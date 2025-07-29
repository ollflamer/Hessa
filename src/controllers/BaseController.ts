import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { logger } from '../utils/logger';

export abstract class BaseController {
  protected handleSuccess<T>(res: Response, data: T, message?: string) {
    sendSuccess(res, data, message);
  }

  protected handleError(res: Response, error: string, statusCode = 400) {
    logger.error(error);
    sendError(res, error, statusCode);
  }

  protected async executeAsync(req: Request, res: Response, operation: () => Promise<any>) {
    try {
      await operation();
    } catch (error) {
      this.handleError(res, error instanceof Error ? error.message : 'Unknown error', 500);
    }
  }
}
