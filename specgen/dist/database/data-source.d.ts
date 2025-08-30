/**
 * TypeORM DataSource configuration and management
 */
import { DataSource } from 'typeorm';
export declare function getDataSource(dbPath?: string): Promise<DataSource>;
export declare function initializeDatabase(dbPath?: string, force?: boolean): Promise<DataSource>;
export declare function closeDatabase(): Promise<void>;
//# sourceMappingURL=data-source.d.ts.map