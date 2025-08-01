import { BaseService } from './BaseService';
import { DatabaseService } from './DatabaseService';
import { User, UserProfile, UpdateProfileDto } from '../models/User';

export class ProfileService extends BaseService {
  private dbService: DatabaseService;

  constructor() {
    super();
    this.dbService = new DatabaseService();
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    return this.executeWithLogging('получение профиля пользователя', async () => {
      const result = await this.dbService.query(
        `SELECT * FROM users WHERE id = $1`,
        [userId]
      );

      if (result.length === 0) {
        return null;
      }

      const user = User.fromObject(result[0]);
      return user.toObject();
    });
  }

  async updateProfile(userId: string, data: UpdateProfileDto): Promise<UserProfile> {
    return this.executeWithLogging('обновление профиля пользователя', async () => {
      const currentUser = await this.getProfile(userId);
      if (!currentUser) {
        throw new Error('Пользователь не найден');
      }
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      if (data.name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        updateValues.push(data.name);
      }

      if (data.avatarUrl !== undefined) {
        updateFields.push(`avatar_url = $${paramIndex++}`);
        updateValues.push(data.avatarUrl);
      }

      if (data.dateOfBirth !== undefined) {
        updateFields.push(`date_of_birth = $${paramIndex++}`);
        updateValues.push(data.dateOfBirth);
      }

      if (data.city !== undefined) {
        updateFields.push(`city = $${paramIndex++}`);
        updateValues.push(data.city);
      }

      if (data.phone !== undefined) {
        updateFields.push(`phone = $${paramIndex++}`);
        updateValues.push(data.phone);
      }

      if (data.age !== undefined) {
        updateFields.push(`age = $${paramIndex++}`);
        updateValues.push(data.age);
      }

      if (data.gender !== undefined) {
        updateFields.push(`gender = $${paramIndex++}`);
        updateValues.push(data.gender);
      }

      if (data.stressLevel !== undefined) {
        updateFields.push(`stress_level = $${paramIndex++}`);
        updateValues.push(data.stressLevel);
      }

      if (data.physicalActivity !== undefined) {
        updateFields.push(`physical_activity = $${paramIndex++}`);
        updateValues.push(data.physicalActivity);
      }

      if (data.dietQuality !== undefined) {
        updateFields.push(`diet_quality = $${paramIndex++}`);
        updateValues.push(data.dietQuality);
      }

      if (data.dietaryRestrictions !== undefined) {
        updateFields.push(`dietary_restrictions = $${paramIndex++}`);
        updateValues.push(JSON.stringify(data.dietaryRestrictions));
      }

      if (data.healthConcerns !== undefined) {
        updateFields.push(`health_concerns = $${paramIndex++}`);
        updateValues.push(JSON.stringify(data.healthConcerns));
      }

      if (updateFields.length === 0) {
        throw new Error('Нет данных для обновления');
      }

      updateFields.push(`updated_at = $${paramIndex++}`);
      updateValues.push(new Date());
      updateValues.push(userId);

      const query = `
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await this.dbService.query(query, updateValues);
      const updatedUser = User.fromObject(result[0]);
      return updatedUser.toObject();
    });
  }

  async getProfileOptions(): Promise<any> {
    return this.executeWithLogging('получение опций профиля', async () => {
      return {
        genderOptions: [
          { value: 'male', label: 'Мужской' },
          { value: 'female', label: 'Женский' }
        ],
        stressLevelOptions: [
          { value: 'none', label: 'Почти нет стресса' },
          { value: 'moderate', label: 'Умеренный стресс' },
          { value: 'high', label: 'Высокий стресс' },
          { value: 'constant', label: 'Постоянный стресс' }
        ],
        physicalActivityOptions: [
          { value: 'none', label: 'Не занимаюсь' },
          { value: '1_2_week', label: '1-2 раза в неделю' },
          { value: '3_5_week', label: '3-5 раз в неделю' },
          { value: 'daily', label: 'Каждый день' }
        ],
        dietQualityOptions: [
          { value: 'daily', label: 'Каждый день' },
          { value: '3_4_week', label: '3-4 раза в неделю' },
          { value: 'rare', label: 'Редко' }
        ],
        dietaryRestrictionsOptions: [
          { value: 'vegetarian', label: 'Вегетарианство' },
          { value: 'vegan', label: 'Веганство' },
          { value: 'lactose_free', label: 'Непереносимость лактозы' },
          { value: 'gluten_free', label: 'Непереносимость глютена' },
          { value: 'nut_free', label: 'Аллергия на орехи' },
          { value: 'diabetic', label: 'Диабет' },
          { value: 'none', label: 'Нет ограничений' }
        ],
        healthConcernsOptions: [
          { value: 'fatigue', label: 'Усталость' },
          { value: 'stress', label: 'Стресс' },
          { value: 'skin_issues', label: 'Проблемы с кожей' },
          { value: 'sleep_problems', label: 'Проблемы со сном' },
          { value: 'digestive_issues', label: 'Проблемы с пищеварением' },
          { value: 'low_immunity', label: 'Слабый иммунитет' },
          { value: 'joint_pain', label: 'Боли в суставах' },
          { value: 'memory_issues', label: 'Проблемы с памятью' },
          { value: 'none', label: 'Нет проблем' }
        ]
      };
    });
  }

  async uploadAvatar(userId: string, avatarUrl: string): Promise<UserProfile> {
    return this.executeWithLogging('загрузка аватарки', async () => {
      const result = await this.dbService.query(
        `UPDATE users 
         SET avatar_url = $1, updated_at = $2
         WHERE id = $3
         RETURNING *`,
        [avatarUrl, new Date(), userId]
      );

      if (result.length === 0) {
        throw new Error('Пользователь не найден');
      }

      const user = User.fromObject(result[0]);
      return user.toObject();
    });
  }

  async deleteAvatar(userId: string): Promise<UserProfile> {
    return this.executeWithLogging('удаление аватарки', async () => {
      const result = await this.dbService.query(
        `UPDATE users 
         SET avatar_url = NULL, updated_at = $1
         WHERE id = $2
         RETURNING *`,
        [new Date(), userId]
      );

      if (result.length === 0) {
        throw new Error('Пользователь не найден');
      }

      const user = User.fromObject(result[0]);
      return user.toObject();
    });
  }
}
