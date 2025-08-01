import { Response, NextFunction } from 'express';
import { RequestWithUser } from '../types/auth';

export const adminMiddleware = (req: RequestWithUser, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Требуется авторизация'
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Недостаточно прав доступа'
    });
    return;
  }

  next();
};
