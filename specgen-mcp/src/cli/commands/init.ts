import { Command } from 'commander';
import { fileSpecService } from '../../services/file-spec.service.js';
import { glob } from 'glob';
import { existsSync, cpSync, chmodSync, readdirSync, statSync } from 'fs';
import path from 'path';
import fs from 'fs/promises';

export function createInitCommand(): Command {
  const cmd = new Command('init');
  
  cmd
    .description('Initialize a new file-based SpecGen project')
    .argument('[directory]', 'Project directory to initialize (defaults to current directory)')
    .option('-f, --force', 'Force initialization even if project already exists')
    .option('--discover', 'Automatically discover and import existing SPEC files during initialization')
    .option('--import-pattern <pattern>', 'Pattern to match SPEC files during discovery (default: SPEC-*.md)', 'SPEC-*.md')
    .action(async (directory?: string, options?: { force?: boolean; discover?: boolean; importPattern?: string }) => {
      try {
        console.log('🚀 Initializing file-based SpecGen project...');
        
        const projectRoot = directory || process.cwd();
        process.chdir(projectRoot);
        
        // Initialize the file-based system
        await fileSpecService.initialize();
        
        console.log('✅ File-based SpecGen project initialized successfully');
        console.log(`📁 Project directory: ${projectRoot}`);
        console.log(`📋 Metadata file: ${path.join(projectRoot, 'specs-metadata.json')}`);
        console.log(`📂 Specs directory: ${path.join(projectRoot, 'docs')}`);
        console.log('');
        
        // Auto-discover and import existing SPEC files if requested
        if (options?.discover) {
          console.log('🔍 Discovering existing SPEC files...');
          
          try {
            const result = await discoverAndImportSpecs(projectRoot, options.importPattern || 'SPEC-*.md');
            
            if (result.success && result.imported > 0) {
              console.log(`✅ Imported ${result.imported} SPEC files`);
              console.log(`📊 Found specifications in ${result.categories} categories`);
            } else if (result.success && result.imported === 0) {
              console.log('ℹ️  No SPEC files found to import');
            } else {
              console.warn('⚠️  Some issues occurred during discovery');
            }
          } catch (error) {
            console.warn('⚠️  Failed to discover SPEC files:', error instanceof Error ? error.message : String(error));
          }
        }

        // Setup .claude folder if needed
        try {
          await setupClaudeFolder(projectRoot);
        } catch (error) {
          console.warn('⚠️  Failed to setup Claude Code configuration:', error instanceof Error ? error.message : String(error));
        }

        // Show project stats
        try {
          const metadata = await fileSpecService.loadMetadata();
          const specCount = Object.keys(metadata.specs).length;
          if (specCount > 0) {
            console.log('📊 Project stats:');
            console.log(`   Total specs: ${specCount}`);
            
            // Count by category
            const categoryCount: Record<string, number> = {};
            Object.values(metadata.specs).forEach(spec => {
              const category = spec.category || 'uncategorized';
              categoryCount[category] = (categoryCount[category] || 0) + 1;
            });
            
            console.log('   Categories:');
            Object.entries(categoryCount).forEach(([category, count]) => {
              console.log(`     ${category}: ${count} specs`);
            });
          }
        } catch {
          // Ignore stats errors on init
        }

        console.log('');
        console.log('Next steps:');
        console.log('  • Add existing SPEC files: specgen init --discover');
        console.log('  • Launch dashboard: Use mcp__specgen-mcp__launch_dashboard tool (port 4567)');
        console.log('  • Use architect command to create new specs');
        console.log('  • Use engineer command to implement specs');
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
    const searchPath = dir === '.' ? projectRoot : path.join(projectRoot, dir);
    
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
      imported: 0,
      categories: 0
    };
  }
  
  // Import found files by organizing them
  let importedCount = 0;
  const categories = new Set<string>();
  
  for (const filePath of foundFiles) {
    try {
      // Read the file and extract frontmatter
      const content = await fs.readFile(filePath, 'utf-8');
      // const lines = content.split('\n'); // Unused variable
      
      // Extract title from filename or content
      const filename = path.basename(filePath, '.md');
      let title = filename;
      
      // Try to extract title from first heading
      const titleMatch = content.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        title = titleMatch[1];
      }
      
      // Detect category from file path or content
      let category = 'general';
      const pathParts = filePath.split('/');
      if (pathParts.length > 2) {
        category = pathParts[pathParts.length - 2]; // parent directory name
      }
      
      // Try to extract frontmatter category
      if (content.includes('---')) {
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (frontmatterMatch) {
          const categoryMatch = frontmatterMatch[1].match(/category:\s*['"]?([^'"]+)['"]?/);
          if (categoryMatch) {
            category = categoryMatch[1];
          }
        }
      }
      
      categories.add(category);
      importedCount++;
      
      console.log(`   📄 ${title} (${category})`);
    } catch (error) {
      console.warn(`   ⚠️  Failed to process ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  // Organization of existing specs is handled automatically by the service during setupProject()
  
  return {
    success: true,
    imported: importedCount,
    categories: categories.size
  };
}

/**
 * Setup .claude folder with Claude Code configuration in the project directory
 */
async function setupClaudeFolder(projectRoot: string) {
  const claudeDir = path.join(projectRoot, '.claude');
  const agentsDir = path.join(claudeDir, 'agents');
  const commandsDir = path.join(claudeDir, 'commands');
  
  // Check if our specific configuration exists (not just the .claude folder)
  if (existsSync(agentsDir) && existsSync(commandsDir)) {
    console.log(`ℹ️  Claude Code configuration already exists at ${projectRoot}/.claude`);
    return;
  }
  
  console.log('🔧 Setting up Claude Code configuration...');
  
  // Use bundled configuration from the package
  // Get the directory where this script is running from (dist/cli/commands/)
  const moduleDir = path.dirname(path.dirname(path.dirname(import.meta.url.replace('file://', ''))));
  const sourcePath = path.join(moduleDir, 'config');
  
  if (!existsSync(sourcePath)) {
    console.log('⚠️  Bundled Claude Code configuration not found - skipping setup');
    console.log(`   Expected at: ${sourcePath}`);
    return;
  }
  
  try {
    // Copy the entire claude-code directory to project/.claude
    cpSync(sourcePath, claudeDir, { recursive: true });
    
    // Make hook scripts executable
    const hooksDir = path.join(claudeDir, 'hooks');
    if (existsSync(hooksDir)) {
      const hookFiles = readdirSync(hooksDir);
      for (const hookFile of hookFiles) {
        const hookPath = path.join(hooksDir, hookFile);
        const stat = statSync(hookPath);
        if (stat.isFile() && hookFile.endsWith('.sh')) {
          chmodSync(hookPath, '755');
        }
      }
    }
    
    console.log(`✅ Claude Code configuration copied to ${projectRoot}/.claude`);
    console.log('   • Commands, agents, and hooks are now available');
    console.log('   • Hook scripts have been made executable');
  } catch (error) {
    throw new Error(`Failed to copy Claude Code configuration: ${error instanceof Error ? error.message : String(error)}`);
  }
}