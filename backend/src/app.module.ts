import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { appConfig } from './config/app.config';
import { authConfig } from './config/auth.config';
import { databaseConfig } from './config/database.config';
import { validateEnv } from './config/env.validation';
import { storageConfig } from './config/storage.config';
import { AuthModule } from './modules/auth/auth.module';
import { CarsModule } from './modules/cars/cars.module';
import { HealthModule } from './modules/health/health.module';
import { ShareLinksModule } from './modules/share-links/share-links.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, storageConfig, authConfig],
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (config: ConfigType<typeof databaseConfig>) => config,
    }),
    AuthModule,
    CarsModule,
    HealthModule,
    ShareLinksModule,
  ],
})
export class AppModule {}
