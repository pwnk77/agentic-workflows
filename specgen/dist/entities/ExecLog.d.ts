/**
 * ExecLog entity - Execution logs for specification implementations
 */
export declare class ExecLog {
    id: number;
    specId: number;
    layer: string;
    status: string;
    summary?: string;
    tasksCompleted?: string;
    createdAt: Date;
    spec: any;
}
//# sourceMappingURL=ExecLog.d.ts.map