import type { INestApplication } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import request from 'supertest';
import type { App } from 'supertest/types';
import type { DataSource } from 'typeorm';
import { authConfig } from '../src/config/auth.config';
import { createTestApp, type FakeImageStorage } from './test-app';

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const BANGKOK = 'กรุงเทพมหานคร';
const MISSING_ID = '00000000-0000-4000-8000-000000000000';

type CarBody = {
  id: string;
  registrationNumber: string;
  year: number | null;
  color: string | null;
  notes: string | null;
  images: { id: string; url: string }[];
};

describe('Cars API (e2e)', () => {
  let app: INestApplication<App>;
  let storage: FakeImageStorage;
  let dataSource: DataSource;
  let token: string;

  const api = () => request(app.getHttpServer());
  const auth = () => ({ Authorization: `Bearer ${token}` });
  const createCar = (body: Record<string, unknown>) =>
    api().post('/api/v1/cars').set(auth()).send(body);

  beforeAll(async () => {
    ({ app, storage, dataSource } = await createTestApp());
    const config = app.get<ConfigType<typeof authConfig>>(authConfig.KEY);
    const login = await api()
      .post('/api/v1/auth/login')
      .send({ username: config.username, password: config.password });
    token = (login.body as { accessToken: string }).accessToken;
  });

  beforeEach(async () => {
    await dataSource.query('TRUNCATE cars, car_images, share_links CASCADE');
    storage.objects.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects car routes without a token (401 UNAUTHORIZED)', async () => {
    const response = await api().get('/api/v1/cars').expect(401);
    expect(response.body).toMatchObject({ code: 'UNAUTHORIZED' });
  });

  describe('create / read / update / delete', () => {
    it('creates a car, normalising the plate and nulling optional fields', async () => {
      const response = await createCar({
        registrationNumber: ' 1กข-1234 ',
        province: BANGKOK,
        brand: ' Toyota ',
        model: 'Corolla',
        notes: '   ',
      }).expect(201);

      expect(response.body).toMatchObject({
        registrationNumber: '1กข 1234',
        brand: 'Toyota',
        year: null,
        color: null,
        notes: null,
        images: [],
      });
    });

    it('rejects the same plate in the same province, however it is spaced (409)', async () => {
      const car = { province: BANGKOK, brand: 'Toyota', model: 'Yaris' };
      await createCar({ ...car, registrationNumber: '1กข 1234' }).expect(201);

      const duplicate = await createCar({
        ...car,
        registrationNumber: '1กข1234',
      }).expect(409);
      expect(duplicate.body).toMatchObject({ code: 'CAR_PLATE_EXISTS' });

      await createCar({
        ...car,
        province: 'เชียงใหม่',
        registrationNumber: '1กข1234',
      }).expect(201);
    });

    it('returns 422 with field errors for invalid fields', async () => {
      const response = await createCar({
        registrationNumber: 'AB 1234',
        province: 'Bangkok',
        brand: '',
        model: 'X',
        year: 1900,
        color: 'pink',
      }).expect(422);

      expect(
        Object.keys(
          (response.body as { fieldErrors: object }).fieldErrors,
        ).sort(),
      ).toEqual(['brand', 'color', 'province', 'registrationNumber', 'year']);
    });

    it('reads, patches (null clears, omitted keeps) and deletes', async () => {
      const created = await createCar({
        registrationNumber: 'กข 99',
        province: BANGKOK,
        brand: 'Honda',
        model: 'City',
        year: 2020,
        notes: 'spare key in drawer',
      }).expect(201);
      const { id } = created.body as CarBody;

      const patched = await api()
        .patch(`/api/v1/cars/${id}`)
        .set(auth())
        .send({ notes: null, color: 'red' })
        .expect(200);
      expect(patched.body).toMatchObject({
        year: 2020,
        color: 'red',
        notes: null,
      });

      await api()
        .patch(`/api/v1/cars/${id}`)
        .set(auth())
        .send({ brand: null })
        .expect(422);

      await api().get(`/api/v1/cars/${id}`).set(auth()).expect(200);
      await api().delete(`/api/v1/cars/${id}`).set(auth()).expect(204);

      const missing = await api()
        .get(`/api/v1/cars/${id}`)
        .set(auth())
        .expect(404);
      expect(missing.body).toMatchObject({ code: 'CAR_NOT_FOUND' });
    });
  });

  describe('list', () => {
    beforeEach(async () => {
      await createCar({
        registrationNumber: '1กข 1234',
        province: BANGKOK,
        brand: 'Toyota',
        model: 'Camry',
      });
      await createCar({
        registrationNumber: 'ขค 55',
        province: BANGKOK,
        brand: 'toyota',
        model: 'Vios',
      });
      await createCar({
        registrationNumber: '9ฮฮ 9',
        province: BANGKOK,
        brand: 'Honda',
        model: 'Civic',
      });
    });

    it('pages with { data, meta } and newest first by default', async () => {
      const response = await api()
        .get('/api/v1/cars?limit=2')
        .set(auth())
        .expect(200);
      expect(response.body).toMatchObject({
        meta: { page: 1, limit: 2, total: 3, totalPages: 2 },
      });
      const data = (response.body as { data: { model: string }[] }).data;
      expect(data.map((car) => car.model)).toEqual(['Civic', 'Vios']);
    });

    it('searches plate ignoring spaces, and brand/model', async () => {
      const byPlate = await api()
        .get('/api/v1/cars')
        .query({ search: '1กข1234' })
        .set(auth())
        .expect(200);
      expect((byPlate.body as { meta: { total: number } }).meta.total).toBe(1);

      const byModel = await api()
        .get('/api/v1/cars')
        .query({ search: 'civ' })
        .set(auth())
        .expect(200);
      expect((byModel.body as { meta: { total: number } }).meta.total).toBe(1);
    });

    it('filters by brand ignoring case and sorts by an allowlisted field', async () => {
      const response = await api()
        .get('/api/v1/cars')
        .query({ brand: 'TOYOTA', sort: 'model', order: 'asc' })
        .set(auth())
        .expect(200);
      const data = (response.body as { data: { model: string }[] }).data;
      expect(data.map((car) => car.model)).toEqual(['Camry', 'Vios']);
    });

    it('rejects unknown sort fields and out-of-range limits (422)', async () => {
      await api().get('/api/v1/cars?sort=id;drop').set(auth()).expect(422);
      await api().get('/api/v1/cars?limit=101').set(auth()).expect(422);
    });

    it('lists distinct brands ignoring case', async () => {
      const response = await api()
        .get('/api/v1/cars/brands')
        .set(auth())
        .expect(200);
      expect((response.body as string[]).map((b) => b.toLowerCase())).toEqual([
        'honda',
        'toyota',
      ]);
    });
  });

  describe('images', () => {
    let carId: string;

    beforeEach(async () => {
      const created = await createCar({
        registrationNumber: 'กข 1',
        province: BANGKOK,
        brand: 'Toyota',
        model: 'Yaris',
      });
      carId = (created.body as CarBody).id;
    });

    const upload = (count: number, file = PNG) => {
      const req = api().post(`/api/v1/cars/${carId}/images`).set(auth());
      for (let i = 0; i < count; i++) {
        req.attach('files', file, {
          filename: `photo-${i}.png`,
          contentType: 'image/png',
        });
      }
      return req;
    };

    it('uploads, shows the cover in the list, and deletes an image', async () => {
      const uploaded = await upload(2).expect(201);
      const images = uploaded.body as { id: string; url: string }[];
      expect(images).toHaveLength(2);
      expect(images[0]?.url).toMatch(
        /^http:\/\/minio\.test\/car-images\/cars\//,
      );
      expect(storage.objects.size).toBe(2);

      const list = await api().get('/api/v1/cars').set(auth()).expect(200);
      const [row] = (list.body as { data: { coverImage: { id: string } }[] })
        .data;
      expect(images.map((image) => image.id)).toContain(row?.coverImage.id);

      const imageId = images[0]?.id ?? '';
      await api()
        .delete(`/api/v1/cars/${carId}/images/${imageId}`)
        .set(auth())
        .expect(204);
      expect(storage.objects.size).toBe(1);
      await api()
        .delete(`/api/v1/cars/${carId}/images/${imageId}`)
        .set(auth())
        .expect(404);
    });

    it('rejects a non-image even when it claims to be a PNG (422)', async () => {
      const response = await upload(1, Buffer.from('not really a png')).expect(
        422,
      );
      expect(response.body).toMatchObject({ code: 'UNSUPPORTED_FILE_TYPE' });
    });

    it('stops at 10 images per car (422 CAR_IMAGE_LIMIT_REACHED)', async () => {
      await upload(8).expect(201);
      const response = await upload(3).expect(422);
      expect(response.body).toMatchObject({ code: 'CAR_IMAGE_LIMIT_REACHED' });
    });

    it('deleting the car also deletes its image objects', async () => {
      await upload(2).expect(201);
      await api().delete(`/api/v1/cars/${carId}`).set(auth()).expect(204);
      expect(storage.objects.size).toBe(0);
    });

    it('returns 404 for images of a missing car', async () => {
      carId = MISSING_ID;
      await upload(1).expect(404);
    });
  });

  describe('share link', () => {
    it('gives one stable link that opens a public read-only view until revoked', async () => {
      await createCar({
        registrationNumber: 'กข 7',
        province: BANGKOK,
        brand: 'Mazda',
        model: '2',
      });

      const first = await api()
        .post('/api/v1/share-link')
        .set(auth())
        .expect(200);
      const second = await api()
        .post('/api/v1/share-link')
        .set(auth())
        .expect(200);
      const shareToken = (first.body as { token: string }).token;
      expect((second.body as { token: string }).token).toBe(shareToken);

      const shared = await api()
        .get(`/api/v1/shared/${shareToken}/cars`)
        .expect(200);
      const [car] = (shared.body as { data: { id: string }[] }).data;
      await api()
        .get(`/api/v1/shared/${shareToken}/cars/${car?.id}`)
        .expect(200);
      await api().get(`/api/v1/shared/${shareToken}/cars/brands`).expect(200);

      await api().delete('/api/v1/share-link').set(auth()).expect(204);
      const revoked = await api()
        .get(`/api/v1/shared/${shareToken}/cars`)
        .expect(404);
      expect(revoked.body).toMatchObject({ code: 'SHARE_LINK_NOT_FOUND' });
    });

    it('needs login to create or revoke the link', async () => {
      await api().post('/api/v1/share-link').expect(401);
      await api().delete('/api/v1/share-link').expect(401);
    });

    it('rejects an unknown token (404)', async () => {
      await api().get('/api/v1/shared/not-a-token/cars').expect(404);
    });
  });
});
