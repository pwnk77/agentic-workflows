import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { MarkdownSearchIndex } from '../../../src/services/search-index.service.js';
import { SpecsMetadataIndex } from '../../../src/services/file-spec.service.js';
import * as fs from 'fs/promises';

// Mock fs module
jest.mock('fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('MarkdownSearchIndex', () => {
  let searchIndex: MarkdownSearchIndex;
  let mockMetadata: SpecsMetadataIndex;

  beforeEach(() => {
    searchIndex = new MarkdownSearchIndex();
    jest.clearAllMocks();

    mockMetadata = {
      version: '2.0.0',
      project: {
        name: 'Test Project',
        description: 'Test project',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      settings: {
        auto_organize: true,
        default_status: 'draft',
        default_priority: 'medium',
        categories: ['general', 'authentication', 'payments']
      },
      specs: {
        '1': {
          id: 1,
          title: 'User Authentication System',
          status: 'todo',
          category: 'authentication',
          file_path: 'docs/todo/authentication/SPEC-001-user-auth.md',
          file_size: 2048,
          checksum: 'abc123',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        '2': {
          id: 2,
          title: 'Payment Processing',
          status: 'draft',
          category: 'payments',
          file_path: 'docs/draft/payments/SPEC-002-payment.md',
          file_size: 1536,
          checksum: 'def456',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z'
        },
        '3': {
          id: 3,
          title: 'API Design Guidelines',
          status: 'done',
          category: 'general',
          file_path: 'docs/done/general/SPEC-003-api.md',
          file_size: 3072,
          checksum: 'ghi789',
          created_at: '2024-01-03T00:00:00Z',
          updated_at: '2024-01-03T00:00:00Z'
        }
      },
      next_id: 4,
      search_index: {
        version: '1.0.0',
        last_rebuilt: '2024-01-03T00:00:00Z',
        token_count: 150
      }
    };
  });

  describe('buildFromFiles', () => {
    it('should build search index from metadata and files', async () => {
      // Mock file contents
      mockFs.readFile
        .mockResolvedValueOnce(`---
id: 1
title: "User Authentication System"
status: "todo"
category: "authentication"
priority: "high"
created_at: "2024-01-01T00:00:00Z"
updated_at: "2024-01-01T00:00:00Z"
created_via: "architect"
related_specs: []
parent_spec_id: null
tags: ["auth", "security", "oauth"]
effort_estimate: "5 days"
completion: 0
---

# User Authentication System

This specification covers the implementation of a comprehensive user authentication system with OAuth support, JWT tokens, and multi-factor authentication capabilities.

## Requirements

- Secure user registration and login
- OAuth integration with Google and GitHub
- JWT token management
- Password reset functionality`)
        .mockResolvedValueOnce(`---
id: 2
title: "Payment Processing"
status: "draft"
category: "payments"
priority: "medium"
created_at: "2024-01-02T00:00:00Z"
updated_at: "2024-01-02T00:00:00Z"
created_via: "manual"
related_specs: []
parent_spec_id: null
tags: ["payments", "stripe", "billing"]
effort_estimate: "3 days"
completion: 0
---

# Payment Processing

Implementation of payment processing using Stripe API for handling subscriptions and one-time payments.

## Features

- Stripe integration
- Subscription management
- Invoice generation`)
        .mockResolvedValueOnce(`---
id: 3
title: "API Design Guidelines"
status: "done"
category: "general"
priority: "medium"
created_at: "2024-01-03T00:00:00Z"
updated_at: "2024-01-03T00:00:00Z"
created_via: "manual"
related_specs: []
parent_spec_id: null
tags: ["api", "rest", "guidelines"]
effort_estimate: "2 days"
completion: 100
---

# API Design Guidelines

REST API design principles and conventions for the project.

## Principles

- RESTful resource naming
- Proper HTTP status codes
- Consistent response formats`);

      await searchIndex.buildFromFiles(mockMetadata);

      const stats = searchIndex.getStats();
      expect(stats.documentCount).toBe(3);
      expect(stats.termCount).toBeGreaterThan(0);
    });

    it('should handle file read errors gracefully', async () => {
      mockFs.readFile
        .mockResolvedValueOnce('valid content')
        .mockRejectedValueOnce(new Error('File not found'))
        .mockResolvedValueOnce('another valid content');

      // Should not throw, but should log error
      await expect(searchIndex.buildFromFiles(mockMetadata)).resolves.not.toThrow();

      // Should have indexed only the successful files
      const stats = searchIndex.getStats();
      expect(stats.documentCount).toBeLessThan(3);
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      // Setup search index with test data
      mockFs.readFile
        .mockResolvedValueOnce(`---
id: 1
title: "User Authentication System"
status: "todo"
category: "authentication"
priority: "high"
created_at: "2024-01-01T00:00:00Z"
updated_at: "2024-01-01T00:00:00Z"
created_via: "architect"
related_specs: []
parent_spec_id: null
tags: ["auth", "security", "oauth"]
effort_estimate: "5 days"
completion: 0
---

# User Authentication System

This specification covers the implementation of a comprehensive user authentication system with OAuth support, JWT tokens, and multi-factor authentication capabilities.`)
        .mockResolvedValueOnce(`---
id: 2
title: "Payment Processing"
status: "draft"
category: "payments"
priority: "medium"
created_at: "2024-01-02T00:00:00Z"
updated_at: "2024-01-02T00:00:00Z"
created_via: "manual"
related_specs: []
parent_spec_id: null
tags: ["payments", "stripe", "billing"]
effort_estimate: "3 days"
completion: 0
---

# Payment Processing

Implementation of payment processing using Stripe API for handling subscriptions.`)
        .mockResolvedValueOnce(`---
id: 3
title: "API Design Guidelines"
status: "done"
category: "general"
priority: "medium"
created_at: "2024-01-03T00:00:00Z"
updated_at: "2024-01-03T00:00:00Z"
created_via: "manual"
related_specs: []
parent_spec_id: null
tags: ["api", "rest", "guidelines"]
effort_estimate: "2 days"
completion: 100
---

# API Design Guidelines

REST API design principles and conventions for the project.`);

      await searchIndex.buildFromFiles(mockMetadata);
    });

    it('should return relevant results for authentication query', () => {
      const results = searchIndex.search('authentication', { limit: 10 });

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe(1);
      expect(results[0].title).toBe('User Authentication System');
      expect(results[0].category).toBe('authentication');
      expect(results[0].score).toBeGreaterThan(0);
    });

    it('should return results for partial matches', () => {
      const results = searchIndex.search('auth', { limit: 10 });

      expect(results.length).toBeGreaterThan(0);
      
      // Should find the authentication spec
      const authResult = results.find(r => r.id === 1);
      expect(authResult).toBeDefined();
      expect(authResult!.score).toBeGreaterThan(0);
    });

    it('should boost title matches', () => {
      const results = searchIndex.search('Payment', { limit: 10 });

      expect(results.length).toBeGreaterThan(0);
      
      // Should find the payment spec with high score due to title match
      const paymentResult = results.find(r => r.id === 2);
      expect(paymentResult).toBeDefined();
      expect(paymentResult!.title).toBe('Payment Processing');
      expect(paymentResult!.score).toBeGreaterThan(0.5); // Should have high score for title match
    });

    it('should boost category matches', () => {
      const results = searchIndex.search('payments', { limit: 10 });

      expect(results.length).toBeGreaterThan(0);
      
      // Should find the payment spec
      const paymentResult = results.find(r => r.id === 2);
      expect(paymentResult).toBeDefined();
      expect(paymentResult!.category).toBe('payments');
    });

    it('should filter by minimum score', () => {
      const allResults = searchIndex.search('api', { limit: 10, minScore: 0 });
      const filteredResults = searchIndex.search('api', { limit: 10, minScore: 0.5 });

      expect(filteredResults.length).toBeLessThanOrEqual(allResults.length);
      
      filteredResults.forEach(result => {
        expect(result.score).toBeGreaterThanOrEqual(0.5);
      });
    });

    it('should limit results correctly', () => {
      const results = searchIndex.search('specification', { limit: 2 });

      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should include snippets when requested', () => {
      const results = searchIndex.search('authentication system', { 
        limit: 5, 
        includeSnippets: true 
      });

      const authResult = results.find(r => r.id === 1);
      expect(authResult).toBeDefined();
      expect(authResult!.snippet).toBeDefined();
      expect(authResult!.snippet).toContain('**authentication**');
    });

    it('should handle empty queries', () => {
      const results = searchIndex.search('', { limit: 10 });

      expect(results).toHaveLength(0);
    });

    it('should handle queries with only stop words', () => {
      const results = searchIndex.search('the and or', { limit: 10 });

      expect(results).toHaveLength(0);
    });

    it('should sort results by relevance score', () => {
      const results = searchIndex.search('system', { limit: 10 });

      // Results should be sorted by score in descending order
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });
  });

  describe('updateDocument', () => {
    beforeEach(async () => {
      // Setup initial index
      mockFs.readFile.mockResolvedValue(`---
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

Original content here.`);

      await searchIndex.buildFromFiles({
        ...mockMetadata,
        specs: {
          '1': {
            id: 1,
            title: 'Original Title',
            status: 'draft',
            category: 'general',
            file_path: 'test.md',
            file_size: 100,
            checksum: 'abc',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        }
      });
    });

    it('should update document in search index', async () => {
      const updatedContent = `---
id: 1
title: "Updated Authentication System"
status: "todo"
category: "authentication"
priority: "high"
created_at: "2024-01-01T00:00:00Z"
updated_at: "2024-01-01T12:00:00Z"
created_via: "test"
related_specs: []
parent_spec_id: null
tags: ["auth", "updated"]
effort_estimate: "3 days"
completion: 25
---

# Updated Authentication System

This is updated content with authentication keywords and OAuth support.`;

      mockFs.readFile.mockResolvedValueOnce(updatedContent);

      await searchIndex.updateDocument(1, 'updated-test.md');

      // Search for new content
      const results = searchIndex.search('authentication', { limit: 5 });
      expect(results.length).toBeGreaterThan(0);
      
      const result = results.find(r => r.id === 1);
      expect(result).toBeDefined();
      expect(result!.title).toBe('Updated Authentication System');
      expect(result!.category).toBe('authentication');
    });

    it('should handle update errors gracefully', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      // Should not throw
      await expect(searchIndex.updateDocument(1, 'nonexistent.md')).resolves.not.toThrow();

      // Document should be removed from index
      const stats = searchIndex.getStats();
      expect(stats.documentCount).toBe(0);
    });
  });

  describe('removeDocument', () => {
    beforeEach(async () => {
      mockFs.readFile
        .mockResolvedValueOnce(`---
id: 1
title: "First Spec"
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

# First Spec

Content for first spec.`)
        .mockResolvedValueOnce(`---
id: 2
title: "Second Spec"
status: "todo"
category: "auth"
priority: "high"
created_at: "2024-01-02T00:00:00Z"
updated_at: "2024-01-02T00:00:00Z"
created_via: "test"
related_specs: []
parent_spec_id: null
tags: ["auth"]
effort_estimate: null
completion: 0
---

# Second Spec

Content for second spec with authentication.`);

      await searchIndex.buildFromFiles({
        ...mockMetadata,
        specs: {
          '1': {
            id: 1,
            title: 'First Spec',
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
            title: 'Second Spec',
            status: 'todo',
            category: 'auth',
            file_path: 'test2.md',
            file_size: 200,
            checksum: 'abc2',
            created_at: '2024-01-02T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z'
          }
        }
      });
    });

    it('should remove document from search index', () => {
      const initialStats = searchIndex.getStats();
      expect(initialStats.documentCount).toBe(2);

      searchIndex.removeDocument(1);

      const finalStats = searchIndex.getStats();
      expect(finalStats.documentCount).toBe(1);

      // Should not find the removed document
      const results = searchIndex.search('first', { limit: 5 });
      const removedDoc = results.find(r => r.id === 1);
      expect(removedDoc).toBeUndefined();

      // Should still find the remaining document
      const results2 = searchIndex.search('second', { limit: 5 });
      const remainingDoc = results2.find(r => r.id === 2);
      expect(remainingDoc).toBeDefined();
    });

    it('should handle removal of non-existent document', () => {
      const initialStats = searchIndex.getStats();
      
      // Should not throw
      expect(() => searchIndex.removeDocument(999)).not.toThrow();

      const finalStats = searchIndex.getStats();
      expect(finalStats.documentCount).toBe(initialStats.documentCount);
    });
  });

  describe('getStats', () => {
    beforeEach(async () => {
      mockFs.readFile
        .mockResolvedValueOnce(`---
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
tags: ["test", "example"]
effort_estimate: null
completion: 0
---

# Test Spec

This is a test specification with various keywords for search testing including authentication, payment, and API design concepts.`)
        .mockResolvedValueOnce(`---
id: 2
title: "Another Spec"
status: "todo"
category: "auth"
priority: "high"
created_at: "2024-01-02T00:00:00Z"
updated_at: "2024-01-02T00:00:00Z"
created_via: "test"
related_specs: []
parent_spec_id: null
tags: ["auth"]
effort_estimate: null
completion: 0
---

# Another Spec

Short content.`);

      await searchIndex.buildFromFiles({
        ...mockMetadata,
        specs: {
          '1': {
            id: 1,
            title: 'Test Spec',
            status: 'draft',
            category: 'general',
            file_path: 'test1.md',
            file_size: 500,
            checksum: 'abc1',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          '2': {
            id: 2,
            title: 'Another Spec',
            status: 'todo',
            category: 'auth',
            file_path: 'test2.md',
            file_size: 100,
            checksum: 'abc2',
            created_at: '2024-01-02T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z'
          }
        }
      });
    });

    it('should return accurate statistics', () => {
      const stats = searchIndex.getStats();

      expect(stats.documentCount).toBe(2);
      expect(stats.termCount).toBeGreaterThan(0);
      expect(stats.avgDocumentLength).toBeGreaterThan(0);
      expect(Array.isArray(stats.topTerms)).toBe(true);
      expect(stats.topTerms.length).toBeLessThanOrEqual(10);
      
      // Top terms should have term and count properties
      stats.topTerms.forEach(term => {
        expect(term).toHaveProperty('term');
        expect(term).toHaveProperty('count');
        expect(typeof term.term).toBe('string');
        expect(typeof term.count).toBe('number');
        expect(term.count).toBeGreaterThan(0);
      });
    });
  });

  describe('clear', () => {
    beforeEach(async () => {
      mockFs.readFile.mockResolvedValue(`---
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

Content here.`);

      await searchIndex.buildFromFiles({
        ...mockMetadata,
        specs: {
          '1': {
            id: 1,
            title: 'Test Spec',
            status: 'draft',
            category: 'general',
            file_path: 'test.md',
            file_size: 100,
            checksum: 'abc',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        }
      });
    });

    it('should clear all index data', () => {
      const initialStats = searchIndex.getStats();
      expect(initialStats.documentCount).toBe(1);
      expect(initialStats.termCount).toBeGreaterThan(0);

      searchIndex.clear();

      const finalStats = searchIndex.getStats();
      expect(finalStats.documentCount).toBe(0);
      expect(finalStats.termCount).toBe(0);
      expect(finalStats.avgDocumentLength).toBe(0);
      expect(finalStats.topTerms).toHaveLength(0);
    });
  });
});