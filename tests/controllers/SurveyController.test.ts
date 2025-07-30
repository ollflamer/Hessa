import request from 'supertest';
import { app } from '../../src/index';
import { TestUtils } from '../utils/testUtils';

describe('SurveyController', () => {
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    await TestUtils.initializeDatabase();
  });

  beforeEach(async () => {
    await TestUtils.cleanDatabase();
    
    // Создаем тестового пользователя
    testUser = await TestUtils.createTestUser({
      email: 'survey@test.com',
      name: 'Survey Test User',
      password: 'password123'
    });

    authToken = TestUtils.generateTestToken(testUser.id);

    // Создаем тестовые витамины и правила
    await TestUtils.createTestVitamins();
    await TestUtils.createTestVitaminRules();
  });

  afterAll(async () => {
    await TestUtils.closeDatabase();
  });

  describe('GET /api/survey/questions', () => {
    it('должен вернуть структуру вопросов опросника', async () => {
      const response = await request(app)
        .get('/api/survey/questions')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();

      const questions = response.body.data;
      
      // Проверяем основные поля
      expect(questions).toHaveProperty('ageGroup');
      expect(questions).toHaveProperty('gender');
      expect(questions).toHaveProperty('activityLevel');
      expect(questions).toHaveProperty('stressLevel');
      expect(questions).toHaveProperty('nutrition');
      expect(questions).toHaveProperty('restrictions');
      expect(questions).toHaveProperty('complaints');
      expect(questions).toHaveProperty('goals');
      expect(questions).toHaveProperty('vitaminsCurrently');

      // Проверяем структуру вопроса
      expect(questions.ageGroup).toHaveProperty('question');
      expect(questions.ageGroup).toHaveProperty('type');
      expect(questions.ageGroup).toHaveProperty('options');
      expect(Array.isArray(questions.ageGroup.options)).toBe(true);

      // Проверяем, что опции содержат value и label
      const firstOption = questions.ageGroup.options[0];
      expect(firstOption).toHaveProperty('value');
      expect(firstOption).toHaveProperty('label');
    });

    it('должен работать без авторизации', async () => {
      await request(app)
        .get('/api/survey/questions')
        .expect(200);
    });
  });

  describe('POST /api/survey', () => {
    it('должен сохранить валидные данные опроса', async () => {
      const surveyData = TestUtils.getValidSurveyData();

      const response = await request(app)
        .post('/api/survey')
        .set('Authorization', `Bearer ${authToken}`)
        .send(surveyData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.surveyCompleted).toBe(true);
      expect(response.body.data.ageGroup).toBe(surveyData.ageGroup);
    });

    it('должен отклонить запрос без авторизации', async () => {
      const surveyData = TestUtils.getValidSurveyData();

      await request(app)
        .post('/api/survey')
        .send(surveyData)
        .expect(401);
    });

    it('должен отклонить невалидные данные', async () => {
      const invalidData = TestUtils.getInvalidSurveyData();

      const response = await request(app)
        .post('/api/survey')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Ошибка валидации');
    });

    it('должен отклонить запрос с неполными данными', async () => {
      const incompleteData = {
        ageGroup: '18_30'
        // Остальные поля отсутствуют
      };

      const response = await request(app)
        .post('/api/survey')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('должен обновить существующий опрос', async () => {
      const surveyData1 = TestUtils.getValidSurveyData();
      const surveyData2 = {
        ...surveyData1,
        stressLevel: 'low'
      };

      // Сохраняем первый раз
      await request(app)
        .post('/api/survey')
        .set('Authorization', `Bearer ${authToken}`)
        .send(surveyData1)
        .expect(201);

      // Обновляем
      const response = await request(app)
        .post('/api/survey')
        .set('Authorization', `Bearer ${authToken}`)
        .send(surveyData2)
        .expect(201);

      expect(response.body.data.stressLevel).toBe('low');
    });
  });

  describe('GET /api/survey', () => {
    it('должен вернуть опрос пользователя', async () => {
      const surveyData = TestUtils.getValidSurveyData();

      // Сначала сохраняем опрос
      await request(app)
        .post('/api/survey')
        .set('Authorization', `Bearer ${authToken}`)
        .send(surveyData);

      // Затем получаем его
      const response = await request(app)
        .get('/api/survey')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.surveyCompleted).toBe(true);
      expect(response.body.data.ageGroup).toBe(surveyData.ageGroup);
    });

    it('должен вернуть пустой опрос для нового пользователя', async () => {
      const response = await request(app)
        .get('/api/survey')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.surveyCompleted).toBe(false);
    });

    it('должен отклонить запрос без авторизации', async () => {
      await request(app)
        .get('/api/survey')
        .expect(401);
    });
  });

  describe('GET /api/survey/recommendations', () => {
    it('должен вернуть рекомендации для завершенного опроса', async () => {
      const surveyData = TestUtils.getValidSurveyData();

      // Сначала сохраняем опрос
      await request(app)
        .post('/api/survey')
        .set('Authorization', `Bearer ${authToken}`)
        .send(surveyData);

      // Затем получаем рекомендации
      const response = await request(app)
        .get('/api/survey/recommendations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);

      if (response.body.data.length > 0) {
        const recommendation = response.body.data[0];
        expect(recommendation).toHaveProperty('vitamin');
        expect(recommendation).toHaveProperty('reasons');
        expect(recommendation).toHaveProperty('priority');
        expect(recommendation).toHaveProperty('matchedRules');

        // Проверяем структуру витамина
        expect(recommendation.vitamin).toHaveProperty('id');
        expect(recommendation.vitamin).toHaveProperty('name');
        expect(recommendation.vitamin).toHaveProperty('category');
        expect(recommendation.vitamin).toHaveProperty('description');
      }
    });

    it('должен вернуть пустой массив для незавершенного опроса', async () => {
      const response = await request(app)
        .get('/api/survey/recommendations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('должен отклонить запрос без авторизации', async () => {
      await request(app)
        .get('/api/survey/recommendations')
        .expect(401);
    });

    it('должен исключить уже принимаемые витамины', async () => {
      const surveyData = {
        ...TestUtils.getValidSurveyData(),
        vitaminsCurrently: ['magnesium'] // Уже принимает магний
      };

      // Сохраняем опрос
      await request(app)
        .post('/api/survey')
        .set('Authorization', `Bearer ${authToken}`)
        .send(surveyData);

      // Получаем рекомендации
      const response = await request(app)
        .get('/api/survey/recommendations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const recommendations = response.body.data;
      
      // Проверяем, что магний не включен в рекомендации
      const magnesiumRecommendation = recommendations.find(
        (r: any) => r.vitamin.name === 'Магний'
      );
      expect(magnesiumRecommendation).toBeUndefined();
    });

    it('должен ограничить количество рекомендаций до 8', async () => {
      const surveyData = TestUtils.getValidSurveyData();

      await request(app)
        .post('/api/survey')
        .set('Authorization', `Bearer ${authToken}`)
        .send(surveyData);

      const response = await request(app)
        .get('/api/survey/recommendations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(8);
    });
  });

  describe('Rate Limiting', () => {
    it('должен применять rate limiting к POST /api/survey', async () => {
      const surveyData = TestUtils.getValidSurveyData();

      // Делаем много запросов подряд
      const promises = Array(15).fill(null).map(() =>
        request(app)
          .post('/api/survey')
          .set('Authorization', `Bearer ${authToken}`)
          .send(surveyData)
      );

      const responses = await Promise.all(promises);

      // Некоторые запросы должны быть отклонены с кодом 429
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('должен обрабатывать ошибки базы данных', async () => {
      // Закрываем соединение с БД для имитации ошибки
      await TestUtils.closeDatabase();

      const response = await request(app)
        .get('/api/survey/questions')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Внутренняя ошибка сервера');

      // Восстанавливаем соединение
      await TestUtils.initializeDatabase();
    });

    it('должен обрабатывать невалидный JWT токен', async () => {
      const surveyData = TestUtils.getValidSurveyData();

      const response = await request(app)
        .post('/api/survey')
        .set('Authorization', 'Bearer invalid_token')
        .send(surveyData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
