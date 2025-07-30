import swaggerJsdoc from 'swagger-jsdoc';
import { appConfig } from './app';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hessa API',
      version: '1.0.0',
      description: 'API документация для проекта Hessa - современный backend на Express.js + TypeScript + PostgreSQL',
      contact: {
        name: 'Vladik',
        email: 'vladik@hessa.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${appConfig.port}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT токен авторизации'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Уникальный идентификатор пользователя'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email пользователя'
            },
            name: {
              type: 'string',
              description: 'Имя пользователя'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата создания'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата последнего обновления'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Статус успешности операции'
            },
            data: {
              type: 'object',
              description: 'Данные ответа'
            },
            message: {
              type: 'string',
              description: 'Сообщение'
            },
            error: {
              type: 'string',
              description: 'Описание ошибки'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'name', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email пользователя'
            },
            name: {
              type: 'string',
              description: 'Имя пользователя'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Пароль (минимум 6 символов)'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email пользователя'
            },
            password: {
              type: 'string',
              description: 'Пароль пользователя'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User'
                },
                token: {
                  type: 'string',
                  description: 'JWT токен'
                }
              }
            },
            message: {
              type: 'string',
              example: 'Авторизация успешна'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Health',
        description: 'Проверка состояния сервиса'
      },
      {
        name: 'Users',
        description: 'Управление пользователями'
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ]
};

export const swaggerSpec = swaggerJsdoc(options);
