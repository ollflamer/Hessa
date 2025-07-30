export type AgeGroup = 'under_18' | '18_30' | '31_45' | '46_60' | '60_plus';
export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'none' | '1_2_week' | '3_5_week' | 'daily';
export type StressLevel = 'low' | 'medium' | 'high' | 'constant';
export type Nutrition = 'daily' | '3_4_week' | 'rare';

export type Restriction = 'vegetarian' | 'vegan' | 'lactose_free' | 'gluten_free' | 'nut_free' | 'diabetic';
export type Complaint = 'fatigue' | 'stress' | 'skin_issues' | 'sleep_problems' | 'digestive_issues' | 'low_immunity' | 'joint_pain' | 'memory_issues';
export type Goal = 'energy' | 'immunity' | 'skin_health' | 'stress_relief' | 'better_sleep' | 'weight_management' | 'muscle_building' | 'heart_health';
export type CurrentVitamin = 'vitamin_d' | 'magnesium' | 'b_complex' | 'omega_3' | 'zinc' | 'iron' | 'calcium' | 'probiotics';

export interface SurveyData {
  ageGroup: AgeGroup;
  gender: Gender;
  activityLevel: ActivityLevel;
  stressLevel: StressLevel;
  nutrition: Nutrition;
  restrictions: Restriction[];
  complaints: Complaint[];
  goals: Goal[];
  vitaminsCurrently: CurrentVitamin[];
}

export interface UserSurvey {
  id: string;
  ageGroup?: AgeGroup;
  gender?: Gender;
  activityLevel?: ActivityLevel;
  stressLevel?: StressLevel;
  nutrition?: Nutrition;
  restrictions: Restriction[];
  complaints: Complaint[];
  goals: Goal[];
  vitaminsCurrent: CurrentVitamin[];
  surveyCompleted: boolean;
  surveyCompletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vitamin {
  id: string;
  name: string;
  category: string;
  description: string;
  benefits: string[];
  dosage: string;
  contraindications?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VitaminRule {
  id: string;
  name: string;
  condition: Record<string, any>;
  vitamins: string[];
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VitaminRecommendation {
  vitamin: Vitamin;
  reasons: string[];
  priority: number;
  matchedRules: string[];
}
