import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { databaseService } from './DatabaseService';
import { BaseService } from './BaseService';
import { User } from '../models/User';
import { appConfig } from '../config/app';

interface CreateUserData {
  email: string;
  name: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

export class UserService extends BaseService {
  async createUser(userData: CreateUserData): Promise<User> {
    return this.executeWithLogging('создание пользователя', async () => {
      const { email, name, password } = userData;
      
      const existingUser = await this.findByEmail(email);
      if (existingUser) {
        throw new Error('Пользователь с таким email уже существует');
      }

      const passwordHash = await bcrypt.hash(password, 12);
      
      const result = await databaseService.query<any>(
        `INSERT INTO users (email, name, password_hash) 
         VALUES ($1, $2, $3) 
         RETURNING id, email, name, created_at, updated_at`,
        [email, name, passwordHash]
      );

      return User.fromObject(result[0]);
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await databaseService.query<any>(
      'SELECT id, email, name, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );

    return result.length > 0 ? User.fromObject(result[0]) : null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await databaseService.query<any>(
      'SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    return result.length > 0 ? User.fromObject(result[0]) : null;
  }

  async login(loginData: LoginData): Promise<{ user: User; token: string }> {
    return this.executeWithLogging('авторизация пользователя', async () => {
      const { email, password } = loginData;
      
      const result = await databaseService.query<any>(
        'SELECT id, email, name, password_hash, created_at, updated_at FROM users WHERE email = $1',
        [email]
      );

      if (result.length === 0) {
        throw new Error('Неверный email или пароль');
      }

      const userData = result[0];
      const isPasswordValid = await bcrypt.compare(password, userData.password_hash);
      
      if (!isPasswordValid) {
        throw new Error('Неверный email или пароль');
      }

      const user = User.fromObject(userData);
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        appConfig.jwtSecret,
        { expiresIn: '24h' }
      );

      return { user, token };
    });
  }

  async getAllUsers(): Promise<User[]> {
    const result = await databaseService.query<any>(
      'SELECT id, email, name, created_at, updated_at FROM users ORDER BY created_at DESC'
    );

    return result.map(userData => User.fromObject(userData));
  }

  verifyToken(token: string): { userId: string; email: string } {
    try {
      return jwt.verify(token, appConfig.jwtSecret) as { userId: string; email: string };
    } catch (error) {
      throw new Error('Недействительный токен');
    }
  }
}

export const userService = new UserService();
