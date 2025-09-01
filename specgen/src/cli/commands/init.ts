import { Command } from 'commander';
import { ProjectService } from '../../services/project.service.js';
import { ImportService } from '../../services/import.service.js';
import { glob } from 'glob';
import { existsSync } from 'fs';

export function createInitCommand(): Command {
  const cmd = new Command('init');
  
  cmd
    .description('Initialize a new SpecGen project')
    .argument('[directory]', 'Project directory to initialize (defaults to current directory)')
    .option('-f, --force', 'Force initialization even if project already exists')
    .option('--discover', 'Automatically discover and import existing SPEC files during initialization')
    .option('--import-pattern <pattern>', 'Pattern to match SPEC files during discovery (default: SPEC-*.md)', 'SPEC-*.md')
    .action(async (directory?: string, options?: { force?: boolean; discover?: boolean; importPattern?: string }) => {
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
          console.log('  • Or re-initialize with discovery: specgen init --discover');
          console.log('  • Start MCP server: specgen start');
        } else {
          console.log(`ℹ️  ${result.message}`);
          console.log(`📁 Project: ${result.projectInfo?.name} (${result.projectInfo?.version})`);
        }

        // Auto-discover and import existing SPEC files if requested
        if (result.success && options?.discover) {
          console.log('');
          console.log('🔍 Discovering existing SPEC files...');
          
          try {
            const projectRoot = result.projectInfo?.root || directory || process.cwd();
            const discoveryResult = await discoverAndImportSpecs(projectRoot, options.importPattern || 'SPEC-*.md');
            
            if (discoveryResult.success && discoveryResult.imported.length > 0) {
              console.log(`✅ Imported ${discoveryResult.imported.length} SPEC files`);
              console.log('📊 Categories discovered:');
              
              // Show category breakdown
              const categoryBreakdown: Record<string, number> = {};
              for (const spec of discoveryResult.imported) {
                categoryBreakdown[spec.feature_group] = (categoryBreakdown[spec.feature_group] || 0) + 1;
              }
              
              for (const [category, count] of Object.entries(categoryBreakdown)) {
                console.log(`   ${category}: ${count} specs`);
              }
            } else if (discoveryResult.success && discoveryResult.imported.length === 0) {
              console.log('ℹ️  No SPEC files found to import');
            } else {
              console.warn('⚠️  Some issues occurred during discovery:', discoveryResult.errors.join(', '));
            }
          } catch (error) {
            console.warn('⚠️  Failed to discover SPEC files:', error instanceof Error ? error.message : String(error));
          }
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

/**
 * Discover and import SPEC files from project directory
 */
async function discoverAndImportSpecs(projectRoot: string, pattern: string) {
  // Look for SPEC files in common documentation directories
  const searchDirs = [
    'docs',
    'documentation', 
    'specs',
    'specifications',
    '.' // Current directory as fallback
  ];
  
  let foundFiles: string[] = [];
  
  // Search in each potential directory
  for (const dir of searchDirs) {
    const searchPath = dir === '.' ? projectRoot : `${projectRoot}/${dir}`;
    
    if (existsSync(searchPath)) {
      const files = await glob(`${searchPath}/**/${pattern}`, {
        ignore: ['node_modules/**', '.git/**', '**/.specgen/**']
      });
      foundFiles.push(...files);
    }
  }
  
  // Remove duplicates
  foundFiles = [...new Set(foundFiles)];
  
  if (foundFiles.length === 0) {
    return {
      success: true,
      imported: [],
      errors: [],
      summary: {
        total: 0,
        successful: 0,
        failed: 0,
        skipped: 0,
        byGroup: {},
        byStatus: {}
      }
    };
  }
  
  // Import the found files using the ImportService
  // We'll import from the project root to let the service handle the file processing
  const result = await ImportService.importFromDirectory(projectRoot, pattern, {
    overwrite: false
  });
  
  return result;
}