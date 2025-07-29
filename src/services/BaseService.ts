import { logger } from '../utils/logger';

export abstract class BaseService {
  protected log(message: string, data?: any) {
    logger.info(`[${this.constructor.name}] ${message}`, data);
  }

  protected logError(message: string, error?: any) {
    logger.error(`[${this.constructor.name}] ${message}`, error);
  }

  protected async executeWithLogging<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    this.log(`Начало ${operation}`);
    try {
      const result = await fn();
      this.log(`Завершение ${operation}`);
      return result;
    } catch (error) {
      this.logError(`Ошибка ${operation}`, error);
      throw error;
    }
  }
}
