import { Response } from 'express';
import { BaseController } from './BaseController';
import { SurveyService } from '../services/SurveyService';
import { SurveyDto } from '../validators/SurveyValidators';
import { logger } from '../utils/logger';
import { RequestWithUser } from '../types';

/**
 * @swagger
 * components:
 *   schemas:
 *     SurveyRequest:
 *       type: object
 *       required:
 *         - ageGroup
 *         - gender
 *         - activityLevel
 *         - stressLevel
 *         - nutrition
 *       properties:
 *         ageGroup:
 *           type: string
 *           enum: [under_18, 18_30, 31_45, 46_60, 60_plus]
 *           description: Возрастная группа
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           description: Пол
 *         activityLevel:
 *           type: string
 *           enum: [none, 1_2_week, 3_5_week, daily]
 *           description: Уровень физической активности
 *         stressLevel:
 *           type: string
 *           enum: [low, medium, high, constant]
 *           description: Уровень стресса
 *         nutrition:
 *           type: string
 *           enum: [daily, 3_4_week, rare]
 *           description: Качество питания
 *         restrictions:
 *           type: array
 *           items:
 *             type: string
 *             enum: [vegetarian, vegan, lactose_free, gluten_free, nut_free, diabetic]
 *           description: Пищевые ограничения
 *         complaints:
 *           type: array
 *           items:
 *             type: string
 *             enum: [fatigue, stress, skin_issues, sleep_problems, digestive_issues, low_immunity, joint_pain, memory_issues]
 *           description: Жалобы на здоровье
 *         goals:
 *           type: array
 *           items:
 *             type: string
 *             enum: [energy, immunity, skin_health, stress_relief, better_sleep, weight_management, muscle_building, heart_health]
 *           description: Цели приема витаминов
 *         vitaminsCurrently:
 *           type: array
 *           items:
 *             type: string
 *             enum: [vitamin_d, magnesium, b_complex, omega_3, zinc, iron, calcium, probiotics]
 *           description: Витамины, которые принимаете сейчас
 *     
 *     Vitamin:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор
 *         name:
 *           type: string
 *           description: Название категории витамина
 *         category:
 *           type: string
 *           description: Категория
 *         description:
 *           type: string
 *           description: Описание категории
 *         benefits:
 *           type: array
 *           items:
 *             type: string
 *           description: Полезные свойства
 *         dosage:
 *           type: string
 *           description: Рекомендуемая дозировка
 *         
 *     VitaminRecommendation:
 *       type: object
 *       properties:
 *         vitamin:
 *           $ref: '#/components/schemas/Vitamin'
 *         reasons:
 *           type: array
 *           items:
 *             type: string
 *           description: Причины рекомендации
 *         priority:
 *           type: integer
 *           description: Приоритет рекомендации
 */

export class SurveyController extends BaseController {
  private surveyService: SurveyService;

  constructor() {
    super();
    this.surveyService = new SurveyService();
  }

  /**
   * @swagger
   * /api/survey:
   *   post:
   *     summary: Сохранить результаты опросника
   *     tags: [Survey]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/SurveyRequest'
   *     responses:
   *       200:
   *         description: Опрос успешно сохранен
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *       400:
   *         description: Ошибка валидации
   *       401:
   *         description: Не авторизован
   */
  async saveSurvey(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return this.handleError(res, 'Пользователь не найден', 401);
      }

      const surveyData = req.body as any;
      
      const result = await this.surveyService.saveSurvey(userId, surveyData);
      
      logger.info(`[SurveyController] Опрос сохранен для пользователя ${userId}`);
      
      this.handleSuccess(res, {
        surveyCompleted: result.surveyCompleted,
        completedAt: result.surveyCompletedAt
      }, 'Опрос успешно сохранен', 201);
    } catch (error) {
      logger.error('[SurveyController] Ошибка сохранения опроса:', error);
      this.handleError(res, 'Ошибка сохранения опроса');
    }
  }

  /**
   * @swagger
   * /api/survey:
   *   get:
   *     summary: Получить результаты опросника пользователя
   *     tags: [Survey]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Результаты опросника
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *       401:
   *         description: Не авторизован
   *       404:
   *         description: Опрос не найден
   */
  async getSurvey(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return this.handleError(res, 'Пользователь не найден', 401);
      }

      const survey = await this.surveyService.getUserSurvey(userId);
      
      if (!survey) {
        return this.handleError(res, 'Опрос не найден', 404);
      }

      this.handleSuccess(res, survey, 'Опрос получен');
    } catch (error) {
      logger.error('[SurveyController] Ошибка получения опроса:', error);
      this.handleError(res, 'Ошибка получения опроса');
    }
  }

  /**
   * @swagger
   * /api/survey/recommendations:
   *   get:
   *     summary: Получить персональные рекомендации витаминов
   *     tags: [Survey]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Персональные рекомендации
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/VitaminRecommendation'
   *       401:
   *         description: Не авторизован
   *       404:
   *         description: Опрос не пройден
   */
  async getRecommendations(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return this.handleError(res, 'Пользователь не найден', 401);
      }

      const recommendations = await this.surveyService.getVitaminRecommendations(userId);
      
      if (recommendations.length === 0) {
        return this.handleError(res, 'Сначала пройдите опрос для получения рекомендаций', 404);
      }

      logger.info(`[SurveyController] Получены рекомендации для пользователя ${userId}: ${recommendations.length} витаминов`);
      
      this.handleSuccess(res, {
        recommendations,
        total: recommendations.length,
        message: 'Персональные рекомендации на основе вашего опроса'
      }, 'Рекомендации получены');
    } catch (error) {
      logger.error('[SurveyController] Ошибка получения рекомендаций:', error);
      this.handleError(res, 'Ошибка получения рекомендаций');
    }
  }

  /**
   * @swagger
   * /api/survey/questions:
   *   get:
   *     summary: Получить вопросы опросника с вариантами ответов
   *     tags: [Survey]
   *     responses:
   *       200:
   *         description: Вопросы опросника
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   */
  async getQuestions(req: Request, res: Response): Promise<void> {
    try {
      const questions = {
        ageGroup: {
          question: 'Ваш возраст?',
          type: 'single',
          options: [
            { value: 'under_18', label: 'До 18 лет' },
            { value: '18_30', label: '18-30 лет' },
            { value: '31_45', label: '31-45 лет' },
            { value: '46_60', label: '46-60 лет' },
            { value: '60_plus', label: 'Старше 60 лет' }
          ]
        },
        gender: {
          question: 'Ваш пол?',
          type: 'single',
          options: [
            { value: 'male', label: 'Мужской' },
            { value: 'female', label: 'Женский' },
            { value: 'other', label: 'Другой' }
          ]
        },
        activityLevel: {
          question: 'Как часто вы занимаетесь спортом?',
          type: 'single',
          options: [
            { value: 'none', label: 'Не занимаюсь' },
            { value: '1_2_week', label: '1-2 раза в неделю' },
            { value: '3_5_week', label: '3-5 раз в неделю' },
            { value: 'daily', label: 'Каждый день' }
          ]
        },
        stressLevel: {
          question: 'Как вы оцениваете уровень стресса в вашей жизни?',
          type: 'single',
          options: [
            { value: 'low', label: 'Низкий' },
            { value: 'medium', label: 'Средний' },
            { value: 'high', label: 'Высокий' },
            { value: 'constant', label: 'Постоянный стресс' }
          ]
        },
        nutrition: {
          question: 'Как часто вы едите полноценную здоровую пищу?',
          type: 'single',
          options: [
            { value: 'daily', label: 'Каждый день' },
            { value: '3_4_week', label: '3-4 раза в неделю' },
            { value: 'rare', label: 'Редко' }
          ]
        },
        restrictions: {
          question: 'Есть ли у вас пищевые ограничения? (можно выбрать несколько)',
          type: 'multiple',
          options: [
            { value: 'vegetarian', label: 'Вегетарианство' },
            { value: 'vegan', label: 'Веганство' },
            { value: 'lactose_free', label: 'Непереносимость лактозы' },
            { value: 'gluten_free', label: 'Непереносимость глютена' },
            { value: 'nut_free', label: 'Аллергия на орехи' },
            { value: 'diabetic', label: 'Диабет' }
          ]
        },
        complaints: {
          question: 'Какие проблемы со здоровьем вас беспокоят? (можно выбрать несколько)',
          type: 'multiple',
          options: [
            { value: 'fatigue', label: 'Усталость' },
            { value: 'stress', label: 'Стресс' },
            { value: 'skin_issues', label: 'Проблемы с кожей' },
            { value: 'sleep_problems', label: 'Проблемы со сном' },
            { value: 'digestive_issues', label: 'Проблемы с пищеварением' },
            { value: 'low_immunity', label: 'Слабый иммунитет' },
            { value: 'joint_pain', label: 'Боли в суставах' },
            { value: 'memory_issues', label: 'Проблемы с памятью' }
          ]
        },
        goals: {
          question: 'Каких целей вы хотите достичь? (можно выбрать несколько)',
          type: 'multiple',
          options: [
            { value: 'energy', label: 'Повысить энергию' },
            { value: 'immunity', label: 'Укрепить иммунитет' },
            { value: 'skin_health', label: 'Улучшить состояние кожи' },
            { value: 'stress_relief', label: 'Снизить стресс' },
            { value: 'better_sleep', label: 'Улучшить сон' },
            { value: 'weight_management', label: 'Контроль веса' },
            { value: 'muscle_building', label: 'Набор мышечной массы' },
            { value: 'heart_health', label: 'Здоровье сердца' }
          ]
        },
        vitaminsCurrently: {
          question: 'Какие витамины вы принимаете сейчас? (можно выбрать несколько)',
          type: 'multiple',
          options: [
            { value: 'vitamin_d', label: 'Витамин D' },
            { value: 'magnesium', label: 'Магний' },
            { value: 'b_complex', label: 'B-комплекс' },
            { value: 'omega_3', label: 'Омега-3' },
            { value: 'zinc', label: 'Цинк' },
            { value: 'iron', label: 'Железо' },
            { value: 'calcium', label: 'Кальций' },
            { value: 'probiotics', label: 'Пробиотики' }
          ]
        }
      };

      this.handleSuccess(res, questions, 'Вопросы получены');
    } catch (error) {
      logger.error('[SurveyController] Ошибка получения вопросов:', error);
      this.handleError(res, 'Ошибка получения вопросов');
    }
  }
}
