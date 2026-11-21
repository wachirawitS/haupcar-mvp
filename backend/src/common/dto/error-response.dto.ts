import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type FieldError = { code: string; message: string };
export type FieldErrors = Record<string, FieldError[]>;

export type ErrorBody = {
  statusCode: number;
  code: string;
  message: string;
  fieldErrors?: FieldErrors;
};

// Shared error schema for Swagger (§7.1, §13).
export class ErrorResponseDto {
  @ApiProperty({ example: 422 })
  statusCode!: number;

  @ApiProperty({ example: 'VALIDATION_FAILED' })
  code!: string;

  @ApiProperty({ example: 'The request contains invalid fields' })
  message!: string;

  @ApiPropertyOptional({
    example: {
      registrationNumber: [
        { code: 'REQUIRED', message: 'registrationNumber is required' },
      ],
    },
  })
  fieldErrors?: FieldErrors;
}
