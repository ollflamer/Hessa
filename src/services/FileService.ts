import { BaseService } from './BaseService';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadedFile {
  originalName: string;
  fileName: string;
  filePath: string;
  url: string;
  size: number;
  mimetype: string;
}

export class FileService extends BaseService {
  private uploadsDir: string;
  private avatarsDir: string;
  private productsDir: string;

  constructor() {
    super();
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.avatarsDir = path.join(this.uploadsDir, 'avatars');
    this.productsDir = path.join(this.uploadsDir, 'products');
    
    this.ensureDirectoriesExist();
  }

  private ensureDirectoriesExist(): void {
    const directories = [this.uploadsDir, this.avatarsDir, this.productsDir];
    
    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async uploadAvatar(file: Express.Multer.File, userId: string): Promise<UploadedFile> {
    return this.executeWithLogging('загрузка аватарки', async () => {
      const fileExtension = path.extname(file.originalname);
      const fileName = `${userId}_${Date.now()}${fileExtension}`;
      const filePath = path.join(this.avatarsDir, fileName);
      const url = `/uploads/avatars/${fileName}`;

      await fs.promises.writeFile(filePath, file.buffer);

      return {
        originalName: file.originalname,
        fileName,
        filePath,
        url,
        size: file.size,
        mimetype: file.mimetype
      };
    });
  }

  async uploadProductImage(file: Express.Multer.File, productId?: string): Promise<UploadedFile> {
    return this.executeWithLogging('загрузка изображения продукта', async () => {
      const fileExtension = path.extname(file.originalname);
      const fileName = `${productId || uuidv4()}_${Date.now()}${fileExtension}`;
      const filePath = path.join(this.productsDir, fileName);
      const url = `/uploads/products/${fileName}`;

      await fs.promises.writeFile(filePath, file.buffer);

      return {
        originalName: file.originalname,
        fileName,
        filePath,
        url,
        size: file.size,
        mimetype: file.mimetype
      };
    });
  }

  async deleteFile(filePath: string): Promise<void> {
    return this.executeWithLogging('удаление файла', async () => {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    });
  }

  async deleteFileByUrl(url: string): Promise<void> {
    return this.executeWithLogging('удаление файла по URL', async () => {
      const relativePath = url.replace('/uploads/', '');
      const filePath = path.join(this.uploadsDir, relativePath);
      
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    });
  }

  getFileStats(filePath: string): Promise<fs.Stats | null> {
    return this.executeWithLogging('получение информации о файле', async () => {
      try {
        return await fs.promises.stat(filePath);
      } catch (error) {
        return null;
      }
    });
  }

  validateImageFile(file: Express.Multer.File, maxSize: number = 5 * 1024 * 1024): void {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Разрешены только изображения JPEG, PNG, WebP');
    }
    
    if (file.size > maxSize) {
      throw new Error(`Размер файла не должен превышать ${Math.round(maxSize / 1024 / 1024)}MB`);
    }
  }

  generateUniqueFileName(originalName: string, prefix?: string): string {
    const fileExtension = path.extname(originalName);
    const baseName = path.basename(originalName, fileExtension);
    const timestamp = Date.now();
    const uuid = uuidv4().substring(0, 8);
    
    return `${prefix ? prefix + '_' : ''}${baseName}_${timestamp}_${uuid}${fileExtension}`;
  }
}
