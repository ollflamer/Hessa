import { BaseService } from './BaseService';
import { DatabaseService } from './DatabaseService';
import { ProductService } from './ProductService';
import { Product, ProductRecommendation } from '../models/Product';
import { VitaminRule } from '../models/Survey';
import { UserSurvey } from '../models/Survey';

export class RecommendationService extends BaseService {
  private dbService: DatabaseService;
  private productService: ProductService;

  constructor() {
    super();
    this.dbService = new DatabaseService();
    this.productService = new ProductService();
  }

  async recommendForUser(userProfile: UserSurvey): Promise<ProductRecommendation[]> {
    return this.executeWithLogging('создание рекомендаций для пользователя', async () => {
      // 1. Находим все подходящие правила
      const matchingRules = await this.findMatchingRules(userProfile);
      
      if (matchingRules.length === 0) {
        return [];
      }

      // 2. Собираем товары из всех правил
      const productRecommendations = new Map<string, ProductRecommendation>();

      for (const rule of matchingRules) {
        const ruleProducts = await this.getProductsForRule(rule.id);
        
        for (const product of ruleProducts) {
          const existingRec = productRecommendations.get(product.id);
          
          if (existingRec) {
            // Увеличиваем приоритет если товар уже есть
            existingRec.priority += rule.priority;
            existingRec.matchedRules.push(rule.id);
          } else {
            // Создаем новую рекомендацию
            productRecommendations.set(product.id, {
              product,
              priority: rule.priority,
              matchedRules: [rule.id],
              reason: this.generateReason(rule, userProfile)
            });
          }
        }
      }

      // 3. Фильтруем уже принимаемые витамины
      const filteredRecommendations = Array.from(productRecommendations.values())
        .filter(rec => !this.isAlreadyTaking(rec.product, userProfile.vitaminsCurrent));

      // 4. Сортируем по приоритету и возвращаем топ-8
      return filteredRecommendations
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 8);
    });
  }

  async addProductToRule(ruleId: string, productId: string): Promise<void> {
    return this.executeWithLogging('добавление товара к правилу', async () => {
      await this.dbService.query(
        `INSERT INTO rule_products (rule_id, product_id)
         VALUES ($1, $2)
         ON CONFLICT (rule_id, product_id) DO NOTHING`,
        [ruleId, productId]
      );
    });
  }

  async removeProductFromRule(ruleId: string, productId: string): Promise<void> {
    return this.executeWithLogging('удаление товара из правила', async () => {
      await this.dbService.query(
        'DELETE FROM rule_products WHERE rule_id = $1 AND product_id = $2',
        [ruleId, productId]
      );
    });
  }

  async getProductsForRule(ruleId: string): Promise<Product[]> {
    return this.executeWithLogging('получение товаров для правила', async () => {
      const result = await this.dbService.query(
        `SELECT p.*, c.name as category_name, c.description as category_description
         FROM products p
         LEFT JOIN vitamin_categories c ON p.category_id = c.id
         INNER JOIN rule_products rp ON p.id = rp.product_id
         WHERE rp.rule_id = $1 AND p.is_active = true
         ORDER BY p.name ASC`,
        [ruleId]
      );

      return result.map(row => this.mapToProduct(row));
    });
  }

  async getRulesForProduct(productId: string): Promise<VitaminRule[]> {
    return this.executeWithLogging('получение правил для товара', async () => {
      const result = await this.dbService.query(
        `SELECT vr.*
         FROM vitamin_rules vr
         INNER JOIN rule_products rp ON vr.id = rp.rule_id
         WHERE rp.product_id = $1 AND vr.is_active = true
         ORDER BY vr.priority DESC`,
        [productId]
      );

      return result.map(row => this.mapToRule(row));
    });
  }

  private async findMatchingRules(userProfile: UserSurvey): Promise<VitaminRule[]> {
    const result = await this.dbService.query(
      `SELECT * FROM vitamin_rules 
       WHERE is_active = true 
       ORDER BY priority DESC`
    );

    const allRules = result.map(row => this.mapToRule(row));
    
    return allRules.filter(rule => this.ruleMatches(rule, userProfile));
  }

  private ruleMatches(rule: VitaminRule, profile: UserSurvey): boolean {
    const conditions = rule.condition;

    // Проверяем каждое условие
    if (conditions.age_group && conditions.age_group.length > 0) {
      if (!conditions.age_group.includes(profile.ageGroup)) {
        return false;
      }
    }

    if (conditions.gender && conditions.gender.length > 0) {
      if (!conditions.gender.includes(profile.gender)) {
        return false;
      }
    }

    if (conditions.activity_level && conditions.activity_level.length > 0) {
      if (!conditions.activity_level.includes(profile.activityLevel)) {
        return false;
      }
    }

    if (conditions.stress_level && conditions.stress_level.length > 0) {
      if (!conditions.stress_level.includes(profile.stressLevel)) {
        return false;
      }
    }

    if (conditions.nutrition && conditions.nutrition.length > 0) {
      if (!conditions.nutrition.includes(profile.nutrition)) {
        return false;
      }
    }

    if (conditions.restrictions && conditions.restrictions.length > 0) {
      const hasMatchingRestriction = conditions.restrictions.some((restriction: any) =>
        profile.restrictions.includes(restriction)
      );
      if (!hasMatchingRestriction) {
        return false;
      }
    }

    if (conditions.complaints && conditions.complaints.length > 0) {
      const hasMatchingComplaint = conditions.complaints.some((complaint: any) =>
        profile.complaints.includes(complaint)
      );
      if (!hasMatchingComplaint) {
        return false;
      }
    }

    if (conditions.goals && conditions.goals.length > 0) {
      const hasMatchingGoal = conditions.goals.some((goal: any) =>
        profile.goals.includes(goal)
      );
      if (!hasMatchingGoal) {
        return false;
      }
    }

    return true;
  }

  private isAlreadyTaking(product: Product, currentVitamins: string[]): boolean {
    // Проверяем по названию товара и его преимуществам
    const productName = product.name.toLowerCase();
    const productBenefits = product.benefits.map(b => b.toLowerCase());

    return currentVitamins.some(vitamin => {
      const vitaminLower = vitamin.toLowerCase();
      return productName.includes(vitaminLower) || 
             productBenefits.some(benefit => benefit.includes(vitaminLower));
    });
  }

  private generateReason(rule: VitaminRule, profile: UserSurvey): string {
    const reasons: string[] = [];

    if (rule.condition.stress_level?.includes(profile.stressLevel)) {
      if (profile.stressLevel === 'high' || profile.stressLevel === 'constant') {
        reasons.push('высокий уровень стресса');
      }
    }

    if (rule.condition.activity_level?.includes(profile.activityLevel)) {
      if (profile.activityLevel === 'none') {
        reasons.push('низкая физическая активность');
      } else if (profile.activityLevel === 'daily') {
        reasons.push('высокая физическая активность');
      }
    }

    if (rule.condition.complaints?.some((c: any) => profile.complaints.includes(c))) {
      const matchingComplaints = rule.condition.complaints.filter((c: any) => 
        profile.complaints.includes(c)
      );
      reasons.push(`жалобы: ${matchingComplaints.join(', ')}`);
    }

    if (rule.condition.goals?.some((g: any) => profile.goals.includes(g))) {
      const matchingGoals = rule.condition.goals.filter((g: any) => 
        profile.goals.includes(g)
      );
      reasons.push(`цели: ${matchingGoals.join(', ')}`);
    }

    return reasons.length > 0 
      ? `Рекомендовано на основе: ${reasons.join(', ')}`
      : 'Рекомендовано для вашего профиля';
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
      updatedAt: new Date(row.updated_at),
      category: row.category_name ? {
        id: row.category_id,
        name: row.category_name,
        description: row.category_description,
        createdAt: new Date(),
        updatedAt: new Date()
      } : undefined
    };
  }

  private mapToRule(row: any): VitaminRule {
    return {
      id: row.id,
      name: row.name || '',
      condition: row.condition,
      vitamins: [],
      priority: row.priority,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}
