export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'moderator';
  avatarUrl?: string;
  dateOfBirth?: Date;
  city?: string;
  phone?: string;
  
  // Данные из опросника
  age?: number;
  gender?: 'male' | 'female';
  stressLevel?: 'none' | 'moderate' | 'high' | 'constant';
  physicalActivity?: 'none' | '1_2_week' | '3_5_week' | 'daily';
  dietQuality?: 'daily' | '3_4_week' | 'rare';
  dietaryRestrictions?: string[];
  healthConcerns?: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileDto {
  name?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  city?: string;
  phone?: string;
  age?: number;
  gender?: 'male' | 'female';
  stressLevel?: 'none' | 'moderate' | 'high' | 'constant';
  physicalActivity?: 'none' | '1_2_week' | '3_5_week' | 'daily';
  dietQuality?: 'daily' | '3_4_week' | 'rare';
  dietaryRestrictions?: string[];
  healthConcerns?: string[];
}

export class User {
  constructor(
    public id: string,
    public email: string,
    public name: string,
    public role: 'user' | 'admin' | 'moderator' = 'user',
    public avatarUrl?: string,
    public dateOfBirth?: Date,
    public city?: string,
    public phone?: string,
    public age?: number,
    public gender?: 'male' | 'female',
    public stressLevel?: 'none' | 'moderate' | 'high' | 'constant',
    public physicalActivity?: 'none' | '1_2_week' | '3_5_week' | 'daily',
    public dietQuality?: 'daily' | '3_4_week' | 'rare',
    public dietaryRestrictions?: string[],
    public healthConcerns?: string[],
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  static fromObject(obj: any): User {
    return new User(
      obj.id,
      obj.email,
      obj.name,
      obj.role || 'user',
      obj.avatar_url,
      obj.date_of_birth ? new Date(obj.date_of_birth) : undefined,
      obj.city,
      obj.phone,
      obj.age,
      obj.gender,
      obj.stress_level,
      obj.physical_activity,
      obj.diet_quality,
      obj.dietary_restrictions ? JSON.parse(obj.dietary_restrictions) : undefined,
      obj.health_concerns ? JSON.parse(obj.health_concerns) : undefined,
      obj.created_at ? new Date(obj.created_at) : new Date(),
      obj.updated_at ? new Date(obj.updated_at) : new Date()
    );
  }

  toObject(): UserProfile {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      avatarUrl: this.avatarUrl,
      dateOfBirth: this.dateOfBirth,
      city: this.city,
      phone: this.phone,
      age: this.age,
      gender: this.gender,
      stressLevel: this.stressLevel,
      physicalActivity: this.physicalActivity,
      dietQuality: this.dietQuality,
      dietaryRestrictions: this.dietaryRestrictions,
      healthConcerns: this.healthConcerns,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  updateProfile(data: UpdateProfileDto): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.avatarUrl !== undefined) this.avatarUrl = data.avatarUrl;
    if (data.dateOfBirth !== undefined) this.dateOfBirth = new Date(data.dateOfBirth);
    if (data.city !== undefined) this.city = data.city;
    if (data.phone !== undefined) this.phone = data.phone;
    if (data.age !== undefined) this.age = data.age;
    if (data.gender !== undefined) this.gender = data.gender;
    if (data.stressLevel !== undefined) this.stressLevel = data.stressLevel;
    if (data.physicalActivity !== undefined) this.physicalActivity = data.physicalActivity;
    if (data.dietQuality !== undefined) this.dietQuality = data.dietQuality;
    if (data.dietaryRestrictions !== undefined) this.dietaryRestrictions = data.dietaryRestrictions;
    if (data.healthConcerns !== undefined) this.healthConcerns = data.healthConcerns;
    
    this.updatedAt = new Date();
  }
}
