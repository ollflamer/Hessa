import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { logger } from '../utils/logger';

export abstract class BaseController {
  protected handleSuccess<T>(res: Response, data: T, message?: string, statusCode = 200) {
    sendSuccess(res, data, message, statusCode);
  }

  protected handleError(res: Response, error: string | Error | unknown, statusCode = 400) {
    let errorMessage: string;
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      errorMessage = 'Неизвестная ошибка';
    }
    logger.error(errorMessage);
    sendError(res, errorMessage, statusCode);
  }

  protected async executeAsync(req: Request, res: Response, operation: () => Promise<any>) {
    try {
      await operation();
    } catch (error) {
      this.handleError(res, error instanceof Error ? error.message : 'Unknown error', 500);
    }
  }
}
