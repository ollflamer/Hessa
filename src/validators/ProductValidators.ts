import { body, param, query } from 'express-validator';

export class ProductValidators {
  static createProduct = [
    body('sku')
      .notEmpty()
      .withMessage('SKU обязателен')
      .isLength({ min: 3, max: 100 })
      .withMessage('SKU должен быть от 3 до 100 символов')
      .matches(/^[A-Z0-9-_]+$/)
      .withMessage('SKU может содержать только заглавные буквы, цифры, дефисы и подчеркивания'),

    body('name')
      .notEmpty()
      .withMessage('Название товара обязательно')
      .isLength({ min: 2, max: 255 })
      .withMessage('Название должно быть от 2 до 255 символов'),

    body('description')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Описание не должно превышать 2000 символов'),

    body('imageUrl')
      .optional()
      .isURL()
      .withMessage('Некорректный URL изображения')
      .isLength({ max: 500 })
      .withMessage('URL изображения не должен превышать 500 символов'),

    body('price')
      .isFloat({ min: 0 })
      .withMessage('Цена должна быть положительным числом'),

    body('size')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Размер не должен превышать 100 символов'),

    body('quantity')
      .isInt({ min: 0 })
      .withMessage('Количество должно быть неотрицательным целым числом'),

    body('categoryId')
      .optional()
      .isUUID()
      .withMessage('Некорректный ID категории'),

    body('restrictions')
      .optional()
      .isArray()
      .withMessage('Ограничения должны быть массивом')
      .custom((value) => {
        if (!Array.isArray(value)) return false;
        const validRestrictions = ['vegetarian', 'vegan', 'lactose_free', 'gluten_free', 'nut_free', 'diabetic'];
        return value.every(item => validRestrictions.includes(item));
      })
      .withMessage('Некорректные значения ограничений'),

    body('benefits')
      .optional()
      .isArray()
      .withMessage('Преимущества должны быть массивом')
      .custom((value) => {
        if (!Array.isArray(value)) return false;
        return value.every(item => typeof item === 'string' && item.length <= 200);
      })
      .withMessage('Каждое преимущество должно быть строкой до 200 символов'),

    body('dosage')
      .optional()
      .isLength({ max: 255 })
      .withMessage('Дозировка не должна превышать 255 символов'),

    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive должно быть булевым значением')
  ];

  static updateProduct = [
    param('id')
      .isUUID()
      .withMessage('Некорректный ID товара'),

    body('sku')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('SKU должен быть от 3 до 100 символов')
      .matches(/^[A-Z0-9-_]+$/)
      .withMessage('SKU может содержать только заглавные буквы, цифры, дефисы и подчеркивания'),

    body('name')
      .optional()
      .isLength({ min: 2, max: 255 })
      .withMessage('Название должно быть от 2 до 255 символов'),

    body('description')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('Описание не должно превышать 2000 символов'),

    body('imageUrl')
      .optional()
      .isURL()
      .withMessage('Некорректный URL изображения')
      .isLength({ max: 500 })
      .withMessage('URL изображения не должен превышать 500 символов'),

    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Цена должна быть положительным числом'),

    body('size')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Размер не должен превышать 100 символов'),

    body('quantity')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Количество должно быть неотрицательным целым числом'),

    body('categoryId')
      .optional()
      .isUUID()
      .withMessage('Некорректный ID категории'),

    body('restrictions')
      .optional()
      .isArray()
      .withMessage('Ограничения должны быть массивом')
      .custom((value) => {
        if (!Array.isArray(value)) return false;
        const validRestrictions = ['vegetarian', 'vegan', 'lactose_free', 'gluten_free', 'nut_free', 'diabetic'];
        return value.every(item => validRestrictions.includes(item));
      })
      .withMessage('Некорректные значения ограничений'),

    body('benefits')
      .optional()
      .isArray()
      .withMessage('Преимущества должны быть массивом')
      .custom((value) => {
        if (!Array.isArray(value)) return false;
        return value.every(item => typeof item === 'string' && item.length <= 200);
      })
      .withMessage('Каждое преимущество должно быть строкой до 200 символов'),

    body('dosage')
      .optional()
      .isLength({ max: 255 })
      .withMessage('Дозировка не должна превышать 255 символов'),

    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive должно быть булевым значением')
  ];

  static createCategory = [
    body('name')
      .notEmpty()
      .withMessage('Название категории обязательно')
      .isLength({ min: 2, max: 255 })
      .withMessage('Название должно быть от 2 до 255 символов'),

    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Описание не должно превышать 1000 символов')
  ];

  static updateCategory = [
    param('id')
      .isUUID()
      .withMessage('Некорректный ID категории'),

    body('name')
      .optional()
      .isLength({ min: 2, max: 255 })
      .withMessage('Название должно быть от 2 до 255 символов'),

    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Описание не должно превышать 1000 символов')
  ];

  static getById = [
    param('id')
      .isUUID()
      .withMessage('Некорректный ID')
  ];

  static search = [
    query('q')
      .notEmpty()
      .withMessage('Поисковый запрос обязателен')
      .isLength({ min: 2 })
      .withMessage('Поисковый запрос должен содержать минимум 2 символа'),
    query('categoryId')
      .optional()
      .isUUID()
      .withMessage('Некорректный ID категории')
  ];

  static addToCategory = [
    param('id')
      .isUUID()
      .withMessage('Некорректный ID товара'),
    body('categoryId')
      .isUUID()
      .withMessage('Некорректный ID категории'),
    body('isPrimary')
      .optional()
      .isBoolean()
      .withMessage('Поле isPrimary должно быть булевым значением')
  ];

  static removeFromCategory = [
    param('id')
      .isUUID()
      .withMessage('Некорректный ID товара'),
    param('categoryId')
      .isUUID()
      .withMessage('Некорректный ID категории')
  ];

  static addToVitaminRule = [
    param('id')
      .isUUID()
      .withMessage('Некорректный ID товара'),
    body('ruleId')
      .isUUID()
      .withMessage('Некорректный ID правила')
  ];

  static removeFromVitaminRule = [
    param('id')
      .isUUID()
      .withMessage('Некорректный ID товара'),
    param('ruleId')
      .isUUID()
      .withMessage('Некорректный ID правила')
  ];

  static updateQuantity = [
    param('id')
      .isUUID()
      .withMessage('Некорректный ID товара'),

    body('quantity')
      .isInt({ min: 0 })
      .withMessage('Количество должно быть неотрицательным целым числом')
  ];

  static addProductToRule = [
    body('ruleId')
      .isUUID()
      .withMessage('Некорректный ID правила'),

    body('productId')
      .isUUID()
      .withMessage('Некорректный ID товара')
  ];
}
