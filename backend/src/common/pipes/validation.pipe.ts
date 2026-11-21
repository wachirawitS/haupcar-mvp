import {
  HttpStatus,
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import type { FieldErrors } from '../dto/error-response.dto';

// class-validator constraint name → stable error code (§7.1).
const CONSTRAINT_CODES: Record<string, string> = {
  isNotEmpty: 'REQUIRED',
  isDefined: 'REQUIRED',
  maxLength: 'TOO_LONG',
  minLength: 'TOO_SHORT',
  whitelistValidation: 'UNKNOWN_FIELD',
  matches: 'INVALID_FORMAT',
  isIn: 'INVALID_VALUE',
};

function toCode(constraint: string): string {
  return (
    CONSTRAINT_CODES[constraint] ??
    constraint.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase()
  );
}

function collectFieldErrors(
  errors: ValidationError[],
  parentPath = '',
  result: FieldErrors = {},
): FieldErrors {
  for (const error of errors) {
    const path = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    const constraints = Object.entries(error.constraints ?? {});
    if (constraints.length > 0) {
      result[path] = constraints.map(([name, message]) => ({
        code: toCode(name),
        message,
      }));
    }
    if (error.children && error.children.length > 0) {
      collectFieldErrors(error.children, path, result);
    }
  }
  return result;
}

// The one global ValidationPipe (§5.1). Invalid input → 422 VALIDATION_FAILED.
export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    exceptionFactory: (errors) =>
      new UnprocessableEntityException({
        code: 'VALIDATION_FAILED',
        message: 'The request contains invalid fields',
        fieldErrors: collectFieldErrors(errors),
      }),
  });
}
