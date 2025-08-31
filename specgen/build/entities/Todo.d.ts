/**
 * Todo entity - Task items associated with specifications
 */
export type TodoStatus = 'pending' | 'in-progress' | 'completed';
export declare class Todo {
    id: number;
    specId: number;
    stepNo?: number;
    text?: string;
    status: TodoStatus;
    spec: any;
}
//# sourceMappingURL=Todo.d.ts.map