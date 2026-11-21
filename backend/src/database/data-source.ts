import { DataSource } from 'typeorm';
import { databaseConfig } from '../config/database.config';

// Entry point for the TypeORM CLI only (migration:generate / run / revert).
// The Nest app builds its connection through TypeOrmModule in app.module.ts.
export const dataSource = new DataSource(databaseConfig());
