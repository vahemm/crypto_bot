import { extname } from 'path';
import { DataSourceOptions } from 'typeorm';

const ext = extname(__filename);

export const DatabaseConfig = (): DataSourceOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5445,
  database: process.env.DB_NAME || '',
  username: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  synchronize: false,
  entities: [`**/*.entity${ext}`],
  migrations: [`db/migrations/*${ext}`],
});
