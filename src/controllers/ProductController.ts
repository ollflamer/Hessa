import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { ProductService } from '../services/ProductService';
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

  constructor() {
    super();
    this.productService = new ProductService();
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
   *               - quantity
   *             properties:
   *               sku:
   *                 type: string
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               imageUrl:
   *                 type: string
   *               price:
   *                 type: number
   *               size:
   *                 type: string
   *               quantity:
   *                 type: integer
   *               categoryId:
   *                 type: string
   *                 format: uuid
   *               restrictions:
   *                 type: array
   *                 items:
   *                   type: string
   *               benefits:
   *                 type: array
   *                 items:
   *                   type: string
   *               dosage:
   *                 type: string
   *               isActive:
   *                 type: boolean
   *     responses:
   *       201:
   *         description: Товар успешно создан
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Product'
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
   * /api/products:
   *   get:
   *     summary: Получить все товары
   *     tags: [Products]
   *     parameters:
   *       - in: query
   *         name: includeInactive
   *         schema:
   *           type: boolean
   *         description: Включить неактивные товары
   *     responses:
   *       200:
   *         description: Список товаров
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Product'
   */
  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const products = await this.productService.getAll(includeInactive);
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
   *     responses:
   *       200:
   *         description: Данные товара
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Product'
   *       404:
   *         description: Товар не найден
   */
  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await this.productService.getById(id);
      
      if (!product) {
        this.handleError(res, new Error('Товар не найден'), 404);
        return;
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
   *     responses:
   *       200:
   *         description: Данные товара
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Product'
   *       404:
   *         description: Товар не найден
   */
  async getProductBySku(req: Request, res: Response): Promise<void> {
    try {
      const { sku } = req.params;
      const product = await this.productService.getBySku(sku);
      
      if (!product) {
        this.handleError(res, new Error('Товар не найден'), 404);
        return;
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
   *       - in: query
   *         name: includeInactive
   *         schema:
   *           type: boolean
   *         description: Включить неактивные товары
   *     responses:
   *       200:
   *         description: Список товаров категории
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Product'
   */
  async getProductsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params;
      const includeInactive = req.query.includeInactive === 'true';
      const products = await this.productService.getByCategory(categoryId, includeInactive);
      this.handleSuccess(res, products);
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
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               sku:
   *                 type: string
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               imageUrl:
   *                 type: string
   *               price:
   *                 type: number
   *               size:
   *                 type: string
   *               quantity:
   *                 type: integer
   *               categoryId:
   *                 type: string
   *                 format: uuid
   *               restrictions:
   *                 type: array
   *                 items:
   *                   type: string
   *               benefits:
   *                 type: array
   *                 items:
   *                   type: string
   *               dosage:
   *                 type: string
   *               isActive:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Товар успешно обновлен
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Product'
   *       404:
   *         description: Товар не найден
   */
  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateProductDto = req.body;
      const product = await this.productService.update(id, updateData);
      
      if (!product) {
        this.handleError(res, new Error('Товар не найден'), 404);
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
        this.handleError(res, new Error('Товар не найден'), 404);
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
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - quantity
   *             properties:
   *               quantity:
   *                 type: integer
   *                 minimum: 0
   *     responses:
   *       200:
   *         description: Количество успешно обновлено
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Product'
   *       404:
   *         description: Товар не найден
   */
  async updateQuantity(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const product = await this.productService.updateQuantity(id, quantity);
      
      if (!product) {
        this.handleError(res, new Error('Товар не найден'), 404);
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
   *         required: true
   *         schema:
   *           type: string
   *         description: Поисковый запрос
   *       - in: query
   *         name: categoryId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Фильтр по категории
   *     responses:
   *       200:
   *         description: Результаты поиска
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Product'
   */
  async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      const { q: query, categoryId } = req.query;
      const products = await this.productService.search(query as string, categoryId as string);
      this.handleSuccess(res, products);
    } catch (error) {
      this.handleError(res, error);
    }
  }
}
