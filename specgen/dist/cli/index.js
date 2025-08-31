#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const init_1 = require("./commands/init");
const import_1 = require("./commands/import");
const start_1 = require("./commands/start");
const status_1 = require("./commands/status");
commander_1.program
    .name('specgen')
    .description('SpecGen - Project-scoped specification management for Claude Code')
    .version('1.0.0');
commander_1.program.addCommand((0, init_1.createInitCommand)());
commander_1.program.addCommand((0, import_1.createImportCommand)());
commander_1.program.addCommand((0, start_1.createStartCommand)());
commander_1.program.addCommand((0, status_1.createStatusCommand)());
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
commander_1.program.parse();
//# sourceMappingURL=index.js.map