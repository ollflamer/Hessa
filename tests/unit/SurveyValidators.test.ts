import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { SurveyDto } from '../../src/validators/SurveyValidators';

describe('SurveyValidators', () => {
  describe('SurveyDto', () => {
    const getValidSurveyData = () => ({
      ageGroup: '18_30' as const,
      gender: 'male' as const,
      activityLevel: 'none' as const,
      stressLevel: 'high' as const,
      nutrition: 'daily' as const,
      restrictions: [],
      complaints: ['fatigue', 'stress'],
      goals: ['energy', 'stress_relief'],
      vitaminsCurrently: []
    });

    it('должен пройти валидацию с корректными данными', async () => {
      const validData = getValidSurveyData();
      const dto = plainToClass(SurveyDto, validData);
      
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('должен провалить валидацию с некорректным возрастом', async () => {
      const invalidData = {
        ...getValidSurveyData(),
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
        ...getValidSurveyData(),
        gender: 'invalid_gender'
      };
      const dto = plainToClass(SurveyDto, invalidData as any);
      
      const errors = await validate(dto);
      
      expect(errors.length).toBeGreaterThan(0);
      const genderError = errors.find(error => error.property === 'gender');
      expect(genderError).toBeDefined();
    });

    it('должен принимать все валидные значения для пола включая "other"', async () => {
      const validGenders = ['male', 'female', 'other'];
      
      for (const gender of validGenders) {
        const validData = {
          ...getValidSurveyData(),
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
          ...getValidSurveyData(),
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
          ...getValidSurveyData(),
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
          ...getValidSurveyData(),
          nutrition
        };
        const dto = plainToClass(SurveyDto, validData as any);
        
        const errors = await validate(dto);
        
        expect(errors).toHaveLength(0);
      }
    });

    it('должен валидировать массивы с корректными значениями', async () => {
      const validData = {
        ...getValidSurveyData(),
        restrictions: ['vegetarian', 'lactose_free'],
        complaints: ['fatigue', 'stress', 'skin_issues'],
        goals: ['energy', 'immunity', 'skin_health'],
        vitaminsCurrently: ['vitamin_d', 'magnesium']
      };
      const dto = plainToClass(SurveyDto, validData as any);
      
      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('должен провалить валидацию с отсутствующими обязательными полями', async () => {
      const incompleteData = {
        ageGroup: '18_30'
      };
      const dto = plainToClass(SurveyDto, incompleteData as any);
      
      const errors = await validate(dto);
      
      expect(errors.length).toBeGreaterThan(0);
      
      const requiredFields = ['gender', 'activityLevel', 'stressLevel', 'nutrition'];
      requiredFields.forEach(field => {
        const fieldError = errors.find(error => error.property === field);
        expect(fieldError).toBeDefined();
      });
    });
  });
});
