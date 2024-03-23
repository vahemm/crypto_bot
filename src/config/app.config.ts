import { DatabaseConfig } from './database.config';

const AppConfig = () => ({
  environment: process.env.NODE_ENVIRONMENT
    ? process.env.NODE_ENVIRONMENT
    : 'development',
  port: process.env.PORT || 3000,
  database: {
    ...DatabaseConfig(),
  },
});

export default AppConfig;
