import { body, param, query } from 'express-validator';

export const createOrderValidator = [
  body('shippingAddress')
    .notEmpty()
    .withMessage('Адрес доставки обязателен')
    .isLength({ min: 10, max: 500 })
    .withMessage('Адрес должен содержать от 10 до 500 символов'),

  body('phone')
    .notEmpty()
    .withMessage('Телефон обязателен')
    .matches(/^[\+]?[0-9\s\-\(\)]{10,20}$/)
    .withMessage('Некорректный формат телефона'),

  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Примечания не должны превышать 1000 символов'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('Заказ должен содержать хотя бы один товар'),

  body('items.*.productId')
    .isUUID()
    .withMessage('Некорректный ID товара'),

  body('items.*.quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Количество должно быть от 1 до 100')
];

export const updateOrderStatusValidator = [
  param('id')
    .isUUID()
    .withMessage('Некорректный ID заказа'),

  body('status')
    .isIn(['processing', 'shipping', 'delivered', 'cancelled'])
    .withMessage('Некорректный статус заказа'),

  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Примечания не должны превышать 1000 символов')
];

export const getOrderValidator = [
  param('id')
    .isUUID()
    .withMessage('Некорректный ID заказа')
];

export const getOrdersValidator = [
  query('status')
    .optional()
    .isIn(['processing', 'shipping', 'delivered', 'cancelled'])
    .withMessage('Некорректный статус заказа'),

  query('userId')
    .optional()
    .isUUID()
    .withMessage('Некорректный ID пользователя'),

  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Некорректная дата начала'),

  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Некорректная дата окончания'),

  query('orderNumber')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Некорректный номер заказа'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Лимит должен быть от 1 до 100'),

  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Смещение должно быть неотрицательным числом')
];
