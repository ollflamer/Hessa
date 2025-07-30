import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

interface AttemptRecord {
  count: number;
  firstAttempt: Date;
  lastAttempt: Date;
  blocked: boolean;
  blockUntil?: Date;
}

class BruteForceProtection {
  private attempts: Map<string, AttemptRecord> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  private readonly blockDurationMs: number;

  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000, blockDurationMs = 30 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.blockDurationMs = blockDurationMs;
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  private getKey(req: Request): string {
    const email = req.body?.email || 'unknown';
    return `${req.ip}:${email}`;
  }

  private cleanup(): void {
    const now = new Date();
    for (const [key, record] of this.attempts.entries()) {
      if (now.getTime() - record.lastAttempt.getTime() > 60 * 60 * 1000) {
        this.attempts.delete(key);
      }
    }
  }

  public recordFailedAttempt(req: Request): void {
    const key = this.getKey(req);
    const now = new Date();
    const record = this.attempts.get(key);

    if (!record) {
      this.attempts.set(key, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
        blocked: false
      });
    } else {
      if (now.getTime() - record.firstAttempt.getTime() > this.windowMs) {
        record.count = 1;
        record.firstAttempt = now;
        record.blocked = false;
        delete record.blockUntil;
      } else {
        record.count++;
      }

      record.lastAttempt = now;

      if (record.count >= this.maxAttempts) {
        record.blocked = true;
        record.blockUntil = new Date(now.getTime() + this.blockDurationMs);
        
        logger.warn('IP blocked due to brute force:', {
          ip: req.ip,
          email: req.body?.email,
          attempts: record.count,
          blockUntil: record.blockUntil
        });
      }

      this.attempts.set(key, record);
    }
  }

  public recordSuccessfulAttempt(req: Request): void {
    const key = this.getKey(req);
    this.attempts.delete(key);
  }

  public isBlocked(req: Request): boolean {
    const key = this.getKey(req);
    const record = this.attempts.get(key);

    if (!record || !record.blocked) {
      return false;
    }

    if (record.blockUntil && new Date() > record.blockUntil) {
      record.blocked = false;
      delete record.blockUntil;
      record.count = 0;
      this.attempts.set(key, record);
      return false;
    }

    return true;
  }

  public getRemainingTime(req: Request): number {
    const key = this.getKey(req);
    const record = this.attempts.get(key);

    if (!record || !record.blockUntil) {
      return 0;
    }

    return Math.max(0, record.blockUntil.getTime() - new Date().getTime());
  }

  public getAttemptCount(req: Request): number {
    const key = this.getKey(req);
    const record = this.attempts.get(key);
    return record?.count || 0;
  }
}

const bruteForceProtection = new BruteForceProtection();

export const bruteForceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (bruteForceProtection.isBlocked(req)) {
    const remainingTime = bruteForceProtection.getRemainingTime(req);
    const remainingMinutes = Math.ceil(remainingTime / (60 * 1000));

    logger.warn('Blocked request due to brute force:', {
      ip: req.ip,
      email: req.body?.email,
      remainingMinutes
    });

    return sendError(res, `Слишком много неудачных попыток входа. Попробуйте через ${remainingMinutes} минут.`, 429);
  }

  (req as any).bruteForce = {
    recordFailure: () => bruteForceProtection.recordFailedAttempt(req),
    recordSuccess: () => bruteForceProtection.recordSuccessfulAttempt(req),
    getAttemptCount: () => bruteForceProtection.getAttemptCount(req)
  };

  next();
};

export { bruteForceProtection };
