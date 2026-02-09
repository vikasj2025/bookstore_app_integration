/**
 * Logger Service for the Online Bookstore Application
 * Provides structured logging with different levels and output targets
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  context?: string;
}

interface LoggerConfig {
  level: string;
  enableConsole: boolean;
}

export class LoggerService {
  private config: LoggerConfig;
  private logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(config: LoggerConfig) {
    this.config = config;
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: any, context?: string): void {
    this.log('debug', message, data, context);
  }

  /**
   * Log info message
   */
  info(message: string, data?: any, context?: string): void {
    this.log('info', message, data, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any, context?: string): void {
    this.log('warn', message, data, context);
  }

  /**
   * Log error message
   */
  error(message: string, data?: any, context?: string): void {
    this.log('error', message, data, context);
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, data?: any, context?: string): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      context,
    };

    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    // In production, you might want to send logs to external services
    // this.logToExternalService(logEntry);
  }

  /**
   * Check if message should be logged based on configured level
   */
  private shouldLog(level: LogLevel): boolean {
    const configuredLevel = this.config.level as LogLevel;
    return this.logLevels[level] >= this.logLevels[configuredLevel];
  }

  /**
   * Log to browser console
   */
  private logToConsole(entry: LogEntry): void {
    const { timestamp, level, message, data, context } = entry;
    const prefix = `[${timestamp}] [${level.toUpperCase()}]${context ? ` [${context}]` : ''}`;

    switch (level) {
      case 'debug':
        console.debug(prefix, message, data || '');
        break;
      case 'info':
        console.info(prefix, message, data || '');
        break;
      case 'warn':
        console.warn(prefix, message, data || '');
        break;
      case 'error':
        console.error(prefix, message, data || '');
        break;
    }
  }

  /**
   * Create child logger with context
   */
  createChild(context: string): LoggerService {
    return new ContextualLogger(this, context);
  }
}

/**
 * Contextual logger that adds context to all log messages
 */
class ContextualLogger extends LoggerService {
  constructor(private parent: LoggerService, private context: string) {
    super(parent['config']);
  }

  debug(message: string, data?: any): void {
    this.parent.debug(message, data, this.context);
  }

  info(message: string, data?: any): void {
    this.parent.info(message, data, this.context);
  }

  warn(message: string, data?: any): void {
    this.parent.warn(message, data, this.context);
  }

  error(message: string, data?: any): void {
    this.parent.error(message, data, this.context);
  }
}
