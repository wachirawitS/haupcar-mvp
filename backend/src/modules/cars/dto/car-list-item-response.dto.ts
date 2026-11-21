import { ApiProperty } from '@nestjs/swagger';
import { CAR_COLORS, type CarColor } from '../entities/car-color.const';
import { PROVINCES, type Province } from '../entities/province.const';
import type { CarSummary } from '../services/cars.service';
import { CarImageResponseDto } from './car-image-response.dto';

// A row in the car list: no notes, only the cover image.
export class CarListItemResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: '1กข 1234' })
  registrationNumber!: string;

  @ApiProperty({ example: 'กรุงเทพมหานคร', enum: PROVINCES })
  province!: Province;

  @ApiProperty({ example: 'Toyota' })
  brand!: string;

  @ApiProperty({ example: 'Corolla Altis' })
  model!: string;

  @ApiProperty({ example: 2022, type: Number, nullable: true })
  year!: number | null;

  @ApiProperty({ example: 'white', enum: CAR_COLORS, nullable: true })
  color!: CarColor | null;

  @ApiProperty({ type: CarImageResponseDto, nullable: true })
  coverImage!: CarImageResponseDto | null;

  @ApiProperty({ example: '2026-11-21T07:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-11-21T07:00:00.000Z' })
  updatedAt!: string;

  static fromSummary(car: CarSummary): CarListItemResponseDto {
    const dto = new CarListItemResponseDto();
    dto.id = car.id;
    dto.registrationNumber = car.registrationNumber;
    dto.province = car.province;
    dto.brand = car.brand;
    dto.model = car.model;
    dto.year = car.year;
    dto.color = car.color;
    dto.coverImage = car.coverImage
      ? CarImageResponseDto.fromView(car.coverImage)
      : null;
    dto.createdAt = car.createdAt.toISOString();
    dto.updatedAt = car.updatedAt.toISOString();
    return dto;
  }
}
