import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StructuredLogger } from '../logging/structured-logger';

@Injectable()
export class AuditLoggingInterceptor implements NestInterceptor {
  private readonly methodsToAudit = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

  constructor(private readonly logger: StructuredLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse();

    const method = request?.method;
    if (!this.methodsToAudit.has(method)) {
      return next.handle();
    }

    const start = Date.now();
    const path = request?.originalUrl || request?.url;
    const ip = request?.ip;
    const userId = request?.user?.sub ?? request?.user?.userId ?? null;
    const role = request?.user?.role ?? 'guest';

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          const statusCode = response?.statusCode;

          this.logger.log('audit_event', {
            context: 'AUDIT',
            action: method,
            path,
            statusCode,
            durationMs: duration,
            userId,
            role,
            ip,
          });
        },
        error: (error) => {
          const duration = Date.now() - start;
          const statusCode = response?.statusCode || error?.status || 500;

          this.logger.warn('audit_event', {
            context: 'AUDIT',
            action: method,
            path,
            statusCode,
            durationMs: duration,
            userId,
            role,
            ip,
            error: error?.message ?? 'unknown',
          });
        },
      }),
    );
  }
}
