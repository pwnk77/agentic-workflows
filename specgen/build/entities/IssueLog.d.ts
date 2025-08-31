/**
 * IssueLog entity - Issue and error logs for debugging
 */
export declare class IssueLog {
    id: number;
    specId: number;
    taskId: string;
    taskDescription: string;
    layer: string;
    status: string;
    error?: string;
    rootCause?: string;
    resolution?: string;
    createdAt: Date;
    spec: any;
}
//# sourceMappingURL=IssueLog.d.ts.map