import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ALL_ENTITIES } from './entities';

loadEnv();

// DataSource usado pelo CLI do TypeORM (migrations) e como referência de config.
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ALL_ENTITIES,
  migrations: ['src/database/migrations/*.ts'],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
  logging: false,
});
