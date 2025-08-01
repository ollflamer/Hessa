-- Миграция: Расширение профиля пользователя для личного кабинета
-- Дата: 2025-08-01

-- Добавляем новые поля в таблицу users
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Данные из опросника
ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(10) CHECK (gender IN ('male', 'female'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS stress_level VARCHAR(20) CHECK (stress_level IN ('none', 'moderate', 'high', 'constant'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS physical_activity VARCHAR(20) CHECK (physical_activity IN ('none', '1_2_week', '3_5_week', 'daily'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS diet_quality VARCHAR(20) CHECK (diet_quality IN ('daily', '3_4_week', 'rare'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT; -- JSON массив
ALTER TABLE users ADD COLUMN IF NOT EXISTS health_concerns TEXT; -- JSON массив

-- Индексы для оптимизации поиска
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
CREATE INDEX IF NOT EXISTS idx_users_age ON users(age);
CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender);

-- Комментарии к полям
COMMENT ON COLUMN users.avatar_url IS 'URL аватарки пользователя';
COMMENT ON COLUMN users.date_of_birth IS 'Дата рождения пользователя';
COMMENT ON COLUMN users.city IS 'Город проживания';
COMMENT ON COLUMN users.phone IS 'Номер телефона';
COMMENT ON COLUMN users.age IS 'Возраст пользователя';
COMMENT ON COLUMN users.gender IS 'Пол пользователя';
COMMENT ON COLUMN users.stress_level IS 'Уровень стресса';
COMMENT ON COLUMN users.physical_activity IS 'Уровень физической активности';
COMMENT ON COLUMN users.diet_quality IS 'Качество питания';
COMMENT ON COLUMN users.dietary_restrictions IS 'Пищевые ограничения (JSON)';
COMMENT ON COLUMN users.health_concerns IS 'Проблемы со здоровьем (JSON)';
