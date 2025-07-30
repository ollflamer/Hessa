import { Response, NextFunction } from 'express';
import { RequestWithUser } from '../types';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * Middleware для проверки роли администратора
 * Должен использоваться после authMiddleware
 */
export const adminMiddleware = (req: RequestWithUser, res: Response, next: NextFunction): void => {
  try {
    const user = req.user;
    
    if (!user) {
      logger.warn('[AdminMiddleware] Попытка доступа без авторизации');
      sendError(res, 'Требуется авторизация', 401);
      return;
    }

    if (user.role !== 'admin') {
      logger.warn(`[AdminMiddleware] Пользователь ${user.id} (${user.email}) попытался получить доступ к админской функции без прав администратора`);
      sendError(res, 'Доступ запрещен. Требуются права администратора', 403);
      return;
    }

    logger.info(`[AdminMiddleware] Администратор ${user.id} (${user.email}) получил доступ к админской функции`);
    next();
  } catch (error) {
    logger.error('[AdminMiddleware] Ошибка проверки прав администратора:', error);
    sendError(res, 'Ошибка проверки прав доступа', 500);
  }
};
