#!/usr/bin/env node
/**
 * CLI entry point for SpecGen MCP Server
 */
import { program } from 'commander';
import { startCommand } from './commands/start.js';
import { dbCommand } from './commands/db.js';
import { specCommand } from './commands/spec.js';
export function createCLI() {
    program
        .name('specgen-mcp-server')
        .description('TypeScript MCP server for SPEC file management with SQLite backend')
        .version('1.0.0');
    // Register commands
    program.addCommand(startCommand);
    program.addCommand(dbCommand);
    program.addCommand(specCommand);
    return program;
}
// Run CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const cli = createCLI();
    cli.parseAsync(process.argv).catch((error) => {
        console.error('CLI Error:', error.message);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map