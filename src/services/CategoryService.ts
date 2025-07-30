import { BaseService } from './BaseService';
import { DatabaseService } from './DatabaseService';
import { VitaminCategory, CreateCategoryDto, UpdateCategoryDto } from '../models/Product';

export class CategoryService extends BaseService {
  private dbService: DatabaseService;

  constructor() {
    super();
    this.dbService = new DatabaseService();
  }

  async create(data: CreateCategoryDto): Promise<VitaminCategory> {
    return this.executeWithLogging('создание категории', async () => {
      const result = await this.dbService.query(
        `INSERT INTO vitamin_categories (name, description)
         VALUES ($1, $2)
         RETURNING id, name, description, created_at, updated_at`,
        [data.name, data.description || null]
      );

      return this.mapToCategory(result[0]);
    });
  }

  async getAll(): Promise<VitaminCategory[]> {
    return this.executeWithLogging('получение всех категорий', async () => {
      const result = await this.dbService.query(
        `SELECT id, name, description, created_at, updated_at
         FROM vitamin_categories
         ORDER BY name ASC`
      );

      return result.map(row => this.mapToCategory(row));
    });
  }

  async getById(id: string): Promise<VitaminCategory | null> {
    return this.executeWithLogging('получение категории по ID', async () => {
      const result = await this.dbService.query(
        `SELECT id, name, description, created_at, updated_at
         FROM vitamin_categories
         WHERE id = $1`,
        [id]
      );

      return result.length > 0 ? this.mapToCategory(result[0]) : null;
    });
  }

  async update(id: string, data: UpdateCategoryDto): Promise<VitaminCategory | null> {
    return this.executeWithLogging('обновление категории', async () => {
      const setParts: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.name !== undefined) {
        setParts.push(`name = $${paramIndex++}`);
        values.push(data.name);
      }

      if (data.description !== undefined) {
        setParts.push(`description = $${paramIndex++}`);
        values.push(data.description);
      }

      if (setParts.length === 0) {
        throw new Error('Нет данных для обновления');
      }

      setParts.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await this.dbService.query(
        `UPDATE vitamin_categories 
         SET ${setParts.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING id, name, description, created_at, updated_at`,
        values
      );

      return result.length > 0 ? this.mapToCategory(result[0]) : null;
    });
  }

  async delete(id: string): Promise<boolean> {
    return this.executeWithLogging('удаление категории', async () => {
      // Проверяем, есть ли товары в этой категории
      const productsCount = await this.dbService.query(
        'SELECT COUNT(*) as count FROM products WHERE category_id = $1',
        [id]
      );

      if (parseInt(productsCount[0].count) > 0) {
        throw new Error('Нельзя удалить категорию, содержащую товары');
      }

      const result = await this.dbService.query(
        'DELETE FROM vitamin_categories WHERE id = $1',
        [id]
      );

      return result.length > 0;
    });
  }

  async getCategoryWithProductsCount(): Promise<(VitaminCategory & { productsCount: number })[]> {
    return this.executeWithLogging('получение категорий с количеством товаров', async () => {
      const result = await this.dbService.query(
        `SELECT 
           c.id, c.name, c.description, c.created_at, c.updated_at,
           COUNT(p.id) as products_count
         FROM vitamin_categories c
         LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
         GROUP BY c.id, c.name, c.description, c.created_at, c.updated_at
         ORDER BY c.name ASC`
      );

      return result.map(row => ({
        ...this.mapToCategory(row),
        productsCount: parseInt(row.products_count)
      }));
    });
  }

  private mapToCategory(row: any): VitaminCategory {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}
