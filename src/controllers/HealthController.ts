import { Request, Response } from 'express';
import { BaseController } from './BaseController';

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
