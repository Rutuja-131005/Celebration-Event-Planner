/**
 * Enterprise Structured Server Logger
 * Provides audit-ready leveled logging with JSON structured formatting.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  context?: string;
  metadata?: Record<string, unknown>;
}

class ServerLogger {
  private isProduction = process.env.NODE_ENV === 'production';
  private serviceName = 'CelebrationAtelier';

  private emit(level: LogLevel, message: string, context?: string, metadata?: Record<string, unknown>): void {
    if (level === 'debug' && this.isProduction) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      context,
      metadata,
    };

    const formatted = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.context || entry.service}] ${entry.message}`;

    if (level === 'error') {
      console.error(formatted, metadata || '');
    } else if (level === 'warn') {
      console.warn(formatted, metadata || '');
    } else if (level === 'debug') {
      console.debug(formatted, metadata || '');
    } else {
      console.info(formatted, metadata || '');
    }
  }

  public debug(message: string, context?: string, metadata?: Record<string, unknown>): void {
    this.emit('debug', message, context, metadata);
  }

  public info(message: string, context?: string, metadata?: Record<string, unknown>): void {
    this.emit('info', message, context, metadata);
  }

  public warn(message: string, context?: string, metadata?: Record<string, unknown>): void {
    this.emit('warn', message, context, metadata);
  }

  public error(message: string, context?: string, metadata?: Record<string, unknown>): void {
    this.emit('error', message, context, metadata);
  }
}

export const serverLogger = new ServerLogger();
