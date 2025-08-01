import { body, param, query } from 'express-validator';

export const registerWithReferralValidator = [
  body('referralCode')
    .optional()
    .isLength({ min: 6, max: 20 })
    .withMessage('Реферальный код должен содержать от 6 до 20 символов')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Реферальный код может содержать только заглавные буквы и цифры')
];

export const spendPointsValidator = [
  body('pointsAmount')
    .isInt({ min: 1 })
    .withMessage('Количество баллов должно быть положительным числом'),

  body('description')
    .notEmpty()
    .withMessage('Описание обязательно')
    .isLength({ max: 500 })
    .withMessage('Описание не должно превышать 500 символов'),

  body('sourceType')
    .isIn(['usage', 'admin'])
    .withMessage('Некорректный тип источника для трат'),

  body('sourceId')
    .optional()
    .isUUID()
    .withMessage('Некорректный ID источника')
];

export const getReferralsValidator = [
  query('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Некорректный статус реферала'),

  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Некорректная дата начала'),

  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Некорректная дата окончания'),

  query('hasOrders')
    .optional()
    .isBoolean()
    .withMessage('hasOrders должно быть булевым значением'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Лимит должен быть от 1 до 100'),

  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Смещение должно быть неотрицательным числом')
];

export const getPointsHistoryValidator = [
  query('transactionType')
    .optional()
    .isIn(['earned', 'spent', 'expired', 'bonus'])
    .withMessage('Некорректный тип транзакции'),

  query('sourceType')
    .optional()
    .isIn(['referral', 'order', 'bonus', 'admin', 'usage'])
    .withMessage('Некорректный тип источника'),

  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Некорректная дата начала'),

  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Некорректная дата окончания'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Лимит должен быть от 1 до 100'),

  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Смещение должно быть неотрицательным числом')
];

export const getReferralByCodeValidator = [
  param('code')
    .isLength({ min: 6, max: 20 })
    .withMessage('Реферальный код должен содержать от 6 до 20 символов')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Реферальный код может содержать только заглавные буквы и цифры')
];

export const adminSpendPointsValidator = [
  param('userId')
    .isUUID()
    .withMessage('Некорректный ID пользователя'),

  body('pointsAmount')
    .isInt({ min: 1 })
    .withMessage('Количество баллов должно быть положительным числом'),

  body('description')
    .notEmpty()
    .withMessage('Описание обязательно')
    .isLength({ max: 500 })
    .withMessage('Описание не должно превышать 500 символов'),

  body('sourceType')
    .isIn(['admin', 'bonus'])
    .withMessage('Некорректный тип источника для админских операций'),

  body('sourceId')
    .optional()
    .isUUID()
    .withMessage('Некорректный ID источника')
];

export const adminAwardPointsValidator = [
  param('userId')
    .isUUID()
    .withMessage('Некорректный ID пользователя'),

  body('pointsAmount')
    .isInt({ min: 1 })
    .withMessage('Количество баллов должно быть положительным числом'),

  body('description')
    .notEmpty()
    .withMessage('Описание обязательно')
    .isLength({ max: 500 })
    .withMessage('Описание не должно превышать 500 символов'),

  body('sourceType')
    .optional()
    .isIn(['admin', 'bonus'])
    .withMessage('Некорректный тип источника для админских операций')
    .default('admin'),

  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Некорректная дата истечения')
];
