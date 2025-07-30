import { Request, Response } from 'express';
import { BaseController } from './BaseController';

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Проверка состояния сервиса
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Сервис работает нормально
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
 *                         status:
 *                           type: string
 *                           example: OK
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *                         uptime:
 *                           type: number
 *                           description: Время работы сервера в секундах
 *                         environment:
 *                           type: string
 *                           example: development
 */
export class HealthController extends BaseController {
  public check = (req: Request, res: Response) => {
    this.executeAsync(req, res, async () => {
      const healthData = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      };
      
      this.handleSuccess(res, healthData, 'Service is healthy');
    });
  };
}
