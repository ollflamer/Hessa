import dotenv from 'dotenv';
import path from 'path';

// ВАЖНО: Загружаем тестовые переменные окружения ПЕРВЫМИ
dotenv.config({ path: path.join(__dirname, '..', '.env.test') });

import { Pool } from 'pg';
import { MigrationService } from '../src/services/MigrationService';
import { databaseService } from '../src/services/DatabaseService';

async function createTestDatabase() {
  const adminPool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres' // Подключаемся к системной БД
  });

  try {
    // Проверяем, существует ли тестовая БД
    const checkDb = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME]
    );

    if (checkDb.rows.length === 0) {
      console.log(`📄 Создание тестовой базы данных: ${process.env.DB_NAME}`);
      await adminPool.query(`CREATE DATABASE "${process.env.DB_NAME}";`);
      console.log('✅ Тестовая база данных создана!');
    } else {
      console.log('📄 Тестовая база данных уже существует');
    }
  } catch (error: any) {
    console.log('⚠️ Предупреждение при создании БД:', error.message);
  } finally {
    await adminPool.end();
  }
}

async function setupTestDatabase() {
  console.log('🔄 Настройка тестовой базы данных...');
  
  try {
    // Сначала создаем БД если её нет
    await createTestDatabase();
    
    // Затем выполняем миграции
    const migrationService = new MigrationService();
    await migrationService.runMigrations();
    
    console.log('✅ Тестовая база данных настроена успешно!');
  } catch (error) {
    console.error('❌ Ошибка настройки тестовой базы данных:', error);
    process.exit(1);
  } finally {
    // Закрываем соединения
    await databaseService.close();
  }
}

setupTestDatabase();
