import {
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { QueryFailedError } from 'typeorm';
import type { storageConfig } from '../../../config/storage.config';
import type { CarImageStorageClient } from '../clients/car-image-storage.client';
import type { CarImageEntity } from '../entities/car-image.entity';
import type { CarEntity } from '../entities/car.entity';
import type { CarImageRepository } from '../repositories/car-image.repository';
import type { CarRepository } from '../repositories/car.repository';
import { CarsService, type CarInput } from './cars.service';

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]);

const input: CarInput = {
  registrationNumber: '1กข 1234',
  province: 'กรุงเทพมหานคร',
  brand: 'Toyota',
  model: 'Corolla',
};

function makeCar(images: Partial<CarImageEntity>[] = []): CarEntity {
  return {
    id: 'car-1',
    registrationNumber: '1กข 1234',
    province: 'กรุงเทพมหานคร',
    brand: 'Toyota',
    model: 'Corolla',
    year: null,
    color: null,
    notes: null,
    images: images as CarImageEntity[],
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };
}

function plateUniqueError(): QueryFailedError {
  return new QueryFailedError('INSERT', [], {
    code: '23505',
    constraint: 'uq_cars_registration_number_province',
  } as unknown as Error);
}

describe('CarsService', () => {
  const carRepository = {
    findById: jest.fn(),
    findPage: jest.fn(),
    findBrands: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const carImageRepository = {
    countByCarId: jest.fn(),
    findOneForCar: jest.fn(),
    findCoversByCarIds: jest.fn(),
    insertMany: jest.fn(),
    delete: jest.fn(),
  };
  const storage = {
    put: jest.fn(),
    delete: jest.fn(),
    publicUrl: (key: string) => `http://minio/car-images/${key}`,
  };
  const config = {
    carImagesMax: 10,
    imageMaxBytes: 1000,
  } as ConfigType<typeof storageConfig>;

  const service = new CarsService(
    carRepository as unknown as CarRepository,
    carImageRepository as unknown as CarImageRepository,
    storage as unknown as CarImageStorageClient,
    config,
  );

  beforeEach(() => jest.resetAllMocks());

  describe('createCar', () => {
    it('stores omitted optional fields as null', async () => {
      carRepository.insert.mockResolvedValue(makeCar());
      await service.createCar(input);
      expect(carRepository.insert).toHaveBeenCalledWith({
        ...input,
        year: null,
        color: null,
        notes: null,
      });
    });

    it('maps the plate unique constraint to 409 CAR_PLATE_EXISTS', async () => {
      carRepository.insert.mockRejectedValue(plateUniqueError());
      const error: unknown = await service
        .createCar(input)
        .catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ConflictException);
      expect((error as ConflictException).getResponse()).toMatchObject({
        code: 'CAR_PLATE_EXISTS',
        fieldErrors: { registrationNumber: expect.any(Array) as unknown },
      });
    });

    it('rethrows other database errors', async () => {
      carRepository.insert.mockRejectedValue(new Error('db down'));
      await expect(service.createCar(input)).rejects.toThrow('db down');
    });
  });

  describe('updateCar', () => {
    it('returns 404 CAR_NOT_FOUND for an unknown id', async () => {
      carRepository.findById.mockResolvedValue(null);
      await expect(
        service.updateCar('x', { brand: 'Honda' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('only sends the fields that were given, and keeps null to clear', async () => {
      carRepository.findById.mockResolvedValue(makeCar());
      await service.updateCar('car-1', {
        brand: 'Honda',
        notes: null,
        model: undefined,
      });
      expect(carRepository.update).toHaveBeenCalledWith('car-1', {
        brand: 'Honda',
        notes: null,
      });
    });

    it('does not write when nothing was given', async () => {
      carRepository.findById.mockResolvedValue(makeCar());
      await service.updateCar('car-1', {});
      expect(carRepository.update).not.toHaveBeenCalled();
    });

    it('maps a duplicate plate to 409', async () => {
      carRepository.findById.mockResolvedValue(makeCar());
      carRepository.update.mockRejectedValue(plateUniqueError());
      await expect(
        service.updateCar('car-1', { registrationNumber: '2กข 1' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('deleteCar', () => {
    it('deletes the row, then every image object', async () => {
      carRepository.findById.mockResolvedValue(
        makeCar([
          { objectKey: 'cars/car-1/a.jpg' },
          { objectKey: 'cars/car-1/b.png' },
        ]),
      );
      await service.deleteCar('car-1');
      expect(carRepository.delete).toHaveBeenCalledWith('car-1');
      expect(storage.delete).toHaveBeenCalledWith('cars/car-1/a.jpg');
      expect(storage.delete).toHaveBeenCalledWith('cars/car-1/b.png');
    });

    it('does not fail when MinIO cannot delete an object', async () => {
      carRepository.findById.mockResolvedValue(
        makeCar([{ objectKey: 'cars/car-1/a.jpg' }]),
      );
      storage.delete.mockRejectedValue(new Error('minio down'));
      await expect(service.deleteCar('car-1')).resolves.toBeUndefined();
    });
  });

  describe('addImages', () => {
    beforeEach(() => {
      carRepository.findById.mockResolvedValue(makeCar());
      carImageRepository.countByCarId.mockResolvedValue(0);
      carImageRepository.insertMany.mockImplementation(
        (rows: { carId: string; objectKey: string }[]) =>
          Promise.resolve(
            rows.map((row, i) => ({
              ...row,
              id: `img-${i}`,
              createdAt: new Date(),
            })),
          ),
      );
    });

    it('uploads with a server-generated key and returns public URLs', async () => {
      const images = await service.addImages('car-1', [
        { buffer: PNG, size: PNG.length },
        { buffer: JPEG, size: JPEG.length },
      ]);

      const [pngKey, , pngType] = storage.put.mock.calls[0] as [
        string,
        Buffer,
        string,
      ];
      expect(pngKey).toMatch(/^cars\/car-1\/[0-9a-f-]{36}\.png$/);
      expect(pngType).toBe('image/png');
      const [jpegKey] = storage.put.mock.calls[1] as [string];
      expect(jpegKey).toMatch(/\.jpg$/);
      expect(images[0]?.url).toBe(`http://minio/car-images/${pngKey}`);
    });

    it('rejects more than the per-car limit with CAR_IMAGE_LIMIT_REACHED', async () => {
      carImageRepository.countByCarId.mockResolvedValue(9);
      const error: unknown = await service
        .addImages('car-1', [
          { buffer: PNG, size: PNG.length },
          { buffer: PNG, size: PNG.length },
        ])
        .catch((e: unknown) => e);
      expect(
        (error as UnprocessableEntityException).getResponse(),
      ).toMatchObject({
        code: 'CAR_IMAGE_LIMIT_REACHED',
      });
      expect(storage.put).not.toHaveBeenCalled();
    });

    it('rejects a non-image by its bytes, whatever the client said', async () => {
      const error: unknown = await service
        .addImages('car-1', [{ buffer: Buffer.from('%PDF-1.7'), size: 8 }])
        .catch((e: unknown) => e);
      expect(
        (error as UnprocessableEntityException).getResponse(),
      ).toMatchObject({
        code: 'UNSUPPORTED_FILE_TYPE',
      });
    });

    it('requires at least one file', async () => {
      await expect(service.addImages('car-1', [])).rejects.toBeInstanceOf(
        UnprocessableEntityException,
      );
    });

    it('removes uploaded objects when saving the rows fails', async () => {
      carImageRepository.insertMany.mockRejectedValue(new Error('db down'));
      await expect(
        service.addImages('car-1', [{ buffer: PNG, size: PNG.length }]),
      ).rejects.toThrow('db down');
      const [uploadedKey] = storage.put.mock.calls[0] as [string];
      expect(storage.delete).toHaveBeenCalledWith(uploadedKey);
    });
  });

  describe('deleteImage', () => {
    it('returns 404 CAR_IMAGE_NOT_FOUND for an image of another car', async () => {
      carImageRepository.findOneForCar.mockResolvedValue(null);
      await expect(
        service.deleteImage('car-1', 'img-x'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('deletes the row and the object', async () => {
      carImageRepository.findOneForCar.mockResolvedValue({
        id: 'img-1',
        objectKey: 'cars/car-1/a.jpg',
      });
      await service.deleteImage('car-1', 'img-1');
      expect(carImageRepository.delete).toHaveBeenCalledWith('img-1');
      expect(storage.delete).toHaveBeenCalledWith('cars/car-1/a.jpg');
    });
  });

  describe('listCars', () => {
    it('adds the cover image to each car, or null', async () => {
      carRepository.findPage.mockResolvedValue({
        items: [makeCar(), { ...makeCar(), id: 'car-2' }],
        total: 2,
      });
      carImageRepository.findCoversByCarIds.mockResolvedValue([
        {
          id: 'img-1',
          carId: 'car-1',
          objectKey: 'k.jpg',
          createdAt: new Date(),
        },
      ]);

      const page = await service.listCars({
        page: 1,
        limit: 20,
        sort: 'createdAt',
        order: 'desc',
      });

      expect(page.items[0]?.coverImage?.url).toBe(
        'http://minio/car-images/k.jpg',
      );
      expect(page.items[1]?.coverImage).toBeNull();
    });
  });
});
