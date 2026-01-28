import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiError } from '../../types';

interface ExceptionResponseWithMessage {
  message: string | string[];
  statusCode?: number;
  error?: string;
}

function isExceptionResponseWithMessage(response: unknown): response is ExceptionResponseWithMessage {
  return typeof response === 'object' && response !== null && 'message' in response;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse: ApiError = {
      status_code: status,
      error: exception.name,
      message:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : isExceptionResponseWithMessage(exceptionResponse)
            ? exceptionResponse.message
            : 'An error occurred',
    };

    response.status(status).json(errorResponse);
  }
}
