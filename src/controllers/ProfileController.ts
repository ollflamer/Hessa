import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { ProfileService } from '../services/ProfileService';
import { ReferralService } from '../services/ReferralService';
import { FileService } from '../services/FileService';
import { DatabaseService } from '../services/DatabaseService';
import { UpdateProfileDto } from '../models/User';
import { RequestWithUser } from '../types/auth';

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: Управление профилем пользователя
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         name:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, admin, moderator]
 *         avatarUrl:
 *           type: string
 *           format: uri
 *         dateOfBirth:
 *           type: string
 *           format: date
 *         city:
 *           type: string
 *         phone:
 *           type: string
 *         age:
 *           type: integer
 *         gender:
 *           type: string
 *           enum: [male, female]
 *         stressLevel:
 *           type: string
 *           enum: [none, moderate, high, constant]
 *         physicalActivity:
 *           type: string
 *           enum: [none, 1_2_week, 3_5_week, daily]
 *         dietQuality:
 *           type: string
 *           enum: [daily, 3_4_week, rare]
 *         dietaryRestrictions:
 *           type: array
 *           items:
 *             type: string
 *         healthConcerns:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

export class ProfileController extends BaseController {
  private profileService: ProfileService;
  private referralService: ReferralService;
  private fileService: FileService;

  constructor() {
    super();
    this.profileService = new ProfileService();
    this.referralService = new ReferralService(new DatabaseService());
    this.fileService = new FileService();
  }

  /**
   * @swagger
   * /api/profile:
   *   get:
   *     summary: Получить профиль текущего пользователя
   *     tags: [Profile]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Профиль пользователя
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/UserProfile'
   *       401:
   *         description: Требуется авторизация
   *       404:
   *         description: Пользователь не найден
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const profile = await this.profileService.getProfile(userId);
      
      if (!profile) {
        return this.handleError(res, 'Пользователь не найден', 404);
      }
      
      this.handleSuccess(res, profile);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/profile/extended:
   *   get:
   *     summary: Получить расширенный профиль с реферальной информацией
   *     tags: [Profile]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Расширенный профиль пользователя
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     profile:
   *                       $ref: '#/components/schemas/UserProfile'
   *                     referralInfo:
   *                       $ref: '#/components/schemas/UserReferralInfo'
   *       401:
   *         description: Требуется авторизация
   *       404:
   *         description: Пользователь не найден
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async getExtendedProfile(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      
      const [profile, referralInfo] = await Promise.all([
        this.profileService.getProfile(userId),
        this.referralService.getUserReferralInfo(userId)
      ]);
      
      if (!profile) {
        return this.handleError(res, 'Пользователь не найден', 404);
      }
      
      this.handleSuccess(res, {
        profile,
        referralInfo
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/profile:
   *   put:
   *     summary: Обновить профиль пользователя
   *     tags: [Profile]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: Имя пользователя
   *               avatarUrl:
   *                 type: string
   *                 format: uri
   *                 description: URL аватарки
   *               dateOfBirth:
   *                 type: string
   *                 format: date
   *                 description: Дата рождения
   *               city:
   *                 type: string
   *                 description: Город проживания
   *               phone:
   *                 type: string
   *                 description: Номер телефона
   *               age:
   *                 type: integer
   *                 minimum: 5
   *                 maximum: 120
   *                 description: Возраст
   *               gender:
   *                 type: string
   *                 enum: [male, female]
   *                 description: Пол
   *               stressLevel:
   *                 type: string
   *                 enum: [none, moderate, high, constant]
   *                 description: Уровень стресса
   *               physicalActivity:
   *                 type: string
   *                 enum: [none, 1_2_week, 3_5_week, daily]
   *                 description: Уровень физической активности
   *               dietQuality:
   *                 type: string
   *                 enum: [daily, 3_4_week, rare]
   *                 description: Качество питания
   *               dietaryRestrictions:
   *                 type: array
   *                 items:
   *                   type: string
   *                   enum: [vegetarian, vegan, lactose_free, gluten_free, nut_free, diabetic, none]
   *                 description: Пищевые ограничения
   *               healthConcerns:
   *                 type: array
   *                 items:
   *                   type: string
   *                   enum: [fatigue, stress, skin_issues, sleep_problems, digestive_issues, low_immunity, joint_pain, memory_issues, none]
   *                 description: Проблемы со здоровьем
   *           example:
   *             name: "Иван Петров"
   *             dateOfBirth: "1990-05-15"
   *             city: "Москва"
   *             phone: "+79161234567"
   *             age: 33
   *             gender: "male"
   *             stressLevel: "moderate"
   *             physicalActivity: "3_5_week"
   *             dietQuality: "daily"
   *             dietaryRestrictions: ["none"]
   *             healthConcerns: ["fatigue", "stress"]
   *     responses:
   *       200:
   *         description: Профиль успешно обновлен
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/UserProfile'
   *                 message:
   *                   type: string
   *                   example: "Профиль успешно обновлен"
   *       400:
   *         description: Ошибка валидации данных
   *       401:
   *         description: Требуется авторизация
   *       404:
   *         description: Пользователь не найден
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const updateData: UpdateProfileDto = req.body;
      
      const updatedProfile = await this.profileService.updateProfile(userId, updateData);
      this.handleSuccess(res, updatedProfile, 'Профиль успешно обновлен');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/profile/options:
   *   get:
   *     summary: Получить опции для полей профиля
   *     tags: [Profile]
   *     responses:
   *       200:
   *         description: Опции для полей профиля
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     genderOptions:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           value:
   *                             type: string
   *                           label:
   *                             type: string
   *                     stressLevelOptions:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           value:
   *                             type: string
   *                           label:
   *                             type: string
   *                     physicalActivityOptions:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           value:
   *                             type: string
   *                           label:
   *                             type: string
   *                     dietQualityOptions:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           value:
   *                             type: string
   *                           label:
   *                             type: string
   *                     dietaryRestrictionsOptions:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           value:
   *                             type: string
   *                           label:
   *                             type: string
   *                     healthConcernsOptions:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           value:
   *                             type: string
   *                           label:
   *                             type: string
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async getProfileOptions(req: Request, res: Response): Promise<void> {
    try {
      const options = await this.profileService.getProfileOptions();
      this.handleSuccess(res, options);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/profile/avatar:
   *   post:
   *     summary: Загрузить аватарку пользователя
   *     tags: [Profile]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               avatar:
   *                 type: string
   *                 format: binary
   *                 description: Файл аватарки (JPEG, PNG, WebP, макс. 5MB)
   *     responses:
   *       200:
   *         description: Аватарка успешно загружена
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/UserProfile'
   *                 message:
   *                   type: string
   *                   example: "Аватарка успешно загружена"
   *       400:
   *         description: Ошибка валидации файла
   *       401:
   *         description: Требуется авторизация
   *       413:
   *         description: Файл слишком большой
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async uploadAvatar(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const file = (req as any).file;
      
      if (!file) {
        return this.handleError(res, 'Файл аватарки не найден', 400);
      }
      
      this.fileService.validateImageFile(file, 5 * 1024 * 1024); // 5MB
      
      const uploadedFile = await this.fileService.uploadAvatar(file, userId);
      
      const updatedProfile = await this.profileService.uploadAvatar(userId, uploadedFile.url);
      this.handleSuccess(res, updatedProfile, 'Аватарка успешно загружена');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/profile/avatar:
   *   delete:
   *     summary: Удалить аватарку пользователя
   *     tags: [Profile]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Аватарка успешно удалена
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/UserProfile'
   *                 message:
   *                   type: string
   *                   example: "Аватарка успешно удалена"
   *       401:
   *         description: Требуется авторизация
   *       404:
   *         description: Пользователь не найден
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async deleteAvatar(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const updatedProfile = await this.profileService.deleteAvatar(userId);
      this.handleSuccess(res, updatedProfile, 'Аватарка успешно удалена');
    } catch (error) {
      this.handleError(res, error);
    }
  }
}
