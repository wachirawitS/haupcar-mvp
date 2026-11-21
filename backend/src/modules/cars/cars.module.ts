import { Module } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { storageConfig } from '../../config/storage.config';
import { ShareLinksModule } from '../share-links/share-links.module';
import { CarImageStorageClient } from './clients/car-image-storage.client';
import { CarImageController } from './controllers/car-image.controller';
import { CarController } from './controllers/car.controller';
import { SharedCarController } from './controllers/shared-car.controller';
import { CarImageEntity } from './entities/car-image.entity';
import { CarEntity } from './entities/car.entity';
import { CarImageRepository } from './repositories/car-image.repository';
import { CarRepository } from './repositories/car.repository';
import { CarsService } from './services/cars.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CarEntity, CarImageEntity]),
    // Uploads stay in memory (nothing on the container disk), limits from config (§10).
    MulterModule.registerAsync({
      inject: [storageConfig.KEY],
      useFactory: (config: ConfigType<typeof storageConfig>) => ({
        limits: { fileSize: config.imageMaxBytes, files: config.carImagesMax },
      }),
    }),
    ShareLinksModule,
  ],
  controllers: [CarController, CarImageController, SharedCarController],
  providers: [
    CarsService,
    CarRepository,
    CarImageRepository,
    CarImageStorageClient,
  ],
})
export class CarsModule {}
