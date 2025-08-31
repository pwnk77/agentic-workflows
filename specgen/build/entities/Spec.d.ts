/**
 * Spec entity - Main specification document
 */
export type SpecStatus = 'draft' | 'todo' | 'in-progress' | 'done';
export declare class Spec {
    id: number;
    title: string;
    bodyMd: string;
    status: SpecStatus;
    createdAt: Date;
    updatedAt: Date;
    version: number;
    todos: any[];
    execLogs: any[];
    issueLogs: any[];
}
//# sourceMappingURL=Spec.d.ts.map