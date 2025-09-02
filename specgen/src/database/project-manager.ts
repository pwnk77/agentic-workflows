import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

/**
 * Manages project detection and database path resolution
 */
export class ProjectManager {
  /**
   * Detect the project root directory from current working directory
   * Priority: git root > package.json parent > current directory
   */
  static detectProject(cwd: string = process.cwd()): string {
    let currentDir = cwd;

    // Walk up directory tree
    while (currentDir !== dirname(currentDir)) {
      // Check for git root
      if (existsSync(join(currentDir, '.git'))) {
        return currentDir;
      }

      // Check for package.json
      if (existsSync(join(currentDir, 'package.json'))) {
        return currentDir;
      }

      // Move up one directory
      currentDir = dirname(currentDir);
    }

    // Fall back to current working directory
    return cwd;
  }

  /**
   * Get the .specgen directory path for a project
   */
  static getSpecgenDir(projectRoot: string): string {
    return join(projectRoot, '.specgen');
  }

  /**
   * Get the database path for a project
   */
  static getDatabasePath(projectRoot: string): string {
    const specgenDir = this.getSpecgenDir(projectRoot);
    return join(specgenDir, 'specgen.sqlite');
  }

  /**
   * Ensure the .specgen directory exists
   */
  static ensureSpecgenDir(projectRoot: string): string {
    const specgenDir = this.getSpecgenDir(projectRoot);
    
    if (!existsSync(specgenDir)) {
      mkdirSync(specgenDir, { recursive: true });
    }

    return specgenDir;
  }

  /**
   * Initialize a project for SpecGen use
   */
  static initializeProject(projectRoot?: string): string {
    const root = projectRoot || this.detectProject();
    const specgenDir = this.ensureSpecgenDir(root);
    const dbPath = this.getDatabasePath(root);
    
    return {
      projectRoot: root,
      specgenDir,
      databasePath: dbPath
    } as any;
  }

  /**
   * Check if a project is already initialized
   */
  static isProjectInitialized(projectRoot: string): boolean {
    const dbPath = this.getDatabasePath(projectRoot);
    return existsSync(dbPath);
  }

  /**
   * Get project metadata for display purposes
   */
  static getProjectInfo(projectRoot: string): ProjectInfo {
    const packageJsonPath = join(projectRoot, 'package.json');
    let projectName = 'unknown';
    let version = '0.0.0';

    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = require(packageJsonPath);
        projectName = packageJson.name || projectName;
        version = packageJson.version || version;
      } catch {
        // Ignore JSON parsing errors
      }
    }

    return {
      name: projectName,
      version,
      root: projectRoot,
      specgenDir: this.getSpecgenDir(projectRoot),
      databasePath: this.getDatabasePath(projectRoot),
      isInitialized: this.isProjectInitialized(projectRoot)
    };
  }
}

export interface ProjectInfo {
  name: string;
  version: string;
  root: string;
  specgenDir: string;
  databasePath: string;
  isInitialized: boolean;
}