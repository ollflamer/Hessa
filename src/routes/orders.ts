import { Router, Request, Response } from 'express';
import { OrderController } from '../controllers/OrderController';
import { OrderService } from '../services/OrderService';
import { DatabaseService } from '../services/DatabaseService';
import { authMiddleware } from '../middleware/auth';
import { validationResult } from 'express-validator';
import { 
  createOrderValidator,
  updateOrderStatusValidator,
  getOrderValidator,
  getOrdersValidator
} from '../validators/OrderValidators';

const router = Router();
const dbService = new DatabaseService();
const orderService = new OrderService(dbService);
const orderController = new OrderController(orderService);

// Middleware для валидации
const validateRequest = (req: Request, res: Response, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Ошибка валидации',
      details: errors.array()
    });
  }
  next();
};

// Middleware для проверки админских прав
const requireAdmin = (req: any, res: Response, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Недостаточно прав (требуются права администратора)'
    });
  }
  next();
};

// Создание заказа (требует авторизации)
router.post('/', 
  authMiddleware,
  createOrderValidator,
  validateRequest,
  (req: Request, res: Response) => orderController.createOrder(req as any, res)
);

// Получение списка заказов (админы видят все, пользователи - только свои)
router.get('/',
  authMiddleware,
  getOrdersValidator,
  validateRequest,
  (req: Request, res: Response) => orderController.getOrders(req as any, res)
);

// Получение моих заказов
router.get('/my',
  authMiddleware,
  (req: Request, res: Response) => orderController.getMyOrders(req as any, res)
);

// Получение сводки по заказам
router.get('/summary',
  authMiddleware,
  (req: Request, res: Response) => orderController.getOrdersSummary(req as any, res)
);

// Получение заказа по ID
router.get('/:id',
  authMiddleware,
  getOrderValidator,
  validateRequest,
  (req: Request, res: Response) => orderController.getOrderById(req as any, res)
);

// Получение заказа по номеру
router.get('/number/:orderNumber',
  authMiddleware,
  (req: Request, res: Response) => orderController.getOrderByNumber(req as any, res)
);

// Обновление статуса заказа (только админы)
router.patch('/:id/status',
  authMiddleware,
  requireAdmin,
  updateOrderStatusValidator,
  validateRequest,
  (req: Request, res: Response) => orderController.updateOrderStatus(req as any, res)
);

// Отмена заказа (владелец заказа или админ)
router.patch('/:id/cancel',
  authMiddleware,
  getOrderValidator,
  validateRequest,
  (req: Request, res: Response) => orderController.cancelOrder(req as any, res)
);

export default router;
