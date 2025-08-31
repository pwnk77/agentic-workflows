"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStartCommand = createStartCommand;
const commander_1 = require("commander");
const project_service_1 = require("../../services/project.service");
function createStartCommand() {
    const cmd = new commander_1.Command('start');
    cmd
        .description('Start the SpecGen MCP server')
        .option('-p, --port <port>', 'Server port (for HTTP mode)', '3000')
        .option('--http', 'Start HTTP server instead of stdio', false)
        .option('--debug', 'Enable debug logging', false)
        .action(async (options) => {
        try {
            if (!project_service_1.ProjectService.isInInitializedProject()) {
                console.error('❌ Project not initialized. Run "specgen init" first.');
                process.exit(1);
            }
            const opts = options || {};
            const project = project_service_1.ProjectService.getCurrentProject();
            console.log('🚀 Starting SpecGen MCP Server...');
            console.log(`📁 Project: ${project.name} (${project.version})`);
            console.log(`🗂️  Database: ${project.databasePath}`);
            if (opts.debug) {
                console.log('🐛 Debug logging enabled');
            }
            try {
                const stats = await project_service_1.ProjectService.getProjectStats();
                console.log(`📊 Project has ${stats.total} specs`);
                if (stats.total > 0) {
                    const statusSummary = Object.entries(stats.byStatus)
                        .map(([status, count]) => `${count} ${status}`)
                        .join(', ');
                    console.log(`   Status: ${statusSummary}`);
                }
            }
            catch (error) {
                console.warn('⚠️  Could not load project stats:', error instanceof Error ? error.message : String(error));
            }
            console.log('');
            if (opts.http) {
                console.log(`🌐 Starting HTTP server on port ${opts.port || 3000}...`);
                console.log('📡 HTTP MCP server not yet implemented - defaulting to stdio mode');
            }
            console.log('📡 Starting stdio MCP server...');
            console.log('💬 Ready for Claude Code integration');
            console.log('');
            console.log('Usage in Claude Code:');
            console.log('  Add to your MCP settings:');
            console.log('  {');
            console.log('    "mcpServers": {');
            console.log('      "specgen": {');
            console.log('        "command": "specgen",');
            console.log('        "args": ["start"]');
            console.log('      }');
            console.log('    }');
            console.log('  }');
            console.log('');
            const { startMCPServer } = await Promise.resolve().then(() => __importStar(require('../../mcp/server')));
            if (opts.debug) {
                process.env.DEBUG = 'specgen:*';
            }
            await startMCPServer();
        }
        catch (error) {
            console.error('❌ Failed to start MCP server:', error instanceof Error ? error.message : String(error));
            process.exit(1);
        }
    });
    return cmd;
}
//# sourceMappingURL=start.js.map