import { Command } from 'commander';
import { ProjectService } from '../../services/project.service';

export function createInitCommand(): Command {
  const cmd = new Command('init');
  
  cmd
    .description('Initialize a new SpecGen project')
    .argument('[directory]', 'Project directory to initialize (defaults to current directory)')
    .option('-f, --force', 'Force initialization even if project already exists')
    .action(async (directory?: string, _options?: { force?: boolean }) => {
      try {
        console.log('🚀 Initializing SpecGen project...');
        
        const result = await ProjectService.initialize(directory);
        
        if (!result.success) {
          console.error(`❌ ${result.message}`);
          process.exit(1);
        }

        if (result.isNewProject) {
          console.log(`✅ ${result.message}`);
          console.log(`📁 Project: ${result.projectInfo?.name} (${result.projectInfo?.version})`);
          console.log(`🗂️  Database: ${result.projectInfo?.databasePath}`);
          console.log('');
          console.log('Next steps:');
          console.log('  • Import existing SPEC files: specgen import docs/');
          console.log('  • Start MCP server: specgen start');
        } else {
          console.log(`ℹ️  ${result.message}`);
          console.log(`📁 Project: ${result.projectInfo?.name} (${result.projectInfo?.version})`);
        }

        // Show project stats if already has data
        if (result.projectInfo?.isInitialized) {
          try {
            const stats = await ProjectService.getProjectStats();
            if (stats.total > 0) {
              console.log('');
              console.log('📊 Current project stats:');
              console.log(`   Total specs: ${stats.total}`);
              if (stats.recentActivity > 0) {
                console.log(`   Recent activity: ${stats.recentActivity} specs updated in last 7 days`);
              }
            }
          } catch {
            // Ignore stats errors on init
          }
        }
      } catch (error) {
        console.error('❌ Failed to initialize project:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  return cmd;
}