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
      feature_group: this.detectGroup(content, filename),
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
   * Detect feature group from content and filename
   */
  private static detectGroup(content: string, filename: string): string {
    const lowerContent = content.toLowerCase();
    const lowerFilename = filename.toLowerCase();

    // Check filename patterns
    if (lowerFilename.includes('specgen') || lowerFilename.includes('spec-gen')) {
      return 'specgen';
    }
    
    if (lowerFilename.includes('learning') || lowerFilename.includes('research')) {
      return 'learning';
    }
    
    if (lowerFilename.includes('repository') || lowerFilename.includes('repo')) {
      return 'repository';
    }

    // Check content patterns
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

    // Extract date-based grouping from filename
    const dateMatch = filename.match(/SPEC-(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      const [, year, month] = dateMatch;
      return `${year}-${month}`;
    }

    return 'general';
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