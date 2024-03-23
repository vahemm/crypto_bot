import { DataSource } from 'typeorm';
import { DatabaseConfig } from './database.config';
import * as dotenv from 'dotenv';

dotenv.config();

export default new DataSource(DatabaseConfig());
