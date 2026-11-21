import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  CAR_SORT_FIELDS,
  type CarSortField,
  type SortOrder,
} from '../repositories/car.repository';
import { BRAND_MAX_LENGTH } from './car-field.rules';

const SORT_ORDERS = ['asc', 'desc'] as const;

// Blank text filters mean "no filter".
const blankToUndefined = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

// Invalid values fail with 422; they are not silently corrected (§4.5).
export class ListCarsQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({
    description:
      'Matches registration number (spaces ignored), brand or model; case-insensitive',
    maxLength: 100,
  })
  @Transform(blankToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    description: 'Exact brand, case-insensitive',
    maxLength: BRAND_MAX_LENGTH,
  })
  @Transform(blankToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(BRAND_MAX_LENGTH)
  brand?: string;

  @ApiPropertyOptional({ enum: CAR_SORT_FIELDS, default: 'createdAt' })
  @IsIn(CAR_SORT_FIELDS)
  sort: CarSortField = 'createdAt';

  @ApiPropertyOptional({ enum: SORT_ORDERS, default: 'desc' })
  @IsIn(SORT_ORDERS)
  order: SortOrder = 'desc';
}
