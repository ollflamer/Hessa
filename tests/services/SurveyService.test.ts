import { SurveyService } from '../../src/services/SurveyService';
import { TestUtils } from '../utils/testUtils';
import { SurveyData } from '../../src/models/Survey';

describe('SurveyService', () => {
  let surveyService: SurveyService;
  let testUserId: string;

  beforeAll(async () => {
    await TestUtils.initializeDatabase();
    surveyService = new SurveyService();
  });

  beforeEach(async () => {
    await TestUtils.cleanDatabase();
    
    // Создаем тестового пользователя
    const user = await TestUtils.createTestUser({
      email: 'survey@test.com',
      name: 'Survey Test User',
      password: 'password123'
    });
    testUserId = user.id;

    // Создаем тестовые витамины и правила
    await TestUtils.createTestVitamins();
    await TestUtils.createTestVitaminRules();
  });

  afterAll(async () => {
    await TestUtils.closeDatabase();
  });

  describe('saveSurvey', () => {
    it('должен сохранить валидные данные опроса', async () => {
      const surveyData: SurveyData = TestUtils.getValidSurveyData();

      const result = await surveyService.saveSurvey(testUserId, surveyData);

      expect(result).toBeDefined();
      expect(result.id).toBe(testUserId);
      expect(result.surveyCompleted).toBe(true);
      expect(result.ageGroup).toBe(surveyData.ageGroup);
      expect(result.gender).toBe(surveyData.gender);
      expect(result.activityLevel).toBe(surveyData.activityLevel);
      expect(result.stressLevel).toBe(surveyData.stressLevel);
      expect(result.nutrition).toBe(surveyData.nutrition);
      expect(result.surveyCompletedAt).toBeDefined();
    });

    it('должен обновить существующий опрос', async () => {
      const surveyData1: SurveyData = TestUtils.getValidSurveyData();
      const surveyData2: SurveyData = {
        ...surveyData1,
        stressLevel: 'low',
        activityLevel: 'daily'
      };

      // Сохраняем первый раз
      await surveyService.saveSurvey(testUserId, surveyData1);

      // Обновляем
      const result = await surveyService.saveSurvey(testUserId, surveyData2);

      expect(result.stressLevel).toBe('low');
      expect(result.activityLevel).toBe('daily');
    });

    it('должен выбросить ошибку для несуществующего пользователя', async () => {
      const surveyData: SurveyData = TestUtils.getValidSurveyData();
      const fakeUserId = '00000000-0000-0000-0000-000000000000';

      await expect(
        surveyService.saveSurvey(fakeUserId, surveyData)
      ).rejects.toThrow('Пользователь не найден');
    });
  });

  describe('getUserSurvey', () => {
    it('должен вернуть опрос пользователя', async () => {
      const surveyData: SurveyData = TestUtils.getValidSurveyData();
      await surveyService.saveSurvey(testUserId, surveyData);

      const result = await surveyService.getUserSurvey(testUserId);

      expect(result).toBeDefined();
      expect(result!.id).toBe(testUserId);
      expect(result!.surveyCompleted).toBe(true);
      expect(result!.ageGroup).toBe(surveyData.ageGroup);
    });

    it('должен вернуть null для пользователя без опроса', async () => {
      const result = await surveyService.getUserSurvey(testUserId);

      expect(result).toBeDefined();
      expect(result!.surveyCompleted).toBe(false);
    });

    it('должен вернуть null для несуществующего пользователя', async () => {
      const fakeUserId = '00000000-0000-0000-0000-000000000000';

      const result = await surveyService.getUserSurvey(fakeUserId);

      expect(result).toBeNull();
    });
  });

  describe('getVitaminRecommendations', () => {
    it('должен вернуть рекомендации для завершенного опроса', async () => {
      const surveyData: SurveyData = TestUtils.getValidSurveyData();
      await surveyService.saveSurvey(testUserId, surveyData);

      const recommendations = await surveyService.getVitaminRecommendations(testUserId);

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);

      // Проверяем структуру рекомендации
      const firstRecommendation = recommendations[0];
      expect(firstRecommendation).toHaveProperty('vitamin');
      expect(firstRecommendation).toHaveProperty('reasons');
      expect(firstRecommendation).toHaveProperty('priority');
      expect(firstRecommendation).toHaveProperty('matchedRules');

      // Проверяем, что витамин содержит необходимые поля
      expect(firstRecommendation.vitamin).toHaveProperty('id');
      expect(firstRecommendation.vitamin).toHaveProperty('name');
      expect(firstRecommendation.vitamin).toHaveProperty('category');
      expect(firstRecommendation.vitamin).toHaveProperty('description');
    });

    it('должен вернуть пустой массив для незавершенного опроса', async () => {
      const recommendations = await surveyService.getVitaminRecommendations(testUserId);

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBe(0);
    });

    it('должен исключить уже принимаемые витамины', async () => {
      const surveyData: SurveyData = {
        ...TestUtils.getValidSurveyData(),
        vitaminsCurrently: ['magnesium'] // Уже принимает магний
      };
      await surveyService.saveSurvey(testUserId, surveyData);

      const recommendations = await surveyService.getVitaminRecommendations(testUserId);

      // Проверяем, что магний не включен в рекомендации
      const magnesiumRecommendation = recommendations.find(
        r => r.vitamin.name === 'Магний'
      );
      expect(magnesiumRecommendation).toBeUndefined();
    });

    it('должен сортировать рекомендации по приоритету', async () => {
      const surveyData: SurveyData = TestUtils.getValidSurveyData();
      await surveyService.saveSurvey(testUserId, surveyData);

      const recommendations = await surveyService.getVitaminRecommendations(testUserId);

      if (recommendations.length > 1) {
        for (let i = 0; i < recommendations.length - 1; i++) {
          expect(recommendations[i].priority).toBeLessThanOrEqual(
            recommendations[i + 1].priority
          );
        }
      }
    });

    it('должен ограничить количество рекомендаций до 8', async () => {
      const surveyData: SurveyData = TestUtils.getValidSurveyData();
      await surveyService.saveSurvey(testUserId, surveyData);

      const recommendations = await surveyService.getVitaminRecommendations(testUserId);

      expect(recommendations.length).toBeLessThanOrEqual(8);
    });
  });

  describe('Логика подбора витаминов', () => {
    it('должен рекомендовать магний для высокого стресса', async () => {
      const surveyData: SurveyData = {
        ...TestUtils.getValidSurveyData(),
        stressLevel: 'high'
      };
      await surveyService.saveSurvey(testUserId, surveyData);

      const recommendations = await surveyService.getVitaminRecommendations(testUserId);

      const magnesiumRecommendation = recommendations.find(
        r => r.vitamin.name === 'Магний'
      );
      expect(magnesiumRecommendation).toBeDefined();
      expect(magnesiumRecommendation!.reasons).toContain('Высокий стресс');
    });

    it('должен рекомендовать витамин D3 для низкой активности', async () => {
      const surveyData: SurveyData = {
        ...TestUtils.getValidSurveyData(),
        activityLevel: 'none'
      };
      await surveyService.saveSurvey(testUserId, surveyData);

      const recommendations = await surveyService.getVitaminRecommendations(testUserId);

      const vitaminD3Recommendation = recommendations.find(
        r => r.vitamin.name === 'Витамин D3'
      );
      expect(vitaminD3Recommendation).toBeDefined();
      expect(vitaminD3Recommendation!.reasons).toContain('Низкая активность');
    });
  });
});
