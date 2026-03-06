import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { StructuredLogger } from '../logging/structured-logger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: StructuredLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: typeof message === 'object' ? (message as any).message || message : message,
    };

    // Log the error using our structured logger
    this.logger.error(`Exception at ${request.method} ${request.url}`, {
      context: 'ExceptionFilter',
      statusCode: status,
      path: request.url,
      method: request.method,
      error: exception instanceof Error ? exception.message : String(exception),
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(status).json(errorResponse);
  }
}
