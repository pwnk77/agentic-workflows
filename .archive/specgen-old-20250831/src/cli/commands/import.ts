import { Command } from 'commander';
import { ImportService } from '../../services/import.service';
import { ProjectService } from '../../services/project.service';

export function createImportCommand(): Command {
  const cmd = new Command('import');
  
  cmd
    .description('Import SPEC files into the project database')
    .argument('<directory>', 'Directory containing SPEC files')
    .argument('[pattern]', 'File pattern to match', 'SPEC-*.md')
    .option('--overwrite', 'Overwrite existing specs with same title', false)
    .option('--stop-on-error', 'Stop import on first error', false)
    .option('--dry-run', 'Show what would be imported without actually importing', false)
    .action(async (directory: string, pattern?: string, options?: {
      overwrite?: boolean;
      stopOnError?: boolean;
      dryRun?: boolean;
    }) => {
      try {
        // Check if project is initialized
        if (!ProjectService.isInInitializedProject()) {
          console.error('❌ Project not initialized. Run "specgen init" first.');
          process.exit(1);
        }

        const opts = options || {};
        console.log(`📥 Importing SPEC files from: ${directory}`);
        console.log(`🔍 Pattern: ${pattern || 'SPEC-*.md'}`);
        
        if (opts.dryRun) {
          console.log('🔄 Dry run mode - no files will be imported');
        }

        if (opts.overwrite) {
          console.log('⚠️  Overwrite mode enabled');
        }

        console.log('');

        const result = await ImportService.importFromDirectory(directory, pattern, {
          overwrite: opts.overwrite,
          stopOnError: opts.stopOnError,
          dryRun: opts.dryRun
        });

        if (!result.success) {
          console.error(`❌ ${result.message}`);
          if (result.errors.length > 0) {
            console.log('\nErrors:');
            result.errors.forEach(error => console.log(`  • ${error}`));
          }
          process.exit(1);
        }

        console.log(`✅ ${result.message}`);
        console.log('');
        
        // Show summary
        const summary = result.summary;
        console.log('📊 Import Summary:');
        console.log(`   Total files: ${summary.total}`);
        console.log(`   ✅ Successful: ${summary.successful}`);
        
        if (summary.failed > 0) {
          console.log(`   ❌ Failed: ${summary.failed}`);
        }
        
        if (summary.skipped > 0) {
          console.log(`   ⏭️  Skipped: ${summary.skipped}`);
        }

        // Show grouping breakdown
        if (Object.keys(summary.byGroup).length > 0) {
          console.log('');
          console.log('📁 By Feature Group:');
          Object.entries(summary.byGroup).forEach(([group, count]) => {
            console.log(`   ${group}: ${count} specs`);
          });
        }

        // Show status breakdown  
        if (Object.keys(summary.byStatus).length > 0) {
          console.log('');
          console.log('📋 By Status:');
          Object.entries(summary.byStatus).forEach(([status, count]) => {
            const icon = getStatusIcon(status);
            console.log(`   ${icon} ${status}: ${count} specs`);
          });
        }

        // Show imported files details
        if (result.imported.length > 0 && result.imported.length <= 10) {
          console.log('');
          console.log('📄 Imported Files:');
          result.imported.forEach(spec => {
            const icon = getStatusIcon(spec.status);
            console.log(`   ${icon} ${spec.title} (${spec.feature_group})`);
          });
        }

        // Show errors if any
        if (result.errors.length > 0) {
          console.log('');
          console.log('⚠️  Warnings/Errors:');
          result.errors.slice(0, 5).forEach(error => {
            console.log(`   • ${error}`);
          });
          
          if (result.errors.length > 5) {
            console.log(`   ... and ${result.errors.length - 5} more`);
          }
        }
      } catch (error) {
        console.error('❌ Import failed:', error instanceof Error ? error.message : String(error));
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