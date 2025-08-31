/**
 * Spec service with business logic and validation
 */
import { Spec, SpecStatus } from '../entities/Spec.js';
import { CreateSpecRequest, UpdateSpecRequest, ListSpecsQuery, SpecListResponse } from '../types/spec.types.js';
export declare class SpecService {
    private repository;
    private settings;
    constructor();
    createSpec(data: CreateSpecRequest): Promise<Spec>;
    updateSpec(id: number, data: UpdateSpecRequest): Promise<Spec>;
    getSpec(id: number, includeRelations?: boolean): Promise<Spec>;
    listSpecs(query?: ListSpecsQuery): Promise<SpecListResponse>;
    deleteSpec(id: number): Promise<void>;
    getSpecsByStatus(status: SpecStatus): Promise<Spec[]>;
    getSpecStats(): Promise<{
        total: number;
        byStatus: Record<SpecStatus, number>;
    }>;
    searchSpecsByTitle(pattern: string): Promise<Spec[]>;
}
//# sourceMappingURL=spec.service.d.ts.map