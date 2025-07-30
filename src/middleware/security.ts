import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import xss from 'xss';
import hpp from 'hpp';
import compression from 'compression';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Helmet для базовой защиты заголовков
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "http://localhost:*"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Rate limiting - общий лимит
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000, 
  message: {
    success: false,
    error: 'Слишком много запросов с вашего IP. Попробуйте позже.',
    retryAfter: '15 минут'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Слишком много запросов с вашего IP. Попробуйте позже.',
      retryAfter: '15 минут'
    });
  }
});

// Rate limiting для авторизации (более строгий)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: {
    success: false,
    error: 'Слишком много попыток входа. Попробуйте через 15 минут.',
    retryAfter: '15 минут'
  },
  skipSuccessfulRequests: true,
  handler: (req: Request, res: Response) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}, email: ${req.body?.email}`);
    res.status(429).json({
      success: false,
      error: 'Слишком много попыток входа. Попробуйте через 15 минут.',
      retryAfter: '15 минут'
    });
  }
});

// Rate limiting для регистрации
export const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 3, 
  message: {
    success: false,
    error: 'Слишком много регистраций с вашего IP. Попробуйте через час.',
    retryAfter: '1 час'
  },
  handler: (req: Request, res: Response) => {
    logger.warn(`Register rate limit exceeded for IP: ${req.ip}, email: ${req.body?.email}`);
    res.status(429).json({
      success: false,
      error: 'Слишком много регистраций с вашего IP. Попробуйте через час.',
      retryAfter: '1 час'
    });
  }
});

// Защита от NoSQL/SQL инъекций
export const sanitizeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeObject = (obj: any, path = ''): any => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const fullPath = path ? `${path}.${key}` : key;
          
          if (key.includes('$') || key.includes('.') || key.startsWith('_')) {
            logger.warn(`Potential injection attempt detected from IP: ${req.ip}, key: ${fullPath}`);
            delete obj[key];
            continue;
          }
          
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            obj[key] = sanitizeObject(obj[key], fullPath);
          }
          
          if (typeof obj[key] === 'string') {
            const originalValue = obj[key];
            obj[key] = obj[key]
              .replace(/[\$\{\}]/g, '')
              .replace(/(union|select|insert|update|delete|drop|create|alter|exec|execute)/gi, '')
              .replace(/[';"\\]/g, '');
            
            if (originalValue !== obj[key]) {
              logger.warn(`Sanitized potentially dangerous content from IP: ${req.ip}, field: ${fullPath}`);
            }
          }
        }
      }
    }
    return obj;
  };
  
  if (req.body) {
    req.body = sanitizeObject(req.body, 'body');
  }
  if (req.params) {
    req.params = sanitizeObject(req.params, 'params');
  }
  
  if (req.query && typeof req.query === 'object') {
    for (const key in req.query) {
      if (req.query.hasOwnProperty(key)) {
        if (key.includes('$') || key.includes('.') || key.startsWith('_')) {
          logger.warn(`Potential injection attempt in query from IP: ${req.ip}, key: ${key}`);
          delete req.query[key];
          continue;
        }
        
        if (typeof req.query[key] === 'string') {
          const originalValue = req.query[key] as string;
          const sanitizedValue = originalValue
            .replace(/[\$\{\}]/g, '')
            .replace(/(union|select|insert|update|delete|drop|create|alter|exec|execute)/gi, '')
            .replace(/[';"\\]/g, '');
          
          if (originalValue !== sanitizedValue) {
            logger.warn(`Sanitized query parameter from IP: ${req.ip}, key: ${key}`);
            req.query[key] = sanitizedValue;
          }
        }
      }
    }
  }
  
  next();
};

// Защита от XSS
export const xssMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xss(req.query[key] as string);
      }
    }
  }
  
  next();
};

export const hppMiddleware = hpp({
  whitelist: ['sort', 'fields', 'page', 'limit']
});
export const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
});

export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /script/i,
    /javascript/i,
    /vbscript/i,
    /onload/i,
    /onerror/i,
    /eval\(/i,
    /union.*select/i,
    /drop.*table/i,
    /insert.*into/i,
    /delete.*from/i
  ];

  const userAgent = req.get('User-Agent') || '';
  const referer = req.get('Referer') || '';
  const requestBody = JSON.stringify(req.body);
  const queryString = JSON.stringify(req.query);

  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(userAgent) || 
    pattern.test(referer) || 
    pattern.test(requestBody) || 
    pattern.test(queryString)
  );

  if (isSuspicious) {
    logger.warn('Suspicious request detected:', {
      ip: req.ip,
      method: req.method,
      url: req.url,
      userAgent,
      referer,
      body: req.body,
      query: req.query
    });
  }

  next();
};
