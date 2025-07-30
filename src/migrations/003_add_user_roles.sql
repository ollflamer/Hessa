-- Добавление системы ролей пользователей
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));

-- Создание индекса для быстрого поиска по роли
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Обновление существующих пользователей - делаем первого пользователя админом
UPDATE users SET role = 'admin' WHERE id = (SELECT id FROM users ORDER BY created_at LIMIT 1);

-- Можно также сделать админом пользователя с определенным email
UPDATE users SET role = 'admin' WHERE email IN ('vladik@hessa.com', 'admin@hessa.com');
