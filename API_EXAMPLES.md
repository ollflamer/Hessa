# Примеры API запросов

## Health Check
```bash
GET http://localhost:3000/api/health
```

## Регистрация пользователя
```bash
POST http://localhost:3000/api/users/register
Content-Type: application/json

{
  "email": "test@example.com",
  "name": "Тестовый Пользователь",
  "password": "password123"
}
```

## Авторизация
```bash
POST http://localhost:3000/api/users/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

## Получить профиль (требует токен)
```bash
GET http://localhost:3000/api/users/profile
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

## Получить всех пользователей (требует токен)
```bash
GET http://localhost:3000/api/users/all
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

## Примеры ответов

### Успешная регистрация:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "test@example.com",
      "name": "Тестовый Пользователь",
      "createdAt": "2025-07-30T01:00:00.000Z",
      "updatedAt": "2025-07-30T01:00:00.000Z"
    }
  },
  "message": "Пользователь создан успешно"
}
```

### Успешная авторизация:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "test@example.com",
      "name": "Тестовый Пользователь",
      "createdAt": "2025-07-30T01:00:00.000Z",
      "updatedAt": "2025-07-30T01:00:00.000Z"
    },
    "token": "jwt.token.here"
  },
  "message": "Авторизация успешна"
}
```
