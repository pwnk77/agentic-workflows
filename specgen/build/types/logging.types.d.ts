/**
 * Logging type definitions
 */
export interface LogContext {
    [key: string]: any;
}
export interface LogEntry {
    level: string;
    message: string;
    timestamp: string;
    context?: LogContext;
    error?: Error;
}
export interface ExecutionLogData {
    specId: number;
    layer: string;
    status: 'started' | 'completed' | 'failed';
    summary?: string;
    tasksCompleted?: string[];
    error?: string;
}
export interface IssueLogData {
    specId: number;
    taskId: string;
    taskDescription: string;
    layer: string;
    status: 'failed' | 'resolved' | 'unresolved';
    error?: string;
    rootCause?: string;
    resolution?: string;
}
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
//# sourceMappingURL=logging.types.d.ts.map