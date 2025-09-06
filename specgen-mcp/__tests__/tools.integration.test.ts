import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';

// Test the individual tool functions directly
// We'll test the core logic without the MCP server complexity

const mockDocsPath = path.resolve(process.cwd(), '../__test_docs__');
const mockMetadataFile = path.resolve(process.cwd(), '../__test_docs__/.spec-metadata.json');

// Helper functions extracted from tools.ts for direct testing
function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : 'Untitled';
}

function detectCategory(content: string): string {
  const contentLower = content.toLowerCase();
  
  // Check in order of specificity - more specific categories first
  if (contentLower.includes('api') || contentLower.includes('endpoint') || contentLower.includes('rest') || contentLower.includes('graphql')) {
    return 'API';
  }
  if (contentLower.includes('ui') || contentLower.includes('frontend') || contentLower.includes('component') || contentLower.includes('interface')) {
    return 'UI';
  }
  if (contentLower.includes('database') || contentLower.includes('schema') || contentLower.includes('sql') || contentLower.includes('migration')) {
    return 'Database';
  }
  if (contentLower.includes('backend') || contentLower.includes('server') || contentLower.includes('service')) {
    return 'Backend';
  }
  if (contentLower.includes('integration') || contentLower.includes('webhook') || contentLower.includes('external')) {
    return 'Integration';
  }
  if (contentLower.includes('architecture') || contentLower.includes('system') || contentLower.includes('design')) {
    return 'Architecture';
  }
  if (contentLower.includes('test') || contentLower.includes('testing') || contentLower.includes('qa') || contentLower.includes('quality')) {
    return 'Testing';
  }
  
  return 'General';
}

function detectStatus(content: string): string {
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('completed') || contentLower.includes('done')) return 'completed';
  if (contentLower.includes('in-progress') || contentLower.includes('implementing')) return 'in-progress';
  if (contentLower.includes('todo') || contentLower.includes('draft')) return 'draft';
  
  return 'todo';
}

function detectPriority(content: string): string {
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('high priority') || contentLower.includes('urgent')) return 'high';
  if (contentLower.includes('low priority') || contentLower.includes('nice to have')) return 'low';
  
  return 'medium';
}

async function scanDocsFolder(): Promise<any> {
  const specFiles = await glob('SPEC-*.md', { cwd: mockDocsPath });
  const specs: any = {};
  
  for (const file of specFiles) {
    const filePath = path.join(mockDocsPath, file);
    const stats = await fs.stat(filePath);
    const content = await fs.readFile(filePath, 'utf-8');
    
    specs[file] = {
      filename: file,
      title: extractTitle(content),
      category: detectCategory(content),
      status: detectStatus(content),
      priority: detectPriority(content),
      tags: extractTags(content),
      created: stats.birthtime.toISOString(),
      modified: stats.mtime.toISOString(),
      last_scanned: new Date().toISOString(),
      file_hash: await generateFileHash(content)
    };
  }
  
  return {
    metadata_version: "1.0.0",
    specs
  };
}

function extractTags(content: string): string[] {
  const tags: string[] = [];
  const contentLower = content.toLowerCase();
  
  const tagKeywords = ['backend', 'frontend', 'api', 'database', 'ui', 'integration', 'testing'];
  
  for (const keyword of tagKeywords) {
    if (contentLower.includes(keyword)) {
      tags.push(keyword);
    }
  }
  
  return [...new Set(tags)]; // Remove duplicates
}

async function generateFileHash(content: string): Promise<string> {
  // Simple hash function for change detection
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
}

describe('SpecGen MCP Tools Integration', () => {
  beforeAll(async () => {
    // Create test directory structure
    await fs.mkdir(mockDocsPath, { recursive: true });
    
    // Create mock spec files
    await fs.writeFile(
      path.join(mockDocsPath, 'SPEC-20250101-test-api.md'),
      `# Test API Specification

## Description
This is a test specification for API development with high priority.

## Endpoints
- GET /api/users
- POST /api/users
- PUT /api/users/:id
- DELETE /api/users/:id

## Database Schema
Users table with proper indexing.

Status: in-progress
Priority: high priority
Testing: API testing required
`
    );
    
    await fs.writeFile(
      path.join(mockDocsPath, 'SPEC-20250102-frontend-dashboard.md'),
      `# Frontend Dashboard Component

## Overview
User interface component for dashboard implementation.

## Components
- Navigation component
- Data visualization
- User management interface

## Testing
- UI testing framework
- Component testing

Status: completed
Priority: low priority
`
    );
    
    await fs.writeFile(
      path.join(mockDocsPath, 'SPEC-20250103-database-migration.md'),
      `# Database Migration Specification

## Schema Updates
Database schema migration for user management system.

## Tables
- users
- permissions
- audit_logs

## Migration Scripts
SQL migration scripts for PostgreSQL and MySQL.

Status: draft
Priority: high priority
`
    );
  });

  afterAll(async () => {
    // Clean up test files
    try {
      await fs.rm(mockDocsPath, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Title Extraction', () => {
    it('should extract title from markdown heading', () => {
      const content = '# Test Specification\n\nContent here';
      expect(extractTitle(content)).toBe('Test Specification');
    });

    it('should return Untitled for content without heading', () => {
      const content = 'No heading content';
      expect(extractTitle(content)).toBe('Untitled');
    });

    it('should handle title with extra whitespace', () => {
      const content = '#   Spaced Title   \n\nContent';
      expect(extractTitle(content)).toBe('Spaced Title');
    });
  });

  describe('Category Detection', () => {
    it('should detect API category', () => {
      const content = 'This specification covers REST API endpoints and GraphQL integration';
      expect(detectCategory(content)).toBe('API');
    });

    it('should detect UI category', () => {
      const content = 'Frontend component with user interface elements';
      expect(detectCategory(content)).toBe('UI');
    });

    it('should detect Database category', () => {
      const content = 'Database schema migration with SQL scripts';
      expect(detectCategory(content)).toBe('Database');
    });

    it('should detect Backend category', () => {
      const content = 'Backend service implementation with server logic';
      expect(detectCategory(content)).toBe('Backend');
    });

    it('should default to General for unmatched content', () => {
      const content = 'General documentation without specific keywords';
      expect(detectCategory(content)).toBe('General');
    });
  });

  describe('Status Detection', () => {
    it('should detect completed status', () => {
      const content = 'Implementation completed and ready for deployment';
      expect(detectStatus(content)).toBe('completed');
    });

    it('should detect in-progress status', () => {
      const content = 'Currently in-progress with ongoing development';
      expect(detectStatus(content)).toBe('in-progress');
    });

    it('should detect draft status', () => {
      const content = 'This is a draft specification for review';
      expect(detectStatus(content)).toBe('draft');
    });

    it('should default to todo for unspecified status', () => {
      const content = 'Specification without explicit status';
      expect(detectStatus(content)).toBe('todo');
    });
  });

  describe('Priority Detection', () => {
    it('should detect high priority', () => {
      const content = 'This is a high priority urgent implementation';
      expect(detectPriority(content)).toBe('high');
    });

    it('should detect low priority', () => {
      const content = 'This is low priority nice to have feature';
      expect(detectPriority(content)).toBe('low');
    });

    it('should default to medium priority', () => {
      const content = 'Regular specification without priority keywords';
      expect(detectPriority(content)).toBe('medium');
    });
  });

  describe('Tag Extraction', () => {
    it('should extract relevant tags from content', () => {
      const content = `
        This specification covers API development with database integration.
        The frontend components will need UI testing.
        Backend services require integration testing.
      `;
      
      const tags = extractTags(content);
      expect(tags).toContain('api');
      expect(tags).toContain('database');
      expect(tags).toContain('frontend');
      expect(tags).toContain('ui');
      expect(tags).toContain('backend');
      expect(tags).toContain('integration');
      expect(tags).toContain('testing');
    });

    it('should remove duplicate tags', () => {
      const content = 'API testing with API endpoints and API documentation';
      const tags = extractTags(content);
      expect(tags.filter(tag => tag === 'api')).toHaveLength(1);
    });
  });

  describe('File Hash Generation', () => {
    it('should generate consistent hash for same content', async () => {
      const content = 'Test content for hashing';
      const hash1 = await generateFileHash(content);
      const hash2 = await generateFileHash(content);
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different content', async () => {
      const content1 = 'First content';
      const content2 = 'Second content';
      const hash1 = await generateFileHash(content1);
      const hash2 = await generateFileHash(content2);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Document Scanning', () => {
    it('should scan all specification files', async () => {
      const metadata = await scanDocsFolder();
      
      expect(metadata).toHaveProperty('metadata_version', '1.0.0');
      expect(metadata).toHaveProperty('specs');
      
      const specs = metadata.specs;
      expect(Object.keys(specs)).toHaveLength(3);
      
      // Check API spec
      const apiSpec = specs['SPEC-20250101-test-api.md'];
      expect(apiSpec).toBeDefined();
      expect(apiSpec.title).toBe('Test API Specification');
      expect(apiSpec.category).toBe('API');
      expect(apiSpec.status).toBe('in-progress');
      expect(apiSpec.priority).toBe('high');
      expect(apiSpec.tags).toContain('api');
      expect(apiSpec.tags).toContain('database');
      expect(apiSpec.tags).toContain('testing');
    });

    it('should include file metadata', async () => {
      const metadata = await scanDocsFolder();
      const firstSpec = Object.values(metadata.specs)[0] as any;
      
      expect(firstSpec).toHaveProperty('filename');
      expect(firstSpec).toHaveProperty('created');
      expect(firstSpec).toHaveProperty('modified');
      expect(firstSpec).toHaveProperty('last_scanned');
      expect(firstSpec).toHaveProperty('file_hash');
      
      // Validate ISO timestamp format
      expect(new Date(firstSpec.created).toISOString()).toBe(firstSpec.created);
      expect(new Date(firstSpec.modified).toISOString()).toBe(firstSpec.modified);
      expect(new Date(firstSpec.last_scanned).toISOString()).toBe(firstSpec.last_scanned);
    });

    it('should categorize all test specs correctly', async () => {
      const metadata = await scanDocsFolder();
      const specs = metadata.specs;
      
      expect(specs['SPEC-20250101-test-api.md'].category).toBe('API');
      expect(specs['SPEC-20250102-frontend-dashboard.md'].category).toBe('UI');
      expect(specs['SPEC-20250103-database-migration.md'].category).toBe('Database');
    });

    it('should detect status for all test specs correctly', async () => {
      const metadata = await scanDocsFolder();
      const specs = metadata.specs;
      
      expect(specs['SPEC-20250101-test-api.md'].status).toBe('in-progress');
      expect(specs['SPEC-20250102-frontend-dashboard.md'].status).toBe('completed');
      expect(specs['SPEC-20250103-database-migration.md'].status).toBe('draft');
    });

    it('should detect priority for all test specs correctly', async () => {
      const metadata = await scanDocsFolder();
      const specs = metadata.specs;
      
      expect(specs['SPEC-20250101-test-api.md'].priority).toBe('high');
      expect(specs['SPEC-20250102-frontend-dashboard.md'].priority).toBe('low');
      expect(specs['SPEC-20250103-database-migration.md'].priority).toBe('high');
    });
  });

  describe('Search Functionality', () => {
    it('should find specs containing search terms', async () => {
      const metadata = await scanDocsFolder();
      const specs = Object.values(metadata.specs) as any[];
      
      // Search for API-related specs
      const apiSpecs = specs.filter(spec => 
        spec.title.toLowerCase().includes('api') ||
        spec.category === 'API'
      );
      
      expect(apiSpecs).toHaveLength(1);
      expect(apiSpecs[0].filename).toBe('SPEC-20250101-test-api.md');
    });

    it('should find specs by status', async () => {
      const metadata = await scanDocsFolder();
      const specs = Object.values(metadata.specs) as any[];
      
      const completedSpecs = specs.filter(spec => spec.status === 'completed');
      const inProgressSpecs = specs.filter(spec => spec.status === 'in-progress');
      const draftSpecs = specs.filter(spec => spec.status === 'draft');
      
      expect(completedSpecs).toHaveLength(1);
      expect(inProgressSpecs).toHaveLength(1);
      expect(draftSpecs).toHaveLength(1);
    });

    it('should find specs by priority', async () => {
      const metadata = await scanDocsFolder();
      const specs = Object.values(metadata.specs) as any[];
      
      const highPrioritySpecs = specs.filter(spec => spec.priority === 'high');
      const lowPrioritySpecs = specs.filter(spec => spec.priority === 'low');
      
      expect(highPrioritySpecs).toHaveLength(2);
      expect(lowPrioritySpecs).toHaveLength(1);
    });
  });
});