/**
 * Full-text search utilities and management
 */
import { DataSource } from 'typeorm';
export interface FTSRebuildOptions {
    force?: boolean;
    verbose?: boolean;
}
export declare function rebuildFTSIndex(dataSource: DataSource, options?: FTSRebuildOptions): Promise<void>;
export declare function optimizeFTSIndex(dataSource: DataSource): Promise<void>;
export declare function getFTSStatus(dataSource: DataSource): Promise<any>;
export declare function validateFTSIntegrity(dataSource: DataSource): Promise<boolean>;
//# sourceMappingURL=fts-setup.d.ts.map