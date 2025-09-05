import { Command } from 'commander';
import { fileSpecService } from '../../services/file-spec.service.js';

export function createStatusCommand(): Command {
  const cmd = new Command('status');
  
  cmd
    .description('Show status of the current SpecGen project')
    .option('-v, --verbose', 'Show detailed information')
    .option('--json', 'Output as JSON')
    .action(async (options?: { verbose?: boolean; json?: boolean }) => {
      try {
        // Load metadata to get project status
        const metadata = await fileSpecService.loadMetadata();
        const specs = Object.values(metadata.specs);
        
        // Calculate statistics
        const stats = {
          project: {
            name: metadata.project.name,
            description: metadata.project.description,
            created_at: metadata.project.created_at,
            updated_at: metadata.project.updated_at
          },
          specs: {
            total: specs.length,
            by_status: {} as Record<string, number>,
            by_category: {} as Record<string, number>,
            by_priority: {} as Record<string, number>
          },
          settings: metadata.settings,
          recent_activity: specs.filter(spec => {
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return new Date(spec.updated_at) > weekAgo;
          }).length
        };

        // Count by different dimensions
        specs.forEach(spec => {
          // By status
          const status = spec.status || 'unknown';
          stats.specs.by_status[status] = (stats.specs.by_status[status] || 0) + 1;
          
          // By category
          const category = spec.category || 'uncategorized';
          stats.specs.by_category[category] = (stats.specs.by_category[category] || 0) + 1;
          
          // By priority
          const priority = spec.priority || 'medium';
          stats.specs.by_priority[priority] = (stats.specs.by_priority[priority] || 0) + 1;
        });

        if (options?.json) {
          console.log(JSON.stringify(stats, null, 2));
          return;
        }

        // Display formatted output
        console.log(`📋 SpecGen Project Status`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`📁 Project: ${stats.project.name}`);
        console.log(`📝 Description: ${stats.project.description}`);
        console.log(`📅 Created: ${new Date(stats.project.created_at).toLocaleDateString()}`);
        console.log(`🔄 Updated: ${new Date(stats.project.updated_at).toLocaleDateString()}`);
        console.log('');

        console.log(`📊 Specification Statistics`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`Total specifications: ${stats.specs.total}`);
        console.log(`Recent activity (7 days): ${stats.recent_activity} specs`);
        console.log('');

        if (stats.specs.total > 0) {
          console.log(`📈 Breakdown by Status:`);
          Object.entries(stats.specs.by_status).forEach(([status, count]) => {
            const emoji = getStatusEmoji(status);
            console.log(`   ${emoji} ${status}: ${count} specs`);
          });
          console.log('');

          console.log(`🏷️  Breakdown by Category:`);
          Object.entries(stats.specs.by_category).forEach(([category, count]) => {
            console.log(`   📂 ${category}: ${count} specs`);
          });
          console.log('');

          console.log(`⭐ Breakdown by Priority:`);
          Object.entries(stats.specs.by_priority).forEach(([priority, count]) => {
            const emoji = getPriorityEmoji(priority);
            console.log(`   ${emoji} ${priority}: ${count} specs`);
          });
        } else {
          console.log('ℹ️  No specifications found in this project');
          console.log('   Run "specgen init --discover" to import existing SPEC files');
        }

        if (options?.verbose && stats.specs.total > 0) {
          console.log('');
          console.log(`🔍 Recent Specifications:`);
          console.log(`━━━━━━━━━━━━━━━━━━━━━━━━`);
          
          // Show most recently updated specs
          const recentSpecs = specs
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .slice(0, 5);
            
          recentSpecs.forEach(spec => {
            const emoji = getStatusEmoji(spec.status);
            const date = new Date(spec.updated_at).toLocaleDateString();
            console.log(`   ${emoji} ${spec.title} (${spec.category}) - ${date}`);
          });
        }

        console.log('');
        console.log('💡 Commands:');
        console.log('   • Launch dashboard: Use mcp__specgen-mcp__launch_dashboard tool (port 4567)');  
        console.log('   • Create new spec: Use architect command');
        console.log('   • Implement spec: Use engineer command');

      } catch (error) {
        if (options?.json) {
          console.log(JSON.stringify({ 
            success: false, 
            error: error instanceof Error ? error.message : String(error) 
          }));
        } else {
          console.error('❌ Failed to get project status:', error instanceof Error ? error.message : String(error));
          console.log('');
          console.log('💡 This might be a new project. Try:');
          console.log('   specgen init --discover');
        }
        process.exit(1);
      }
    });

  return cmd;
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case 'draft': return '📝';
    case 'todo': return '📋';
    case 'in-progress': return '🔄';
    case 'done': return '✅';
    default: return '❓';
  }
}

function getPriorityEmoji(priority: string): string {
  switch (priority) {
    case 'high': return '🔴';
    case 'medium': return '🟡';
    case 'low': return '🟢';
    default: return '⚪';
  }
}