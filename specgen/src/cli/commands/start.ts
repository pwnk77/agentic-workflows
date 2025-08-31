import { Command } from 'commander';
import { ProjectService } from '../../services/project.service';

export function createStartCommand(): Command {
  const cmd = new Command('start');
  
  cmd
    .description('Start the SpecGen MCP server')
    .option('-p, --port <port>', 'Server port (for HTTP mode)', '3000')
    .option('--http', 'Start HTTP server instead of stdio', false)
    .option('--debug', 'Enable debug logging', false)
    .action(async (options?: { port?: string; http?: boolean; debug?: boolean }) => {
      try {
        // Check if project is initialized
        if (!ProjectService.isInInitializedProject()) {
          console.error('❌ Project not initialized. Run "specgen init" first.');
          process.exit(1);
        }

        const opts = options || {};
        const project = ProjectService.getCurrentProject();
        
        console.log('🚀 Starting SpecGen MCP Server...');
        console.log(`📁 Project: ${project.name} (${project.version})`);
        console.log(`🗂️  Database: ${project.databasePath}`);
        
        if (opts.debug) {
          console.log('🐛 Debug logging enabled');
        }

        // Show project stats
        try {
          const stats = await ProjectService.getProjectStats();
          console.log(`📊 Project has ${stats.total} specs`);
          
          if (stats.total > 0) {
            const statusSummary = Object.entries(stats.byStatus)
              .map(([status, count]) => `${count} ${status}`)
              .join(', ');
            console.log(`   Status: ${statusSummary}`);
          }
        } catch (error) {
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

        // Import and start the MCP server
        const { startMCPServer } = await import('../../mcp/server');
        
        // Set debug mode if requested
        if (opts.debug) {
          process.env.DEBUG = 'specgen:*';
        }

        await startMCPServer();
      } catch (error) {
        console.error('❌ Failed to start MCP server:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  return cmd;
}