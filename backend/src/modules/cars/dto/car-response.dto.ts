import { ApiProperty } from '@nestjs/swagger';
import { CAR_COLORS, type CarColor } from '../entities/car-color.const';
import { PROVINCES, type Province } from '../entities/province.const';
import type { CarDetails } from '../services/cars.service';
import { CarImageResponseDto } from './car-image-response.dto';

// Every exposed field is listed, so a new column never leaks by accident (§5.4).
export class CarResponseDto {
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

  @ApiProperty({ example: null, type: String, nullable: true })
  notes!: string | null;

  @ApiProperty({
    type: [CarImageResponseDto],
    description: 'Oldest first; the first one is the cover',
  })
  images!: CarImageResponseDto[];

  @ApiProperty({ example: '2026-11-21T07:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-11-21T07:00:00.000Z' })
  updatedAt!: string;

  static fromDetails(car: CarDetails): CarResponseDto {
    const dto = new CarResponseDto();
    dto.id = car.id;
    dto.registrationNumber = car.registrationNumber;
    dto.province = car.province;
    dto.brand = car.brand;
    dto.model = car.model;
    dto.year = car.year;
    dto.color = car.color;
    dto.notes = car.notes;
    dto.images = car.images.map((image) => CarImageResponseDto.fromView(image));
    dto.createdAt = car.createdAt.toISOString();
    dto.updatedAt = car.updatedAt.toISOString();
    return dto;
  }
}
