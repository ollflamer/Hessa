# Настройка базы данных PostgreSQL

## Установка PostgreSQL на Windows

1. **Скачать PostgreSQL:**
   - Перейти на https://www.postgresql.org/download/windows/
   - Скачать PostgreSQL 15+ для Windows
   - Запустить установщик

2. **Во время установки:**
   - Порт: 5432 (по умолчанию)
   - Пароль для пользователя postgres: `admin123`
   - Запомнить этот пароль!

3. **После установки:**
   - Добавить PostgreSQL в PATH (обычно автоматически)
   - Перезагрузить терминал

## Создание базы данных

Открыть командную строку и выполнить:

```bash
# Подключиться к PostgreSQL
psql -U postgres -h localhost

# Ввести пароль: admin123

# Создать базу данных
CREATE DATABASE hessa_db;

# Подключиться к созданной БД
\c hessa_db;

# Проверить подключение
SELECT current_database();

# Выйти
\q
```

## Альтернативный способ через pgAdmin

1. Открыть pgAdmin (устанавливается вместе с PostgreSQL)
2. Подключиться к серверу (пароль: admin123)
3. Создать новую базу данных с именем `hessa_db`

## Проверка настроек

Убедиться, что в файле `.env` правильные данные:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hessa_db
DB_USER=postgres
DB_PASSWORD=admin123
```

После настройки БД можно запускать сервер: `npm run dev`
