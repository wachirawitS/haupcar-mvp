import { ApiProperty } from '@nestjs/swagger';
import type { CarPage } from '../services/cars.service';
import { CarListItemResponseDto } from './car-list-item-response.dto';

class PageMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}

// List shape { data, meta } (§4.5).
export class CarPageResponseDto {
  @ApiProperty({ type: [CarListItemResponseDto] })
  data!: CarListItemResponseDto[];

  @ApiProperty({ type: PageMetaDto })
  meta!: PageMetaDto;

  static fromPage(page: CarPage): CarPageResponseDto {
    const dto = new CarPageResponseDto();
    dto.data = page.items.map((car) => CarListItemResponseDto.fromSummary(car));
    dto.meta = {
      page: page.page,
      limit: page.limit,
      total: page.total,
      totalPages: Math.ceil(page.total / page.limit),
    };
    return dto;
  }
}
