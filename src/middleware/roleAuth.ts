import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin' | 'moderator';
  };
}

export const requireRole = (allowedRoles: ('user' | 'admin' | 'moderator')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      logger.warn('Попытка доступа без авторизации', { ip: req.ip, path: req.path });
      return sendError(res, 'Требуется авторизация', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Попытка доступа с недостаточными правами', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        ip: req.ip,
        path: req.path
      });
      return sendError(res, 'Недостаточно прав для выполнения этого действия', 403);
    }

    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireAdminOrModerator = requireRole(['admin', 'moderator']);
export const requireAnyRole = requireRole(['user', 'admin', 'moderator']);
