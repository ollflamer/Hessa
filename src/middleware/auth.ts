import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/UserService';
import { sendError } from '../utils/response';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Токен авторизации не предоставлен', 401);
    }

    const token = authHeader.substring(7);
    const decoded = userService.verifyToken(token);
    
    const user = await userService.findById(decoded.userId);
    if (!user) {
      return sendError(res, 'Пользователь не найден', 401);
    }

    (req as any).user = user;
    next();
  } catch (error) {
    return sendError(res, 'Недействительный токен', 401);
  }
};
