import { readFileSync } from 'fs';
import { basename, extname } from 'path';

/**
 * Parser for extracting metadata from SPEC markdown files
 */
export class SpecParser {
  /**
   * Parse a SPEC file and extract metadata
   */
  static parseSpecFile(filePath: string): ParsedSpec {
    const content = readFileSync(filePath, 'utf-8');
    const filename = basename(filePath);
    
    return {
      title: this.extractTitle(content, filename),
      body_md: content,
      status: this.detectStatus(content),
      feature_group: this.detectGroup(content, filename, filePath),
      source_file: filePath
    };
  }

  /**
   * Extract title from content or filename
   */
  private static extractTitle(content: string, filename: string): string {
    // Try to find H1 title in content
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      return h1Match[1].trim();
    }

    // Try to find SPEC-YYYY-MM-DD-title pattern in filename
    const specMatch = filename.match(/SPEC-\d{4}-\d{2}-\d{2}-(.+)\.md$/i);
    if (specMatch) {
      return specMatch[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    // Fall back to filename without extension
    return basename(filename, extname(filename));
  }

  /**
   * Detect implementation status from content
   */
  private static detectStatus(content: string): SpecStatus {
    const lowerContent = content.toLowerCase();

    // Look for completion indicators
    if (this.hasCompletionMarkers(content)) {
      return 'done';
    }

    // Look for in-progress indicators
    if (lowerContent.includes('in progress') || 
        lowerContent.includes('in-progress') ||
        lowerContent.includes('implementing') ||
        lowerContent.includes('working on')) {
      return 'in-progress';
    }

    // Look for todo/task indicators
    if (lowerContent.includes('todo') || 
        lowerContent.includes('to do') ||
        this.hasTaskList(content) ||
        lowerContent.includes('implementation plan')) {
      return 'todo';
    }

    // Default to draft
    return 'draft';
  }

  /**
   * Detect feature group from content, filename, and file path
   */
  private static detectGroup(content: string, filename: string, filePath: string): string {
    // First priority: Extract category from subfolder path
    const pathCategory = this.extractCategoryFromPath(filePath);
    if (pathCategory) {
      return pathCategory;
    }

    const lowerContent = content.toLowerCase();
    const lowerFilename = filename.toLowerCase();

    // Second priority: Check filename patterns
    if (lowerFilename.includes('specgen') || lowerFilename.includes('spec-gen')) {
      return 'specgen';
    }
    
    if (lowerFilename.includes('learning') || lowerFilename.includes('research')) {
      return 'learning';
    }
    
    if (lowerFilename.includes('repository') || lowerFilename.includes('repo')) {
      return 'repository';
    }

    // Third priority: Check content patterns
    if (lowerContent.includes('specgen') || lowerContent.includes('spec management')) {
      return 'specgen';
    }
    
    if (lowerContent.includes('learning') || lowerContent.includes('research') || 
        lowerContent.includes('documentation') || lowerContent.includes('knowledge')) {
      return 'learning';
    }
    
    if (lowerContent.includes('repository') || lowerContent.includes('codebase') ||
        lowerContent.includes('git') || lowerContent.includes('version control')) {
      return 'repository';
    }

    // Fourth priority: Extract date-based grouping from filename
    const dateMatch = filename.match(/SPEC-(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      const [, year, month] = dateMatch;
      return `${year}-${month}`;
    }

    return 'general';
  }

  /**
   * Extract category from file path based on subfolder structure
   * Examples: 
   * - docs/articles/SPEC-*.md → 'articles'
   * - docs/authentication/SPEC-*.md → 'authentication'
   * - specs/database/SPEC-*.md → 'database'
   */
  private static extractCategoryFromPath(filePath: string): string | null {
    const pathParts = filePath.split(/[/\\]/).filter(part => part.length > 0);
    
    // Look for common documentation folders and their subfolders
    const docFolderIndex = pathParts.findIndex(part => 
      ['docs', 'specifications', 'specs', 'documentation'].includes(part.toLowerCase())
    );
    
    if (docFolderIndex >= 0 && docFolderIndex < pathParts.length - 1) {
      // Get the subfolder after the docs folder
      const category = pathParts[docFolderIndex + 1].toLowerCase();
      
      // Map common folder names to standardized categories
      const categoryMap: Record<string, string> = {
        'articles': 'articles',
        'auth': 'authentication',
        'authentication': 'authentication', 
        'database': 'database',
        'db': 'database',
        'debugging': 'debugging',
        'documentation': 'documentation',
        'docs': 'documentation',
        'platform': 'platform-overview',
        'platform-overview': 'platform-overview',
        'reports': 'reports',
        'scheduler': 'scheduler',
        'search': 'search-enhancement',
        'search-enhancement': 'search-enhancement',
        'system': 'system-infrastructure',
        'system-infrastructure': 'system-infrastructure',
        'infrastructure': 'system-infrastructure',
        'ui': 'ui-enhancements',
        'ui-enhancements': 'ui-enhancements',
        'frontend': 'ui-enhancements',
        'specgen': 'specgen',
        'learning': 'learning',
        'repository': 'repository',
        'repo': 'repository'
      };
      
      return categoryMap[category] || category;
    }
    
    // Fallback: Look for category-like folders anywhere in the path
    for (let i = pathParts.length - 2; i >= 0; i--) {
      const folder = pathParts[i].toLowerCase();
      if (folder !== 'spec' && folder !== 'specs' && folder !== 'specgen' && 
          folder.length > 2 && !folder.match(/^\d{4}-\d{2}$/)) {
        // This looks like a category folder
        const categoryMap: Record<string, string> = {
          'articles': 'articles',
          'auth': 'authentication',
          'authentication': 'authentication',
          'database': 'database',
          'db': 'database',
          'debugging': 'debugging',
          'documentation': 'documentation',
          'docs': 'documentation',
          'platform': 'platform-overview',
          'reports': 'reports',
          'scheduler': 'scheduler',
          'search': 'search-enhancement',
          'system': 'system-infrastructure',
          'infrastructure': 'system-infrastructure',
          'ui': 'ui-enhancements',
          'frontend': 'ui-enhancements'
        };
        
        return categoryMap[folder] || folder;
      }
    }
    
    return null;
  }

  /**
   * Check for completion markers in content
   */
  private static hasCompletionMarkers(content: string): boolean {
    const patterns = [
      /✅.*completed?/i,
      /✓.*completed?/i,
      /\[x\].*completed?/i,
      /status:?\s*(completed?|done|finished)/i,
      /implementation:?\s*(completed?|done|finished)/i,
      /## execution log/i, // Presence of execution log suggests completion
      /successfully implemented/i,
      /feature complete/i
    ];

    return patterns.some(pattern => pattern.test(content));
  }

  /**
   * Check for task lists in content
   */
  private static hasTaskList(content: string): boolean {
    const taskPatterns = [
      /- \[ \]/g, // Unchecked tasks
      /- \[x\]/gi, // Checked tasks
      /\d+\.\s+\[/g, // Numbered task lists
      /## implementation plan/i,
      /## task breakdown/i,
      /### task/i
    ];

    return taskPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Batch parse multiple SPEC files
   */
  static parseMultipleSpecs(filePaths: string[]): ParsedSpec[] {
    return filePaths.map(filePath => {
      try {
        return this.parseSpecFile(filePath);
      } catch (error) {
        console.warn(`Failed to parse ${filePath}:`, error);
        return null;
      }
    }).filter((spec): spec is ParsedSpec => spec !== null);
  }
}

export interface ParsedSpec {
  title: string;
  body_md: string;
  status: SpecStatus;
  feature_group: string;
  source_file: string;
}

export type SpecStatus = 'draft' | 'todo' | 'in-progress' | 'done';