-- Добавляем поле role в таблицу users
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Создаем индекс для быстрого поиска по роли
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Обновляем существующих пользователей-администраторов
UPDATE users SET role = 'admin' WHERE email IN ('admin@hessa.com', 'vladik@hessa.com');

-- Добавляем ограничение на возможные значения роли (только если его еще нет)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'chk_user_role' 
        AND conrelid = 'users'::regclass
    ) THEN
        ALTER TABLE users ADD CONSTRAINT chk_user_role 
            CHECK (role IN ('user', 'admin', 'moderator'));
    END IF;
END $$;

-- Комментарий к полю
COMMENT ON COLUMN users.role IS 'Роль пользователя: user - обычный пользователь, admin - администратор, moderator - модератор';
