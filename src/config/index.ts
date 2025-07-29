import { appConfig } from './app';
import { dbConfig } from './database';

export const config = {
  app: appConfig,
  database: dbConfig
};

export * from './app';
export * from './database';
