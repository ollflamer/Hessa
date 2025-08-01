export type TransactionType = 'earned' | 'spent' | 'expired' | 'bonus';
export type SourceType = 'referral' | 'order' | 'bonus' | 'admin' | 'usage';
export type ReferralStatus = 'active' | 'inactive';

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  referralCode: string;
  registrationDate: Date;
  firstOrderDate?: Date;
  firstOrderId?: string;
  totalOrders: number;
  totalEarnedPoints: number;
  status: ReferralStatus;
  createdAt: Date;
  updatedAt: Date;
  referrer?: {
    id: string;
    name: string;
    email: string;
  };
  referred?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PointTransaction {
  id: string;
  userId: string;
  transactionType: TransactionType;
  pointsAmount: number;
  pointsBalanceAfter: number;
  sourceType: SourceType;
  sourceId?: string;
  description?: string;
  referralId?: string;
  orderId?: string;
  expiresAt?: Date;
  createdAt: Date;
  referral?: Referral;
  order?: {
    id: string;
    orderNumber: string;
    totalAmount: number;
  };
}

export interface UserReferralInfo {
  userId: string;
  referralCode: string;
  referralUrl: string;
  pointsBalance: number;
  referredByUserId?: string;
  totalReferrals: number;
  totalEarnedPoints: number;
  activeReferrals: number;
  referredBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnedPoints: number;
  totalOrdersFromReferrals: number;
  averageOrderValue: number;
  conversionRate: number;
  topReferrals: Array<{
    referral: Referral;
    earnedPoints: number;
    ordersCount: number;
  }>;
}

export interface PointsHistory {
  transactions: PointTransaction[];
  totalEarned: number;
  totalSpent: number;
  currentBalance: number;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface CreateReferralDto {
  referralCode: string;
  referredUserId: string;
}

export interface SpendPointsDto {
  pointsAmount: number;
  description: string;
  sourceType: SourceType;
  sourceId?: string;
}

export interface ReferralFilters {
  status?: ReferralStatus;
  dateFrom?: string;
  dateTo?: string;
  hasOrders?: boolean;
}

export interface PointTransactionFilters {
  transactionType?: TransactionType;
  sourceType?: SourceType;
  dateFrom?: string;
  dateTo?: string;
}

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  earned: 'Начислено',
  spent: 'Потрачено',
  expired: 'Истекло',
  bonus: 'Бонус'
};

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  referral: 'Реферальная программа',
  order: 'Заказ',
  bonus: 'Бонус',
  admin: 'Администратор',
  usage: 'Использование'
};

export const REFERRAL_PERCENTAGE = 0.10; // 10%
export const POINTS_PER_RUBLE = 1; // 1 балл = 1000 сум
