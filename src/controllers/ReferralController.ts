import { Response } from 'express';
import { BaseController } from './BaseController';
import { ReferralService } from '../services/ReferralService';
import { RequestWithUser } from '../types/auth';
import { ReferralFilters, PointTransactionFilters, SpendPointsDto } from '../models/Referral';

export class ReferralController extends BaseController {
  private referralService: ReferralService;

  constructor(referralService: ReferralService) {
    super();
    this.referralService = referralService;
  }

  /**
   * @swagger
   * /api/referrals/link:
   *   get:
   *     summary: Получить реферальную ссылку пользователя
   *     tags: [Referrals]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Реферальная ссылка пользователя
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
   *                     referralCode:
   *                       type: string
   *                       description: Реферальный код
   *                       example: "ABC123DEF"
   *                     referralUrl:
   *                       type: string
   *                       format: uri
   *                       description: Полная реферальная ссылка
   *                       example: "http://localhost:3000/register?ref=ABC123DEF"
   *                     shareText:
   *                       type: string
   *                       description: Текст для отправки
   *                       example: "Присоединяйся к Hessa по моей ссылке и получи бонусы!"
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  async getReferralLink(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const referralInfo = await this.referralService.getUserReferralInfo(userId);
      
      const shareText = `Присоединяйся к Hessa по моей ссылке и получи бонусы! ${referralInfo.referralUrl}`;
      
      this.handleSuccess(res, {
        referralCode: referralInfo.referralCode,
        referralUrl: referralInfo.referralUrl,
        shareText
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/referrals/info:
   *   get:
   *     summary: Получить реферальную информацию пользователя
   *     tags: [Referrals]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Реферальная информация пользователя
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/UserReferralInfo'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  async getReferralInfo(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const referralInfo = await this.referralService.getUserReferralInfo(userId);
      this.handleSuccess(res, referralInfo);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/referrals/my:
   *   get:
   *     summary: Получить список моих рефералов
   *     tags: [Referrals]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [active, inactive]
   *         description: Статус реферала
   *       - in: query
   *         name: dateFrom
   *         schema:
   *           type: string
   *           format: date
   *         description: Дата начала периода
   *       - in: query
   *         name: dateTo
   *         schema:
   *           type: string
   *           format: date
   *         description: Дата окончания периода
   *       - in: query
   *         name: hasOrders
   *         schema:
   *           type: boolean
   *         description: Фильтр по наличию заказов
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *         description: Количество записей
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           minimum: 0
   *           default: 0
   *         description: Смещение
   *     responses:
   *       200:
   *         description: Список рефералов
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Referral'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  async getMyReferrals(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { status, dateFrom, dateTo, hasOrders, limit = 20, offset = 0 } = req.query;

      const filters: ReferralFilters = {
        status: status as any,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
        hasOrders: hasOrders === 'true' ? true : hasOrders === 'false' ? false : undefined
      };

      const referrals = await this.referralService.getUserReferrals(
        userId, 
        filters, 
        parseInt(limit as string), 
        parseInt(offset as string)
      );

      this.handleSuccess(res, referrals);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/referrals/points/history:
   *   get:
   *     summary: Получить историю баллов
   *     tags: [Referrals]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: transactionType
   *         schema:
   *           type: string
   *           enum: [earned, spent, expired, bonus]
   *         description: Тип транзакции
   *       - in: query
   *         name: sourceType
   *         schema:
   *           type: string
   *           enum: [referral, order, bonus, admin, usage]
   *         description: Источник транзакции
   *       - in: query
   *         name: dateFrom
   *         schema:
   *           type: string
   *           format: date
   *         description: Дата начала периода
   *       - in: query
   *         name: dateTo
   *         schema:
   *           type: string
   *           format: date
   *         description: Дата окончания периода
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *         description: Количество записей
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           minimum: 0
   *           default: 0
   *         description: Смещение
   *     responses:
   *       200:
   *         description: История баллов
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/PointsHistory'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  async getPointsHistory(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { transactionType, sourceType, dateFrom, dateTo, limit = 20, offset = 0 } = req.query;

      const filters: PointTransactionFilters = {
        transactionType: transactionType as any,
        sourceType: sourceType as any,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string
      };

      const history = await this.referralService.getPointsHistory(
        userId, 
        filters, 
        parseInt(limit as string), 
        parseInt(offset as string)
      );

      this.handleSuccess(res, history);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/referrals/points/spend:
   *   post:
   *     summary: Потратить баллы
   *     tags: [Referrals]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - pointsAmount
   *               - description
   *               - sourceType
   *             properties:
   *               pointsAmount:
   *                 type: integer
   *                 minimum: 1
   *                 description: Количество баллов для списания
   *                 example: 100
   *               description:
   *                 type: string
   *                 maxLength: 500
   *                 description: Описание трат
   *                 example: "Оплата заказа №ORD-20241201-0001"
   *               sourceType:
   *                 type: string
   *                 enum: [usage, admin]
   *                 description: Тип источника
   *                 example: "usage"
   *               sourceId:
   *                 type: string
   *                 format: uuid
   *                 description: ID источника (например, ID заказа)
   *     responses:
   *       200:
   *         description: Баллы успешно списаны
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/PointTransaction'
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  async spendPoints(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const spendData: SpendPointsDto = req.body;

      const transaction = await this.referralService.spendPoints(userId, spendData);
      this.handleSuccess(res, transaction);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/referrals/stats:
   *   get:
   *     summary: Получить статистику рефералов
   *     tags: [Referrals]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Статистика рефералов
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/ReferralStats'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  async getMyStats(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const stats = await this.referralService.getReferralStats(userId);
      this.handleSuccess(res, stats);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/referrals/code/{code}:
   *   get:
   *     summary: Получить информацию о реферале по коду
   *     tags: [Referrals]
   *     parameters:
   *       - in: path
   *         name: code
   *         required: true
   *         schema:
   *           type: string
   *           pattern: '^[A-Z0-9]{6,20}$'
   *         description: Реферальный код
   *         example: "ABC123DEF"
   *     responses:
   *       200:
   *         description: Информация о реферале
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/UserReferralInfo'
   *       404:
   *         description: Реферальный код не найден
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  async getReferralByCode(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { code } = req.params;
      const referralInfo = await this.referralService.getReferralByCode(code);
      
      if (!referralInfo) {
        return this.handleError(res, new Error('Реферальный код не найден'), 404);
      }

      this.handleSuccess(res, referralInfo);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/referrals/admin/stats:
   *   get:
   *     summary: Получить общую статистику рефералов (только админы)
   *     tags: [Referrals]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Общая статистика рефералов
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/ReferralStats'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  async getAdminStats(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const stats = await this.referralService.getReferralStats();
      this.handleSuccess(res, stats);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/referrals/admin/users/{userId}/points/award:
   *   post:
   *     summary: Начислить баллы пользователю (только админы)
   *     tags: [Referrals]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID пользователя
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - pointsAmount
   *               - description
   *             properties:
   *               pointsAmount:
   *                 type: integer
   *                 minimum: 1
   *                 description: Количество баллов для начисления
   *                 example: 500
   *               description:
   *                 type: string
   *                 maxLength: 500
   *                 description: Описание начисления
   *                 example: "Бонус за активность"
   *               sourceType:
   *                 type: string
   *                 enum: [admin, bonus]
   *                 default: admin
   *                 description: Тип источника
   *               expiresAt:
   *                 type: string
   *                 format: date-time
   *                 description: Дата истечения баллов
   *     responses:
   *       200:
   *         description: Баллы успешно начислены
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/PointTransaction'
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  async adminAwardPoints(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { pointsAmount, description, sourceType = 'admin', expiresAt } = req.body;

      const transaction = await this.referralService.awardPoints(
        userId,
        pointsAmount,
        description,
        sourceType,
        undefined,
        expiresAt ? new Date(expiresAt) : undefined
      );

      this.handleSuccess(res, transaction);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/referrals/admin/users/{userId}/points/spend:
   *   post:
   *     summary: Списать баллы у пользователя (только админы)
   *     tags: [Referrals]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID пользователя
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - pointsAmount
   *               - description
   *               - sourceType
   *             properties:
   *               pointsAmount:
   *                 type: integer
   *                 minimum: 1
   *                 description: Количество баллов для списания
   *                 example: 100
   *               description:
   *                 type: string
   *                 maxLength: 500
   *                 description: Описание списания
   *                 example: "Корректировка баланса"
   *               sourceType:
   *                 type: string
   *                 enum: [admin, bonus]
   *                 description: Тип источника
   *               sourceId:
   *                 type: string
   *                 format: uuid
   *                 description: ID источника
   *     responses:
   *       200:
   *         description: Баллы успешно списаны
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/PointTransaction'
   *       400:
   *         $ref: '#/components/responses/ValidationError'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       500:
   *         $ref: '#/components/responses/InternalError'
   */
  async adminSpendPoints(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const spendData: SpendPointsDto = req.body;

      const transaction = await this.referralService.spendPoints(userId, spendData);
      this.handleSuccess(res, transaction);
    } catch (error) {
      this.handleError(res, error);
    }
  }
}
