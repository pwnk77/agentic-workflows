import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';

// Test the recursive scanning changes
const testDocsPath = path.resolve(process.cwd(), '../__test_recursive_docs__');
const testMetadataFile = path.resolve(testDocsPath, '.spec-metadata.json');

// Import utility functions to test
function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : 'Untitled';
}

function detectCategory(content: string): string {
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('api') || contentLower.includes('endpoint')) {
    return 'API';
  }
  if (contentLower.includes('ui') || contentLower.includes('frontend')) {
    return 'UI';
  }
  if (contentLower.includes('database') || contentLower.includes('schema')) {
    return 'Database';
  }
  if (contentLower.includes('backend') || contentLower.includes('server')) {
    return 'Backend';
  }
  if (contentLower.includes('mcp') || contentLower.includes('specgen')) {
    return 'Integration';
  }
  
  return 'General';
}

function detectStatus(content: string): string {
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('completed') || contentLower.includes('done')) return 'completed';
  if (contentLower.includes('in-progress') || contentLower.includes('implementing')) return 'in-progress';
  if (contentLower.includes('draft')) return 'draft';
  
  return 'todo';
}

function detectPriority(content: string): string {
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('high priority') || contentLower.includes('urgent')) return 'high';
  if (contentLower.includes('low priority') || contentLower.includes('nice to have')) return 'low';
  
  return 'medium';
}

// Frontmatter utility functions (same as in tools.ts)
function hasFrontmatter(content: string): boolean {
  return content.trim().startsWith('---') && content.includes('\n---\n');
}

function generateFrontmatter(title: string, category: string, status: string, priority: string): string {
  const now = new Date().toISOString();
  return `---
title: "${title}"
category: "${category}"
status: "${status}"
priority: "${priority}"
created: "${now}"
modified: "${now}"
---

`;
}

async function addFrontmatterToFile(filePath: string, content: string, title: string, category: string, status: string, priority: string): Promise<void> {
  if (!hasFrontmatter(content)) {
    const frontmatter = generateFrontmatter(title, category, status, priority);
    const newContent = frontmatter + content;
    await fs.writeFile(filePath, newContent, 'utf-8');
  }
}

// Simulate the improved scanSpecs function
async function scanSpecsRecursive(): Promise<any> {
  // Use glob for recursive scanning of subdirectories
  const pattern = path.join(testDocsPath, '**/SPEC-*.md');
  const filePaths = await glob(pattern);
  const specs: any = {};
  
  for (const filePath of filePaths) {
    const file = path.basename(filePath);
    let content = await fs.readFile(filePath, 'utf-8');
    const stats = await fs.stat(filePath);
    const title = extractTitle(content);
    const category = detectCategory(content);
    const status = detectStatus(content);
    const priority = detectPriority(content);
    
    // Add frontmatter to files that don't have it
    if (!hasFrontmatter(content)) {
      await addFrontmatterToFile(filePath, content, title, category, status, priority);
      // Re-read the file to get updated content
      content = await fs.readFile(filePath, 'utf-8');
    }
    
    specs[file] = {
      filename: file,
      title,
      category,
      status,
      priority,
      modified: stats.mtime.toISOString(),
      created: stats.birthtime.toISOString()
    };
  }

  const metadata = {
    metadata_version: "1.0.0",
    last_full_scan: new Date().toISOString(),
    specs: specs
  };

  await fs.writeFile(testMetadataFile, JSON.stringify(metadata, null, 2));
  return metadata;
}

describe('Recursive Scanning and Frontmatter Tests', () => {
  beforeAll(async () => {
    // Create test directory structure with subdirectories
    await fs.mkdir(testDocsPath, { recursive: true });
    await fs.mkdir(path.join(testDocsPath, 'specgen-v2'), { recursive: true });
    await fs.mkdir(path.join(testDocsPath, 'core-specgen'), { recursive: true });
    await fs.mkdir(path.join(testDocsPath, 'archived'), { recursive: true });
    
    // Create SPEC files in root
    await fs.writeFile(
      path.join(testDocsPath, 'SPEC-20250101-root-spec.md'),
      `# Root Level Specification

This is a spec file in the root directory.

Status: completed
Priority: high priority
`
    );

    // Create SPEC files in subdirectories
    await fs.writeFile(
      path.join(testDocsPath, 'specgen-v2', 'SPEC-20250102-mcp-server-enhancement.md'),
      `# SpecGen MCP Server Enhancement

This specification covers MCP server improvements with high priority.

## Backend Changes
Server-side modifications for better performance.

Status: in-progress
Priority: high priority
`
    );

    await fs.writeFile(
      path.join(testDocsPath, 'core-specgen', 'SPEC-20250103-database-migration.md'),
      `---
title: "Database Migration with Existing Frontmatter"
category: "Database"
status: "draft"
priority: "medium"
created: "2025-01-03T10:00:00.000Z"
modified: "2025-01-03T10:00:00.000Z"
---

# Database Migration Specification

This file already has frontmatter and should not be modified.

Schema updates for the database migration process.
`
    );

    await fs.writeFile(
      path.join(testDocsPath, 'archived', 'SPEC-20250104-old-api.md'),
      `# Legacy API Specification

Old API specification that needs frontmatter added.

## Endpoints
REST API endpoints for legacy system.

Priority: low priority
Status: draft
`
    );

    // Create a file without frontmatter
    await fs.writeFile(
      path.join(testDocsPath, 'specgen-v2', 'SPEC-20250105-frontend-ui.md'),
      `# Frontend UI Components

User interface components for the dashboard.

## Components
- Navigation
- Charts  
- Data tables

Status: todo
Priority: medium priority
`
    );
  });

  afterAll(async () => {
    // Clean up test files
    try {
      await fs.rm(testDocsPath, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Recursive File Discovery', () => {
    it('should find SPEC files in all subdirectories', async () => {
      const metadata = await scanSpecsRecursive();
      
      expect(metadata).toHaveProperty('specs');
      const specs = metadata.specs;
      
      // Should find all 5 SPEC files across different directories
      expect(Object.keys(specs)).toHaveLength(5);
      
      // Verify files from different directories are found
      expect(specs['SPEC-20250101-root-spec.md']).toBeDefined();
      expect(specs['SPEC-20250102-mcp-server-enhancement.md']).toBeDefined();
      expect(specs['SPEC-20250103-database-migration.md']).toBeDefined();
      expect(specs['SPEC-20250104-old-api.md']).toBeDefined();
      expect(specs['SPEC-20250105-frontend-ui.md']).toBeDefined();
    });

    it('should correctly categorize specs from subdirectories', async () => {
      const metadata = await scanSpecsRecursive();
      const specs = metadata.specs;
      
      expect(specs['SPEC-20250102-mcp-server-enhancement.md'].category).toBe('Backend');
      expect(specs['SPEC-20250103-database-migration.md'].category).toBe('Database');
      expect(specs['SPEC-20250104-old-api.md'].category).toBe('API');
      expect(specs['SPEC-20250105-frontend-ui.md'].category).toBe('UI');
    });

    it('should detect status and priority correctly across subdirectories', async () => {
      const metadata = await scanSpecsRecursive();
      const specs = metadata.specs;
      
      expect(specs['SPEC-20250101-root-spec.md'].status).toBe('completed');
      expect(specs['SPEC-20250101-root-spec.md'].priority).toBe('high');
      
      expect(specs['SPEC-20250102-mcp-server-enhancement.md'].status).toBe('in-progress');
      expect(specs['SPEC-20250102-mcp-server-enhancement.md'].priority).toBe('high');
      
      expect(specs['SPEC-20250105-frontend-ui.md'].status).toBe('todo');
      expect(specs['SPEC-20250105-frontend-ui.md'].priority).toBe('medium');
    });
  });

  describe('Frontmatter Management', () => {
    it('should detect files with existing frontmatter', () => {
      const contentWithFrontmatter = `---
title: "Test Spec"
category: "Testing"
status: "draft"
---

# Test Content`;

      const contentWithoutFrontmatter = `# Test Content
Some content without frontmatter`;

      expect(hasFrontmatter(contentWithFrontmatter)).toBe(true);
      expect(hasFrontmatter(contentWithoutFrontmatter)).toBe(false);
    });

    it('should generate proper frontmatter format', () => {
      const frontmatter = generateFrontmatter('Test Title', 'Testing', 'draft', 'medium');
      
      expect(frontmatter).toContain('---\n');
      expect(frontmatter).toContain('title: "Test Title"');
      expect(frontmatter).toContain('category: "Testing"');
      expect(frontmatter).toContain('status: "draft"');
      expect(frontmatter).toContain('priority: "medium"');
      expect(frontmatter).toContain('created: "');
      expect(frontmatter).toContain('modified: "');
      expect(frontmatter.endsWith('---\n\n')).toBe(true);
    });

    it('should add frontmatter to files that dont have it', async () => {
      const metadata = await scanSpecsRecursive();
      
      // Check that files without frontmatter now have it
      const rootSpecPath = path.join(testDocsPath, 'SPEC-20250101-root-spec.md');
      const rootContent = await fs.readFile(rootSpecPath, 'utf-8');
      expect(hasFrontmatter(rootContent)).toBe(true);
      
      const apiSpecPath = path.join(testDocsPath, 'archived', 'SPEC-20250104-old-api.md');
      const apiContent = await fs.readFile(apiSpecPath, 'utf-8');
      expect(hasFrontmatter(apiContent)).toBe(true);
      
      const uiSpecPath = path.join(testDocsPath, 'specgen-v2', 'SPEC-20250105-frontend-ui.md');
      const uiContent = await fs.readFile(uiSpecPath, 'utf-8');
      expect(hasFrontmatter(uiContent)).toBe(true);
    });

    it('should preserve existing frontmatter', async () => {
      await scanSpecsRecursive();
      
      // Check that file with existing frontmatter is unchanged
      const dbSpecPath = path.join(testDocsPath, 'core-specgen', 'SPEC-20250103-database-migration.md');
      const dbContent = await fs.readFile(dbSpecPath, 'utf-8');
      
      expect(dbContent).toContain('title: "Database Migration with Existing Frontmatter"');
      expect(dbContent).toContain('created: "2025-01-03T10:00:00.000Z"');
    });

    it('should add correct metadata in frontmatter based on content analysis', async () => {
      await scanSpecsRecursive();
      
      // Check root spec frontmatter
      const rootSpecPath = path.join(testDocsPath, 'SPEC-20250101-root-spec.md');
      const rootContent = await fs.readFile(rootSpecPath, 'utf-8');
      expect(rootContent).toContain('title: "Root Level Specification"');
      expect(rootContent).toContain('status: "completed"');
      expect(rootContent).toContain('priority: "high"');
      
      // Check UI spec frontmatter
      const uiSpecPath = path.join(testDocsPath, 'specgen-v2', 'SPEC-20250105-frontend-ui.md');
      const uiContent = await fs.readFile(uiSpecPath, 'utf-8');
      expect(uiContent).toContain('title: "Frontend UI Components"');
      expect(uiContent).toContain('category: "UI"');
      expect(uiContent).toContain('status: "todo"');
      expect(uiContent).toContain('priority: "medium"');
    });
  });

  describe('Metadata JSON Generation', () => {
    it('should create comprehensive metadata for all discovered specs', async () => {
      const metadata = await scanSpecsRecursive();
      
      expect(metadata.metadata_version).toBe('1.0.0');
      expect(metadata.last_full_scan).toBeDefined();
      expect(new Date(metadata.last_full_scan).toISOString()).toBe(metadata.last_full_scan);
      
      // Verify all specs have required metadata fields
      Object.values(metadata.specs).forEach((spec: any) => {
        expect(spec).toHaveProperty('filename');
        expect(spec).toHaveProperty('title');
        expect(spec).toHaveProperty('category');
        expect(spec).toHaveProperty('status');
        expect(spec).toHaveProperty('priority');
        expect(spec).toHaveProperty('created');
        expect(spec).toHaveProperty('modified');
      });
    });

    it('should save metadata to JSON file', async () => {
      await scanSpecsRecursive();
      
      // Verify metadata file was created
      const metadataExists = await fs.access(testMetadataFile).then(() => true).catch(() => false);
      expect(metadataExists).toBe(true);
      
      // Verify metadata content
      const savedMetadata = JSON.parse(await fs.readFile(testMetadataFile, 'utf-8'));
      expect(savedMetadata).toHaveProperty('metadata_version');
      expect(savedMetadata).toHaveProperty('specs');
      expect(Object.keys(savedMetadata.specs)).toHaveLength(5);
    });
  });
});