# Swagger API Документация

## Доступ к документации

После запуска сервера документация доступна по адресам:

- **Swagger UI**: http://localhost:3000/api-docs
- **JSON спецификация**: http://localhost:3000/api-docs.json

## Возможности Swagger UI

### 🔐 Авторизация
1. Зарегистрируйте пользователя через `POST /api/users/register`
2. Авторизуйтесь через `POST /api/users/login` и получите JWT токен
3. Нажмите кнопку **Authorize** в Swagger UI
4. Введите токен в формате: `Bearer YOUR_JWT_TOKEN`
5. Теперь можете тестировать защищенные endpoints

### 📋 Доступные endpoints

#### Health Check
- `GET /api/health` - Проверка состояния сервиса

#### Users (Пользователи)
- `POST /api/users/register` - Регистрация нового пользователя
- `POST /api/users/login` - Авторизация пользователя
- `GET /api/users/profile` - Получение профиля (требует авторизацию)
- `GET /api/users/all` - Список всех пользователей (требует авторизацию)

### 🎯 Тестирование API

1. **Регистрация**:
   ```json
   {
     "email": "test@example.com",
     "name": "Тестовый Пользователь",
     "password": "password123"
   }
   ```

2. **Авторизация**:
   ```json
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```

3. **Использование токена**:
   - Скопируйте токен из ответа авторизации
   - Нажмите "Authorize" в Swagger UI
   - Введите: `Bearer YOUR_TOKEN_HERE`

## Добавление новых endpoints

При добавлении новых API endpoints добавляйте Swagger аннотации:

```typescript
/**
 * @swagger
 * /api/your-endpoint:
 *   post:
 *     summary: Описание endpoint
 *     tags: [YourTag]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/YourSchema'
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
```

## Настройка

Конфигурация Swagger находится в файле `src/config/swagger.ts`:
- Базовая информация об API
- Схемы данных
- Настройки безопасности
- Теги для группировки endpoints

## Автоматическое обновление

Swagger автоматически сканирует файлы:
- `./src/routes/*.ts`
- `./src/controllers/*.ts`

При добавлении новых аннотаций документация обновляется автоматически после перезапуска сервера.
