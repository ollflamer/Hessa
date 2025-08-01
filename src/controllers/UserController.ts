import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { userService } from '../services/UserService';

export class UserController extends BaseController {
  /**
   * @swagger
   * /api/users/register:
   *   post:
   *     summary: Регистрация нового пользователя
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterRequest'
   *     responses:
   *       200:
   *         description: Пользователь успешно зарегистрирован
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         user:
   *                           $ref: '#/components/schemas/User'
   *       400:
   *         description: Ошибка валидации или пользователь уже существует
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  public register = (req: Request, res: Response) => {
    this.executeAsync(req, res, async () => {
      const { email, name, password, agreeToTerms } = req.body;
      
      if (!email || !name || !password) {
        return this.handleError(res, 'Email, имя и пароль обязательны', 400);
      }

      if (!agreeToTerms) {
        return this.handleError(res, 'Необходимо согласиться с офертой', 400);
      }

      const user = await userService.createUser({ email, name, password });
      this.handleSuccess(res, { user }, 'Пользователь создан успешно');
    });
  };

  /**
   * @swagger
   * /api/users/login:
   *   post:
   *     summary: Авторизация пользователя
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *     responses:
   *       200:
   *         description: Успешная авторизация
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoginResponse'
   *       400:
   *         description: Неверные данные для входа
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  public login = (req: Request, res: Response) => {
    this.executeAsync(req, res, async () => {
      const { email, password } = req.body;
      const bruteForce = (req as any).bruteForce;
      
      try {
        const result = await userService.login({ email, password });
        
        if (bruteForce) {
          bruteForce.recordSuccess();
        }
        
        this.handleSuccess(res, result, 'Авторизация успешна');
      } catch (error) {
        if (bruteForce) {
          bruteForce.recordFailure();
        }
        this.handleError(res, 'Неверный email или пароль', 401);
      }
    });
  };

  /**
   * @swagger
   * /api/users/profile:
   *   get:
   *     summary: Получение профиля текущего пользователя
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Профиль пользователя
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         user:
   *                           $ref: '#/components/schemas/User'
   *       401:
   *         description: Не авторизован или недействительный токен
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
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

  /**
   * @swagger
   * /api/users/all:
   *   get:
   *     summary: Получение списка всех пользователей
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Список всех пользователей
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         users:
   *                           type: array
   *                           items:
   *                             $ref: '#/components/schemas/User'
   *                         count:
   *                           type: number
   *                           description: Количество пользователей
   *       401:
   *         description: Не авторизован или недействительный токен
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   */
  public getAllUsers = (req: Request, res: Response) => {
    this.executeAsync(req, res, async () => {
      const users = await userService.getAllUsers();
      this.handleSuccess(res, { users, count: users.length }, 'Список пользователей');
    });
  };
}
