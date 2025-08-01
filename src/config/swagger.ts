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
          required: ['email', 'name', 'password', 'agreeToTerms'],
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
              minLength: 8,
              description: 'Пароль (минимум 8 символов, должен содержать заглавную букву, строчную букву, цифру и спецсимвол)'
            },
            agreeToTerms: {
              type: 'boolean',
              description: 'Согласие с условиями использования и офертой'
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
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID заказа'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'ID пользователя'
            },
            orderNumber: {
              type: 'string',
              description: 'Номер заказа'
            },
            status: {
              type: 'string',
              enum: ['processing', 'shipping', 'delivered', 'cancelled'],
              description: 'Статус заказа'
            },
            totalAmount: {
              type: 'number',
              description: 'Общая стоимость заказа'
            },
            shippingAddress: {
              type: 'string',
              description: 'Адрес доставки'
            },
            phone: {
              type: 'string',
              description: 'Телефон для связи'
            },
            notes: {
              type: 'string',
              description: 'Примечания к заказу'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата создания заказа'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата последнего обновления'
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/OrderItem'
              },
              description: 'Товары в заказе'
            },
            user: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  format: 'uuid'
                },
                name: {
                  type: 'string'
                },
                email: {
                  type: 'string',
                  format: 'email'
                }
              },
              description: 'Информация о пользователе'
            }
          }
        },
        OrderItem: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID позиции заказа'
            },
            orderId: {
              type: 'string',
              format: 'uuid',
              description: 'ID заказа'
            },
            productId: {
              type: 'string',
              format: 'uuid',
              description: 'ID товара'
            },
            quantity: {
              type: 'integer',
              minimum: 1,
              description: 'Количество товара'
            },
            unitPrice: {
              type: 'number',
              format: 'decimal',
              description: 'Цена за единицу на момент заказа'
            },
            totalPrice: {
              type: 'number',
              format: 'decimal',
              description: 'Общая стоимость позиции'
            },
            product: {
              $ref: '#/components/schemas/Product',
              description: 'Информация о товаре'
            }
          },
          required: ['id', 'orderId', 'productId', 'quantity', 'unitPrice', 'totalPrice']
        },
        Referral: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID реферала'
            },
            referrerId: {
              type: 'string',
              format: 'uuid',
              description: 'ID пригласившего пользователя'
            },
            referredId: {
              type: 'string',
              format: 'uuid',
              description: 'ID приглашенного пользователя'
            },
            referralCode: {
              type: 'string',
              description: 'Реферальный код'
            },
            registrationDate: {
              type: 'string',
              format: 'date-time',
              description: 'Дата регистрации по реферальной ссылке'
            },
            firstOrderDate: {
              type: 'string',
              format: 'date-time',
              description: 'Дата первого заказа'
            },
            totalOrders: {
              type: 'integer',
              description: 'Общее количество заказов'
            },
            totalEarnedPoints: {
              type: 'integer',
              description: 'Общее количество заработанных баллов'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive'],
              description: 'Статус реферала'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['id', 'referrerId', 'referredId', 'referralCode', 'registrationDate', 'totalOrders', 'totalEarnedPoints', 'status']
        },
        PointTransaction: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid'
            },
            userId: {
              type: 'string',
              format: 'uuid'
            },
            transactionType: {
              type: 'string',
              enum: ['earned', 'spent', 'expired', 'bonus']
            },
            pointsAmount: {
              type: 'integer'
            },
            pointsBalanceAfter: {
              type: 'integer'
            },
            sourceType: {
              type: 'string',
              enum: ['referral', 'order', 'bonus', 'admin', 'usage']
            },
            description: {
              type: 'string'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['id', 'userId', 'transactionType', 'pointsAmount', 'pointsBalanceAfter', 'sourceType']
        },
        UserReferralInfo: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              format: 'uuid'
            },
            referralCode: {
              type: 'string'
            },
            referralUrl: {
              type: 'string',
              format: 'uri'
            },
            pointsBalance: {
              type: 'integer'
            },
            totalReferrals: {
              type: 'integer'
            },
            totalEarnedPoints: {
              type: 'integer'
            },
            activeReferrals: {
              type: 'integer'
            }
          },
          required: ['userId', 'referralCode', 'referralUrl', 'pointsBalance', 'totalReferrals', 'totalEarnedPoints', 'activeReferrals']
        },
        ReferralStats: {
          type: 'object',
          properties: {
            totalReferrals: {
              type: 'integer'
            },
            activeReferrals: {
              type: 'integer'
            },
            totalEarnedPoints: {
              type: 'integer'
            },
            totalOrdersFromReferrals: {
              type: 'integer'
            },
            averageOrderValue: {
              type: 'number',
              format: 'decimal'
            },
            conversionRate: {
              type: 'number',
              format: 'decimal'
            }
          },
          required: ['totalReferrals', 'activeReferrals', 'totalEarnedPoints', 'totalOrdersFromReferrals', 'averageOrderValue', 'conversionRate']
        },
        PointsHistory: {
          type: 'object',
          properties: {
            transactions: {
              type: 'array',
              items: { $ref: '#/components/schemas/PointTransaction' }
            },
            totalEarned: {
              type: 'integer'
            },
            totalSpent: {
              type: 'integer'
            },
            currentBalance: {
              type: 'integer'
            },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                limit: { type: 'integer' },
                offset: { type: 'integer' },
                hasMore: { type: 'boolean' }
              }
            }
          },
          required: ['transactions', 'totalEarned', 'totalSpent', 'currentBalance', 'pagination']
        }
      }
    },
    responses: {
      Unauthorized: {
        description: 'Неавторизованный доступ',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false
                },
                message: {
                  type: 'string',
                  example: 'Требуется авторизация'
                }
              }
            }
          }
        }
      },
      Forbidden: {
        description: 'Доступ запрещен',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false
                },
                message: {
                  type: 'string',
                  example: 'Недостаточно прав доступа'
                }
              }
            }
          }
        }
      },
      ValidationError: {
        description: 'Ошибка валидации',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false
                },
                message: {
                  type: 'string',
                  example: 'Ошибка валидации данных'
                },
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: {
                        type: 'string'
                      },
                      message: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      InternalError: {
        description: 'Внутренняя ошибка сервера',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false
                },
                message: {
                  type: 'string',
                  example: 'Внутренняя ошибка сервера'
                }
              }
            }
          }
        }
      },
      ErrorResponse: {
        description: 'Общая ошибка',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: false
                },
                message: {
                  type: 'string'
                }
              }
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
      },
      {
        name: 'Referrals',
        description: 'Реферальная программа и баллы'
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ]
};

export const swaggerSpec = swaggerJsdoc(options);
