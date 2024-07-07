import { DatabaseConfig } from './database.config';

const AppConfig = () => ({
  environment: process.env.NODE_ENVIRONMENT
    ? process.env.NODE_ENVIRONMENT
    : 'development',
  port: process.env.PORT || 3000,
  bybit_api_key: process.env.BYBIT_API_KEY,
  bybit_api_secret: process.env.BYBIT_API_SECRET,
  gate_api_key: process.env.GATE_API_KEY,
  gate_api_secret: process.env.GATE_API_SECRET,
  crypto_trading_tester_bot: process.env.CRYPTO_TRADING_TESTER_BOT,
  database: {
    ...DatabaseConfig(),
  },
});

export default AppConfig;
