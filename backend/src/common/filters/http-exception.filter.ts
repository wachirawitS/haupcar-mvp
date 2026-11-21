import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import type { ErrorBody, FieldErrors } from '../dto/error-response.dto';

const DEFAULT_CODES: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'FILE_TOO_LARGE',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDATION_FAILED',
};

// The one error shape for every response (§7.1).
// Services throw Nest exceptions with { code, message, fieldErrors? }.
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const body = this.toErrorBody(exception);

    if (body.statusCode >= 500) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(body.message, stack);
    } else {
      this.logger.warn(`${body.statusCode} ${body.code}`);
    }

    response.status(body.statusCode).json(body);
  }

  private toErrorBody(exception: unknown): ErrorBody {
    if (!(exception instanceof HttpException)) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong',
      };
    }

    const statusCode = exception.getStatus();
    const payload = exception.getResponse();
    const fallbackCode = DEFAULT_CODES[statusCode] ?? 'HTTP_ERROR';

    if (typeof payload !== 'object' || payload === null) {
      return { statusCode, code: fallbackCode, message: exception.message };
    }

    const { code, message, fieldErrors } = payload as {
      code?: unknown;
      message?: unknown;
      fieldErrors?: unknown;
    };
    const body: ErrorBody = {
      statusCode,
      code: typeof code === 'string' ? code : fallbackCode,
      message: typeof message === 'string' ? message : exception.message,
    };
    if (fieldErrors !== undefined) {
      body.fieldErrors = fieldErrors as FieldErrors;
    }
    return body;
  }
}
