import { BaseService } from './BaseService';
import { DatabaseService } from './DatabaseService';
import { ReferralService } from './ReferralService';
import { 
  Order, 
  OrderItem, 
  CreateOrderDto, 
  UpdateOrderStatusDto, 
  OrderFilters, 
  OrderSummary,
  OrderStatus 
} from '../models/Order';

export class OrderService extends BaseService {
  private dbService: DatabaseService;
  private referralService: ReferralService;

  constructor(dbService: DatabaseService, referralService?: ReferralService) {
    super();
    this.dbService = dbService;
    this.referralService = referralService || new ReferralService(dbService);
  }

  async create(userId: string, orderData: CreateOrderDto): Promise<Order> {
    return this.executeWithLogging('создание заказа', async () => {
      return await this.dbService.executeTransaction(async () => {
        const items = [];
        let totalAmount = 0;

        for (const item of orderData.items) {
          const product = await this.dbService.query(
            'SELECT id, sku, name, price, quantity FROM products WHERE id = $1 AND is_active = true',
            [item.productId]
          );

          if (product.length === 0) {
            throw new Error(`Товар с ID ${item.productId} не найден или неактивен`);
          }

          const productData = product[0];
          
          if (productData.quantity < item.quantity) {
            throw new Error(`Недостаточно товара "${productData.name}" на складе. Доступно: ${productData.quantity}`);
          }

          const unitPrice = parseFloat(productData.price);
          const totalPrice = unitPrice * item.quantity;
          totalAmount += totalPrice;

          items.push({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice,
            totalPrice,
            productData
          });
        }

        const orderResult = await this.dbService.query(
          `INSERT INTO orders (user_id, total_amount, shipping_address, phone, notes)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [userId, totalAmount, orderData.shippingAddress, orderData.phone, orderData.notes || null]
        );

        const order = orderResult[0];

        for (const item of items) {
          await this.dbService.query(
            `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
             VALUES ($1, $2, $3, $4, $5)`,
            [order.id, item.productId, item.quantity, item.unitPrice, item.totalPrice]
          );

          await this.dbService.query(
            'UPDATE products SET quantity = quantity - $1 WHERE id = $2',
            [item.quantity, item.productId]
          );
        }

        const createdOrder = await this.getById(order.id);
        if (!createdOrder) {
          throw new Error('Ошибка при создании заказа');
        }

        try {
          await this.referralService.processReferralReward(order.id);
        } catch (error) {
          console.warn('Ошибка при обработке реферальных баллов:', error);
        }

        return createdOrder;
      });
    });
  }

  async getById(id: string): Promise<Order | null> {
    return this.executeWithLogging('получение заказа по ID', async () => {
      const orderResult = await this.dbService.query(
        `SELECT o.*, u.name as user_name, u.email as user_email
         FROM orders o
         JOIN users u ON o.user_id = u.id
         WHERE o.id = $1`,
        [id]
      );

      if (orderResult.length === 0) {
        return null;
      }

      const order = this.mapToOrder(orderResult[0]);
      order.items = await this.getOrderItems(id);

      return order;
    });
  }

  async getByOrderNumber(orderNumber: string): Promise<Order | null> {
    return this.executeWithLogging('получение заказа по номеру', async () => {
      const orderResult = await this.dbService.query(
        `SELECT o.*, u.name as user_name, u.email as user_email
         FROM orders o
         JOIN users u ON o.user_id = u.id
         WHERE o.order_number = $1`,
        [orderNumber]
      );

      if (orderResult.length === 0) {
        return null;
      }

      const order = this.mapToOrder(orderResult[0]);
      order.items = await this.getOrderItems(order.id);

      return order;
    });
  }

  async getUserOrders(userId: string, limit = 20, offset = 0): Promise<Order[]> {
    return this.executeWithLogging('получение заказов пользователя', async () => {
      const result = await this.dbService.query(
        `SELECT o.*, u.name as user_name, u.email as user_email
         FROM orders o
         JOIN users u ON o.user_id = u.id
         WHERE o.user_id = $1
         ORDER BY o.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      const orders = result.map(row => this.mapToOrder(row));

      for (const order of orders) {
        order.items = await this.getOrderItems(order.id);
      }

      return orders;
    });
  }

  async getAll(filters: OrderFilters = {}, limit = 20, offset = 0): Promise<Order[]> {
    return this.executeWithLogging('получение всех заказов', async () => {
      let whereConditions = [];
      let params = [];
      let paramIndex = 1;

      if (filters.status) {
        whereConditions.push(`o.status = $${paramIndex}`);
        params.push(filters.status);
        paramIndex++;
      }

      if (filters.userId) {
        whereConditions.push(`o.user_id = $${paramIndex}`);
        params.push(filters.userId);
        paramIndex++;
      }

      if (filters.orderNumber) {
        whereConditions.push(`o.order_number ILIKE $${paramIndex}`);
        params.push(`%${filters.orderNumber}%`);
        paramIndex++;
      }

      if (filters.dateFrom) {
        whereConditions.push(`o.created_at >= $${paramIndex}`);
        params.push(filters.dateFrom);
        paramIndex++;
      }

      if (filters.dateTo) {
        whereConditions.push(`o.created_at <= $${paramIndex}`);
        params.push(filters.dateTo);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      params.push(limit, offset);

      const result = await this.dbService.query(
        `SELECT o.*, u.name as user_name, u.email as user_email
         FROM orders o
         JOIN users u ON o.user_id = u.id
         ${whereClause}
         ORDER BY o.created_at DESC
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        params
      );

      const orders = result.map(row => this.mapToOrder(row));

      for (const order of orders) {
        order.items = await this.getOrderItems(order.id);
      }

      return orders;
    });
  }

  async updateStatus(id: string, statusData: UpdateOrderStatusDto): Promise<Order | null> {
    return this.executeWithLogging('обновление статуса заказа', async () => {
      const result = await this.dbService.query(
        `UPDATE orders 
         SET status = $1, notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [statusData.status, statusData.notes, id]
      );

      if (result.length === 0) {
        return null;
      }

      return this.getById(id);
    });
  }

  async cancel(id: string, userId?: string): Promise<Order | null> {
    return this.executeWithLogging('отмена заказа', async () => {
      return await this.dbService.executeTransaction(async () => {
        const orderCheck = await this.dbService.query(
          `SELECT id, status, user_id FROM orders WHERE id = $1 ${userId ? 'AND user_id = $2' : ''}`,
          userId ? [id, userId] : [id]
        );

        if (orderCheck.length === 0) {
          throw new Error('Заказ не найден');
        }

        const order = orderCheck[0];
        
        if (order.status === 'delivered') {
          throw new Error('Нельзя отменить доставленный заказ');
        }

        if (order.status === 'cancelled') {
          throw new Error('Заказ уже отменен');
        }

        const items = await this.dbService.query(
          'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
          [id]
        );

        for (const item of items) {
          await this.dbService.query(
            'UPDATE products SET quantity = quantity + $1 WHERE id = $2',
            [item.quantity, item.product_id]
          );
        }

        await this.dbService.query(
          `UPDATE orders 
           SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [id]
        );

        return this.getById(id);
      });
    });
  }

  async getSummary(userId?: string): Promise<OrderSummary> {
    return this.executeWithLogging('получение сводки по заказам', async () => {
      const whereClause = userId ? 'WHERE user_id = $1' : '';
      const params = userId ? [userId] : [];

      const result = await this.dbService.query(
        `SELECT 
           COUNT(*) as total_orders,
           COALESCE(SUM(total_amount), 0) as total_amount,
           COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_count,
           COUNT(CASE WHEN status = 'shipping' THEN 1 END) as shipping_count,
           COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_count,
           COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count
         FROM orders ${whereClause}`,
        params
      );

      const row = result[0];

      return {
        totalOrders: parseInt(row.total_orders),
        totalAmount: parseFloat(row.total_amount),
        ordersByStatus: {
          processing: parseInt(row.processing_count),
          shipping: parseInt(row.shipping_count),
          delivered: parseInt(row.delivered_count),
          cancelled: parseInt(row.cancelled_count)
        }
      };
    });
  }

  private async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const result = await this.dbService.query(
      `SELECT oi.*, p.sku, p.name as product_name, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1
       ORDER BY oi.created_at ASC`,
      [orderId]
    );

    return result.map(row => this.mapToOrderItem(row));
  }

  private mapToOrder(row: any): Order {
    return {
      id: row.id,
      userId: row.user_id,
      orderNumber: row.order_number,
      status: row.status as OrderStatus,
      totalAmount: parseFloat(row.total_amount),
      shippingAddress: row.shipping_address,
      phone: row.phone,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      user: {
        id: row.user_id,
        name: row.user_name,
        email: row.user_email
      }
    };
  }

  private mapToOrderItem(row: any): OrderItem {
    return {
      id: row.id,
      orderId: row.order_id,
      productId: row.product_id,
      quantity: row.quantity,
      unitPrice: parseFloat(row.unit_price),
      totalPrice: parseFloat(row.total_price),
      createdAt: new Date(row.created_at),
      product: {
        id: row.product_id,
        sku: row.sku,
        name: row.product_name,
        imageUrl: row.image_url
      }
    };
  }
}
