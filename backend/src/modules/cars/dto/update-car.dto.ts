import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { CAR_COLORS, type CarColor } from '../entities/car-color.const';
import { PROVINCES, type Province } from '../entities/province.const';
import {
  BRAND_MAX_LENGTH,
  IsNotFutureCarYear,
  MIN_CAR_YEAR,
  MODEL_MAX_LENGTH,
  NOTES_MAX_LENGTH,
  normalizeNotes,
  normalizeRegistrationNumber,
  REGISTRATION_NUMBER_MAX_LENGTH,
  REGISTRATION_NUMBER_PATTERN,
  trimText,
} from './car-field.rules';

// Written out instead of PartialType(CreateCarDto): @IsOptional would also let
// `null` through on required fields. Here only year/color/notes accept null (§5.5).
const isPresent = (_dto: object, value: unknown) => value !== undefined;

export class UpdateCarDto {
  @ApiPropertyOptional({ example: '1กข 1234' })
  @Transform(({ value }) => normalizeRegistrationNumber(value))
  @ValidateIf(isPresent)
  @IsString()
  @IsNotEmpty()
  @MaxLength(REGISTRATION_NUMBER_MAX_LENGTH)
  @Matches(REGISTRATION_NUMBER_PATTERN)
  registrationNumber?: string;

  @ApiPropertyOptional({ example: 'กรุงเทพมหานคร', enum: PROVINCES })
  @ValidateIf(isPresent)
  @IsIn(PROVINCES)
  province?: Province;

  @ApiPropertyOptional({ example: 'Toyota', maxLength: BRAND_MAX_LENGTH })
  @Transform(({ value }) => trimText(value))
  @ValidateIf(isPresent)
  @IsString()
  @IsNotEmpty()
  @MaxLength(BRAND_MAX_LENGTH)
  brand?: string;

  @ApiPropertyOptional({
    example: 'Corolla Altis',
    maxLength: MODEL_MAX_LENGTH,
  })
  @Transform(({ value }) => trimText(value))
  @ValidateIf(isPresent)
  @IsString()
  @IsNotEmpty()
  @MaxLength(MODEL_MAX_LENGTH)
  model?: string;

  @ApiPropertyOptional({ example: 2022, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(MIN_CAR_YEAR)
  @IsNotFutureCarYear()
  year?: number | null;

  @ApiPropertyOptional({ example: 'white', enum: CAR_COLORS, nullable: true })
  @IsOptional()
  @IsIn(CAR_COLORS)
  color?: CarColor | null;

  @ApiPropertyOptional({ nullable: true, maxLength: NOTES_MAX_LENGTH })
  @Transform(({ value }) => normalizeNotes(value))
  @IsOptional()
  @IsString()
  @MaxLength(NOTES_MAX_LENGTH)
  notes?: string | null;
}
