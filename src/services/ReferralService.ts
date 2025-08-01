import { BaseService } from './BaseService';
import { DatabaseService } from './DatabaseService';
import { 
  Referral, 
  PointTransaction, 
  UserReferralInfo, 
  ReferralStats, 
  PointsHistory,
  CreateReferralDto,
  SpendPointsDto,
  ReferralFilters,
  PointTransactionFilters,
  TransactionType,
  SourceType,
  REFERRAL_PERCENTAGE
} from '../models/Referral';

export class ReferralService extends BaseService {
  private dbService: DatabaseService;

  constructor(dbService: DatabaseService) {
    super();
    this.dbService = dbService;
  }

  async getUserReferralInfo(userId: string): Promise<UserReferralInfo> {
    return this.executeWithLogging('получение реферальной информации пользователя', async () => {
      const result = await this.dbService.query(
        `SELECT 
           u.id as user_id,
           u.referral_code,
           u.points_balance,
           u.referred_by_user_id,
           rb.name as referred_by_name,
           rb.email as referred_by_email,
           COUNT(r.id) as total_referrals,
           COUNT(CASE WHEN r.status = 'active' THEN 1 END) as active_referrals,
           COALESCE(SUM(r.total_earned_points), 0) as total_earned_points
         FROM users u
         LEFT JOIN users rb ON u.referred_by_user_id = rb.id
         LEFT JOIN referrals r ON u.id = r.referrer_id
         WHERE u.id = $1
         GROUP BY u.id, u.referral_code, u.points_balance, u.referred_by_user_id, rb.name, rb.email`,
        [userId]
      );

      if (result.length === 0) {
        throw new Error('Пользователь не найден');
      }

      const row = result[0];
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

      return {
        userId: row.user_id,
        referralCode: row.referral_code,
        referralUrl: `${baseUrl}/register?ref=${row.referral_code}`,
        pointsBalance: parseInt(row.points_balance),
        referredByUserId: row.referred_by_user_id,
        totalReferrals: parseInt(row.total_referrals),
        totalEarnedPoints: parseInt(row.total_earned_points),
        activeReferrals: parseInt(row.active_referrals),
        referredBy: row.referred_by_user_id ? {
          id: row.referred_by_user_id,
          name: row.referred_by_name,
          email: row.referred_by_email
        } : undefined
      };
    });
  }

  async createReferralConnection(referralCode: string, newUserId: string): Promise<Referral | null> {
    return this.executeWithLogging('создание реферальной связи', async () => {
      return await this.dbService.executeTransaction(async () => {
        const referrerResult = await this.dbService.query(
          'SELECT id FROM users WHERE referral_code = $1 AND id != $2',
          [referralCode, newUserId]
        );

        if (referrerResult.length === 0) {
          return null;
        }

        const referrerId = referrerResult[0].id;

        await this.dbService.query(
          'UPDATE users SET referred_by_user_id = $1 WHERE id = $2',
          [referrerId, newUserId]
        );

        const referralResult = await this.dbService.query(
          `INSERT INTO referrals (referrer_id, referred_id, referral_code)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [referrerId, newUserId, referralCode]
        );

        return this.mapToReferral(referralResult[0]);
      });
    });
  }

  async processReferralReward(orderId: string): Promise<number> {
    return this.executeWithLogging('обработка реферального вознаграждения', async () => {
      const orderResult = await this.dbService.query(
        `SELECT o.id, o.user_id, o.total_amount, u.referred_by_user_id
         FROM orders o
         JOIN users u ON o.user_id = u.id
         WHERE o.id = $1 AND u.referred_by_user_id IS NOT NULL`,
        [orderId]
      );

      if (orderResult.length === 0) {
        return 0;
      }

      const order = orderResult[0];
      const referrerId = order.referred_by_user_id;
      const orderAmount = parseFloat(order.total_amount);

      const pointsAwarded = await this.dbService.query(
        'SELECT award_referral_points($1, $2, $3, $4) as points',
        [referrerId, orderId, orderAmount.toString(), REFERRAL_PERCENTAGE.toString()]
      );

      return parseInt(pointsAwarded[0].points);
    });
  }

  async getUserReferrals(userId: string, filters: ReferralFilters = {}, limit = 20, offset = 0): Promise<Referral[]> {
    return this.executeWithLogging('получение рефералов пользователя', async () => {
      let whereConditions = ['r.referrer_id = $1'];
      let params = [userId];
      let paramIndex = 2;

      if (filters.status) {
        whereConditions.push(`r.status = $${paramIndex}`);
        params.push(filters.status);
        paramIndex++;
      }

      if (filters.dateFrom) {
        whereConditions.push(`r.registration_date >= $${paramIndex}`);
        params.push(filters.dateFrom);
        paramIndex++;
      }

      if (filters.dateTo) {
        whereConditions.push(`r.registration_date <= $${paramIndex}`);
        params.push(filters.dateTo);
        paramIndex++;
      }

      if (filters.hasOrders !== undefined) {
        if (filters.hasOrders) {
          whereConditions.push('r.total_orders > 0');
        } else {
          whereConditions.push('r.total_orders = 0');
        }
      }

      const whereClause = whereConditions.join(' AND ');
      
      const result = await this.dbService.query(
        `SELECT r.*, 
                u_referred.name as referred_name, 
                u_referred.email as referred_email
         FROM referrals r
         JOIN users u_referred ON r.referred_id = u_referred.id
         WHERE ${whereClause}
         ORDER BY r.created_at DESC
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...params, limit, offset]
      );

      return result.map(row => this.mapToReferral(row));
    });
  }

  async getPointsHistory(userId: string, filters: PointTransactionFilters = {}, limit = 20, offset = 0): Promise<PointsHistory> {
    return this.executeWithLogging('получение истории баллов', async () => {
      let whereConditions = ['pt.user_id = $1'];
      let params = [userId];
      let paramIndex = 2;

      if (filters.transactionType) {
        whereConditions.push(`pt.transaction_type = $${paramIndex}`);
        params.push(filters.transactionType);
        paramIndex++;
      }

      if (filters.sourceType) {
        whereConditions.push(`pt.source_type = $${paramIndex}`);
        params.push(filters.sourceType);
        paramIndex++;
      }

      if (filters.dateFrom) {
        whereConditions.push(`pt.created_at >= $${paramIndex}`);
        params.push(filters.dateFrom);
        paramIndex++;
      }

      if (filters.dateTo) {
        whereConditions.push(`pt.created_at <= $${paramIndex}`);
        params.push(filters.dateTo);
        paramIndex++;
      }

      const whereClause = whereConditions.join(' AND ');

      const [transactionsResult, statsResult, totalResult] = await Promise.all([
        this.dbService.query(
          `SELECT pt.*, 
                  o.order_number, o.total_amount as order_total,
                  r.referral_code
           FROM point_transactions pt
           LEFT JOIN orders o ON pt.order_id = o.id
           LEFT JOIN referrals r ON pt.referral_id = r.id
           WHERE ${whereClause}
           ORDER BY pt.created_at DESC
           LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
          [...params, limit, offset]
        ),
        this.dbService.query(
          `SELECT 
             COALESCE(SUM(CASE WHEN transaction_type = 'earned' THEN points_amount ELSE 0 END), 0) as total_earned,
             COALESCE(SUM(CASE WHEN transaction_type = 'spent' THEN points_amount ELSE 0 END), 0) as total_spent,
             (SELECT points_balance FROM users WHERE id = $1) as current_balance
           FROM point_transactions
           WHERE user_id = $1`,
          [userId]
        ),
        this.dbService.query(
          `SELECT COUNT(*) as total FROM point_transactions pt WHERE ${whereClause}`,
          params
        )
      ]);

      const transactions = transactionsResult.map(row => this.mapToPointTransaction(row));
      const stats = statsResult[0];
      const total = parseInt(totalResult[0].total);

      return {
        transactions,
        totalEarned: parseInt(stats.total_earned),
        totalSpent: parseInt(stats.total_spent),
        currentBalance: parseInt(stats.current_balance),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      };
    });
  }

  async spendPoints(userId: string, spendData: SpendPointsDto): Promise<PointTransaction> {
    return this.executeWithLogging('списание баллов', async () => {
      return await this.dbService.executeTransaction(async () => {
        const userResult = await this.dbService.query(
          'SELECT points_balance FROM users WHERE id = $1',
          [userId]
        );

        if (userResult.length === 0) {
          throw new Error('Пользователь не найден');
        }

        const currentBalance = parseInt(userResult[0].points_balance);

        if (currentBalance < spendData.pointsAmount) {
          throw new Error('Недостаточно баллов на счету');
        }

        const newBalance = currentBalance - spendData.pointsAmount;

        await this.dbService.query(
          'UPDATE users SET points_balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [newBalance, userId]
        );

        const transactionResult = await this.dbService.query(
          `INSERT INTO point_transactions (
             user_id, transaction_type, points_amount, points_balance_after, 
             source_type, source_id, description
           ) VALUES ($1, 'spent', $2, $3, $4, $5, $6)
           RETURNING *`,
          [userId, spendData.pointsAmount, newBalance, spendData.sourceType, spendData.sourceId, spendData.description]
        );

        return this.mapToPointTransaction(transactionResult[0]);
      });
    });
  }

  async awardPoints(userId: string, pointsAmount: number, description: string, sourceType: SourceType = 'admin', sourceId?: string, expiresAt?: Date): Promise<PointTransaction> {
    return this.executeWithLogging('начисление баллов', async () => {
      return await this.dbService.executeTransaction(async () => {
        const userResult = await this.dbService.query(
          'SELECT points_balance FROM users WHERE id = $1',
          [userId]
        );

        if (userResult.length === 0) {
          throw new Error('Пользователь не найден');
        }

        const currentBalance = parseInt(userResult[0].points_balance);
        const newBalance = currentBalance + pointsAmount;

        await this.dbService.query(
          'UPDATE users SET points_balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [newBalance, userId]
        );

        const transactionResult = await this.dbService.query(
          `INSERT INTO point_transactions (
             user_id, transaction_type, points_amount, points_balance_after, 
             source_type, source_id, description, expires_at
           ) VALUES ($1, 'earned', $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [userId, pointsAmount, newBalance, sourceType, sourceId, description, expiresAt]
        );

        return this.mapToPointTransaction(transactionResult[0]);
      });
    });
  }

  async getReferralStats(userId?: string): Promise<ReferralStats> {
    return this.executeWithLogging('получение статистики рефералов', async () => {
      const whereClause = userId ? 'WHERE r.referrer_id = $1' : '';
      const params = userId ? [userId] : [];

      const [statsResult, topReferralsResult] = await Promise.all([
        this.dbService.query(
          `SELECT 
             COUNT(r.id) as total_referrals,
             COUNT(CASE WHEN r.status = 'active' THEN 1 END) as active_referrals,
             COALESCE(SUM(r.total_earned_points), 0) as total_earned_points,
             COALESCE(SUM(r.total_orders), 0) as total_orders,
             CASE 
               WHEN SUM(r.total_orders) > 0 
               THEN AVG(o.total_amount)
               ELSE 0 
             END as avg_order_value,
             CASE 
               WHEN COUNT(r.id) > 0 
               THEN (COUNT(CASE WHEN r.total_orders > 0 THEN 1 END)::FLOAT / COUNT(r.id)::FLOAT) * 100
               ELSE 0 
             END as conversion_rate
           FROM referrals r
           LEFT JOIN orders o ON o.user_id = r.referred_id
           ${whereClause}`,
          params
        ),
        this.dbService.query(
          `SELECT r.*, 
                  u_referrer.name as referrer_name,
                  u_referrer.email as referrer_email,
                  u_referred.name as referred_name,
                  u_referred.email as referred_email
           FROM referrals r
           JOIN users u_referrer ON r.referrer_id = u_referrer.id
           JOIN users u_referred ON r.referred_id = u_referred.id
           ${whereClause}
           ORDER BY r.total_earned_points DESC, r.total_orders DESC
           LIMIT 10`,
          params
        )
      ]);

      const stats = statsResult[0];
      const topReferrals = topReferralsResult.map(row => ({
        referral: this.mapToReferral(row),
        earnedPoints: parseInt(row.total_earned_points),
        ordersCount: parseInt(row.total_orders)
      }));

      return {
        totalReferrals: parseInt(stats.total_referrals),
        activeReferrals: parseInt(stats.active_referrals),
        totalEarnedPoints: parseInt(stats.total_earned_points),
        totalOrdersFromReferrals: parseInt(stats.total_orders),
        averageOrderValue: parseFloat(stats.avg_order_value) || 0,
        conversionRate: parseFloat(stats.conversion_rate) || 0,
        topReferrals
      };
    });
  }

  async getReferralByCode(code: string): Promise<UserReferralInfo | null> {
    return this.executeWithLogging('получение реферала по коду', async () => {
      const result = await this.dbService.query(
        `SELECT u.id, u.name, u.email, u.referral_code
         FROM users u
         WHERE u.referral_code = $1`,
        [code]
      );

      if (result.length === 0) {
        return null;
      }

      const user = result[0];
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

      return {
        userId: user.id,
        referralCode: user.referral_code,
        referralUrl: `${baseUrl}/register?ref=${user.referral_code}`,
        pointsBalance: 0,
        totalReferrals: 0,
        totalEarnedPoints: 0,
        activeReferrals: 0
      };
    });
  }

  private mapToReferral(row: any): Referral {
    return {
      id: row.id,
      referrerId: row.referrer_id,
      referredId: row.referred_id,
      referralCode: row.referral_code,
      registrationDate: new Date(row.registration_date),
      firstOrderDate: row.first_order_date ? new Date(row.first_order_date) : undefined,
      firstOrderId: row.first_order_id,
      totalOrders: parseInt(row.total_orders),
      totalEarnedPoints: parseInt(row.total_earned_points),
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      referred: row.referred_name ? {
        id: row.referred_id,
        name: row.referred_name,
        email: row.referred_email
      } : undefined,
      referrer: row.referrer_name ? {
        id: row.referrer_id,
        name: row.referrer_name,
        email: row.referrer_email
      } : undefined
    };
  }

  private mapToPointTransaction(row: any): PointTransaction {
    return {
      id: row.id,
      userId: row.user_id,
      transactionType: row.transaction_type as TransactionType,
      pointsAmount: parseInt(row.points_amount),
      pointsBalanceAfter: parseInt(row.points_balance_after),
      sourceType: row.source_type as SourceType,
      sourceId: row.source_id,
      description: row.description,
      referralId: row.referral_id,
      orderId: row.order_id,
      expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
      createdAt: new Date(row.created_at),
      order: row.order_number ? {
        id: row.order_id,
        orderNumber: row.order_number,
        totalAmount: parseFloat(row.order_total)
      } : undefined
    };
  }
}
