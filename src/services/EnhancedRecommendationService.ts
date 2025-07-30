import { DatabaseService } from './DatabaseService';
import { BaseService } from './BaseService';
import { Product } from '../models/Product';
import { SurveyData } from '../models/Survey';

export interface ProductRecommendation {
  product: Product;
  score: number;
  reasons: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface RecommendationResult {
  recommendations: ProductRecommendation[];
  totalScore: number;
  excludedProducts: string[];
  analysisReport: string;
}

export class EnhancedRecommendationService extends BaseService {
  constructor(private dbService: DatabaseService) {
    super();
  }

  async getPersonalizedRecommendations(
    userId: number,
    surveyProfile: SurveyData,
    maxRecommendations = 8
  ): Promise<RecommendationResult> {
    return this.executeWithLogging('получение персональных рекомендаций', async () => {
      const products = await this.getAllActiveProducts();
      const currentVitamins = surveyProfile.vitaminsCurrently || [];
      
      const scoredProducts = products
        .filter(product => !this.isProductAlreadyTaken(product, currentVitamins))
        .map(product => this.scoreProduct(product, surveyProfile))
        .filter(recommendation => recommendation.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxRecommendations);

      const totalScore = scoredProducts.reduce((sum, rec) => sum + rec.score, 0);
      const excludedProducts = products
        .filter(product => this.isProductAlreadyTaken(product, currentVitamins))
        .map(product => product.name);

      return {
        recommendations: scoredProducts,
        totalScore,
        excludedProducts,
        analysisReport: this.generateAnalysisReport(surveyProfile, scoredProducts)
      };
    });
  }

  private async getAllActiveProducts(): Promise<Product[]> {
    const result = await this.dbService.query(`
      SELECT p.*, c.name as category_name, c.description as category_description
      FROM products p
      LEFT JOIN vitamin_categories c ON p.category_id = c.id
      WHERE p.is_active = true
      ORDER BY p.name ASC
    `);

    return result.map((row: any) => this.mapToProduct(row));
  }

  private scoreProduct(product: Product, profile: SurveyData): ProductRecommendation {
    let score = 0;
    const reasons: string[] = [];

    score += this.scoreByComplaints(product, profile, reasons);
    score += this.scoreByGoals(product, profile, reasons);
    score += this.scoreByDemographics(product, profile, reasons);
    score += this.scoreByLifestyle(product, profile, reasons);
    score += this.scoreByNutrition(product, profile, reasons);
    score += this.scoreByRestrictions(product, profile, reasons);

    const priority = this.calculatePriority(score);

    return {
      product,
      score,
      reasons,
      priority
    };
  }

  private scoreByComplaints(product: Product, profile: SurveyData, reasons: string[]): number {
    if (!product.targetComplaints || !profile.complaints) return 0;

    let score = 0;
    const productComplaints = product.targetComplaints as string[];
    
    for (const complaint of profile.complaints) {
      if (productComplaints.includes(complaint)) {
        score += 15;
        reasons.push(`Помогает при ${this.translateComplaint(complaint)}`);
      }
    }

    return score;
  }

  private scoreByGoals(product: Product, profile: SurveyData, reasons: string[]): number {
    if (!product.targetGoals || !profile.goals) return 0;

    let score = 0;
    const productGoals = product.targetGoals as string[];
    
    for (const goal of profile.goals) {
      if (productGoals.includes(goal)) {
        score += 12;
        reasons.push(`Поддерживает цель: ${this.translateGoal(goal)}`);
      }
    }

    return score;
  }

  private scoreByDemographics(product: Product, profile: SurveyData, reasons: string[]): number {
    let score = 0;

    if (profile.gender === 'female' && profile.ageGroup && ['18_30', '31_45'].includes(profile.ageGroup)) {
      const productVitamins = product.vitaminType as string[];
      if (productVitamins?.includes('iron')) {
        score += 10;
        reasons.push('Рекомендуется женщинам репродуктивного возраста');
      }
    }

    if (profile.ageGroup === '60_plus') {
      const productVitamins = product.vitaminType as string[];
      if (productVitamins?.includes('vitamin_d') || productVitamins?.includes('omega_3')) {
        score += 8;
        reasons.push('Важно для людей старшего возраста');
      }
    }

    return score;
  }

  private scoreByLifestyle(product: Product, profile: SurveyData, reasons: string[]): number {
    let score = 0;
    const productVitamins = product.vitaminType as string[];

    if (profile.stressLevel && ['high', 'constant'].includes(profile.stressLevel)) {
      if (productVitamins?.includes('magnesium') || productVitamins?.includes('b_complex')) {
        score += 10;
        reasons.push('Помогает справляться со стрессом');
      }
    }

    if (profile.activityLevel === 'daily') {
      if (productVitamins?.includes('magnesium') || productVitamins?.includes('omega_3')) {
        score += 8;
        reasons.push('Поддерживает активный образ жизни');
      }
    }

    if (profile.activityLevel === 'none') {
      if (productVitamins?.includes('vitamin_d') || productVitamins?.includes('b_complex')) {
        score += 6;
        reasons.push('Компенсирует низкую активность');
      }
    }

    return score;
  }

  private scoreByNutrition(product: Product, profile: SurveyData, reasons: string[]): number {
    let score = 0;
    const productVitamins = product.vitaminType as string[];

    if (profile.nutrition === 'rare') {
      if (productVitamins?.includes('multivitamin') || productVitamins?.includes('b_complex')) {
        score += 12;
        reasons.push('Компенсирует недостатки питания');
      }
    }

    return score;
  }

  private scoreByRestrictions(product: Product, profile: SurveyData, reasons: string[]): number {
    if (!product.restrictions || !profile.restrictions) return 0;

    for (const restriction of profile.restrictions) {
      if (product.restrictions.includes(restriction as any)) {
        return -50;
      }
    }

    return 0;
  }

  private isProductAlreadyTaken(product: Product, currentVitamins: string[]): boolean {
    if (!product.vitaminType) return false;
    
    const productTypes = product.vitaminType as string[];
    return currentVitamins.some(vitamin => 
      productTypes.some(type => 
        vitamin.toLowerCase().includes(type.replace('_', ' ')) ||
        type.replace('_', ' ').includes(vitamin.toLowerCase())
      )
    );
  }

  private calculatePriority(score: number): 'high' | 'medium' | 'low' {
    if (score >= 25) return 'high';
    if (score >= 15) return 'medium';
    return 'low';
  }

  private generateAnalysisReport(profile: SurveyData, recommendations: ProductRecommendation[]): string {
    const lines = [
      `Анализ профиля: ${profile.gender === 'female' ? 'женщина' : 'мужчина'}, ${this.translateAgeGroup(profile.ageGroup)}`,
      `Уровень активности: ${this.translateActivityLevel(profile.activityLevel)}`,
      `Уровень стресса: ${this.translateStressLevel(profile.stressLevel)}`,
      `Качество питания: ${this.translateNutrition(profile.nutrition)}`,
      '',
      `Найдено ${recommendations.length} персональных рекомендаций:`,
      ...recommendations.map((rec, index) => 
        `${index + 1}. ${rec.product.name} (приоритет: ${rec.priority}, балл: ${rec.score})`
      )
    ];

    return lines.join('\n');
  }

  private translateComplaint(complaint: string): string {
    const translations: Record<string, string> = {
      fatigue: 'усталости',
      low_immunity: 'сниженном иммунитете',
      sleep_problems: 'проблемах со сном',
      stress: 'стрессе',
      skin_issues: 'проблемах с кожей',
      joint_pain: 'болях в суставах',
      digestive_issues: 'проблемах с пищеварением',
      memory_issues: 'проблемах с памятью'
    };
    return translations[complaint] || complaint;
  }

  private translateGoal(goal: string): string {
    const translations: Record<string, string> = {
      general_wellness: 'общее самочувствие',
      immunity: 'укрепление иммунитета',
      energy: 'повышение энергии',
      skin_health: 'здоровье кожи',
      heart_health: 'здоровье сердца',
      memory: 'улучшение памяти',
      stress_relief: 'снятие стресса',
      better_sleep: 'улучшение сна'
    };
    return translations[goal] || goal;
  }

  private translateAgeGroup(ageGroup?: string): string {
    const translations: Record<string, string> = {
      under_18: 'до 18 лет',
      '18_30': '18-30 лет',
      '31_45': '31-45 лет',
      '46_60': '46-60 лет',
      '60_plus': 'старше 60 лет'
    };
    return translations[ageGroup || ''] || 'не указан';
  }

  private translateActivityLevel(level?: string): string {
    const translations: Record<string, string> = {
      none: 'почти нет',
      '1_2_week': '1-2 раза в неделю',
      '3_5_week': '3-5 раз в неделю',
      daily: 'ежедневно'
    };
    return translations[level || ''] || 'не указан';
  }

  private translateStressLevel(level?: string): string {
    const translations: Record<string, string> = {
      low: 'низкий',
      medium: 'умеренный',
      high: 'высокий',
      constant: 'постоянный'
    };
    return translations[level || ''] || 'не указан';
  }

  private translateNutrition(nutrition?: string): string {
    const translations: Record<string, string> = {
      daily: 'ежедневно',
      '3_4_week': '3-4 раза в неделю',
      rare: 'редко'
    };
    return translations[nutrition || ''] || 'не указано';
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
}
