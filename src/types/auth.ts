import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  isActive: boolean;
  referralCode?: string;
  pointsBalance?: number;
  referredByUserId?: string;
}

export interface RequestWithUser extends Request {
  user?: User;
}
