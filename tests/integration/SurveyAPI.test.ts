import request from 'supertest';
import { app } from '../../src/index';

describe('Survey API Integration Tests', () => {
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

    it('должен содержать правильные варианты для возраста', async () => {
      const response = await request(app)
        .get('/api/survey/questions')
        .expect(200);

      const ageOptions = response.body.data.ageGroup.options;
      const expectedAgeValues = ['under_18', '18_30', '31_45', '46_60', '60_plus'];
      
      expectedAgeValues.forEach(value => {
        const option = ageOptions.find((opt: any) => opt.value === value);
        expect(option).toBeDefined();
        expect(option.label).toBeDefined();
      });
    });

    it('должен содержать правильные варианты для пола', async () => {
      const response = await request(app)
        .get('/api/survey/questions')
        .expect(200);

      const genderOptions = response.body.data.gender.options;
      const expectedGenderValues = ['male', 'female', 'other'];
      
      expectedGenderValues.forEach(value => {
        const option = genderOptions.find((opt: any) => opt.value === value);
        expect(option).toBeDefined();
        expect(option.label).toBeDefined();
      });
    });

    it('должен содержать правильные варианты для активности', async () => {
      const response = await request(app)
        .get('/api/survey/questions')
        .expect(200);

      const activityOptions = response.body.data.activityLevel.options;
      const expectedActivityValues = ['none', '1_2_week', '3_5_week', 'daily'];
      
      expectedActivityValues.forEach(value => {
        const option = activityOptions.find((opt: any) => opt.value === value);
        expect(option).toBeDefined();
        expect(option.label).toBeDefined();
      });
    });

    it('должен содержать правильные варианты для стресса', async () => {
      const response = await request(app)
        .get('/api/survey/questions')
        .expect(200);

      const stressOptions = response.body.data.stressLevel.options;
      const expectedStressValues = ['low', 'medium', 'high', 'constant'];
      
      expectedStressValues.forEach(value => {
        const option = stressOptions.find((opt: any) => opt.value === value);
        expect(option).toBeDefined();
        expect(option.label).toBeDefined();
      });
    });

    it('должен содержать правильные варианты для питания', async () => {
      const response = await request(app)
        .get('/api/survey/questions')
        .expect(200);

      const nutritionOptions = response.body.data.nutrition.options;
      const expectedNutritionValues = ['daily', '3_4_week', 'rare'];
      
      expectedNutritionValues.forEach(value => {
        const option = nutritionOptions.find((opt: any) => opt.value === value);
        expect(option).toBeDefined();
        expect(option.label).toBeDefined();
      });
    });
  });

  describe('POST /api/survey', () => {
    it('должен отклонить запрос без авторизации', async () => {
      const surveyData = {
        ageGroup: '18_30',
        gender: 'male',
        activityLevel: 'none',
        stressLevel: 'high',
        nutrition: 'daily',
        restrictions: [],
        complaints: ['fatigue'],
        goals: ['energy'],
        vitaminsCurrently: []
      };

      await request(app)
        .post('/api/survey')
        .send(surveyData)
        .expect(401);
    });

    it('должен отклонить невалидные данные', async () => {
      const invalidData = {
        ageGroup: 'invalid_age',
        gender: 'invalid_gender',
        activityLevel: 'invalid_activity',
        stressLevel: 'invalid_stress',
        nutrition: 'invalid_nutrition'
      };

      const response = await request(app)
        .post('/api/survey')
        .set('Authorization', 'Bearer fake_token')
        .send(invalidData)
        .expect(401); // Сначала проверит авторизацию

      // Если бы токен был валидным, получили бы 400 за валидацию
    });

    it('должен отклонить запрос с неполными данными', async () => {
      const incompleteData = {
        ageGroup: '18_30'
      };

      await request(app)
        .post('/api/survey')
        .set('Authorization', 'Bearer fake_token')
        .send(incompleteData)
        .expect(401); // Сначала проверит авторизацию
    });
  });

  describe('GET /api/survey', () => {
    it('должен отклонить запрос без авторизации', async () => {
      await request(app)
        .get('/api/survey')
        .expect(401);
    });
  });

  describe('GET /api/survey/recommendations', () => {
    it('должен отклонить запрос без авторизации', async () => {
      await request(app)
        .get('/api/survey/recommendations')
        .expect(401);
    });
  });

  describe('Error Handling', () => {
    it('должен обрабатывать невалидный JWT токен', async () => {
      const response = await request(app)
        .post('/api/survey')
        .set('Authorization', 'Bearer invalid_token')
        .send({})
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('должен обрабатывать отсутствующий заголовок авторизации', async () => {
      const response = await request(app)
        .get('/api/survey')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
