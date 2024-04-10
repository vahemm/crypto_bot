import { DatabaseConfig } from './database.config';

const AppConfig = () => ({
  environment: process.env.NODE_ENVIRONMENT
    ? process.env.NODE_ENVIRONMENT
    : 'development',
  port: process.env.PORT || 3000,
  bybit_api_key: process.env.BYBIT_API_KEY,
  bybit_api_secret: process.env.BYBIT_API_SECRET,
  database: {
    ...DatabaseConfig(),
  },
});

export default AppConfig;
