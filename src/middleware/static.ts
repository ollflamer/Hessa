import express, { Request, Response, NextFunction } from 'express';
import * as path from 'path';
import * as fs from 'fs';

export const staticFiles = express.static(path.join(process.cwd(), 'uploads'), {
  maxAge: '1d',
  etag: true,
  lastModified: true,
  setHeaders: (res: Response, filePath: string) => {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        res.setHeader('Content-Type', 'image/jpeg');
        break;
      case '.png':
        res.setHeader('Content-Type', 'image/png');
        break;
      case '.webp':
        res.setHeader('Content-Type', 'image/webp');
        break;
      default:
        res.setHeader('Content-Type', 'application/octet-stream');
    }
    
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
});
export const checkFileExists = (req: Request, res: Response, next: NextFunction) => {
  const filePath = path.join(process.cwd(), 'uploads', req.path);
  
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({
        success: false,
        message: 'Файл не найден'
      });
    }
    next();
  });
};

export const logFileAccess = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] Доступ к файлу: ${req.path}`);
  next();
};
