import { INestApplication, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { createValidationPipe } from '../src/common/pipes/validation.pipe';
import { CarImageStorageClient } from '../src/modules/cars/clients/car-image-storage.client';

// MinIO is replaced by an in-memory fake in e2e tests (§14.1).
export class FakeImageStorage {
  readonly objects = new Map<string, Buffer>();

  put(key: string, body: Buffer): Promise<void> {
    this.objects.set(key, body);
    return Promise.resolve();
  }

  delete(key: string): Promise<void> {
    this.objects.delete(key);
    return Promise.resolve();
  }

  publicUrl(key: string): string {
    return `http://minio.test/car-images/${key}`;
  }
}

// Same bootstrap as main.ts, on a real PostgreSQL test database.
// Point DB_* at a test database, never the dev one (§14.2).
export async function createTestApp(): Promise<{
  app: INestApplication<App>;
  storage: FakeImageStorage;
  dataSource: DataSource;
}> {
  const storage = new FakeImageStorage();
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(CarImageStorageClient)
    .useValue(storage)
    .compile();

  const app = moduleRef.createNestApplication<INestApplication<App>>();
  app.setGlobalPrefix('api', { exclude: ['health'] });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(createValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.init();

  const dataSource = app.get(DataSource);
  await dataSource.runMigrations();
  return { app, storage, dataSource };
}
