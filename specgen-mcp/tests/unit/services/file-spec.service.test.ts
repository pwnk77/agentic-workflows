import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import * as fs from 'fs/promises';
import * as path from 'path';
import { FileSpecService, CreateSpecData, UpdateSpecData } from '../../../src/services/file-spec.service.js';

// Mock fs module
jest.mock('fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('FileSpecService', () => {
  let fileSpecService: FileSpecService;
  const testDocsPath = 'test-docs';
  const testMetadataPath = 'test-specs-metadata.json';

  beforeEach(() => {
    fileSpecService = new FileSpecService();
    (fileSpecService as any).docsPath = testDocsPath;
    (fileSpecService as any).metadataPath = testMetadataPath;
    
    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clear cache
    (fileSpecService as any).metadataCache = null;
  });

  describe('initialization', () => {
    it('should create folder structure on initialization', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.readFile.mockRejectedValue(new Error('File not found'));
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.rename.mockResolvedValue(undefined);

      await fileSpecService.initialize();

      expect(mockFs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('draft/general'),
        { recursive: true }
      );
      expect(mockFs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('todo/authentication'),
        { recursive: true }
      );
    });

    it('should create empty metadata if file does not exist', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.readFile.mockRejectedValue(new Error('File not found'));
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.rename.mockResolvedValue(undefined);

      await fileSpecService.initialize();

      const writeCall = mockFs.writeFile.mock.calls.find(call => 
        (call[0] as string).includes('metadata')
      );
      
      expect(writeCall).toBeDefined();
      const metadataContent = JSON.parse(writeCall![1] as string);
      expect(metadataContent.version).toBe('2.0.0');
      expect(metadataContent.next_id).toBe(1);
    });

    it('should load existing metadata if file exists', async () => {
      const existingMetadata = {
        version: '2.0.0',
        project: {
          name: 'Test Project',
          description: 'Test',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        settings: {
          auto_organize: true,
          default_status: 'draft',
          default_priority: 'medium',
          categories: ['general']
        },
        specs: {},
        next_id: 5,
        search_index: {
          version: '1.0.0',
          last_rebuilt: '2024-01-01T00:00:00Z',
          token_count: 0
        }
      };

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.readFile.mockResolvedValue(JSON.stringify(existingMetadata));

      await fileSpecService.initialize();

      const metadata = await fileSpecService.loadMetadata();
      expect(metadata.next_id).toBe(6); // Auto-incremented by organize process
      expect(metadata.project.name).toBe('Test Project');
    });
  });

  describe('createSpec', () => {
    it('should create a new specification with auto-detected category', async () => {
      const mockMetadata = {
        version: '2.0.0',
        project: {
          name: 'Test',
          description: 'Test',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        settings: {
          auto_organize: true,
          default_status: 'draft',
          default_priority: 'medium',
          categories: ['general', 'authentication']
        },
        specs: {},
        next_id: 1,
        search_index: {
          version: '1.0.0',
          last_rebuilt: '2024-01-01T00:00:00Z',
          token_count: 0
        }
      };

      (fileSpecService as any).metadataCache = mockMetadata;
      
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.rename.mockResolvedValue(undefined);

      const createData: CreateSpecData = {
        title: 'User Authentication',
        body_md: 'This spec covers user login and signup functionality with OAuth support.',
        status: 'draft'
      };

      const spec = await fileSpecService.createSpec(createData);

      expect(spec.title).toBe('User Authentication');
      expect(spec.id).toBe(1);
      expect(spec.category).toBe('authentication'); // Should auto-detect
      expect(spec.status).toBe('draft');

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('draft/authentication/SPEC-001-user-authentication.md'),
        expect.stringContaining('---'),
        'utf-8'
      );
    });

    it('should use provided category instead of auto-detection', async () => {
      const mockMetadata = {
        version: '2.0.0',
        project: {
          name: 'Test',
          description: 'Test',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        settings: {
          auto_organize: true,
          default_status: 'draft',
          default_priority: 'medium',
          categories: ['general', 'custom']
        },
        specs: {},
        next_id: 1,
        search_index: {
          version: '1.0.0',
          last_rebuilt: '2024-01-01T00:00:00Z',
          token_count: 0
        }
      };

      (fileSpecService as any).metadataCache = mockMetadata;
      
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.rename.mockResolvedValue(undefined);

      const createData: CreateSpecData = {
        title: 'Test Spec',
        body_md: 'Content here',
        category: 'custom'
      };

      const spec = await fileSpecService.createSpec(createData);

      expect(spec.category).toBe('custom');
      
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('draft/custom/SPEC-001-test-spec.md'),
        expect.any(String),
        'utf-8'
      );
    });

    it('should generate proper markdown with frontmatter', async () => {
      const mockMetadata = {
        version: '2.0.0',
        project: {
          name: 'Test',
          description: 'Test',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        settings: {
          auto_organize: true,
          default_status: 'draft',
          default_priority: 'medium',
          categories: ['general']
        },
        specs: {},
        next_id: 1,
        search_index: {
          version: '1.0.0',
          last_rebuilt: '2024-01-01T00:00:00Z',
          token_count: 0
        }
      };

      (fileSpecService as any).metadataCache = mockMetadata;
      
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.rename.mockResolvedValue(undefined);

      const createData: CreateSpecData = {
        title: 'Test Spec',
        body_md: '# Test Spec\n\nThis is test content.',
        related_specs: [2, 3],
        priority: 'high'
      };

      await fileSpecService.createSpec(createData);

      const writeCall = mockFs.writeFile.mock.calls.find(call => 
        (call[0] as string).includes('.md')
      );
      
      expect(writeCall).toBeDefined();
      const markdownContent = writeCall![1] as string;
      
      expect(markdownContent).toMatch(/^---\n/);
      expect(markdownContent).toContain('id: 1');
      expect(markdownContent).toContain('title: "Test Spec"');
      expect(markdownContent).toContain('priority: "high"');
      expect(markdownContent).toContain('related_specs: [2, 3]');
      expect(markdownContent).toContain('---\n\n# Test Spec\n\nThis is test content.');
    });
  });

  describe('updateSpec', () => {
    it('should update existing specification', async () => {
      const existingSpec = {
        id: 1,
        title: 'Original Title',
        status: 'draft',
        category: 'general',
        priority: 'medium',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_via: 'test',
        related_specs: [],
        parent_spec_id: null,
        tags: [],
        effort_estimate: null,
        completion: 0
      };

      const mockMetadata = {
        version: '2.0.0',
        project: {
          name: 'Test',
          description: 'Test',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        settings: {
          auto_organize: true,
          default_status: 'draft',
          default_priority: 'medium',
          categories: ['general']
        },
        specs: {
          '1': {
            id: 1,
            title: 'Original Title',
            status: 'draft',
            category: 'general',
            file_path: 'test-docs/draft/general/SPEC-001-original-title.md',
            file_size: 100,
            checksum: 'abc123',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        },
        next_id: 2,
        search_index: {
          version: '1.0.0',
          last_rebuilt: '2024-01-01T00:00:00Z',
          token_count: 0
        }
      };

      (fileSpecService as any).metadataCache = mockMetadata;

      const existingContent = `---
id: 1
title: "Original Title"
status: "draft"
category: "general"
priority: "medium"
created_at: "2024-01-01T00:00:00Z"
updated_at: "2024-01-01T00:00:00Z"
created_via: "test"
related_specs: []
parent_spec_id: null
tags: []
effort_estimate: null
completion: 0
---

# Original Title

Original content here.`;

      mockFs.readFile.mockResolvedValue(existingContent);
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.rename.mockResolvedValue(undefined);

      const updates: UpdateSpecData = {
        title: 'Updated Title',
        status: 'in-progress',
        body_md: '# Updated Title\n\nUpdated content here.'
      };

      const updatedSpec = await fileSpecService.updateSpec(1, updates);

      expect(updatedSpec.title).toBe('Updated Title');
      expect(updatedSpec.status).toBe('in-progress');
      expect(updatedSpec.body_md).toBe('# Updated Title\n\nUpdated content here.');

      // Should write to new location due to status change
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('in-progress/general/SPEC-001-updated-title.md'),
        expect.any(String),
        'utf-8'
      );
    });

    it('should handle file moves when status or category changes', async () => {
      const mockMetadata = {
        version: '2.0.0',
        project: {
          name: 'Test',
          description: 'Test',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        settings: {
          auto_organize: true,
          default_status: 'draft',
          default_priority: 'medium',
          categories: ['general', 'authentication']
        },
        specs: {
          '1': {
            id: 1,
            title: 'Test Spec',
            status: 'draft',
            category: 'general',
            file_path: 'test-docs/draft/general/SPEC-001-test-spec.md',
            file_size: 100,
            checksum: 'abc123',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        },
        next_id: 2,
        search_index: {
          version: '1.0.0',
          last_rebuilt: '2024-01-01T00:00:00Z',
          token_count: 0
        }
      };

      (fileSpecService as any).metadataCache = mockMetadata;

      const existingContent = `---
id: 1
title: "Test Spec"
status: "draft"
category: "general"
priority: "medium"
created_at: "2024-01-01T00:00:00Z"
updated_at: "2024-01-01T00:00:00Z"
created_via: "test"
related_specs: []
parent_spec_id: null
tags: []
effort_estimate: null
completion: 0
---

# Test Spec

Content here.`;

      mockFs.readFile.mockResolvedValue(existingContent);
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.unlink.mockResolvedValue(undefined);
      mockFs.rename.mockResolvedValue(undefined);

      const updates: UpdateSpecData = {
        status: 'todo',
        category: 'authentication'
      };

      await fileSpecService.updateSpec(1, updates);

      // Should write to new location
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        'test-docs/todo/authentication/SPEC-001-test-spec.md',
        expect.any(String),
        'utf-8'
      );

      // Should remove old file
      expect(mockFs.unlink).toHaveBeenCalledWith(
        'test-docs/draft/general/SPEC-001-test-spec.md'
      );
    });
  });

  describe('getSpecById', () => {
    it('should return null for non-existent spec', async () => {
      const mockMetadata = {
        version: '2.0.0',
        project: {
          name: 'Test',
          description: 'Test',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        settings: {
          auto_organize: true,
          default_status: 'draft',
          default_priority: 'medium',
          categories: ['general']
        },
        specs: {},
        next_id: 1,
        search_index: {
          version: '1.0.0',
          last_rebuilt: '2024-01-01T00:00:00Z',
          token_count: 0
        }
      };

      (fileSpecService as any).metadataCache = mockMetadata;

      const spec = await fileSpecService.getSpecById(999);
      expect(spec).toBeNull();
    });

    it('should return spec with parsed frontmatter and body', async () => {
      const mockMetadata = {
        version: '2.0.0',
        project: {
          name: 'Test',
          description: 'Test',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        settings: {
          auto_organize: true,
          default_status: 'draft',
          default_priority: 'medium',
          categories: ['general']
        },
        specs: {
          '1': {
            id: 1,
            title: 'Test Spec',
            status: 'draft',
            category: 'general',
            file_path: 'test-docs/draft/general/SPEC-001-test-spec.md',
            file_size: 100,
            checksum: 'abc123',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        },
        next_id: 2,
        search_index: {
          version: '1.0.0',
          last_rebuilt: '2024-01-01T00:00:00Z',
          token_count: 0
        }
      };

      (fileSpecService as any).metadataCache = mockMetadata;

      const fileContent = `---
id: 1
title: "Test Spec"
status: "draft"
category: "general"
priority: "medium"
created_at: "2024-01-01T00:00:00Z"
updated_at: "2024-01-01T00:00:00Z"
created_via: "test"
related_specs: [2, 3]
parent_spec_id: null
tags: ["test", "spec"]
effort_estimate: "2 days"
completion: 50
---

# Test Spec

This is the body content of the specification.

## Details

More details here.`;

      mockFs.readFile.mockResolvedValue(fileContent);

      const spec = await fileSpecService.getSpecById(1);

      expect(spec).not.toBeNull();
      expect(spec!.id).toBe(1);
      expect(spec!.title).toBe('Test Spec');
      expect(spec!.status).toBe('draft');
      expect(spec!.category).toBe('general');
      expect(spec!.related_specs).toEqual([2, 3]);
      expect(spec!.tags).toEqual(['test', 'spec']);
      expect(spec!.effort_estimate).toBe('2 days');
      expect(spec!.completion).toBe(50);
      expect(spec!.body_md).toBe(`# Test Spec

This is the body content of the specification.

## Details

More details here.`);
    });
  });

  describe('deleteSpec', () => {
    it('should delete spec file and remove from metadata', async () => {
      const mockMetadata = {
        version: '2.0.0',
        project: {
          name: 'Test',
          description: 'Test',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        settings: {
          auto_organize: true,
          default_status: 'draft',
          default_priority: 'medium',
          categories: ['general']
        },
        specs: {
          '1': {
            id: 1,
            title: 'Test Spec',
            status: 'draft',
            category: 'general',
            file_path: 'test-docs/draft/general/SPEC-001-test-spec.md',
            file_size: 100,
            checksum: 'abc123',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        },
        next_id: 2,
        search_index: {
          version: '1.0.0',
          last_rebuilt: '2024-01-01T00:00:00Z',
          token_count: 0
        }
      };

      (fileSpecService as any).metadataCache = mockMetadata;

      mockFs.unlink.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.rename.mockResolvedValue(undefined);

      await fileSpecService.deleteSpec(1);

      expect(mockFs.unlink).toHaveBeenCalledWith(
        'test-docs/draft/general/SPEC-001-test-spec.md'
      );

      // Check that metadata was updated (specs should be empty)
      const saveCall = mockFs.writeFile.mock.calls.find(call => 
        (call[0] as string).includes('metadata')
      );
      expect(saveCall).toBeDefined();
      
      const savedMetadata = JSON.parse(saveCall![1] as string);
      expect(savedMetadata.specs).toEqual({});
    });

    it('should throw error for non-existent spec', async () => {
      const mockMetadata = {
        version: '2.0.0',
        project: {
          name: 'Test',
          description: 'Test',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        settings: {
          auto_organize: true,
          default_status: 'draft',
          default_priority: 'medium',
          categories: ['general']
        },
        specs: {},
        next_id: 1,
        search_index: {
          version: '1.0.0',
          last_rebuilt: '2024-01-01T00:00:00Z',
          token_count: 0
        }
      };

      (fileSpecService as any).metadataCache = mockMetadata;

      await expect(fileSpecService.deleteSpec(999))
        .rejects.toThrow('Spec 999 not found');
    });
  });

  describe('listSpecs', () => {
    it('should return filtered and paginated specs', async () => {
      const mockMetadata = {
        version: '2.0.0',
        project: {
          name: 'Test',
          description: 'Test',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        settings: {
          auto_organize: true,
          default_status: 'draft',
          default_priority: 'medium',
          categories: ['general', 'auth']
        },
        specs: {
          '1': {
            id: 1,
            title: 'Spec 1',
            status: 'draft',
            category: 'general',
            file_path: 'test1.md',
            file_size: 100,
            checksum: 'abc1',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          '2': {
            id: 2,
            title: 'Spec 2',
            status: 'todo',
            category: 'auth',
            file_path: 'test2.md',
            file_size: 200,
            checksum: 'abc2',
            created_at: '2024-01-02T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z'
          },
          '3': {
            id: 3,
            title: 'Spec 3',
            status: 'draft',
            category: 'auth',
            file_path: 'test3.md',
            file_size: 300,
            checksum: 'abc3',
            created_at: '2024-01-03T00:00:00Z',
            updated_at: '2024-01-03T00:00:00Z'
          }
        },
        next_id: 4,
        search_index: {
          version: '1.0.0',
          last_rebuilt: '2024-01-01T00:00:00Z',
          token_count: 0
        }
      };

      (fileSpecService as any).metadataCache = mockMetadata;

      // Test filtering by status
      const result1 = await fileSpecService.listSpecs({ status: 'draft' });
      expect(result1.specs).toHaveLength(2);
      expect(result1.total).toBe(2);

      // Test filtering by category
      const result2 = await fileSpecService.listSpecs({ category: 'auth' });
      expect(result2.specs).toHaveLength(2);
      expect(result2.total).toBe(2);

      // Test pagination
      const result3 = await fileSpecService.listSpecs({ limit: 2, offset: 1 });
      expect(result3.specs).toHaveLength(2);
      expect(result3.total).toBe(3);
    });

    it('should sort specs correctly', async () => {
      const mockMetadata = {
        version: '2.0.0',
        project: {
          name: 'Test',
          description: 'Test',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        settings: {
          auto_organize: true,
          default_status: 'draft',
          default_priority: 'medium',
          categories: ['general']
        },
        specs: {
          '1': {
            id: 1,
            title: 'A Spec',
            status: 'draft',
            category: 'general',
            file_path: 'test1.md',
            file_size: 100,
            checksum: 'abc1',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          '2': {
            id: 2,
            title: 'Z Spec',
            status: 'draft',
            category: 'general',
            file_path: 'test2.md',
            file_size: 200,
            checksum: 'abc2',
            created_at: '2024-01-02T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z'
          }
        },
        next_id: 3,
        search_index: {
          version: '1.0.0',
          last_rebuilt: '2024-01-01T00:00:00Z',
          token_count: 0
        }
      };

      (fileSpecService as any).metadataCache = mockMetadata;

      // Test sorting by title ascending
      const result1 = await fileSpecService.listSpecs({ 
        sort_by: 'title', 
        sort_order: 'asc' 
      });
      expect(result1.specs[0].title).toBe('A Spec');
      expect(result1.specs[1].title).toBe('Z Spec');

      // Test sorting by title descending
      const result2 = await fileSpecService.listSpecs({ 
        sort_by: 'title', 
        sort_order: 'desc' 
      });
      expect(result2.specs[0].title).toBe('Z Spec');
      expect(result2.specs[1].title).toBe('A Spec');
    });
  });

  describe('parseMarkdown', () => {
    it('should parse frontmatter and body correctly', () => {
      const content = `---
id: 1
title: "Test Spec"
status: "draft"
category: "general"
priority: "high"
created_at: "2024-01-01T00:00:00Z"
updated_at: "2024-01-01T00:00:00Z"
created_via: "test"
related_specs: [2, 3]
parent_spec_id: null
tags: ["test", "example"]
effort_estimate: "3 days"
completion: 75
---

# Test Spec

This is the body content.

## Section 1

More content here.`;

      const result = fileSpecService.parseMarkdown(content);

      expect(result.frontmatter.id).toBe(1);
      expect(result.frontmatter.title).toBe('Test Spec');
      expect(result.frontmatter.status).toBe('draft');
      expect(result.frontmatter.category).toBe('general');
      expect(result.frontmatter.priority).toBe('high');
      expect(result.frontmatter.related_specs).toEqual([2, 3]);
      expect(result.frontmatter.parent_spec_id).toBeNull();
      expect(result.frontmatter.tags).toEqual(['test', 'example']);
      expect(result.frontmatter.effort_estimate).toBe('3 days');
      expect(result.frontmatter.completion).toBe(75);

      expect(result.body).toBe(`# Test Spec

This is the body content.

## Section 1

More content here.`);
    });

    it('should throw error for content without frontmatter', () => {
      const content = `# Test Spec

This content has no frontmatter.`;

      expect(() => fileSpecService.parseMarkdown(content))
        .toThrow('Content does not have frontmatter');
    });

    it('should throw error for invalid frontmatter format', () => {
      const content = `---
id: 1
title: "Test Spec"
# Missing closing ---

# Test Spec

Body content here.`;

      expect(() => fileSpecService.parseMarkdown(content))
        .toThrow('Invalid frontmatter format');
    });
  });

  describe('buildMarkdown', () => {
    it('should generate correct markdown with frontmatter', () => {
      const frontmatter = {
        id: 1,
        title: 'Test Spec',
        status: 'draft' as const,
        category: 'general',
        priority: 'high' as const,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        created_via: 'test',
        related_specs: [2, 3],
        parent_spec_id: null,
        tags: ['test', 'example'],
        effort_estimate: '3 days',
        completion: 75
      };

      const body = `# Test Spec

This is the body content.`;

      const result = fileSpecService.buildMarkdown(frontmatter, body);

      expect(result).toContain('---');
      expect(result).toContain('id: 1');
      expect(result).toContain('title: "Test Spec"');
      expect(result).toContain('status: "draft"');
      expect(result).toContain('category: "general"');
      expect(result).toContain('priority: "high"');
      expect(result).toContain('related_specs: [2, 3]');
      expect(result).toContain('parent_spec_id: null');
      expect(result).toContain('tags: ["test", "example"]');
      expect(result).toContain('effort_estimate: "3 days"');
      expect(result).toContain('completion: 75');
      expect(result).toContain('---\n\n# Test Spec\n\nThis is the body content.');
    });
  });
});