import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

// Middleware для express-validator
export const validationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg).join(', ');
    logger.warn('Validation failed:', {
      ip: req.ip,
      url: req.url,
      errors: errorMessages,
      body: req.body
    });
    return sendError(res, `Ошибка валидации: ${errorMessages}`, 400);
  }
  next();
};

export function validateDto<T extends object>(dtoClass: new () => T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToClass(dtoClass, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        const errorMessages = errors.map((error: ValidationError) => {
          return Object.values(error.constraints || {}).join(', ');
        }).join('; ');

        logger.warn('Validation failed:', {
          ip: req.ip,
          url: req.url,
          errors: errorMessages,
          body: req.body
        });

        return sendError(res, `Ошибка валидации: ${errorMessages}`, 400);
      }

      req.body = dto;
      next();
    } catch (error) {
      logger.error('Validation middleware error:', error);
      return sendError(res, 'Ошибка валидации данных', 500);
    }
  };
}

export const sqlInjectionValidator = (req: Request, res: Response, next: NextFunction) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /(--|\/\*|\*\/|xp_|sp_)/gi,
    /(\bOR\b.*\bLIKE\b|\bUNION\b.*\bSELECT\b)/gi
  ];

  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  const hasSqlInjection = checkValue(req.body) || checkValue(req.query) || checkValue(req.params);

  if (hasSqlInjection) {
    logger.warn('SQL injection attempt detected:', {
      ip: req.ip,
      url: req.url,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params
    });

    return sendError(res, 'Недопустимые символы в запросе', 400);
  }

  next();
};

export const requestSizeValidator = (maxSize: number = 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('content-length') || '0');
    
    if (contentLength > maxSize) {
      logger.warn('Request size exceeded:', {
        ip: req.ip,
        url: req.url,
        contentLength,
        maxSize
      });

      return sendError(res, 'Размер запроса превышает допустимый лимит', 413);
    }

    next();
  };
};
