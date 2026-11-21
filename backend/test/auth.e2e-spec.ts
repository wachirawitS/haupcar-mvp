import { INestApplication, VersioningType } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { createValidationPipe } from '../src/common/pipes/validation.pipe';
import { authConfig } from '../src/config/auth.config';

// Needs a real PostgreSQL (§14.1). Point DB_* at a test database, never the dev one.
describe('POST /api/v1/auth/login (e2e)', () => {
  let app: INestApplication<App>;
  let credentials: { username: string; password: string };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api', { exclude: ['health'] });
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(createValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    const config = app.get<ConfigType<typeof authConfig>>(authConfig.KEY);
    credentials = { username: config.username, password: config.password };
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 200 { accessToken, expiresIn } for the fixed credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send(credentials)
      .expect(200);

    expect(response.body).toEqual({
      accessToken: expect.any(String) as unknown,
      expiresIn: expect.any(Number) as unknown,
    });
  });

  it('returns 401 INVALID_CREDENTIALS for a wrong password', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username: credentials.username, password: 'wrong' })
      .expect(401);

    expect(response.body).toMatchObject({ code: 'INVALID_CREDENTIALS' });
  });

  it('returns 422 VALIDATION_FAILED with field errors for an empty body', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({})
      .expect(422);

    expect(response.body).toMatchObject({
      code: 'VALIDATION_FAILED',
      fieldErrors: {
        username: expect.any(Array) as unknown,
        password: expect.any(Array) as unknown,
      },
    });
  });

  it('keeps /health public', () => {
    return request(app.getHttpServer()).get('/health').expect(200);
  });
});
