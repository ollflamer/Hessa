import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { feedbackService } from '../services/FeedbackService';

/**
 * @swagger
 * components:
 *   schemas:
 *     Feedback:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Уникальный идентификатор сообщения
 *         name:
 *           type: string
 *           description: Имя отправителя
 *         email:
 *           type: string
 *           format: email
 *           description: Email отправителя
 *         text:
 *           type: string
 *           description: Текст сообщения
 *         response:
 *           type: string
 *           description: Ответ администратора
 *         status:
 *           type: string
 *           enum: [pending, in_progress, answered, closed]
 *           description: Статус сообщения
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Дата создания
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Дата обновления
 *         respondedAt:
 *           type: string
 *           format: date-time
 *           description: Дата ответа
 *     CreateFeedbackRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - text
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Имя отправителя
 *         email:
 *           type: string
 *           format: email
 *           description: Email отправителя
 *         text:
 *           type: string
 *           minLength: 10
 *           maxLength: 2000
 *           description: Текст сообщения
 *     FeedbackResponse:
 *       type: object
 *       required:
 *         - response
 *       properties:
 *         response:
 *           type: string
 *           minLength: 5
 *           maxLength: 2000
 *           description: Ответ администратора
 */

export class FeedbackController extends BaseController {

  /**
   * @swagger
   * /api/feedback:
   *   post:
   *     summary: Создать новое сообщение обратной связи
   *     tags: [Feedback]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateFeedbackRequest'
   *     responses:
   *       201:
   *         description: Сообщение успешно создано
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         feedback:
   *                           $ref: '#/components/schemas/Feedback'
   *                         messageId:
   *                           type: string
   *                           description: ID сообщения для отслеживания
   *       400:
   *         description: Ошибка валидации или превышен лимит сообщений
   *       429:
   *         description: Слишком много запросов
   */
  public createFeedback = (req: Request, res: Response) => {
    this.executeAsync(req, res, async () => {
      const { name, email, text } = req.body;
      const ipAddress = req.ip;
      
      const feedback = await feedbackService.createFeedback({ name, email, text }, ipAddress);
      
      this.handleSuccess(res, { 
        feedback, 
        messageId: feedback.id 
      }, 'Сообщение успешно отправлено');
    });
  };

  /**
   * @swagger
   * /api/feedback:
   *   get:
   *     summary: Получить все сообщения (только для админов)
   *     tags: [Feedback]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [pending, in_progress, answered, closed]
   *         description: Фильтр по статусу
   *       - in: query
   *         name: email
   *         schema:
   *           type: string
   *         description: Фильтр по email
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
   *         description: Количество записей на странице
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           minimum: 0
   *           default: 0
   *         description: Смещение для пагинации
   *     responses:
   *       200:
   *         description: Список сообщений
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         feedback:
   *                           type: array
   *                           items:
   *                             $ref: '#/components/schemas/Feedback'
   *                         total:
   *                           type: integer
   *                         limit:
   *                           type: integer
   *                         offset:
   *                           type: integer
   */
  public getAllFeedback = (req: Request, res: Response) => {
    this.executeAsync(req, res, async () => {
      const filters = {
        status: req.query.status as string,
        email: req.query.email as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        limit: parseInt(req.query.limit as string) || 20,
        offset: parseInt(req.query.offset as string) || 0
      };
      
      const result = await feedbackService.getAllFeedback(filters);
      
      this.handleSuccess(res, {
        ...result,
        limit: filters.limit,
        offset: filters.offset
      }, 'Сообщения получены успешно');
    });
  };

  /**
   * @swagger
   * /api/feedback/{id}:
   *   get:
   *     summary: Получить сообщение по ID
   *     tags: [Feedback]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID сообщения
   *     responses:
   *       200:
   *         description: Сообщение найдено
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         feedback:
   *                           $ref: '#/components/schemas/Feedback'
   *       404:
   *         description: Сообщение не найдено
   */
  public getFeedbackById = (req: Request, res: Response) => {
    this.executeAsync(req, res, async () => {
      const { id } = req.params;
      
      const feedback = await feedbackService.getFeedbackById(id);
      
      if (!feedback) {
        return this.handleError(res, 'Сообщение не найдено', 404);
      }
      
      this.handleSuccess(res, { feedback }, 'Сообщение получено успешно');
    });
  };

  /**
   * @swagger
   * /api/feedback/{id}/response:
   *   post:
   *     summary: Ответить на сообщение (только для админов)
   *     tags: [Feedback]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID сообщения
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/FeedbackResponse'
   *     responses:
   *       200:
   *         description: Ответ успешно отправлен
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         feedback:
   *                           $ref: '#/components/schemas/Feedback'
   *       404:
   *         description: Сообщение не найдено
   */
  public respondToFeedback = (req: Request, res: Response) => {
    this.executeAsync(req, res, async () => {
      const { id } = req.params;
      const { response } = req.body;
      const adminId = (req as any).user?.id;
      
      const feedback = await feedbackService.respondToFeedback(id, response, adminId);
      
      this.handleSuccess(res, { feedback }, 'Ответ успешно отправлен');
    });
  };

  /**
   * @swagger
   * /api/feedback/{id}/status:
   *   patch:
   *     summary: Изменить статус сообщения (только для админов)
   *     tags: [Feedback]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID сообщения
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - status
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [pending, in_progress, answered, closed]
   *                 description: Новый статус сообщения
   *     responses:
   *       200:
   *         description: Статус успешно изменен
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         feedback:
   *                           $ref: '#/components/schemas/Feedback'
   *       404:
   *         description: Сообщение не найдено
   */
  public updateFeedbackStatus = (req: Request, res: Response) => {
    this.executeAsync(req, res, async () => {
      const { id } = req.params;
      const { status } = req.body;
      const adminId = (req as any).user?.id;
      
      const feedback = await feedbackService.updateFeedbackStatus(id, status, adminId);
      
      this.handleSuccess(res, { feedback }, 'Статус успешно обновлен');
    });
  };
}
