import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  PayloadTooLargeException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { storageConfig } from '../../../config/storage.config';
import { isUniqueViolation } from '../../../database/postgres-error';
import { CarImageStorageClient } from '../clients/car-image-storage.client';
import type { CarColor } from '../entities/car-color.const';
import type { CarImageEntity } from '../entities/car-image.entity';
import {
  CAR_PLATE_UNIQUE_CONSTRAINT,
  type CarEntity,
} from '../entities/car.entity';
import type { Province } from '../entities/province.const';
import { CarImageRepository } from '../repositories/car-image.repository';
import {
  CarRepository,
  type CarPageQuery,
} from '../repositories/car.repository';

export type CarInput = {
  registrationNumber: string;
  province: Province;
  brand: string;
  model: string;
  year?: number | null;
  color?: CarColor | null;
  notes?: string | null;
};
// Omitted = unchanged; null clears a nullable field (§5.5).
export type CarPatch = Partial<CarInput>;
export type ListCarsInput = CarPageQuery;
export type UploadedImage = { buffer: Buffer; size: number };

export type CarImageView = { id: string; url: string; createdAt: Date };
type CarFields = Omit<CarEntity, 'images'>;
export type CarDetails = CarFields & { images: CarImageView[] };
export type CarSummary = CarFields & { coverImage: CarImageView | null };
export type CarPage = {
  items: CarSummary[];
  total: number;
  page: number;
  limit: number;
};

type ImageType = { extension: string; contentType: string };

// Detect the type from the file's first bytes; the client-sent mimetype is not trusted (§10).
function detectImageType(buffer: Buffer): ImageType | null {
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
    return { extension: 'jpg', contentType: 'image/jpeg' };
  }
  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (buffer.subarray(0, 8).equals(Buffer.from(pngSignature))) {
    return { extension: 'png', contentType: 'image/png' };
  }
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { extension: 'webp', contentType: 'image/webp' };
  }
  return null;
}

function carNotFound(): NotFoundException {
  return new NotFoundException({
    code: 'CAR_NOT_FOUND',
    message: 'Car not found',
  });
}

function plateExists(): ConflictException {
  return new ConflictException({
    code: 'CAR_PLATE_EXISTS',
    message: 'A car with this registration number and province already exists',
    fieldErrors: {
      registrationNumber: [
        {
          code: 'CAR_PLATE_EXISTS',
          message: 'registrationNumber already exists in this province',
        },
      ],
    },
  });
}

@Injectable()
export class CarsService {
  private readonly logger = new Logger(CarsService.name);

  constructor(
    private readonly carRepository: CarRepository,
    private readonly carImageRepository: CarImageRepository,
    private readonly storage: CarImageStorageClient,
    @Inject(storageConfig.KEY)
    private readonly config: ConfigType<typeof storageConfig>,
  ) {}

  async listCars(input: ListCarsInput): Promise<CarPage> {
    const { items, total } = await this.carRepository.findPage(input);
    const covers = await this.carImageRepository.findCoversByCarIds(
      items.map((car) => car.id),
    );
    const coverByCarId = new Map(covers.map((image) => [image.carId, image]));

    return {
      // List queries do not load images; only the cover is added.
      items: items.map((car) => {
        const cover = coverByCarId.get(car.id);
        return { ...car, coverImage: cover ? this.toImageView(cover) : null };
      }),
      total,
      page: input.page,
      limit: input.limit,
    };
  }

  listBrands(): Promise<string[]> {
    return this.carRepository.findBrands();
  }

  async getCar(id: string): Promise<CarDetails> {
    const car = await this.carRepository.findById(id);
    if (!car) throw carNotFound();
    return this.toDetails(car);
  }

  async createCar(input: CarInput): Promise<CarDetails> {
    try {
      const car = await this.carRepository.insert({
        ...input,
        year: input.year ?? null,
        color: input.color ?? null,
        notes: input.notes ?? null,
      });
      return this.toDetails(car);
    } catch (error) {
      // No pre-check: the DB constraint decides, so two requests cannot race (§9.4).
      if (isUniqueViolation(error, CAR_PLATE_UNIQUE_CONSTRAINT)) {
        throw plateExists();
      }
      throw error;
    }
  }

  async updateCar(id: string, patch: CarPatch): Promise<CarDetails> {
    const car = await this.carRepository.findById(id);
    if (!car) throw carNotFound();
    // DTO instances carry every declared key; only keys that were sent are changes.
    const changes = Object.fromEntries(
      Object.entries(patch).filter(([, value]) => value !== undefined),
    ) as CarPatch;
    if (Object.keys(changes).length === 0) return this.toDetails(car);

    try {
      await this.carRepository.update(id, changes);
    } catch (error) {
      if (isUniqueViolation(error, CAR_PLATE_UNIQUE_CONSTRAINT)) {
        throw plateExists();
      }
      throw error;
    }
    return this.getCar(id);
  }

  async deleteCar(id: string): Promise<void> {
    const car = await this.carRepository.findById(id);
    if (!car) throw carNotFound();

    // Rows go first (images cascade); MinIO afterwards and never fails the request (§10).
    await this.carRepository.delete(id);
    await this.deleteObjects(
      (car.images ?? []).map((image) => image.objectKey),
    );
  }

  async addImages(
    carId: string,
    files: UploadedImage[],
  ): Promise<CarImageView[]> {
    if (files.length === 0) {
      throw new UnprocessableEntityException({
        code: 'VALIDATION_FAILED',
        message: 'The request contains invalid fields',
        fieldErrors: {
          files: [{ code: 'REQUIRED', message: 'files is required' }],
        },
      });
    }
    const car = await this.carRepository.findById(carId);
    if (!car) throw carNotFound();

    const existing = await this.carImageRepository.countByCarId(carId);
    if (existing + files.length > this.config.carImagesMax) {
      throw new UnprocessableEntityException({
        code: 'CAR_IMAGE_LIMIT_REACHED',
        message: `A car can have at most ${this.config.carImagesMax} images`,
      });
    }

    const uploads = files.map((file) => {
      if (file.size > this.config.imageMaxBytes) {
        throw new PayloadTooLargeException({
          code: 'FILE_TOO_LARGE',
          message: `Each image must be at most ${this.config.imageMaxBytes} bytes`,
        });
      }
      const type = detectImageType(file.buffer);
      if (!type) {
        throw new UnprocessableEntityException({
          code: 'UNSUPPORTED_FILE_TYPE',
          message: 'Only JPEG, PNG and WebP images are allowed',
        });
      }
      // Keys are generated on the server, never from the uploaded file name (§10).
      const key = `cars/${carId}/${randomUUID()}.${type.extension}`;
      return { key, file, type };
    });

    const uploadedKeys: string[] = [];
    try {
      for (const { key, file, type } of uploads) {
        await this.storage.put(key, file.buffer, type.contentType);
        uploadedKeys.push(key);
      }
      const images = await this.carImageRepository.insertMany(
        uploadedKeys.map((objectKey) => ({ carId, objectKey })),
      );
      return images.map((image) => this.toImageView(image));
    } catch (error) {
      // Do not leave orphan objects behind when the upload or the insert fails.
      await this.deleteObjects(uploadedKeys);
      throw error;
    }
  }

  async deleteImage(carId: string, imageId: string): Promise<void> {
    const image = await this.carImageRepository.findOneForCar(carId, imageId);
    if (!image) {
      throw new NotFoundException({
        code: 'CAR_IMAGE_NOT_FOUND',
        message: 'Car image not found',
      });
    }
    await this.carImageRepository.delete(image.id);
    await this.deleteObjects([image.objectKey]);
  }

  private async deleteObjects(keys: string[]): Promise<void> {
    for (const key of keys) {
      try {
        await this.storage.delete(key);
      } catch (error) {
        this.logger.error(
          `Failed to delete image object ${key}`,
          (error as Error).stack,
        );
      }
    }
  }

  private toDetails({ images, ...car }: CarEntity): CarDetails {
    return {
      ...car,
      images: (images ?? []).map((image) => this.toImageView(image)),
    };
  }

  private toImageView(image: CarImageEntity): CarImageView {
    return {
      id: image.id,
      url: this.storage.publicUrl(image.objectKey),
      createdAt: image.createdAt,
    };
  }
}
