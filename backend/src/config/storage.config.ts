import { registerAs } from '@nestjs/config';

export const storageConfig = registerAs('storage', () => ({
  endpoint: process.env.MINIO_ENDPOINT ?? '',
  publicUrl: process.env.MINIO_PUBLIC_URL ?? '',
  accessKey: process.env.MINIO_ACCESS_KEY ?? '',
  secretKey: process.env.MINIO_SECRET_KEY ?? '',
  bucket: process.env.MINIO_BUCKET ?? '',
  carImagesMax: Number(process.env.CAR_IMAGES_MAX ?? 10),
  imageMaxBytes: Number(process.env.IMAGE_MAX_BYTES ?? 5 * 1024 * 1024),
}));
