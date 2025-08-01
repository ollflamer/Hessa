import { Pool, PoolClient } from 'pg';
import { dbConfig } from '../config/database';
import { logger } from '../utils/logger';
import { BaseService } from './BaseService';

export class DatabaseService extends BaseService {
  private pool: Pool;

  constructor() {
    super();
    this.log('Конфигурация БД:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.username,
      password: dbConfig.password ? '***' : 'НЕ УСТАНОВЛЕН'
    });
    
    this.pool = new Pool({
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.username,
      password: dbConfig.password,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err) => {
      this.logError('Неожиданная ошибка БД', err);
    });
  }

  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    return this.executeWithLogging('database query', async () => {
      const client = await this.pool.connect();
      try {
        const result = await client.query(text, params);
        return result.rows;
      } finally {
        client.release();
      }
    });
  }

  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  async executeTransaction<T>(fn: () => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn();
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT NOW() as current_time');
      this.log('Подключение к БД успешно', result[0]);
      return true;
    } catch (error) {
      this.logError('Ошибка подключения к БД', error);
      return false;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
    this.log('Пул соединений закрыт');
  }
}

export const databaseService = new DatabaseService();
