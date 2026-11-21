import { ApiProperty } from '@nestjs/swagger';
import type { CarImageView } from '../services/cars.service';

export class CarImageResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({
    example: 'http://localhost:9000/car-images/cars/<carId>/<uuid>.jpg',
    description: 'Public MinIO URL',
  })
  url!: string;

  @ApiProperty({ example: '2026-11-21T07:00:00.000Z' })
  createdAt!: string;

  static fromView(image: CarImageView): CarImageResponseDto {
    const dto = new CarImageResponseDto();
    dto.id = image.id;
    dto.url = image.url;
    dto.createdAt = image.createdAt.toISOString();
    return dto;
  }
}
