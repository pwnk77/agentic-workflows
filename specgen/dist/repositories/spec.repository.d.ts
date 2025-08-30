/**
 * Spec repository with TypeORM
 */
import { Spec, SpecStatus } from '../entities/Spec.js';
import { ListSpecsQuery } from '../types/spec.types.js';
export declare class SpecRepository {
    private repository;
    private getRepository;
    findById(id: number, relations?: string[]): Promise<Spec | null>;
    findAll(query: ListSpecsQuery): Promise<{
        specs: Spec[];
        total: number;
    }>;
    create(data: Partial<Spec>): Promise<Spec>;
    update(id: number, data: Partial<Spec>): Promise<Spec | null>;
    delete(id: number): Promise<boolean>;
    findByStatus(status: SpecStatus): Promise<Spec[]>;
    countByStatus(status?: SpecStatus): Promise<number>;
    findRecent(limit?: number): Promise<Spec[]>;
    findByTitlePattern(pattern: string): Promise<Spec[]>;
}
//# sourceMappingURL=spec.repository.d.ts.map