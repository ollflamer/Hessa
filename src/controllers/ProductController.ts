import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { ProductService } from '../services/ProductService';
import { FileService } from '../services/FileService';
import { CreateProductDto, UpdateProductDto } from '../models/Product';

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Управление товарами
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         sku:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         imageUrl:
 *           type: string
 *         price:
 *           type: number
 *         size:
 *           type: string
 *         quantity:
 *           type: integer
 *         categoryId:
 *           type: string
 *           format: uuid
 *         restrictions:
 *           type: array
 *           items:
 *             type: string
 *         benefits:
 *           type: array
 *           items:
 *             type: string
 *         dosage:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         category:
 *           $ref: '#/components/schemas/VitaminCategory'
 */

export class ProductController extends BaseController {
  private productService: ProductService;
  private fileService: FileService;

  constructor() {
    super();
    this.productService = new ProductService();
    this.fileService = new FileService();
  }

  /**
   * @swagger
   * /api/products:
   *   get:
   *     summary: Получить все товары
   *     tags: [Products]
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *         description: Количество товаров на странице
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *         description: Смещение для пагинации
   *       - in: query
   *         name: includeInactive
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Включить неактивные товары в результат
   *     responses:
   *       200:
   *         description: Список товаров
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
   *                     $ref: '#/components/schemas/Product'
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const { includeInactive = false } = req.query;
      const products = await this.productService.getAll(Boolean(includeInactive));
      this.handleSuccess(res, products);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/products/{id}:
   *   get:
   *     summary: Получить товар по ID
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID товара
   *     responses:
   *       200:
   *         description: Товар найден
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Product'
   *       404:
   *         description: Товар не найден
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await this.productService.getById(id);
      if (!product) {
        return this.handleError(res, 'Товар не найден', 404);
      }
      this.handleSuccess(res, product);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/products/sku/{sku}:
   *   get:
   *     summary: Получить товар по SKU
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: sku
   *         required: true
   *         schema:
   *           type: string
   *         description: SKU товара
   *     responses:
   *       200:
   *         description: Товар найден
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Product'
   *       404:
   *         description: Товар не найден
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async getProductBySku(req: Request, res: Response): Promise<void> {
    try {
      const { sku } = req.params;
      const product = await this.productService.getBySku(sku);
      if (!product) {
        return this.handleError(res, 'Товар не найден', 404);
      }
      this.handleSuccess(res, product);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/products/category/{categoryId}:
   *   get:
   *     summary: Получить товары по категории
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: categoryId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID категории
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *         description: Количество товаров на странице
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *         description: Смещение для пагинации
   *       - in: query
   *         name: includeInactive
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Включить неактивные товары в результат
   *     responses:
   *       200:
   *         description: Список товаров категории
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
   *                     $ref: '#/components/schemas/Product'
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async getProductsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params;
      const { includeInactive } = req.query;
      const products = await this.productService.getByCategory(categoryId, includeInactive === 'true');
      this.handleSuccess(res, products);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/products:
   *   post:
   *     summary: Создать новый товар
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - sku
   *               - name
   *               - price
   *               - categoryId
   *             properties:
   *               sku:
   *                 type: string
   *                 description: Артикул товара
   *               name:
   *                 type: string
   *                 description: Название товара
   *               description:
   *                 type: string
   *                 description: Описание товара
   *               imageUrl:
   *                 type: string
   *                 description: URL изображения
   *               price:
   *                 type: number
   *                 description: Цена товара
   *               size:
   *                 type: string
   *                 description: Размер упаковки
   *               quantity:
   *                 type: integer
   *                 description: Количество на складе
   *               categoryId:
   *                 type: string
   *                 format: uuid
   *                 description: ID категории
   *               restrictions:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Ограничения по применению
   *               benefits:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Полезные свойства
   *               dosage:
   *                 type: string
   *                 description: Дозировка
   *           example:
   *             sku: "VIT-D3-1000"
   *             name: "Витамин D3 1000 МЕ"
   *             description: "Высококачественный витамин D3"
   *             imageUrl: "https://example.com/image.jpg"
   *             price: 1500
   *             size: "60 капсул"
   *             quantity: 100
   *             categoryId: "123e4567-e89b-12d3-a456-426614174000"
   *             restrictions: ["Не рекомендуется детям до 3 лет"]
   *             benefits: ["Укрепляет иммунитет", "Поддерживает здоровье костей"]
   *             dosage: "1 капсула в день"
   *     responses:
   *       201:
   *         description: Товар успешно создан
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Product'
   *       400:
   *         description: Ошибка валидации данных
   *       401:
   *         description: Требуется авторизация
   *       403:
   *         description: Недостаточно прав
   *       409:
   *         description: Товар с таким SKU уже существует
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const productData: CreateProductDto = req.body;
      const product = await this.productService.create(productData);
      this.handleSuccess(res, product, 'Товар успешно создан', 201);
    } catch (error) {
      this.handleError(res, error);
    }
  }
  
  /**
   * @swagger
   * /api/products/{id}:
   *   put:
   *     summary: Обновить товар
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID товара
   *     requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Product' # Упрощенная схема, можно детализировать
   *     responses:
   *       200:
   *         description: Товар успешно обновлен
   *       404:
   *         description: Товар не найден
   */
  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateProductDto = req.body;
      const product = await this.productService.update(id, updateData);
      
      if (!product) {
        this.handleError(res, 'Товар не найден', 404);
        return;
      }

      this.handleSuccess(res, product, 'Товар успешно обновлен');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/products/{id}:
   *   delete:
   *     summary: Удалить товар (мягкое удаление)
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID товара
   *     responses:
   *       200:
   *         description: Товар успешно удален
   *       404:
   *         description: Товар не найден
   */
  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.productService.delete(id);
      
      if (!deleted) {
        this.handleError(res, 'Товар не найден', 404);
        return;
      }

      this.handleSuccess(res, null, 'Товар успешно удален');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/products/{id}/quantity:
   *   patch:
   *     summary: Обновить количество товара
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID товара
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               quantity:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Количество успешно обновлено
   *       404:
   *         description: Товар не найден
   */
  async updateQuantity(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const product = await this.productService.updateQuantity(id, quantity);
      
      if (!product) {
        this.handleError(res, 'Товар не найден', 404);
        return;
      }

      this.handleSuccess(res, product, 'Количество успешно обновлено');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/products/search:
   *   get:
   *     summary: Поиск товаров
   *     tags: [Products]
   *     parameters:
   *       - in: query
   *         name: q
   *         schema:
   *           type: string
   *         description: Поисковый запрос
   *       - in: query
   *         name: categoryId
   *         schema:
   *           type: string
   *         description: ID категории для фильтрации
   *     responses:
   *       200:
   *         description: Результаты поиска
   */
  async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      const { q, categoryId } = req.query;
      const products = await this.productService.search(q as string, categoryId as string);
      this.handleSuccess(res, products);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/products/{id}/categories:
   *   post:
   *     summary: Привязать товар к категории
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID товара
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - categoryId
   *             properties:
   *               categoryId:
   *                 type: string
   *                 format: uuid
   *                 description: ID категории
   *               isPrimary:
   *                 type: boolean
   *                 default: false
   *                 description: Является ли категория основной для товара
   *           example:
   *             categoryId: "123e4567-e89b-12d3-a456-426614174000"
   *             isPrimary: false
   *     responses:
   *       200:
   *         description: Товар успешно привязан к категории
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Товар успешно привязан к категории"
   *       400:
   *         description: Ошибка валидации данных
   *       401:
   *         description: Требуется авторизация
   *       403:
   *         description: Недостаточно прав (требуются права администратора)
   *       404:
   *         description: Товар или категория не найдены
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async addProductToCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { categoryId, isPrimary = false } = req.body;
      
      await this.productService.addProductToCategory(id, categoryId, isPrimary);
      this.handleSuccess(res, { message: 'Товар успешно привязан к категории' });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/products/{id}/categories/{categoryId}:
   *   delete:
   *     summary: Отвязать товар от категории
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID товара
   *       - in: path
   *         name: categoryId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID категории
   *     responses:
   *       200:
   *         description: Товар успешно отвязан от категории
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Товар успешно отвязан от категории"
   *       400:
   *         description: Ошибка валидации данных
   *       401:
   *         description: Требуется авторизация
   *       403:
   *         description: Недостаточно прав (требуются права администратора)
   *       404:
   *         description: Связь не найдена
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async removeProductFromCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id, categoryId } = req.params;
      
      await this.productService.removeProductFromCategory(id, categoryId);
      this.handleSuccess(res, { message: 'Товар успешно отвязан от категории' });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/products/{id}/vitamin-rules:
   *   post:
   *     summary: Привязать товар к правилу опросника
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID товара
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - ruleId
   *             properties:
   *               ruleId:
   *                 type: string
   *                 format: uuid
   *                 description: ID правила опросника
   *           example:
   *             ruleId: "123e4567-e89b-12d3-a456-426614174000"
   *     responses:
   *       200:
   *         description: Товар успешно привязан к правилу
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Товар успешно привязан к правилу опросника"
   *       400:
   *         description: Ошибка валидации данных
   *       401:
   *         description: Требуется авторизация
   *       403:
   *         description: Недостаточно прав (требуются права администратора)
   *       404:
   *         description: Товар или правило не найдены
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async addProductToVitaminRule(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { ruleId } = req.body;
      
      await this.productService.addProductToVitaminRule(id, ruleId);
      this.handleSuccess(res, { message: 'Товар успешно привязан к правилу опросника' });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/products/{id}/vitamin-rules/{ruleId}:
   *   delete:
   *     summary: Отвязать товар от правила опросника
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID товара
   *       - in: path
   *         name: ruleId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID правила опросника
   *     responses:
   *       200:
   *         description: Товар успешно отвязан от правила
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Товар успешно отвязан от правила опросника"
   *       400:
   *         description: Ошибка валидации данных
   *       401:
   *         description: Требуется авторизация
   *       403:
   *         description: Недостаточно прав (требуются права администратора)
   *       404:
   *         description: Связь не найдена
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async removeProductFromVitaminRule(req: Request, res: Response): Promise<void> {
    try {
      const { id, ruleId } = req.params;
      
      await this.productService.removeProductFromVitaminRule(id, ruleId);
      this.handleSuccess(res, { message: 'Товар успешно отвязан от правила опросника' });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/products/{id}/categories:
   *   get:
   *     summary: Получить категории товара
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID товара
   *     responses:
   *       200:
   *         description: Список категорий товара
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
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         format: uuid
   *                         description: ID категории
   *                       name:
   *                         type: string
   *                         description: Название категории
   *                       description:
   *                         type: string
   *                         description: Описание категории
   *                       isPrimary:
   *                         type: boolean
   *                         description: Является ли категория основной для товара
   *                     example:
   *                       id: "123e4567-e89b-12d3-a456-426614174000"
   *                       name: "Витамины"
   *                       description: "Витаминные комплексы"
   *                       isPrimary: true
   *       400:
   *         description: Ошибка валидации данных
   *       404:
   *         description: Товар не найден
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async getProductCategories(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const categories = await this.productService.getProductCategories(id);
      this.handleSuccess(res, categories);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/products/{id}/vitamin-rules:
   *   get:
   *     summary: Получить правила опросника для товара
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID товара
   *     responses:
   *       200:
   *         description: Список правил опросника для товара
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
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         format: uuid
   *                         description: ID правила
   *                       name:
   *                         type: string
   *                         description: Название правила
   *                       condition:
   *                         type: string
   *                         description: Условие применения правила
   *                       priority:
   *                         type: integer
   *                         description: Приоритет правила
   *                     example:
   *                       id: "123e4567-e89b-12d3-a456-426614174000"
   *                       name: "Высокий стресс"
   *                       condition: "stress_level = 'high' OR stress_level = 'constant'"
   *                       priority: 1
   *       400:
   *         description: Ошибка валидации данных
   *       404:
   *         description: Товар не найден
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async getProductVitaminRules(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const rules = await this.productService.getProductVitaminRules(id);
      this.handleSuccess(res, rules);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/products/{id}/image:
   *   post:
   *     summary: Загрузить изображение товара
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID товара
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               image:
   *                 type: string
   *                 format: binary
   *                 description: Файл изображения (JPEG, PNG, WebP, макс. 10MB)
   *     responses:
   *       200:
   *         description: Изображение успешно загружено
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
   *                     imageUrl:
   *                       type: string
   *                       description: URL загруженного изображения
   *                     fileName:
   *                       type: string
   *                       description: Имя файла
   *                     size:
   *                       type: integer
   *                       description: Размер файла в байтах
   *                 message:
   *                   type: string
   *                   example: "Изображение успешно загружено"
   *       400:
   *         description: Ошибка валидации файла
   *       401:
   *         description: Требуется авторизация
   *       403:
   *         description: Недостаточно прав
   *       404:
   *         description: Товар не найден
   *       413:
   *         description: Файл слишком большой
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async uploadProductImage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const file = (req as any).file;
      
      if (!file) {
        return this.handleError(res, 'Файл изображения не найден', 400);
      }
      
      const product = await this.productService.getById(id);
      if (!product) {
        return this.handleError(res, 'Товар не найден', 404);
      }
      
      this.fileService.validateImageFile(file, 10 * 1024 * 1024); // 10MB
      
      const uploadedFile = await this.fileService.uploadProductImage(file, id);
      
      await this.productService.update(id, { imageUrl: uploadedFile.url });
      
      this.handleSuccess(res, {
        imageUrl: uploadedFile.url,
        fileName: uploadedFile.fileName,
        size: uploadedFile.size
      }, 'Изображение успешно загружено');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/products/{id}/image:
   *   delete:
   *     summary: Удалить изображение товара
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID товара
   *     responses:
   *       200:
   *         description: Изображение успешно удалено
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Изображение успешно удалено"
   *       401:
   *         description: Требуется авторизация
   *       403:
   *         description: Недостаточно прав
   *       404:
   *         description: Товар не найден
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async deleteProductImage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const product = await this.productService.getById(id);
      if (!product) {
        return this.handleError(res, 'Товар не найден', 404);
      }
      
      if (product.imageUrl) {
        await this.fileService.deleteFileByUrl(product.imageUrl);
      }
      
      await this.productService.update(id, { imageUrl: undefined });
      
      this.handleSuccess(res, null, 'Изображение успешно удалено');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/products/upload-image:
   *   post:
   *     summary: Загрузить изображение без привязки к товару
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               image:
   *                 type: string
   *                 format: binary
   *                 description: Файл изображения (JPEG, PNG, WebP, макс. 10MB)
   *     responses:
   *       200:
   *         description: Изображение успешно загружено
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
   *                     imageUrl:
   *                       type: string
   *                       description: URL загруженного изображения
   *                     fileName:
   *                       type: string
   *                       description: Имя файла
   *                     size:
   *                       type: integer
   *                       description: Размер файла в байтах
   *                 message:
   *                   type: string
   *                   example: "Изображение успешно загружено"
   *       400:
   *         description: Ошибка валидации файла
   *       401:
   *         description: Требуется авторизация
   *       403:
   *         description: Недостаточно прав
   *       413:
   *         description: Файл слишком большой
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      const file = (req as any).file;
      
      if (!file) {
        return this.handleError(res, 'Файл изображения не найден', 400);
      }
      
      this.fileService.validateImageFile(file, 10 * 1024 * 1024); // 10MB
      
      const uploadedFile = await this.fileService.uploadProductImage(file);
      
      this.handleSuccess(res, {
        imageUrl: uploadedFile.url,
        fileName: uploadedFile.fileName,
        size: uploadedFile.size
      }, 'Изображение успешно загружено');
    } catch (error) {
      this.handleError(res, error);
    }
  }
}
