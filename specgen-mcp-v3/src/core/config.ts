import * as path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect if running in global install context
function isGlobalInstall(): boolean {
  try {
    // Check if we're running from a global node_modules directory
    const packagePath = path.resolve(__dirname, '..');
    return packagePath.includes('/lib/node_modules/') || packagePath.includes('\\lib\\node_modules\\');
  } catch {
    return false;
  }
}

// Get current working directory - always where user runs the MCP command
function getCurrentWorkingDirectory(): string {
  try {
    return process.cwd(); // Always use where the user launched the MCP command
  } catch (error) {
    console.warn('Failed to get process.cwd(), falling back to __dirname:', error);
    return path.dirname(__dirname);
  }
}

// Configuration - Separate project paths from package paths
function getConfig() {
  const projectRoot = getCurrentWorkingDirectory(); // Where user runs MCP (always process.cwd())
  const isGlobal = isGlobalInstall();

  return {
    // Project paths - always relative to where user runs MCP command
    docsPath: path.resolve(projectRoot, 'docs'),
    metadataFile: path.resolve(projectRoot, 'docs/.spec-metadata.json'),

    // JSON Storage paths for v3.1 (safe from worktree pruning)
    specgenPath: path.resolve(projectRoot, '.specgen'),
    jsonSpecsPath: path.resolve(projectRoot, '.specgen/specs'),
    markdownSpecsPath: path.resolve(projectRoot, '.specgen/markdown'),
    backupsPath: path.resolve(projectRoot, '.specgen/backups'),

    // Dashboard path - depends on where package is installed
    dashboardPath: isGlobal
      ? path.resolve(__dirname, '..', 'specdash')    // Global: /opt/homebrew/lib/node_modules/specgen-mcp/specdash
      : path.resolve(projectRoot, '.specgen/specdash') // Local: project/.specgen/specdash
  };
}

export const CONFIG = getConfig();

// Backward compatibility
export const config = CONFIG;