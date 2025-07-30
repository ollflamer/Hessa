import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { CategoryService } from '../services/CategoryService';
import { CreateCategoryDto, UpdateCategoryDto } from '../models/Product';

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Управление категориями витаминов
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     VitaminCategory:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

export class CategoryController extends BaseController {
  private categoryService: CategoryService;

  constructor() {
    super();
    this.categoryService = new CategoryService();
  }

  /**
   * @swagger
   * /api/categories:
   *   post:
   *     summary: Создать новую категорию
   *     tags: [Categories]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       201:
   *         description: Категория успешно создана
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/VitaminCategory'
   */
  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const categoryData: CreateCategoryDto = req.body;
      const category = await this.categoryService.create(categoryData);
      this.handleSuccess(res, category, 'Категория успешно создана', 201);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/categories:
   *   get:
   *     summary: Получить все категории
   *     tags: [Categories]
   *     responses:
   *       200:
   *         description: Список категорий
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/VitaminCategory'
   */
  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await this.categoryService.getAll();
      this.handleSuccess(res, categories);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/categories/with-counts:
   *   get:
   *     summary: Получить категории с количеством товаров
   *     tags: [Categories]
   *     responses:
   *       200:
   *         description: Список категорий с количеством товаров
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 allOf:
   *                   - $ref: '#/components/schemas/VitaminCategory'
   *                   - type: object
   *                     properties:
   *                       productsCount:
   *                         type: integer
   */
  async getCategoriesWithCounts(req: Request, res: Response): Promise<void> {
    try {
      const categories = await this.categoryService.getCategoryWithProductsCount();
      this.handleSuccess(res, categories);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/categories/{id}:
   *   get:
   *     summary: Получить категорию по ID
   *     tags: [Categories]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Данные категории
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/VitaminCategory'
   *       404:
   *         description: Категория не найдена
   */
  async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const category = await this.categoryService.getById(id);
      
      if (!category) {
        this.handleError(res, new Error('Категория не найдена'), 404);
        return;
      }

      this.handleSuccess(res, category);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/categories/{id}:
   *   put:
   *     summary: Обновить категорию
   *     tags: [Categories]
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
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       200:
   *         description: Категория успешно обновлена
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/VitaminCategory'
   *       404:
   *         description: Категория не найдена
   */
  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateCategoryDto = req.body;
      const category = await this.categoryService.update(id, updateData);
      
      if (!category) {
        this.handleError(res, new Error('Категория не найдена'), 404);
        return;
      }

      this.handleSuccess(res, category, 'Категория успешно обновлена');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * @swagger
   * /api/categories/{id}:
   *   delete:
   *     summary: Удалить категорию
   *     tags: [Categories]
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
   *         description: Категория успешно удалена
   *       400:
   *         description: Нельзя удалить категорию с товарами
   *       404:
   *         description: Категория не найдена
   */
  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.categoryService.delete(id);
      
      if (!deleted) {
        this.handleError(res, new Error('Категория не найдена'), 404);
        return;
      }

      this.handleSuccess(res, null, 'Категория успешно удалена');
    } catch (error) {
      this.handleError(res, error);
    }
  }
}
