import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { SurveyDto } from '../../src/validators/SurveyValidators';
import { TestUtils } from '../utils/testUtils';

describe('SurveyValidators', () => {
  describe('SurveyDto', () => {
    it('должен пройти валидацию с корректными данными', async () => {
      const validData = TestUtils.getValidSurveyData();
      const dto = plainToClass(SurveyDto, validData as any);
      
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('должен провалить валидацию с некорректным возрастом', async () => {
      const invalidData = {
        ...TestUtils.getValidSurveyData(),
        ageGroup: 'invalid_age'
      };
      const dto = plainToClass(SurveyDto, invalidData as any);
      
      const errors = await validate(dto);
      
      expect(errors.length).toBeGreaterThan(0);
      const ageGroupError = errors.find(error => error.property === 'ageGroup');
      expect(ageGroupError).toBeDefined();
    });

    it('должен провалить валидацию с некорректным полом', async () => {
      const invalidData = {
        ...TestUtils.getValidSurveyData(),
        gender: 'invalid_gender'
      };
      const dto = plainToClass(SurveyDto, invalidData as any);
      
      const errors = await validate(dto);
      
      expect(errors.length).toBeGreaterThan(0);
      const genderError = errors.find(error => error.property === 'gender');
      expect(genderError).toBeDefined();
    });

    it('должен провалить валидацию с некорректным уровнем активности', async () => {
      const invalidData = {
        ...TestUtils.getValidSurveyData(),
        activityLevel: 'invalid_activity'
      };
      const dto = plainToClass(SurveyDto, invalidData as any);
      
      const errors = await validate(dto);
      
      expect(errors.length).toBeGreaterThan(0);
      const activityError = errors.find(error => error.property === 'activityLevel');
      expect(activityError).toBeDefined();
    });

    it('должен провалить валидацию с некорректным уровнем стресса', async () => {
      const invalidData = {
        ...TestUtils.getValidSurveyData(),
        stressLevel: 'invalid_stress'
      };
      const dto = plainToClass(SurveyDto, invalidData as any);
      
      const errors = await validate(dto);
      
      expect(errors.length).toBeGreaterThan(0);
      const stressError = errors.find(error => error.property === 'stressLevel');
      expect(stressError).toBeDefined();
    });

    it('должен провалить валидацию с некорректным питанием', async () => {
      const invalidData = {
        ...TestUtils.getValidSurveyData(),
        nutrition: 'invalid_nutrition'
      };
      const dto = plainToClass(SurveyDto, invalidData as any);
      
      const errors = await validate(dto);
      
      expect(errors.length).toBeGreaterThan(0);
      const nutritionError = errors.find(error => error.property === 'nutrition');
      expect(nutritionError).toBeDefined();
    });

    it('должен принимать пустые массивы для необязательных полей', async () => {
      const validData = {
        ...TestUtils.getValidSurveyData(),
        restrictions: [],
        complaints: [],
        goals: [],
        vitaminsCurrently: []
      };
      const dto = plainToClass(SurveyDto, validData as any);
      
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('должен валидировать массивы с корректными значениями', async () => {
      const validData = {
        ...TestUtils.getValidSurveyData(),
        restrictions: ['vegetarian', 'lactose_free'],
        complaints: ['fatigue', 'stress', 'skin_issues'],
        goals: ['energy', 'immunity', 'skin_health'],
        vitaminsCurrently: ['vitamin_d', 'magnesium']
      };
      const dto = plainToClass(SurveyDto, validData as any);
      
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('должен провалить валидацию с некорректными значениями в массивах', async () => {
      const invalidData = {
        ...TestUtils.getValidSurveyData(),
        restrictions: ['invalid_restriction'],
        complaints: ['invalid_complaint'],
        goals: ['invalid_goal'],
        vitaminsCurrently: ['invalid_vitamin']
      };
      const dto = plainToClass(SurveyDto, invalidData as any);
      
      const errors = await validate(dto);
      
      expect(errors.length).toBeGreaterThan(0);
    });

    it('должен провалить валидацию с отсутствующими обязательными полями', async () => {
      const incompleteData = {
        ageGroup: '18_30'
        // Остальные поля отсутствуют
      };
      const dto = plainToClass(SurveyDto, incompleteData as any);
      
      const errors = await validate(dto);
      
      expect(errors.length).toBeGreaterThan(0);
      
      // Проверяем, что есть ошибки для обязательных полей
      const requiredFields = ['gender', 'activityLevel', 'stressLevel', 'nutrition'];
      requiredFields.forEach(field => {
        const fieldError = errors.find(error => error.property === field);
        expect(fieldError).toBeDefined();
      });
    });

    it('должен принимать все валидные значения для пола включая "other"', async () => {
      const validGenders = ['male', 'female', 'other'];
      
      for (const gender of validGenders) {
        const validData = {
          ...TestUtils.getValidSurveyData(),
          gender
        };
        const dto = plainToClass(SurveyDto, validData as any);
        
        const errors = await validate(dto);
        
        expect(errors).toHaveLength(0);
      }
    });

    it('должен принимать все валидные уровни активности', async () => {
      const validActivityLevels = ['none', '1_2_week', '3_5_week', 'daily'];
      
      for (const activityLevel of validActivityLevels) {
        const validData = {
          ...TestUtils.getValidSurveyData(),
          activityLevel
        };
        const dto = plainToClass(SurveyDto, validData as any);
        
        const errors = await validate(dto);
        
        expect(errors).toHaveLength(0);
      }
    });

    it('должен принимать все валидные уровни стресса', async () => {
      const validStressLevels = ['low', 'medium', 'high', 'constant'];
      
      for (const stressLevel of validStressLevels) {
        const validData = {
          ...TestUtils.getValidSurveyData(),
          stressLevel
        };
        const dto = plainToClass(SurveyDto, validData as any);
        
        const errors = await validate(dto);
        
        expect(errors).toHaveLength(0);
      }
    });

    it('должен принимать все валидные значения питания', async () => {
      const validNutritionValues = ['daily', '3_4_week', 'rare'];
      
      for (const nutrition of validNutritionValues) {
        const validData = {
          ...TestUtils.getValidSurveyData(),
          nutrition
        };
        const dto = plainToClass(SurveyDto, validData as any);
        
        const errors = await validate(dto);
        
        expect(errors).toHaveLength(0);
      }
    });
  });
});
