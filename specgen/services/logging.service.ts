/**
 * Structured logging service with Winston and TypeScript
 */

import winston from 'winston';
import { getAppSettings } from '../config/settings.js';
import { isTest } from '../config/environment.js';
import { ExecutionLogData, IssueLogData, LogContext, LogLevel } from '../types/logging.types.js';
import { getDataSource } from '../database/data-source.js';
import { ExecLog } from '../entities/ExecLog.js';
import { IssueLog } from '../entities/IssueLog.js';

class LoggingService {
  private winston: winston.Logger;
  private initialized = false;

  constructor() {
    this.winston = this.createWinstonLogger();
    this.initialized = true;
  }

  private createWinstonLogger(): winston.Logger {
    const settings = getAppSettings();
    
    const formats = [
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ];

    const transports: winston.transport[] = [];

    // Console transport (always enabled)
    if (settings.logging.enableConsole) {
      transports.push(
        new winston.transports.Console({
          level: settings.logging.level,
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
              const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
              return `${timestamp} [${level}]: ${message}${metaStr}`;
            })
          )
        })
      );
    }

    // File transport (for development/production)
    if (settings.logging.enableFile && !isTest()) {
      transports.push(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: settings.logging.maxFileSize,
          maxFiles: settings.logging.maxFiles
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: settings.logging.maxFileSize,
          maxFiles: settings.logging.maxFiles
        })
      );
    }

    return winston.createLogger({
      level: settings.logging.level,
      format: winston.format.combine(...formats),
      transports,
      exitOnError: false
    });
  }

  error(message: string, error?: Error | LogContext, context?: LogContext): void {
    this.log('error', message, error, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, undefined, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, undefined, context);
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, undefined, context);
  }

  private log(level: LogLevel, message: string, errorOrContext?: Error | LogContext, context?: LogContext): void {
    if (!this.initialized) return;

    let finalContext: LogContext = {};
    let error: Error | undefined;

    if (errorOrContext) {
      if (errorOrContext instanceof Error) {
        error = errorOrContext;
        finalContext = context || {};
      } else {
        finalContext = errorOrContext;
      }
    }

    if (error) {
      this.winston.log(level, message, {
        ...finalContext,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      });
    } else {
      this.winston.log(level, message, finalContext);
    }
  }

  async logExecution(data: ExecutionLogData): Promise<void> {
    try {
      const dataSource = await getDataSource();
      const execLogRepo = dataSource.getRepository(ExecLog);

      const execLog = execLogRepo.create({
        specId: data.specId,
        layer: data.layer,
        status: data.status,
        summary: data.summary,
        tasksCompleted: data.tasksCompleted ? JSON.stringify(data.tasksCompleted) : undefined
      });

      await execLogRepo.save(execLog);

      this.info('Execution log saved', {
        specId: data.specId,
        layer: data.layer,
        status: data.status
      });
    } catch (error) {
      this.error('Failed to save execution log', error as Error, data);
    }
  }

  async logIssue(data: IssueLogData): Promise<void> {
    try {
      const dataSource = await getDataSource();
      const issueLogRepo = dataSource.getRepository(IssueLog);

      const issueLog = issueLogRepo.create({
        specId: data.specId,
        taskId: data.taskId,
        taskDescription: data.taskDescription,
        layer: data.layer,
        status: data.status,
        error: data.error,
        rootCause: data.rootCause,
        resolution: data.resolution
      });

      await issueLogRepo.save(issueLog);

      this.info('Issue log saved', {
        specId: data.specId,
        taskId: data.taskId,
        status: data.status
      });
    } catch (error) {
      this.error('Failed to save issue log', error as Error, data);
    }
  }

  setLevel(level: LogLevel): void {
    this.winston.level = level;
  }

  getLevel(): string {
    return this.winston.level;
  }

  child(context: LogContext): LoggingService {
    const childService = new LoggingService();
    childService.winston = this.winston.child(context);
    return childService;
  }
}

// Create singleton instance
export const logger = new LoggingService();