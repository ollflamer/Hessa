import crypto from 'crypto';

export const generateId = (): string => {
  return crypto.randomUUID();
};

export const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export const generateToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};
