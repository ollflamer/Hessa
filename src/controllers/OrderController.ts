import { Response } from 'express';
import { BaseController } from './BaseController';
import { OrderService } from '../services/OrderService';
import { CreateOrderDto, UpdateOrderStatusDto, OrderFilters } from '../models/Order';
import { RequestWithUser } from '../types';

export class OrderController extends BaseController {
  private orderService: OrderService;

  constructor(orderService: OrderService) {
    super();
    this.orderService = orderService;
  }

  /**
   * @swagger
   * /api/orders:
   *   post:
   *     summary: Создать новый заказ
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - shippingAddress
   *               - phone
   *               - items
   *             properties:
   *               shippingAddress:
   *                 type: string
   *                 minLength: 10
   *                 maxLength: 500
   *                 description: Адрес доставки
   *               phone:
   *                 type: string
   *                 pattern: '^[\+]?[0-9\s\-\(\)]{10,20}$'
   *                 description: Телефон для связи
   *               notes:
   *                 type: string
   *                 maxLength: 1000
   *                 description: Примечания к заказу
   *               items:
   *                 type: array
   *                 minItems: 1
   *                 items:
   *                   type: object
   *                   required:
   *                     - productId
   *                     - quantity
   *                   properties:
   *                     productId:
   *                       type: string
   *                       format: uuid
   *                       description: ID товара
   *                     quantity:
   *                       type: integer
   *                       minimum: 1
   *                       maximum: 100
   *                       description: Количество товара
   *           example:
   *             shippingAddress: "г. Москва, ул. Тверская, д. 1, кв. 10"
   *             phone: "+7 (999) 123-45-67"
   *             notes: "Доставить после 18:00"
   *             items:
   *               - productId: "123e4567-e89b-12d3-a456-426614174000"
   *                 quantity: 2
   *               - productId: "987f6543-e21c-43d2-b654-321987654321"
   *                 quantity: 1
   *     responses:
   *       201:
   *         description: Заказ успешно создан
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Order'
   *                 message:
   *                   type: string
   *                   example: "Заказ успешно создан"
   *       400:
   *         description: Ошибка валидации данных
   *       401:
   *         description: Требуется авторизация
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async createOrder(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        this.handleError(res, 'Пользователь не авторизован', 401);
        return;
      }

      const orderData: CreateOrderDto = req.body;
      const order = await this.orderService.create(userId, orderData);
      this.handleSuccess(res, order, 'Заказ успешно создан', 201);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/orders:
   *   get:
   *     summary: Получить список заказов
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [processing, shipping, delivered, cancelled]
   *         description: Фильтр по статусу заказа
   *       - in: query
   *         name: orderNumber
   *         schema:
   *           type: string
   *         description: Поиск по номеру заказа
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
   *         description: Количество заказов на странице
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           minimum: 0
   *           default: 0
   *         description: Смещение для пагинации
   *     responses:
   *       200:
   *         description: Список заказов
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
   *                     $ref: '#/components/schemas/Order'
   *       401:
   *         description: Требуется авторизация
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async getOrders(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { status, orderNumber, dateFrom, dateTo, limit = 20, offset = 0 } = req.query;
      const isAdmin = req.user?.role === 'admin';

      const filters: OrderFilters = {
        status: status as any,
        orderNumber: orderNumber as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string
      };

      // Обычные пользователи видят только свои заказы
      if (!isAdmin) {
        filters.userId = req.user?.id;
      }

      const orders = await this.orderService.getAll(filters, Number(limit), Number(offset));
      this.handleSuccess(res, orders);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/orders/{id}:
   *   get:
   *     summary: Получить заказ по ID
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID заказа
   *     responses:
   *       200:
   *         description: Данные заказа
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Order'
   *       400:
   *         description: Некорректный ID заказа
   *       401:
   *         description: Требуется авторизация
   *       403:
   *         description: Нет доступа к заказу
   *       404:
   *         description: Заказ не найден
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async getOrderById(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await this.orderService.getById(id);

      if (!order) {
        this.handleError(res, 'Заказ не найден', 404);
        return;
      }

      // Проверяем права доступа
      const isAdmin = req.user?.role === 'admin';
      const isOwner = req.user?.id === order.userId;

      if (!isAdmin && !isOwner) {
        this.handleError(res, 'Нет доступа к заказу', 403);
        return;
      }

      this.handleSuccess(res, order);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/orders/number/{orderNumber}:
   *   get:
   *     summary: Получить заказ по номеру
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: orderNumber
   *         required: true
   *         schema:
   *           type: string
   *         description: Номер заказа
   *     responses:
   *       200:
   *         description: Данные заказа
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Order'
   *       401:
   *         description: Требуется авторизация
   *       403:
   *         description: Нет доступа к заказу
   *       404:
   *         description: Заказ не найден
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async getOrderByNumber(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { orderNumber } = req.params;
      const order = await this.orderService.getByOrderNumber(orderNumber);

      if (!order) {
        this.handleError(res, 'Заказ не найден', 404);
        return;
      }

      // Проверяем права доступа
      const isAdmin = req.user?.role === 'admin';
      const isOwner = req.user?.id === order.userId;

      if (!isAdmin && !isOwner) {
        this.handleError(res, 'Нет доступа к заказу', 403);
        return;
      }

      this.handleSuccess(res, order);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/orders/{id}/status:
   *   patch:
   *     summary: Обновить статус заказа (только для админов)
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID заказа
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
   *                 enum: [processing, shipping, delivered, cancelled]
   *                 description: Новый статус заказа
   *               notes:
   *                 type: string
   *                 maxLength: 1000
   *                 description: Примечания к изменению статуса
   *           example:
   *             status: "shipping"
   *             notes: "Заказ передан в службу доставки"
   *     responses:
   *       200:
   *         description: Статус заказа успешно обновлен
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Order'
   *                 message:
   *                   type: string
   *                   example: "Статус заказа обновлен"
   *       400:
   *         description: Ошибка валидации данных
   *       401:
   *         description: Требуется авторизация
   *       403:
   *         description: Недостаточно прав (только админы)
   *       404:
   *         description: Заказ не найден
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async updateOrderStatus(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const statusData: UpdateOrderStatusDto = req.body;

      const order = await this.orderService.updateStatus(id, statusData);

      if (!order) {
        this.handleError(res, 'Заказ не найден', 404);
        return;
      }

      this.handleSuccess(res, order, 'Статус заказа обновлен');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/orders/{id}/cancel:
   *   patch:
   *     summary: Отменить заказ
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID заказа
   *     responses:
   *       200:
   *         description: Заказ успешно отменен
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Order'
   *                 message:
   *                   type: string
   *                   example: "Заказ отменен"
   *       400:
   *         description: Заказ нельзя отменить
   *       401:
   *         description: Требуется авторизация
   *       403:
   *         description: Нет доступа к заказу
   *       404:
   *         description: Заказ не найден
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async cancelOrder(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const isAdmin = req.user?.role === 'admin';
      const userId = isAdmin ? undefined : req.user?.id;

      const order = await this.orderService.cancel(id, userId);

      if (!order) {
        this.handleError(res, 'Заказ не найден', 404);
        return;
      }

      this.handleSuccess(res, order, 'Заказ отменен');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/orders/my:
   *   get:
   *     summary: Получить мои заказы
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *         description: Количество заказов на странице
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           minimum: 0
   *           default: 0
   *         description: Смещение для пагинации
   *     responses:
   *       200:
   *         description: Список моих заказов
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
   *                     $ref: '#/components/schemas/Order'
   *       401:
   *         description: Требуется авторизация
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async getMyOrders(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        this.handleError(res, 'Пользователь не авторизован', 401);
        return;
      }

      const { limit = 20, offset = 0 } = req.query;
      const orders = await this.orderService.getUserOrders(userId, Number(limit), Number(offset));
      this.handleSuccess(res, orders);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/orders/summary:
   *   get:
   *     summary: Получить сводку по заказам
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Сводка по заказам
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
   *                     totalOrders:
   *                       type: integer
   *                       description: Общее количество заказов
   *                     totalAmount:
   *                       type: number
   *                       description: Общая сумма заказов
   *                     ordersByStatus:
   *                       type: object
   *                       properties:
   *                         processing:
   *                           type: integer
   *                         shipping:
   *                           type: integer
   *                         delivered:
   *                           type: integer
   *                         cancelled:
   *                           type: integer
   *       401:
   *         description: Требуется авторизация
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async getOrdersSummary(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const isAdmin = req.user?.role === 'admin';
      const userId = isAdmin ? undefined : req.user?.id;

      const summary = await this.orderService.getSummary(userId);
      this.handleSuccess(res, summary);
    } catch (error) {
      this.handleError(res, error);
    }
  }
}
