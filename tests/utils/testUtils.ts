import { DatabaseService } from '../../src/services/DatabaseService';
import { UserService } from '../../src/services/UserService';
import { SurveyData } from '../../src/models/Survey';
import jwt from 'jsonwebtoken';

export class TestUtils {
  private static dbService: DatabaseService;
  private static userService: UserService;
  private static isInitialized = false;

  static async initializeDatabase(): Promise<void> {
    await this.initDatabase();
    this.userService = new UserService();

    // Очищаем тестовые таблицы
    await this.cleanDatabase();
  }

  static async initDatabase() {
    if (!this.isInitialized) {
      this.dbService = new DatabaseService();
      this.isInitialized = true;
      
      try {
        // Проверяем соединение
        await this.dbService.testConnection();
      } catch (error) {
        console.error('Ошибка инициализации БД:', error);
        throw error;
      }
    }
  }

  static async cleanDatabase(): Promise<void> {
    if (!this.dbService) {
      this.dbService = new DatabaseService();
    }

    try {
      // Используем TRUNCATE для быстрой очистки с каскадным удалением
      await this.dbService.query('TRUNCATE TABLE vitamin_rules, vitamins, users RESTART IDENTITY CASCADE');
    } catch (error) {
      // Если TRUNCATE не работает, используем DELETE
      try {
        await this.dbService.query('DELETE FROM vitamin_rules');
        await this.dbService.query('DELETE FROM vitamins');
        await this.dbService.query('DELETE FROM users');
      } catch (deleteError) {
        console.warn('Ошибка очистки БД (возможно, таблицы не существуют):', deleteError);
      }
    }

    try {
      // Очищаем таблицы в правильном порядке (учитывая внешние ключи)
      await this.dbService.query('DELETE FROM feedback_rate_limit');
      await this.dbService.query('DELETE FROM feedback');
    } catch (error) {
      console.warn('Ошибка очистки БД (возможно, таблицы не существуют):', error);
    }
  }

  static async createTestUser(): Promise<{ user: any; token: string }> {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const userData = {
      email: `test-${timestamp}-${randomId}@example.com`,
      password: 'password123',
      name: 'Тестовый Пользователь'
    };

    if (!this.userService) {
      this.userService = new UserService();
    }

    const user = await this.userService.createUser(userData);
    const token = this.generateTestToken(user.id, 'user');

    return { user, token };
      name: userData.name,
      password: userData.password
    });
  }

  static generateTestToken(userId: string, role: string = 'user'): string {
    const secret = process.env.JWT_SECRET || 'test_secret';
    return jwt.sign(
      { 
        userId, 
        email: 'test@example.com',
        role 
      },
      secret,
      { expiresIn: '1h' }
    );
  }

  static async createTestVitamins(): Promise<void> {
    if (!this.dbService) {
      this.dbService = new DatabaseService();
    }

    const vitamins = [
      {
        name: 'Витамин D3',
        category: 'Для иммунитета',
        description: 'Поддерживает иммунную систему и здоровье костей',
        benefits: JSON.stringify(['иммунитет', 'кости', 'настроение']),
        dosage: '1000-4000 МЕ в день'
      },
      {
        name: 'Магний',
        category: 'Для нервной системы',
        description: 'Помогает справиться со стрессом и улучшает сон',
        benefits: JSON.stringify(['стресс', 'сон', 'мышцы']),
        dosage: '200-400 мг в день'
      },
      {
        name: 'B-комплекс',
        category: 'Для энергии',
        description: 'Поддерживает энергетический обмен и нервную систему',
        benefits: JSON.stringify(['энергия', 'нервы', 'метаболизм']),
        dosage: '1 капсула в день'
      }
    ];

    for (const vitamin of vitamins) {
      await this.dbService.query(`
        INSERT INTO vitamins (name, category, description, benefits, dosage)
        VALUES ($1, $2, $3, $4, $5)
      `, [vitamin.name, vitamin.category, vitamin.description, vitamin.benefits, vitamin.dosage]);
    }
  }

  static async createTestVitaminRules(): Promise<void> {
    if (!this.dbService) {
      this.dbService = new DatabaseService();
    }

    const rules = [
      {
        name: 'Высокий стресс',
        condition: JSON.stringify({ stress_level: 'high' }),
        vitamins: JSON.stringify(['Магний', 'B-комплекс']),
        priority: 1
      },
      {
        name: 'Низкая активность',
        condition: JSON.stringify({ activity_level: 'none' }),
        vitamins: JSON.stringify(['Витамин D3', 'B-комплекс']),
        priority: 2
      }
    ];

    for (const rule of rules) {
      await this.dbService.query(`
        INSERT INTO vitamin_rules (name, condition, vitamins, priority)
        VALUES ($1, $2, $3, $4)
      `, [rule.name, rule.condition, rule.vitamins, rule.priority]);
    }
  }

  static async closeDatabase() {
    try {
      if (this.dbService && this.isInitialized) {
        await this.dbService.close();
        this.isInitialized = false;
        this.dbService = null as any;
      }
    } catch (error: any) {
      if (!error.message.includes('more than once')) {
        console.warn('Предупреждение при закрытии соединения БД:', error.message);
      }
    }
  }

  static getValidSurveyData(): SurveyData {
    return {
      ageGroup: '18_30' as const,
      gender: 'male' as const,
      activityLevel: 'none' as const,
      stressLevel: 'high' as const,
      nutrition: 'daily' as const,
      restrictions: [],
      complaints: ['fatigue', 'stress'],
      goals: ['energy', 'stress_relief'],
      vitaminsCurrently: []
    };
  }

  static getInvalidSurveyData() {
    return {
      ageGroup: 'invalid_age',
      gender: 'invalid_gender',
      activityLevel: 'invalid_activity',
      stressLevel: 'invalid_stress',
      nutrition: 'invalid_nutrition'
    };
  }
}
