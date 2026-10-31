/**
 * Enterprise Structured Client Logger
 * Replaces unstructured console calls with structured, leveled telemetry.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogPayload {
  timestamp: string;
  level: LogLevel;
  context?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

class ClientLogger {
  private isProduction = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';

  private formatMessage(level: LogLevel, message: string, context?: string, metadata?: Record<string, unknown>): LogPayload {
    return {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      metadata,
    };
  }

  public debug(message: string, context?: string, metadata?: Record<string, unknown>): void {
    if (this.isProduction) return;
    const entry = this.formatMessage('debug', message, context, metadata);
    console.debug(`[DEBUG] [${entry.context || 'Client'}] ${entry.message}`, entry.metadata || '');
  }

  public info(message: string, context?: string, metadata?: Record<string, unknown>): void {
    const entry = this.formatMessage('info', message, context, metadata);
    console.info(`[INFO] [${entry.context || 'Client'}] ${entry.message}`, entry.metadata || '');
  }

  public warn(message: string, contextOrMeta?: string | unknown, metadata?: Record<string, unknown>): void {
    const isContextString = typeof contextOrMeta === 'string';
    const context = isContextString ? contextOrMeta : 'Client';
    const meta = !isContextString && contextOrMeta ? { error: String(contextOrMeta), ...metadata } : metadata;
    const entry = this.formatMessage('warn', message, context, meta);
    console.warn(`[WARN] [${entry.context || 'Client'}] ${entry.message}`, entry.metadata || '');
  }

  public error(message: string, contextOrError?: string | unknown, metadata?: Record<string, unknown>): void {
    const isContextString = typeof contextOrError === 'string';
    const context = isContextString ? contextOrError : 'Client';
    const meta = !isContextString && contextOrError ? { error: contextOrError instanceof Error ? contextOrError.message : String(contextOrError), ...metadata } : metadata;
    const entry = this.formatMessage('error', message, context, meta);
    console.error(`[ERROR] [${entry.context || 'Client'}] ${entry.message}`, entry.metadata || '');
  }
}

export const logger = new ClientLogger();
