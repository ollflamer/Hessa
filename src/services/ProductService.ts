import { BaseService } from './BaseService';
import { DatabaseService } from './DatabaseService';
import { Product, ProductWithCategory, CreateProductDto, UpdateProductDto, VitaminCategory, ProductCategory } from '../models/Product';

export class ProductService extends BaseService {
  private dbService: DatabaseService;

  constructor() {
    super();
    this.dbService = new DatabaseService();
  }

  async create(data: CreateProductDto): Promise<Product> {
    return this.executeWithLogging('создание товара', async () => {
      // Проверяем уникальность SKU
      const existingSku = await this.dbService.query(
        'SELECT id FROM products WHERE sku = $1',
        [data.sku]
      );

      if (existingSku.length > 0) {
        throw new Error('Товар с таким SKU уже существует');
      }

      const result = await this.dbService.query(
        `INSERT INTO products (
           sku, name, description, image_url, price, size, quantity,
           category_id, restrictions, benefits, dosage, is_active
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          data.sku,
          data.name,
          data.description || null,
          data.imageUrl || null,
          data.price,
          data.size || null,
          data.quantity,
          data.categoryId || null,
          JSON.stringify(data.restrictions || []),
          JSON.stringify(data.benefits || []),
          data.dosage || null,
          data.isActive !== undefined ? data.isActive : true
        ]
      );

      return this.mapToProduct(result[0]);
    });
  }

  async getAll(includeInactive = false): Promise<Product[]> {
    return this.executeWithLogging('получение всех товаров', async () => {
      const whereClause = includeInactive ? '' : 'WHERE p.is_active = true';
      
      const result = await this.dbService.query(
        `SELECT p.*, c.name as category_name, c.description as category_description
         FROM products p
         LEFT JOIN vitamin_categories c ON p.category_id = c.id
         ${whereClause}
         ORDER BY p.name ASC`
      );

      const products = result.map(row => this.mapToProductWithCategory(row));
      
      // Добавляем все категории для каждого товара
      for (const product of products) {
        product.categories = await this.getProductCategories(product.id);
      }
      
      return products;
    });
  }

  async getById(id: string): Promise<Product | null> {
    return this.executeWithLogging('получение товара по ID', async () => {
      const result = await this.dbService.query(
        `SELECT p.*, c.name as category_name, c.description as category_description
         FROM products p
         LEFT JOIN vitamin_categories c ON p.category_id = c.id
         WHERE p.id = $1`,
        [id]
      );

      return result.length > 0 ? this.mapToProductWithCategory(result[0]) : null;
    });
  }

  async getBySku(sku: string): Promise<Product | null> {
    return this.executeWithLogging('получение товара по SKU', async () => {
      const result = await this.dbService.query(
        `SELECT p.*, c.name as category_name, c.description as category_description
         FROM products p
         LEFT JOIN vitamin_categories c ON p.category_id = c.id
         WHERE p.sku = $1`,
        [sku]
      );

      return result.length > 0 ? this.mapToProductWithCategory(result[0]) : null;
    });
  }

  async getByCategory(categoryId: string, includeInactive = false): Promise<Product[]> {
    return this.executeWithLogging('получение товаров по категории', async () => {
      const whereClause = includeInactive 
        ? 'WHERE p.category_id = $1'
        : 'WHERE p.category_id = $1 AND p.is_active = true';

      const result = await this.dbService.query(
        `SELECT p.*, c.name as category_name, c.description as category_description
         FROM products p
         LEFT JOIN vitamin_categories c ON p.category_id = c.id
         ${whereClause}
         ORDER BY p.name ASC`,
        [categoryId]
      );

      return result.map(row => this.mapToProductWithCategory(row));
    });
  }

  async update(id: string, data: UpdateProductDto): Promise<Product | null> {
    return this.executeWithLogging('обновление товара', async () => {
      // Проверяем уникальность SKU если он изменяется
      if (data.sku) {
        const existingSku = await this.dbService.query(
          'SELECT id FROM products WHERE sku = $1 AND id != $2',
          [data.sku, id]
        );

        if (existingSku.length > 0) {
          throw new Error('Товар с таким SKU уже существует');
        }
      }

      const setParts: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      const updateFields = [
        'sku', 'name', 'description', 'imageUrl', 'price', 
        'size', 'quantity', 'categoryId', 'dosage', 'isActive'
      ];

      const dbFields = [
        'sku', 'name', 'description', 'image_url', 'price',
        'size', 'quantity', 'category_id', 'dosage', 'is_active'
      ];

      updateFields.forEach((field, index) => {
        if (data[field as keyof UpdateProductDto] !== undefined) {
          setParts.push(`${dbFields[index]} = $${paramIndex++}`);
          values.push(data[field as keyof UpdateProductDto]);
        }
      });

      if (data.restrictions !== undefined) {
        setParts.push(`restrictions = $${paramIndex++}`);
        values.push(JSON.stringify(data.restrictions));
      }

      if (data.benefits !== undefined) {
        setParts.push(`benefits = $${paramIndex++}`);
        values.push(JSON.stringify(data.benefits));
      }

      if (setParts.length === 0) {
        throw new Error('Нет данных для обновления');
      }

      setParts.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await this.dbService.query(
        `UPDATE products 
         SET ${setParts.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING *`,
        values
      );

      return result.length > 0 ? this.mapToProduct(result[0]) : null;
    });
  }

  async delete(id: string): Promise<boolean> {
    return this.executeWithLogging('удаление товара', async () => {
      // Мягкое удаление - помечаем как неактивный
      const result = await this.dbService.query(
        'UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );

      return result.length > 0;
    });
  }

  async hardDelete(id: string): Promise<boolean> {
    return this.executeWithLogging('жесткое удаление товара', async () => {
      // Сначала удаляем связи с правилами
      await this.dbService.query(
        'DELETE FROM rule_products WHERE product_id = $1',
        [id]
      );

      // Затем удаляем сам товар
      const result = await this.dbService.query(
        'DELETE FROM products WHERE id = $1',
        [id]
      );

      return result.length > 0;
    });
  }

  async updateQuantity(id: string, quantity: number): Promise<Product | null> {
    return this.executeWithLogging('обновление количества товара', async () => {
      const result = await this.dbService.query(
        `UPDATE products 
         SET quantity = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [quantity, id]
      );

      return result.length > 0 ? this.mapToProduct(result[0]) : null;
    });
  }

  async search(query: string, categoryId?: string): Promise<Product[]> {
    return this.executeWithLogging('поиск товаров', async () => {
      let sql = `
        SELECT p.*, c.name as category_name, c.description as category_description
        FROM products p
        LEFT JOIN vitamin_categories c ON p.category_id = c.id
        WHERE p.is_active = true
        AND (
          p.name ILIKE $1 
          OR p.description ILIKE $1 
          OR p.sku ILIKE $1
          OR p.benefits::text ILIKE $1
        )
      `;
      
      const params: any[] = [`%${query}%`];

      if (categoryId) {
        sql += ` AND p.category_id = $2`;
        params.push(categoryId);
      }

      sql += ` ORDER BY p.name ASC`;

      const result = await this.dbService.query(sql, params);
      return result.map(row => this.mapToProductWithCategory(row));
    });
  }

  private mapToProduct(row: any): Product {
    return {
      id: row.id,
      sku: row.sku,
      name: row.name,
      description: row.description,
      imageUrl: row.image_url,
      price: parseFloat(row.price),
      size: row.size,
      quantity: parseInt(row.quantity),
      categoryId: row.category_id,
      restrictions: row.restrictions ? JSON.parse(row.restrictions) : [],
      targetComplaints: row.target_complaints ? JSON.parse(row.target_complaints) : [],
      targetGoals: row.target_goals ? JSON.parse(row.target_goals) : [],
      vitaminType: row.vitamin_type ? JSON.parse(row.vitamin_type) : [],
      benefits: row.benefits ? JSON.parse(row.benefits) : [],
      dosage: row.dosage,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private mapToProductWithCategory(row: any): Product {
    const product = this.mapToProduct(row);
    
    if (row.category_name) {
      product.category = {
        id: row.category_id,
        name: row.category_name,
        description: row.category_description,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    return product;
  }

  async getProductCategories(productId: string): Promise<ProductCategory[]> {
    return this.executeWithLogging('получение категорий товара', async () => {
      const result = await this.dbService.query(
        `SELECT pc.*, vc.name as category_name, vc.description as category_description
         FROM product_categories pc
         JOIN vitamin_categories vc ON pc.category_id = vc.id
         WHERE pc.product_id = $1
         ORDER BY pc.is_primary DESC, vc.name ASC`,
        [productId]
      );

      return result.map(row => ({
        id: row.id,
        productId: row.product_id,
        categoryId: row.category_id,
        isPrimary: row.is_primary,
        createdAt: new Date(row.created_at),
        category: {
          id: row.category_id,
          name: row.category_name,
          description: row.category_description,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }));
    });
  }

  async addProductToCategory(productId: string, categoryId: string, isPrimary = false): Promise<void> {
    return this.executeWithLogging('добавление товара в категорию', async () => {
      await this.dbService.query(
        `INSERT INTO product_categories (product_id, category_id, is_primary)
         VALUES ($1, $2, $3)
         ON CONFLICT (product_id, category_id) 
         DO UPDATE SET is_primary = $3`,
        [productId, categoryId, isPrimary]
      );
    });
  }

  async removeProductFromCategory(productId: string, categoryId: string): Promise<void> {
    return this.executeWithLogging('удаление товара из категории', async () => {
      await this.dbService.query(
        'DELETE FROM product_categories WHERE product_id = $1 AND category_id = $2',
        [productId, categoryId]
      );
    });
  }

  async getProductsByMultipleCategories(categoryIds: string[], includeInactive = false): Promise<Product[]> {
    return this.executeWithLogging('получение товаров по нескольким категориям', async () => {
      const whereClause = includeInactive 
        ? 'WHERE pc.category_id = ANY($1)'
        : 'WHERE pc.category_id = ANY($1) AND p.is_active = true';

      const result = await this.dbService.query(
        `SELECT DISTINCT p.*, c.name as category_name, c.description as category_description
         FROM products p
         JOIN product_categories pc ON p.id = pc.product_id
         LEFT JOIN vitamin_categories c ON p.category_id = c.id
         ${whereClause}
         ORDER BY p.name ASC`,
        [categoryIds]
      );

      const products = result.map(row => this.mapToProductWithCategory(row));
      
      // Добавляем все категории для каждого товара
      for (const product of products) {
        product.categories = await this.getProductCategories(product.id);
      }
      
      return products;
    });
  }
}
