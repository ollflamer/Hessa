import dotenv from 'dotenv';

// Загружаем переменные окружения для тестов
dotenv.config({ path: '.env.test' });

// Устанавливаем тестовое окружение
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'hessa_test_db';

// Увеличиваем таймаут для тестов с БД
jest.setTimeout(30000);
