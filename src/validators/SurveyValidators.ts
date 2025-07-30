import { IsEnum, IsArray, IsOptional, ArrayUnique, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { 
  AgeGroup, 
  Gender, 
  ActivityLevel, 
  StressLevel, 
  Nutrition,
  Restriction,
  Complaint,
  Goal,
  CurrentVitamin 
} from '../models/Survey';

export class SurveyDto {
  @IsEnum(['under_18', '18_30', '31_45', '46_60', '60_plus'], {
    message: 'Возрастная группа должна быть одной из: under_18, 18_30, 31_45, 46_60, 60_plus'
  })
  ageGroup!: AgeGroup;

  @IsEnum(['male', 'female', 'other'], {
    message: 'Пол должен быть одним из: male, female, other'
  })
  gender!: Gender;

  @IsEnum(['none', '1_2_week', '3_5_week', 'daily'], {
    message: 'Уровень активности должен быть одним из: none, 1_2_week, 3_5_week, daily'
  })
  activityLevel!: ActivityLevel;

  @IsEnum(['low', 'medium', 'high', 'constant'], {
    message: 'Уровень стресса должен быть одним из: low, medium, high, constant'
  })
  stressLevel!: StressLevel;

  @IsEnum(['daily', '3_4_week', 'rare'], {
    message: 'Качество питания должно быть одним из: daily, 3_4_week, rare'
  })
  nutrition!: Nutrition;

  @IsOptional()
  @IsArray({ message: 'Ограничения должны быть массивом' })
  @ArrayUnique({ message: 'Ограничения не должны повторяться' })
  @Transform(({ value }) => Array.isArray(value) ? value : [])
  restrictions: Restriction[] = [];

  @IsOptional()
  @IsArray({ message: 'Жалобы должны быть массивом' })
  @ArrayUnique({ message: 'Жалобы не должны повторяться' })
  @Transform(({ value }) => Array.isArray(value) ? value : [])
  complaints: Complaint[] = [];

  @IsOptional()
  @IsArray({ message: 'Цели должны быть массивом' })
  @ArrayUnique({ message: 'Цели не должны повторяться' })
  @Transform(({ value }) => Array.isArray(value) ? value : [])
  goals: Goal[] = [];

  @IsOptional()
  @IsArray({ message: 'Текущие витамины должны быть массивом' })
  @ArrayUnique({ message: 'Витамины не должны повторяться' })
  @Transform(({ value }) => Array.isArray(value) ? value : [])
  vitaminsCurrently: CurrentVitamin[] = [];
}

export class UpdateSurveyDto {
  @IsOptional()
  @IsEnum(['under_18', '18_30', '31_45', '46_60', '60_plus'])
  ageGroup?: AgeGroup;

  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: Gender;

  @IsOptional()
  @IsEnum(['none', '1_2_week', '3_5_week', 'daily'])
  activityLevel?: ActivityLevel;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'constant'])
  stressLevel?: StressLevel;

  @IsOptional()
  @IsEnum(['daily', '3_4_week', 'rare'])
  nutrition?: Nutrition;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  restrictions?: Restriction[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  complaints?: Complaint[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  goals?: Goal[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  vitaminsCurrently?: CurrentVitamin[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  completed?: boolean;
}
