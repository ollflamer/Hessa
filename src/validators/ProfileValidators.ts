import { body, param } from 'express-validator';

export class ProfileValidators {
  static updateProfile = [
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Имя должно содержать от 2 до 100 символов')
      .trim(),
    
    body('avatarUrl')
      .optional()
      .isURL()
      .withMessage('Некорректный URL аватарки'),
    
    body('dateOfBirth')
      .optional()
      .isISO8601()
      .withMessage('Некорректная дата рождения')
      .custom((value) => {
        const date = new Date(value);
        const now = new Date();
        const age = now.getFullYear() - date.getFullYear();
        if (age < 5 || age > 120) {
          throw new Error('Возраст должен быть от 5 до 120 лет');
        }
        return true;
      }),
    
    body('city')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Название города должно содержать от 2 до 100 символов')
      .trim(),
    
    body('phone')
      .optional()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage('Некорректный номер телефона'),
    
    body('age')
      .optional()
      .isInt({ min: 5, max: 120 })
      .withMessage('Возраст должен быть от 5 до 120 лет'),
    
    body('gender')
      .optional()
      .isIn(['male', 'female'])
      .withMessage('Пол должен быть male или female'),
    
    body('stressLevel')
      .optional()
      .isIn(['none', 'moderate', 'high', 'constant'])
      .withMessage('Некорректный уровень стресса'),
    
    body('physicalActivity')
      .optional()
      .isIn(['none', '1_2_week', '3_5_week', 'daily'])
      .withMessage('Некорректный уровень физической активности'),
    
    body('dietQuality')
      .optional()
      .isIn(['daily', '3_4_week', 'rare'])
      .withMessage('Некорректное качество питания'),
    
    body('dietaryRestrictions')
      .optional()
      .isArray()
      .withMessage('Пищевые ограничения должны быть массивом')
      .custom((restrictions) => {
        const validRestrictions = [
          'vegetarian', 'vegan', 'lactose_free', 'gluten_free', 
          'nut_free', 'diabetic', 'none'
        ];
        for (const restriction of restrictions) {
          if (!validRestrictions.includes(restriction)) {
            throw new Error(`Некорректное пищевое ограничение: ${restriction}`);
          }
        }
        return true;
      }),
    
    body('healthConcerns')
      .optional()
      .isArray()
      .withMessage('Проблемы со здоровьем должны быть массивом')
      .custom((concerns) => {
        const validConcerns = [
          'fatigue', 'stress', 'skin_issues', 'sleep_problems',
          'digestive_issues', 'low_immunity', 'joint_pain', 'memory_issues', 'none'
        ];
        for (const concern of concerns) {
          if (!validConcerns.includes(concern)) {
            throw new Error(`Некорректная проблема со здоровьем: ${concern}`);
          }
        }
        return true;
      })
  ];

  static uploadAvatar = [
    body('file')
      .custom((value, { req }) => {
        if (!req.file) {
          throw new Error('Файл аватарки обязателен');
        }
        
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(req.file.mimetype)) {
          throw new Error('Разрешены только изображения JPEG, PNG, WebP');
        }
        
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (req.file.size > maxSize) {
          throw new Error('Размер файла не должен превышать 5MB');
        }
        
        return true;
      })
  ];

  static getProfileOptions = [];
}
