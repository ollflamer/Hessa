export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'hessa_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password'
};
