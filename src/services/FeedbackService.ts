import { DatabaseService } from './DatabaseService';
import { Feedback, CreateFeedbackDto, FeedbackResponseDto, FeedbackFilters, FeedbackRateLimit } from '../models/Feedback';
import { logger } from '../utils/logger';

export class FeedbackService extends DatabaseService {
  
  async checkRateLimit(email: string, ipAddress?: string): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const queryText = `
      SELECT message_count, last_message_at 
      FROM feedback_rate_limit 
      WHERE email = $1 AND last_message_at > $2
    `;
    
    const result = await this.query(queryText, [email, oneHourAgo]);
    
    if (result.length === 0) {
      return true;
    }
    
    const { message_count, last_message_at } = result[0];
    const timeSinceLastMessage = Date.now() - new Date(last_message_at).getTime();
    const oneHourInMs = 60 * 60 * 1000;
    
    if (message_count >= 3 && timeSinceLastMessage < oneHourInMs) {
      logger.warn(`Rate limit exceeded for email: ${email}, IP: ${ipAddress}`);
      return false;
    }
    
    return true;
  }

  async updateRateLimit(email: string, ipAddress?: string): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const existingQuery = `
      SELECT id, message_count 
      FROM feedback_rate_limit 
      WHERE email = $1 AND last_message_at > $2
    `;
    
    const existing = await this.query(existingQuery, [email, oneHourAgo]);
    
    if (existing.length > 0) {
      const updateQuery = `
        UPDATE feedback_rate_limit 
        SET message_count = message_count + 1, last_message_at = NOW()
        WHERE id = $1
      `;
      await this.query(updateQuery, [existing[0].id]);
    } else {
      const insertQuery = `
        INSERT INTO feedback_rate_limit (email, ip_address, last_message_at, message_count)
        VALUES ($1, $2, NOW(), 1)
      `;
      await this.query(insertQuery, [email, ipAddress]);
    }
  }

  async createFeedback(data: CreateFeedbackDto, ipAddress?: string): Promise<Feedback> {
    const canSend = await this.checkRateLimit(data.email, ipAddress);
    
    if (!canSend) {
      throw new Error('Слишком много сообщений. Попробуйте через час.');
    }

    const queryText = `
      INSERT INTO feedback (name, email, text, status)
      VALUES ($1, $2, $3, 'pending')
      RETURNING *
    `;
    
    const result = await this.query(queryText, [data.name, data.email, data.text]);
    
    await this.updateRateLimit(data.email, ipAddress);
    
    logger.info(`New feedback created from ${data.email}`);
    
    return this.mapRowToFeedback(result[0]);
  }

  async getAllFeedback(filters: FeedbackFilters = {}): Promise<{ feedback: Feedback[], total: number }> {
    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (filters.status) {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(filters.status);
      paramIndex++;
    }

    if (filters.email) {
      whereConditions.push(`email ILIKE $${paramIndex}`);
      queryParams.push(`%${filters.email}%`);
      paramIndex++;
    }

    if (filters.dateFrom) {
      whereConditions.push(`created_at >= $${paramIndex}`);
      queryParams.push(filters.dateFrom);
      paramIndex++;
    }

    if (filters.dateTo) {
      whereConditions.push(`created_at <= $${paramIndex}`);
      queryParams.push(filters.dateTo);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    const countQuery = `SELECT COUNT(*) as total FROM feedback ${whereClause}`;
    const countResult = await this.query(countQuery, queryParams);
    const total = parseInt(countResult[0].total);

    const limit = Math.min(filters.limit || 20, 100);
    const offset = filters.offset || 0;

    const dataQuery = `
      SELECT f.*, u.name as admin_name 
      FROM feedback f
      LEFT JOIN users u ON f.admin_id = u.id
      ${whereClause}
      ORDER BY f.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    const result = await this.query(dataQuery, queryParams);
    
    const feedback = result.map((row: any) => this.mapRowToFeedback(row));
    
    return { feedback, total };
  }

  async getFeedbackById(id: string): Promise<Feedback | null> {
    const queryText = `
      SELECT f.*, u.name as admin_name 
      FROM feedback f
      LEFT JOIN users u ON f.admin_id = u.id
      WHERE f.id = $1
    `;
    
    const result = await this.query(queryText, [id]);
    
    if (result.length === 0) {
      return null;
    }
    
    return this.mapRowToFeedback(result[0]);
  }

  async updateFeedbackStatus(id: string, status: string, adminId?: string): Promise<Feedback> {
    const queryText = `
      UPDATE feedback 
      SET status = $1, admin_id = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await this.query(queryText, [status, adminId, id]);
    
    if (result.length === 0) {
      throw new Error('Сообщение не найдено');
    }
    
    logger.info(`Feedback ${id} status updated to ${status} by admin ${adminId}`);
    
    return this.mapRowToFeedback(result[0]);
  }

  async respondToFeedback(id: string, response: string, adminId: string): Promise<Feedback> {
    const queryText = `
      UPDATE feedback 
      SET response = $1, status = 'answered', admin_id = $2, responded_at = NOW(), updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await this.query(queryText, [response, adminId, id]);
    
    if (result.length === 0) {
      throw new Error('Сообщение не найдено');
    }
    
    logger.info(`Feedback ${id} responded by admin ${adminId}`);
    
    return this.mapRowToFeedback(result[0]);
  }

  async getFeedbackByEmail(email: string): Promise<Feedback[]> {
    const queryText = `
      SELECT * FROM feedback 
      WHERE email = $1 
      ORDER BY created_at DESC
    `;
    
    const result = await this.query(queryText, [email]);
    
    return result.map((row: any) => this.mapRowToFeedback(row));
  }

  private mapRowToFeedback(row: any): Feedback {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      text: row.text,
      response: row.response,
      status: row.status,
      adminId: row.admin_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      respondedAt: row.responded_at
    };
  }
}

export const feedbackService = new FeedbackService();
