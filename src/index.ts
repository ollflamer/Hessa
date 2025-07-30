import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import { appConfig } from './config/app';
import { logger } from './utils/logger';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import { routes } from './routes';
import { databaseService } from './services/DatabaseService';
import { migrationService } from './services/MigrationService';
import { swaggerSpec } from './config/swagger';
import { 
  helmetMiddleware, 
  generalRateLimit, 
  sanitizeMiddleware, 
  xssMiddleware, 
  hppMiddleware, 
  compressionMiddleware,
  securityLogger 
} from './middleware/security';

const app = express();

// Основные миддлвары
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(corsMiddleware);

// Базовые middleware безопасности для всех маршрутов
app.use(compressionMiddleware);

// Условные middleware безопасности (исключаем Swagger)
app.use((req: Request, res: Response, next: NextFunction) => {
  // Пропускаем строгую безопасность для Swagger
  if (req.path.startsWith('/api-docs')) {
    return next();
  }
  
  // Применяем защиту для API endpoints
  helmetMiddleware(req, res, () => {
    generalRateLimit(req, res, () => {
      securityLogger(req, res, () => {
        // Применяем sanitization перед другими middleware
        sanitizeMiddleware(req, res, () => {
          xssMiddleware(req, res, () => {
            hppMiddleware(req, res, next);
          });
        });
      });
    });
  });
});



app.use('/api', routes);

// Swagger UI с отключенной безопасностью
app.use('/api-docs', (req: Request, res: Response, next: NextFunction) => {
  // Временно отключаем CSP для Swagger
  res.removeHeader('Content-Security-Policy');
  next();
}, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Hessa API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true
  }
}));

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Hessa API Server', 
    version: '1.0.0',
    documentation: '/api-docs',
    swagger_json: '/api-docs.json'
  });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    logger.info('🔄 Инициализация сервера...');
    logger.info('🔑 DB Config:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD ? '123' : 'НЕ УСТАНОВЛЕН'
    });
    
    const isDbConnected = await databaseService.testConnection();
    if (!isDbConnected) {
      throw new Error('Не удалось подключиться к базе данных');
    }
    
    await migrationService.runMigrations();
    
    app.listen(appConfig.port, () => {
      logger.info(`🚀 Сервер запущен на порту ${appConfig.port}`);
      logger.info(`📍 Статус: ${appConfig.nodeEnv}`);
      logger.info(`🌐 Пин понг: http://localhost:${appConfig.port}/api/health`);
      logger.info(`👥 API пользователей: http://localhost:${appConfig.port}/api/users`);
      logger.info(`📝 Документация Swagger: http://localhost:${appConfig.port}/api-docs`);
    });
  } catch (error) {
    logger.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
  }
};

startServer();
