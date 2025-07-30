export interface VitaminCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  size?: string;
  quantity: number;
  categoryId?: string; // Основная категория (для обратной совместимости)
  
  // Ограничения и противопоказания
  restrictions: ProductRestriction[];
  
  // Атрибуты для рекомендаций (новые)
  targetComplaints: ProductComplaint[]; // Какие проблемы решает
  targetGoals: ProductGoal[]; // Какие цели помогает достичь
  vitaminType: ProductVitaminType[]; // Тип витамина/добавки
  
  // Остальные поля
  benefits: string[]; // Описание пользы (текстовое)
  dosage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Связанные данные (для JOIN запросов)
  category?: VitaminCategory; // Основная категория
  categories?: ProductCategory[]; // Все категории товара
}

export interface RuleProduct {
  id: string;
  ruleId: string;
  productId: string;
  createdAt: Date;
}

export interface ProductCategory {
  id: string;
  productId: string;
  categoryId: string;
  isPrimary: boolean;
  createdAt: Date;
  
  // Связанные данные
  category?: VitaminCategory;
}

export interface ProductWithCategory extends Product {
  category: VitaminCategory;
}

export interface ProductRecommendation {
  product: Product;
  priority: number;
  matchedRules: string[];
  reason: string;
}

// Ограничения для товаров (противопоказания)
export enum ProductRestriction {
  PREGNANCY = 'pregnancy',
  LACTATION = 'lactation', 
  DIABETES = 'diabetes',
  HYPERTENSION = 'hypertension',
  KIDNEY_DISEASE = 'kidney_disease',
  LIVER_DISEASE = 'liver_disease',
  ALLERGIES = 'allergies',
  CHILDREN_UNDER_12 = 'children_under_12',
  BLOOD_THINNERS = 'blood_thinners',
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  LACTOSE_FREE = 'lactose_free',
  GLUTEN_FREE = 'gluten_free',
  NUT_FREE = 'nut_free',
  NONE = 'none'
}

// Проблемы, которые решает товар
export enum ProductComplaint {
  FATIGUE = 'fatigue',
  STRESS = 'stress', 
  SKIN_ISSUES = 'skin_issues',
  SLEEP_PROBLEMS = 'sleep_problems',
  DIGESTIVE_ISSUES = 'digestive_issues',
  LOW_IMMUNITY = 'low_immunity',
  JOINT_PAIN = 'joint_pain',
  MEMORY_ISSUES = 'memory_issues'
}

// Цели, которые помогает достичь товар
export enum ProductGoal {
  ENERGY = 'energy',
  IMMUNITY = 'immunity',
  SKIN_HEALTH = 'skin_health', 
  STRESS_RELIEF = 'stress_relief',
  BETTER_SLEEP = 'better_sleep',
  WEIGHT_MANAGEMENT = 'weight_management',
  MUSCLE_BUILDING = 'muscle_building',
  HEART_HEALTH = 'heart_health'
}

// Типы витаминов/добавок
export enum ProductVitaminType {
  VITAMIN_D = 'vitamin_d',
  MAGNESIUM = 'magnesium',
  B_COMPLEX = 'b_complex',
  OMEGA_3 = 'omega_3',
  ZINC = 'zinc',
  IRON = 'iron',
  CALCIUM = 'calcium',
  PROBIOTICS = 'probiotics',
  VITAMIN_C = 'vitamin_c',
  COENZYME_Q10 = 'coenzyme_q10',
  ASHWAGANDHA = 'ashwagandha',
  COLLAGEN = 'collagen',
  MULTIVITAMIN = 'multivitamin'
}

// Обратная совместимость с существующими типами
export type Restriction = ProductRestriction;
export type Complaint = ProductComplaint;
export type Goal = ProductGoal;
export type CurrentVitamin = ProductVitaminType;

export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  size?: string;
  quantity: number;
  categoryId?: string;
  
  // Ограничения и атрибуты
  restrictions?: ProductRestriction[];
  targetComplaints?: ProductComplaint[];
  targetGoals?: ProductGoal[];
  vitaminType?: ProductVitaminType[];
  
  benefits?: string[];
  dosage?: string;
  isActive?: boolean;
}

export interface UpdateProductDto {
  sku?: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  size?: string;
  quantity?: number;
  categoryId?: string;
  
  // Ограничения и атрибуты
  restrictions?: ProductRestriction[];
  targetComplaints?: ProductComplaint[];
  targetGoals?: ProductGoal[];
  vitaminType?: ProductVitaminType[];
  
  benefits?: string[];
  dosage?: string;
  isActive?: boolean;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}
