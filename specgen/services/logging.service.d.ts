/**
 * Structured logging service with Winston and TypeScript
 */
import { ExecutionLogData, IssueLogData, LogContext, LogLevel } from '../types/logging.types.js';
declare class LoggingService {
    private winston;
    private initialized;
    constructor();
    private createWinstonLogger;
    error(message: string, error?: Error | LogContext, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    info(message: string, context?: LogContext): void;
    debug(message: string, context?: LogContext): void;
    private log;
    logExecution(data: ExecutionLogData): Promise<void>;
    logIssue(data: IssueLogData): Promise<void>;
    setLevel(level: LogLevel): void;
    getLevel(): string;
    child(context: LogContext): LoggingService;
}
export declare const logger: LoggingService;
export {};
//# sourceMappingURL=logging.service.d.ts.map