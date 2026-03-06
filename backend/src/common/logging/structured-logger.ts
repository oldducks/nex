import { Injectable, LoggerService } from '@nestjs/common';

type LogLevel = 'log' | 'warn' | 'error' | 'debug' | 'verbose';

export interface StructuredLogMeta {
  context?: string;
  [key: string]: any;
}

@Injectable()
export class StructuredLogger implements LoggerService {
  private format(level: LogLevel, message: string, meta?: StructuredLogMeta) {
    const payload: any = {
      level,
      message,
      timestamp: new Date().toISOString(),
    };

    if (meta) {
      Object.assign(payload, meta);
    }

    // Basic JSON log for future aggregation systems (ELK, Loki, etc.)
    return JSON.stringify(payload);
  }

  log(message: string, meta?: StructuredLogMeta) {
    // eslint-disable-next-line no-console
    console.log(this.format('log', message, meta));
  }

  error(message: string, trace?: string, meta?: StructuredLogMeta) {
    const payloadMeta = { ...meta, trace };
    // eslint-disable-next-line no-console
    console.error(this.format('error', message, payloadMeta));
  }

  warn(message: string, meta?: StructuredLogMeta) {
    // eslint-disable-next-line no-console
    console.warn(this.format('warn', message, meta));
  }

  debug?(message: string, meta?: StructuredLogMeta) {
    // eslint-disable-next-line no-console
    console.debug(this.format('debug', message, meta));
  }

  verbose?(message: string, meta?: StructuredLogMeta) {
    // eslint-disable-next-line no-console
    console.debug(this.format('verbose', message, meta));
  }
}

