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
import { staticFiles } from './middleware/static';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(corsMiddleware);

// Статические файлы (изображения)
app.use('/uploads', staticFiles);

app.use(compressionMiddleware);

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api-docs')) {
    return next();
  }
  
  helmetMiddleware(req, res, () => {
    generalRateLimit(req, res, () => {
      securityLogger(req, res, () => {
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

app.use('/api-docs', (req: Request, res: Response, next: NextFunction) => {
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

// Экспорт для тестов
export { app };

process.on('uncaughtException', (error) => {
  logger.error('❌ Неперехваченное исключение:', error);
  if (appConfig.nodeEnv === 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Неперехваченное отклонение промиса:', { reason, promise });
  if (appConfig.nodeEnv === 'production') {
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  logger.info('🔄 Получен сигнал SIGTERM, завершение работы...');
  databaseService.close().then(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('🔄 Получен сигнал SIGINT, завершение работы...');
  databaseService.close().then(() => {
    process.exit(0);
  });
});

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
    
    const server = app.listen(appConfig.port, () => {
      logger.info(`🚀 Сервер запущен на порту ${appConfig.port}`);
      logger.info(`📍 Статус: ${appConfig.nodeEnv}`);
      logger.info(`🌐 Пин понг: http://localhost:${appConfig.port}/api/health`);
      logger.info(`👥 API пользователей: http://localhost:${appConfig.port}/api/users`);
      logger.info(`📝 Документация Swagger: http://localhost:${appConfig.port}/api-docs`);
    });

    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Порт ${appConfig.port} уже используется`);
      } else {
        logger.error('❌ Ошибка сервера:', error);
      }
      if (appConfig.nodeEnv === 'production') {
        process.exit(1);
      }
    });

  } catch (error) {
    logger.error('❌ Ошибка запуска сервера:', error);
    if (appConfig.nodeEnv === 'production') {
      process.exit(1);
    }
  }
};

startServer();
