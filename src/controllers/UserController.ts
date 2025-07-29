import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { userService } from '../services/UserService';

export class UserController extends BaseController {
  public register = (req: Request, res: Response) => {
    this.executeAsync(req, res, async () => {
      const { email, name, password } = req.body;
      
      if (!email || !name || !password) {
        return this.handleError(res, 'Email, имя и пароль обязательны', 400);
      }

      const user = await userService.createUser({ email, name, password });
      this.handleSuccess(res, { user }, 'Пользователь создан успешно');
    });
  };

  public login = (req: Request, res: Response) => {
    this.executeAsync(req, res, async () => {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return this.handleError(res, 'Email и пароль обязательны', 400);
      }

      const result = await userService.login({ email, password });
      this.handleSuccess(res, result, 'Авторизация успешна');
    });
  };

  public getProfile = (req: Request, res: Response) => {
    this.executeAsync(req, res, async () => {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return this.handleError(res, 'Пользователь не авторизован', 401);
      }

      const user = await userService.findById(userId);
      if (!user) {
        return this.handleError(res, 'Пользователь не найден', 404);
      }

      this.handleSuccess(res, { user }, 'Профиль получен');
    });
  };

  public getAllUsers = (req: Request, res: Response) => {
    this.executeAsync(req, res, async () => {
      const users = await userService.getAllUsers();
      this.handleSuccess(res, { users, count: users.length }, 'Список пользователей');
    });
  };
}
