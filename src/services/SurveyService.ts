import { DatabaseService } from './DatabaseService';
import { logger } from '../utils/logger';
import { 
  SurveyData, 
  UserSurvey, 
  Vitamin, 
  VitaminRule, 
  VitaminRecommendation 
} from '../models/Survey';

export class SurveyService extends DatabaseService {
  constructor() {
    super();
    logger.info('[SurveyService] Инициализация сервиса опросника');
  }

  async saveSurvey(userId: string, surveyData: SurveyData): Promise<UserSurvey> {
    try {
      const query = `
        UPDATE users SET 
          age_group = $2,
          gender = $3,
          activity_level = $4,
          stress_level = $5,
          nutrition = $6,
          restrictions = $7,
          complaints = $8,
          goals = $9,
          vitamins_current = $10,
          survey_completed = TRUE,
          survey_completed_at = NOW(),
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const values = [
        userId,
        surveyData.ageGroup,
        surveyData.gender,
        surveyData.activityLevel,
        surveyData.stressLevel,
        surveyData.nutrition,
        JSON.stringify(surveyData.restrictions),
        JSON.stringify(surveyData.complaints),
        JSON.stringify(surveyData.goals),
        JSON.stringify(surveyData.vitaminsCurrently)
      ];

      const result = await this.query(query, values);
      
      if (!result || result.length === 0) {
        throw new Error('Пользователь не найден');
      }

      return this.mapUserToSurvey(result[0]);
    } catch (error) {
      logger.error('[SurveyService] Ошибка сохранения опроса:', error);
      throw error;
    }
  }

  async getUserSurvey(userId: string): Promise<UserSurvey | null> {
    try {
      const query = `
        SELECT * FROM users WHERE id = $1
      `;

      const result = await this.query(query, [userId]);
      
      if (!result || result.length === 0) {
        return null;
      }

      return this.mapUserToSurvey(result[0]);
    } catch (error) {
      logger.error('[SurveyService] Ошибка получения опроса:', error);
      throw error;
    }
  }

  async getVitaminRecommendations(userId: string): Promise<VitaminRecommendation[]> {
    try {
      const userSurvey = await this.getUserSurvey(userId);
      
      if (!userSurvey || !userSurvey.surveyCompleted) {
        return [];
      }

      const rules = await this.getActiveRules();
      const vitamins = await this.getActiveVitamins();
      
      const matchedRules = this.findMatchingRules(userSurvey, rules);
      const recommendations = this.buildRecommendations(matchedRules, vitamins, userSurvey);

      return recommendations;
    } catch (error) {
      logger.error('[SurveyService] Ошибка получения рекомендаций:', error);
      throw error;
    }
  }

  private async getActiveRules(): Promise<VitaminRule[]> {
    const query = `
      SELECT * FROM vitamin_rules 
      WHERE is_active = TRUE 
      ORDER BY priority ASC, created_at ASC
    `;

    const result = await this.query(query);
    return result.map(this.mapRowToVitaminRule);
  }

  private async getActiveVitamins(): Promise<Vitamin[]> {
    const query = `
      SELECT * FROM vitamins 
      WHERE is_active = TRUE 
      ORDER BY name ASC
    `;

    const result = await this.query(query);
    return result.map(this.mapRowToVitamin);
  }

  private findMatchingRules(userSurvey: UserSurvey, rules: VitaminRule[]): VitaminRule[] {
    return rules.filter(rule => this.ruleMatches(userSurvey, rule.condition));
  }

  private ruleMatches(userSurvey: UserSurvey, condition: Record<string, any>): boolean {
    for (const [key, expectedValue] of Object.entries(condition)) {
      const userValue = this.getUserValue(userSurvey, key);
      
      if (!this.valuesMatch(userValue, expectedValue)) {
        return false;
      }
    }
    return true;
  }

  private getUserValue(userSurvey: UserSurvey, key: string): any {
    const mapping: Record<string, any> = {
      'age_group': userSurvey.ageGroup,
      'gender': userSurvey.gender,
      'activity_level': userSurvey.activityLevel,
      'stress_level': userSurvey.stressLevel,
      'nutrition': userSurvey.nutrition,
      'restrictions': userSurvey.restrictions,
      'complaints': userSurvey.complaints,
      'goals': userSurvey.goals,
      'vitamins_current': userSurvey.vitaminsCurrent
    };

    return mapping[key];
  }

  private valuesMatch(userValue: any, expectedValue: any): boolean {
    if (Array.isArray(expectedValue)) {
      return expectedValue.includes(userValue);
    }

    if (Array.isArray(userValue) && Array.isArray(expectedValue)) {
      return expectedValue.some(val => userValue.includes(val));
    }

    if (Array.isArray(userValue)) {
      return userValue.includes(expectedValue);
    }

    return userValue === expectedValue;
  }

  private buildRecommendations(
    matchedRules: VitaminRule[], 
    vitamins: Vitamin[], 
    userSurvey: UserSurvey
  ): VitaminRecommendation[] {
    const vitaminMap = new Map<string, VitaminRecommendation>();

    for (const rule of matchedRules) {
      for (const vitaminName of rule.vitamins) {
        const vitamin = vitamins.find(v => v.name === vitaminName);
        
        if (!vitamin) continue;

        if (userSurvey.vitaminsCurrent.some(current => 
          this.normalizeVitaminName(current) === this.normalizeVitaminName(vitamin.name)
        )) {
          continue;
        }

        if (!vitaminMap.has(vitamin.id)) {
          vitaminMap.set(vitamin.id, {
            vitamin,
            reasons: [],
            priority: rule.priority,
            matchedRules: []
          });
        }

        const recommendation = vitaminMap.get(vitamin.id)!;
        recommendation.reasons.push(rule.name);
        recommendation.matchedRules.push(rule.id);
        recommendation.priority = Math.min(recommendation.priority, rule.priority);
      }
    }

    return Array.from(vitaminMap.values())
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 8);
  }

  private normalizeVitaminName(name: string): string {
    const mapping: Record<string, string> = {
      'vitamin_d': 'Витамин D3',
      'magnesium': 'Магний',
      'b_complex': 'B-комплекс',
      'omega_3': 'Омега-3',
      'zinc': 'Цинк',
      'iron': 'Железо',
      'calcium': 'Кальций',
      'probiotics': 'Пробиотики'
    };

    return mapping[name.toLowerCase()] || name;
  }

  private mapUserToSurvey(row: any): UserSurvey {
    return {
      id: row.id,
      ageGroup: row.age_group,
      gender: row.gender,
      activityLevel: row.activity_level,
      stressLevel: row.stress_level,
      nutrition: row.nutrition,
      restrictions: row.restrictions || [],
      complaints: row.complaints || [],
      goals: row.goals || [],
      vitaminsCurrent: row.vitamins_current || [],
      surveyCompleted: row.survey_completed || false,
      surveyCompletedAt: row.survey_completed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapRowToVitamin(row: any): Vitamin {
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      description: row.description,
      benefits: row.benefits || [],
      dosage: row.dosage,
      contraindications: row.contraindications,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapRowToVitaminRule(row: any): VitaminRule {
    return {
      id: row.id,
      name: row.name,
      condition: row.condition,
      vitamins: row.vitamins || [],
      priority: row.priority,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
