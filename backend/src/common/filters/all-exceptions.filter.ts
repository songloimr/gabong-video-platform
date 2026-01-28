import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  status_code: number;
  error: string;
  message: string | string[];
  timestamp: string;
  path: string;
  details?: Record<string, unknown>;
}

/**
 * Global exception filter that catches all exceptions and formats them consistently.
 * Handles HttpExceptions, validation errors, database errors, and unexpected exceptions.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);

    // Log the error (with full stack trace for non-HTTP exceptions)
    if (exception instanceof HttpException) {
      if (errorResponse.status_code >= 500) {
        this.logger.error(
          `${request.method} ${request.url} - ${errorResponse.status_code}: ${errorResponse.message}`,
          exception.stack,
        );
      } else {
        this.logger.warn(
          `${request.method} ${request.url} - ${errorResponse.status_code}: ${JSON.stringify(errorResponse.message)}`,
        );
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled error at ${request.method} ${request.url}: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error(
        `Unknown error at ${request.method} ${request.url}: ${JSON.stringify(exception)}`,
      );
    }

    response.status(errorResponse.status_code).json(errorResponse);
  }

  private buildErrorResponse(
    exception: unknown,
    request: Request,
  ): ErrorResponse {
    const timestamp = new Date().toISOString();
    const path = request.url;

    // Handle NestJS HttpException (including BadRequestException, NotFoundException, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      let message: string | string[];
      let details: Record<string, unknown> | undefined;

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, unknown>;

        // Handle validation errors from class-validator
        if (Array.isArray(responseObj.message)) {
          message = responseObj.message;
        } else if (typeof responseObj.message === 'string') {
          message = responseObj.message;
        } else {
          message = exception.message;
        }

        // Include additional details if present (for structured validation errors)
        if (responseObj.errors) {
          details = { validation_errors: responseObj.errors };
        }
      } else {
        message = exception.message;
      }

      return {
        status_code: status,
        error: this.getErrorName(status),
        message,
        timestamp,
        path,
        ...(details && { details }),
      };
    }

    // Handle unexpected errors
    if (exception instanceof Error) {
      const isProduction = process.env.NODE_ENV === 'production';

      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'InternalServerError',
        message: isProduction
          ? 'An unexpected error occurred'
          : exception.message,
        timestamp,
        path,
        ...(!isProduction && {
          details: {
            name: exception.name,
            stack: exception.stack?.split('\n').slice(0, 5),
          },
        }),
      };
    }

    // Handle unknown exceptions
    return {
      status_code: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'InternalServerError',
      message: 'An unexpected error occurred',
      timestamp,
      path,
    };
  }

  private getErrorName(status: number): string {
    const errorNames: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BadRequest',
      [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
      [HttpStatus.FORBIDDEN]: 'Forbidden',
      [HttpStatus.NOT_FOUND]: 'NotFound',
      [HttpStatus.METHOD_NOT_ALLOWED]: 'MethodNotAllowed',
      [HttpStatus.CONFLICT]: 'Conflict',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'UnprocessableEntity',
      [HttpStatus.TOO_MANY_REQUESTS]: 'TooManyRequests',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'InternalServerError',
      [HttpStatus.BAD_GATEWAY]: 'BadGateway',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'ServiceUnavailable',
    };

    return errorNames[status] || 'Error';
  }
}
