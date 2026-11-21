import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreateCarDto {
  @ApiProperty({
    example: '1กข 1234',
    description:
      'Thai plate: optional 1–2 digits + 1–3 Thai letters + 1–4 digits. Spaces/hyphens are normalised to "1กข 1234".',
  })
  @Transform(({ value }) => normalizeRegistrationNumber(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(REGISTRATION_NUMBER_MAX_LENGTH)
  @Matches(REGISTRATION_NUMBER_PATTERN)
  registrationNumber!: string;

  @ApiProperty({ example: 'กรุงเทพมหานคร', enum: PROVINCES })
  @IsIn(PROVINCES)
  province!: Province;

  @ApiProperty({ example: 'Toyota', maxLength: BRAND_MAX_LENGTH })
  @Transform(({ value }) => trimText(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(BRAND_MAX_LENGTH)
  brand!: string;

  @ApiProperty({ example: 'Corolla Altis', maxLength: MODEL_MAX_LENGTH })
  @Transform(({ value }) => trimText(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(MODEL_MAX_LENGTH)
  model!: string;

  @ApiPropertyOptional({
    example: 2022,
    nullable: true,
    minimum: MIN_CAR_YEAR,
    description: 'From 1950 to next year',
  })
  @IsOptional()
  @IsInt()
  @Min(MIN_CAR_YEAR)
  @IsNotFutureCarYear()
  year?: number | null;

  @ApiPropertyOptional({ example: 'white', enum: CAR_COLORS, nullable: true })
  @IsOptional()
  @IsIn(CAR_COLORS)
  color?: CarColor | null;

  @ApiPropertyOptional({
    example: 'Company car for the sales team',
    nullable: true,
    maxLength: NOTES_MAX_LENGTH,
    description: 'Empty text is stored as null',
  })
  @Transform(({ value }) => normalizeNotes(value))
  @IsOptional()
  @IsString()
  @MaxLength(NOTES_MAX_LENGTH)
  notes?: string | null;
}
