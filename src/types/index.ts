export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'moderator';
  createdAt: Date;
  updatedAt: Date;
}

import { Request } from 'express';

export interface RequestWithUser extends Request {
  user?: User;
}
