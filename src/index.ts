import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { appConfig } from './config/app';
import { logger } from './utils/logger';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import { routes } from './routes';
import { databaseService } from './services/DatabaseService';
import { migrationService } from './services/MigrationService';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(corsMiddleware);

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ message: 'Hessa API Server', version: '1.0.0' });
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
      password: process.env.DB_PASSWORD ? '***' : 'НЕ УСТАНОВЛЕН'
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
    });
  } catch (error) {
    logger.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
  }
};

startServer();
