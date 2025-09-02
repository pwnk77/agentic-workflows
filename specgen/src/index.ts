// Main entry point for SpecGen MCP library
export { SpecService, type Spec, type CreateSpecData, type UpdateSpecData } from './services/spec.service.js';
export { ProjectService } from './services/project.service.js';
export type { ProjectInfo } from './database/project-manager.js';
export { ImportService, type ImportResult } from './services/import.service.js';
export { SpecParser, type ParsedSpec } from './parsers/spec-parser.js';
export { ProjectManager } from './database/project-manager.js';
export { DatabaseConnection } from './database/connection.js';