// Main entry point for SpecGen MCP library
export { SpecService, type Spec, type CreateSpecData, type UpdateSpecData } from './services/spec.service';
export { ProjectService } from './services/project.service';
export type { ProjectInfo } from './database/project-manager';
export { ImportService, type ImportResult } from './services/import.service';
export { SpecParser, type ParsedSpec } from './parsers/spec-parser';
export { ProjectManager } from './database/project-manager';
export { DatabaseConnection } from './database/connection';