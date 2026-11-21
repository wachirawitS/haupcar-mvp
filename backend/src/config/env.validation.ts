import { plainToInstance, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
} from 'class-validator';

// Every env var the app reads. Required values have no default (§11).
class EnvironmentVariables {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT?: number;

  @IsUrl({ require_tld: false })
  CORS_ORIGIN!: string;

  @IsString()
  @IsNotEmpty()
  DB_HOST!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  DB_PORT?: number;

  @IsString()
  @IsNotEmpty()
  DB_USER!: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME!: string;

  @IsUrl({ require_tld: false })
  MINIO_ENDPOINT!: string;

  @IsUrl({ require_tld: false })
  MINIO_PUBLIC_URL!: string;

  @IsString()
  @IsNotEmpty()
  MINIO_ACCESS_KEY!: string;

  @IsString()
  @IsNotEmpty()
  MINIO_SECRET_KEY!: string;

  @IsString()
  @IsNotEmpty()
  MINIO_BUCKET!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  CAR_IMAGES_MAX?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  IMAGE_MAX_BYTES?: number;

  @IsString()
  @IsNotEmpty()
  AUTH_USERNAME!: string;

  @IsString()
  @IsNotEmpty()
  AUTH_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsOptional()
  @IsString()
  JWT_EXPIRES_IN?: string;
}

// Used by ConfigModule: a missing or invalid value stops the app at startup.
export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const env = plainToInstance(EnvironmentVariables, config);
  const errors = validateSync(env, { skipMissingProperties: false });
  if (errors.length > 0) {
    const names = errors.map((error) => error.property).join(', ');
    throw new Error(`Invalid or missing environment variables: ${names}`);
  }
  return config;
}
