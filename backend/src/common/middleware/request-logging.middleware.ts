import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { StructuredLogger } from '../logging/structured-logger';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: StructuredLogger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusCode = res.statusCode;

      const meta = {
        context: 'HTTP',
        method: req.method,
        path: req.originalUrl,
        statusCode,
        durationMs: duration,
        ip: req.ip,
      };

      if (statusCode >= 500) {
        this.logger.error('http_request', undefined, meta);
      } else if (statusCode >= 400) {
        this.logger.warn('http_request', meta);
      } else {
        this.logger.log('http_request', meta);
      }
    });

    next();
  }
}
