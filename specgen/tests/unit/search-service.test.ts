/**
 * Unit tests for SearchService
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { SearchService } from '../../services/search.service.js';
import { SpecService } from '../../services/spec.service.js';
import { initializeDatabase } from '../../database/data-source.js';
import path from 'path';
import fs from 'fs';

describe('SearchService', () => {
  let searchService: SearchService;
  let specService: SpecService;
  let testDbPath: string;
  let testSpecs: any[] = [];

  beforeEach(async () => {
    // Create a temporary test database
    testDbPath = path.join(__dirname, `search-test-${Date.now()}.sqlite`);
    await initializeDatabase(testDbPath);
    searchService = new SearchService();
    specService = new SpecService();

    // Create test specifications
    const specs = [
      {
        title: 'Authentication System',
        body_md: '# Authentication System\n\nThis specification describes the user authentication system with OAuth2 integration.',
        status: 'draft' as const
      },
      {
        title: 'Database Schema Design',
        body_md: '# Database Schema\n\nDesign for the relational database schema with user tables, authentication tokens, and session management.',
        status: 'in-progress' as const
      },
      {
        title: 'API Documentation',
        body_md: '# REST API Documentation\n\nComprehensive documentation for all REST endpoints including authentication, user management, and data operations.',
        status: 'done' as const
      },
      {
        title: 'Frontend Components',
        body_md: '# UI Components\n\nReact components for the user interface including forms, buttons, and navigation elements.',
        status: 'todo' as const
      }
    ];

    for (const spec of specs) {
      const created = await specService.createSpec(spec);
      testSpecs.push(created);
    }

    // Allow time for search index to update
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(async () => {
    testSpecs = [];
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('searchSpecs', () => {
    it('should find specifications by title', async () => {
      const result = await searchService.searchSpecs({
        query: 'Authentication',
        limit: 10,
        offset: 0,
        minScore: 0.1
      });

      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].title).toContain('Authentication');
      expect(result.query).toBe('Authentication');
      expect(result.searchTime).toBeGreaterThan(0);
    });

    it('should find specifications by body content', async () => {
      const result = await searchService.searchSpecs({
        query: 'OAuth2',
        limit: 10,
        offset: 0,
        minScore: 0.1
      });

      expect(result.results.length).toBeGreaterThan(0);
      const authSpec = result.results.find(r => r.title.includes('Authentication'));
      expect(authSpec).toBeDefined();
    });

    it('should rank results by relevance score', async () => {
      const result = await searchService.searchSpecs({
        query: 'database user',
        limit: 10,
        offset: 0,
        minScore: 0.1
      });

      expect(result.results.length).toBeGreaterThan(1);
      // Results should be sorted by score descending
      for (let i = 0; i < result.results.length - 1; i++) {
        expect(result.results[i].score).toBeGreaterThanOrEqual(result.results[i + 1].score);
      }
    });

    it('should filter by minimum score', async () => {
      const highScoreResult = await searchService.searchSpecs({
        query: 'authentication',
        limit: 10,
        offset: 0,
        minScore: 0.8
      });

      const lowScoreResult = await searchService.searchSpecs({
        query: 'authentication',
        limit: 10,
        offset: 0,
        minScore: 0.1
      });

      expect(highScoreResult.results.length).toBeLessThanOrEqual(lowScoreResult.results.length);
      if (highScoreResult.results.length > 0) {
        expect(highScoreResult.results[0].score).toBeGreaterThanOrEqual(0.8);
      }
    });

    it('should handle pagination', async () => {
      const result = await searchService.searchSpecs({
        query: 'documentation',
        limit: 2,
        offset: 0,
        minScore: 0.1
      });

      expect(result.limit).toBe(2);
      expect(result.offset).toBe(0);
      expect(result.hasMore).toBe(result.total > 2);
    });

    it('should return empty results for non-matching query', async () => {
      const result = await searchService.searchSpecs({
        query: 'nonexistentterm12345',
        limit: 10,
        offset: 0,
        minScore: 0.1
      });

      expect(result.results).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
    });

    it('should include highlighted snippets', async () => {
      const result = await searchService.searchSpecs({
        query: 'REST API',
        limit: 10,
        offset: 0,
        minScore: 0.1
      });

      expect(result.results.length).toBeGreaterThan(0);
      const apiDoc = result.results.find(r => r.title.includes('API Documentation'));
      expect(apiDoc).toBeDefined();
      expect(apiDoc!.snippet).toContain('REST');
      expect(apiDoc!.snippet).toContain('<mark>');
    });

    it('should validate search parameters', async () => {
      // Test invalid minScore
      await expect(searchService.searchSpecs({
        query: 'test',
        limit: 10,
        offset: 0,
        minScore: 1.5
      })).rejects.toThrow();

      // Test invalid limit
      await expect(searchService.searchSpecs({
        query: 'test',
        limit: 0,
        offset: 0,
        minScore: 0.1
      })).rejects.toThrow();

      // Test negative offset
      await expect(searchService.searchSpecs({
        query: 'test',
        limit: 10,
        offset: -1,
        minScore: 0.1
      })).rejects.toThrow();
    });
  });

  describe('getSearchStats', () => {
    it('should return search statistics', async () => {
      const stats = await searchService.getSearchStats();

      expect(stats.totalDocuments).toBe(testSpecs.length);
      expect(stats.avgDocumentLength).toBeGreaterThan(0);
      expect(stats.indexSize).toBeGreaterThan(0);
    });
  });
});