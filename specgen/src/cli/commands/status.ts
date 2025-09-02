import { Command } from 'commander';
import { ProjectService } from '../../services/project.service.js';
import { SpecService } from '../../services/spec.service.js';

export function createStatusCommand(): Command {
  const cmd = new Command('status');
  
  cmd
    .description('Show project status and statistics')
    .option('--detailed', 'Show detailed statistics including latest specs', false)
    .action(async (options?: { detailed?: boolean }) => {
      try {
        // Check if project is initialized
        if (!ProjectService.isInInitializedProject()) {
          console.error('❌ Project not initialized. Run "specgen init" first.');
          process.exit(1);
        }

        const opts = options || {};
        const project = ProjectService.getCurrentProject();
        
        console.log('📊 SpecGen Project Status');
        console.log('=========================');
        console.log('');
        console.log(`📁 Project: ${project.name} (${project.version})`);
        console.log(`🏠 Location: ${project.root}`);
        console.log(`🗂️  Database: ${project.databasePath}`);
        console.log(`✅ Status: ${project.isInitialized ? 'Initialized' : 'Not initialized'}`);
        console.log('');

        // Get and show statistics
        const stats = SpecService.getStats(opts.detailed);
        
        console.log('📈 Specification Statistics:');
        console.log(`   Total specs: ${stats.total_specs}`);
        console.log('');

        // Status breakdown
        if (Object.keys(stats.by_status).length > 0) {
          console.log('📋 By Status:');
          Object.entries(stats.by_status).forEach(([status, count]) => {
            const icon = getStatusIcon(status);
            const percentage = stats.total_specs > 0 ? ((count / stats.total_specs) * 100).toFixed(1) : '0';
            console.log(`   ${icon} ${status}: ${count} (${percentage}%)`);
          });
          console.log('');
        }

        // Group breakdown
        if (Object.keys(stats.by_group).length > 0) {
          console.log('📁 By Feature Group:');
          Object.entries(stats.by_group).forEach(([group, count]) => {
            const percentage = stats.total_specs > 0 ? ((count / stats.total_specs) * 100).toFixed(1) : '0';
            console.log(`   📂 ${group}: ${count} (${percentage}%)`);
          });
          console.log('');
        }

        // Recent activity (if detailed)
        if (opts.detailed && stats.recent_activity !== undefined) {
          console.log('🕒 Recent Activity:');
          console.log(`   ${stats.recent_activity} specs updated in last 7 days`);
          console.log('');
        }

        // Latest specs (if detailed)
        if (opts.detailed && stats.latest_specs && stats.latest_specs.length > 0) {
          console.log('📄 Latest Specs:');
          stats.latest_specs.forEach(spec => {
            const icon = getStatusIcon(spec.status);
            const date = new Date(spec.created_at).toLocaleDateString();
            console.log(`   ${icon} ${spec.title} (${spec.feature_group}) - ${date}`);
          });
          console.log('');
        }

        // Recommendations
        console.log('💡 Quick Actions:');
        if (stats.total_specs === 0) {
          console.log('   • Import existing SPEC files: specgen import docs/');
          console.log('   • Start MCP server: specgen start');
        } else {
          console.log('   • Start MCP server: specgen start');
          console.log('   • Import more files: specgen import <directory>');
          
          const draftCount = stats.by_status['draft'] || 0;
          const todoCount = stats.by_status['todo'] || 0;
          
          if (draftCount > 0) {
            console.log(`   • ${draftCount} draft specs could be promoted to todo/in-progress`);
          }
          
          if (todoCount > 0) {
            console.log(`   • ${todoCount} todo specs ready for implementation`);
          }
        }

      } catch (error) {
        console.error('❌ Failed to get project status:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  return cmd;
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'done': return '✅';
    case 'in-progress': return '🔄';
    case 'todo': return '📋';
    case 'draft': return '📝';
    default: return '📄';
  }
}