#!/usr/bin/env node
import { program } from 'commander';
import { createInitCommand } from './commands/init.js';
import { createImportCommand } from './commands/import.js';
import { createStartCommand } from './commands/start.js';
import { createStatusCommand } from './commands/status.js';
program
    .name('specgen')
    .description('SpecGen - Project-scoped specification management for Claude Code')
    .version('1.0.0');
program.addCommand(createInitCommand());
program.addCommand(createImportCommand());
program.addCommand(createStartCommand());
program.addCommand(createStatusCommand());
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error.message);
    if (process.env.DEBUG) {
        console.error(error.stack);
    }
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled promise rejection:', reason);
    process.exit(1);
});
program.parse();
//# sourceMappingURL=index.js.map