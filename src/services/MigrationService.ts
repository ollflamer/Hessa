import fs from 'fs';
import path from 'path';
import { databaseService } from './DatabaseService';
import { BaseService } from './BaseService';

export class MigrationService extends BaseService {
  private migrationsPath = path.join(__dirname, '../migrations');

  async createMigrationsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    await databaseService.query(query);
    this.log('Таблица миграций создана');
  }

  async getExecutedMigrations(): Promise<string[]> {
    const result = await databaseService.query<{filename: string}>(
      'SELECT filename FROM migrations ORDER BY id'
    );
    return result.map(row => row.filename);
  }

  async getMigrationFiles(): Promise<string[]> {
    if (!fs.existsSync(this.migrationsPath)) {
      this.log('Папка миграций не найдена');
      return [];
    }

    return fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort();
  }

  async executeMigration(filename: string): Promise<void> {
    const filePath = path.join(this.migrationsPath, filename);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    const client = await databaseService.getClient();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'INSERT INTO migrations (filename) VALUES ($1)',
        [filename]
      );
      await client.query('COMMIT');
      this.log(`Миграция выполнена: ${filename}`);
    } catch (error) {
      await client.query('ROLLBACK');
      this.logError(`Ошибка выполнения миграции ${filename}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  async runMigrations(): Promise<void> {
    await this.executeWithLogging('запуск миграций', async () => {
      await this.createMigrationsTable();
      
      const executedMigrations = await this.getExecutedMigrations();
      const migrationFiles = await this.getMigrationFiles();
      
      const pendingMigrations = migrationFiles.filter(
        file => !executedMigrations.includes(file)
      );

      if (pendingMigrations.length === 0) {
        this.log('Нет новых миграций для выполнения');
        return;
      }

      this.log(`Найдено ${pendingMigrations.length} новых миграций`);
      
      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }
      
      this.log('Все миграции выполнены успешно');
    });
  }
}

export const migrationService = new MigrationService();
