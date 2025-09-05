import express from 'express';
import cors from 'cors';
import { fileSpecService } from '../services/file-spec.service.js';
import { searchIndexService } from '../services/search-index.service.js';
import { categoryDetector } from '../services/category-detector.service.js';

export function createFileDashboardServer(): express.Application {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Initialize file system if not already done
  let initialized = false;
  const ensureInitialized = async () => {
    if (!initialized) {
      try {
        await fileSpecService.initialize();
        const metadata = await fileSpecService.loadMetadata();
        await searchIndexService.buildFromFiles(metadata);
        initialized = true;
        console.log('File-based system initialized for dashboard');
      } catch (error) {
        console.error('Failed to initialize file system:', error);
        throw error;
      }
    }
  };

  // Health check endpoint
  app.get('/health', async (_req, res) => {
    try {
      await ensureInitialized();
      const metadata = await fileSpecService.loadMetadata();
      const stats = searchIndexService.getStats();
      
      return res.json({
        status: 'healthy',
        system: 'file-based',
        version: metadata.version,
        specs_count: Object.keys(metadata.specs).length,
        search_index_stats: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/specs - List specifications with filtering
  app.get('/api/specs', async (req, res) => {
    try {
      await ensureInitialized();
      
      const options: any = {
        status: req.query.status as string,
        category: req.query.category as string || req.query.feature_group as string,
        priority: req.query.priority as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
        sort_by: req.query.sort_by as string,
        sort_order: req.query.sort_order as 'asc' | 'desc'
      };
      
      // Remove undefined values
      Object.keys(options).forEach(key => {
        if (options[key] === undefined) {
          delete options[key];
        }
      });
      
      const result = await fileSpecService.listSpecs(options);
      
      // Map category to feature_group for backward compatibility
      const compatibleSpecs = result.specs.map(spec => ({
        ...spec,
        feature_group: spec.category
      }));
      
      return res.json({
        success: true,
        specs: compatibleSpecs,
        pagination: {
          offset: options.offset || 0,
          limit: options.limit || 100,
          total: result.total
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/specs/:id - Get specification by ID
  app.get('/api/specs/:id', async (req, res) => {
    try {
      await ensureInitialized();
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid spec ID'
        });
      }
      
      const spec = await fileSpecService.getSpecById(id);
      if (!spec) {
        return res.status(404).json({
          success: false,
          error: 'Spec not found'
        });
      }
      
      // Include related specs if requested
      let result: any = {
        success: true,
        spec: {
          ...spec,
          feature_group: spec.category
        }
      };
      
      if (req.query.include_relations === 'true' && spec.related_specs && spec.related_specs.length > 0) {
        try {
          const relatedSpecs = [];
          for (const relatedId of spec.related_specs) {
            const relatedSpec = await fileSpecService.getSpecById(relatedId);
            if (relatedSpec) {
              relatedSpecs.push({
                ...relatedSpec,
                feature_group: relatedSpec.category
              });
            }
          }
          result.related_specs = relatedSpecs;
        } catch (e) {
          console.error('Failed to load related specs:', e);
        }
      }
      
      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/specs - Create new specification
  app.post('/api/specs', async (req, res) => {
    try {
      await ensureInitialized();
      
      const { title, body_md, status, feature_group, priority, related_specs, parent_spec_id, created_via } = req.body;
      
      if (!title || !body_md) {
        return res.status(400).json({
          success: false,
          error: 'title and body_md are required'
        });
      }
      
      const createData: any = {
        title,
        body_md,
        status: status || 'draft',
        priority: priority || 'medium',
        created_via: created_via || 'dashboard'
      };
      
      // Map feature_group to category
      if (feature_group) {
        createData.category = feature_group;
      }
      
      if (related_specs) createData.related_specs = related_specs;
      if (parent_spec_id) createData.parent_spec_id = parent_spec_id;
      
      const spec = await fileSpecService.createSpec(createData);
      
      // Update search index
      const metadata = await fileSpecService.loadMetadata();
      await searchIndexService.buildFromFiles(metadata);
      
      return res.status(201).json({
        success: true,
        spec: {
          ...spec,
          feature_group: spec.category
        },
        message: `Created specification "${spec.title}" with ID ${spec.id}`
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // PUT /api/specs/:id - Update specification
  app.put('/api/specs/:id', async (req, res) => {
    try {
      await ensureInitialized();
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid spec ID'
        });
      }
      
      const updateData: any = { ...req.body };
      
      // Map feature_group to category
      if (updateData.feature_group) {
        updateData.category = updateData.feature_group;
        delete updateData.feature_group;
      }
      
      const spec = await fileSpecService.updateSpec(id, updateData);
      
      if (!spec) {
        return res.status(404).json({
          success: false,
          error: 'Spec not found'
        });
      }
      
      // Update search index for the changed spec
      const metadata = await fileSpecService.loadMetadata();
      const specMeta = metadata.specs[id];
      if (specMeta) {
        await searchIndexService.updateDocument(id, specMeta.file_path);
      }
      
      return res.json({
        success: true,
        spec: {
          ...spec,
          feature_group: spec.category
        },
        message: `Updated specification "${spec.title}"`
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // DELETE /api/specs/:id - Delete specification
  app.delete('/api/specs/:id', async (req, res) => {
    try {
      await ensureInitialized();
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid spec ID'
        });
      }
      
      // Check if spec exists first
      const existingSpec = await fileSpecService.getSpecById(id);
      if (!existingSpec) {
        return res.status(404).json({
          success: false,
          error: 'Spec not found'
        });
      }
      
      await fileSpecService.deleteSpec(id);
      
      // Remove from search index
      searchIndexService.removeDocument(id);
      
      return res.json({
        success: true,
        message: `Deleted specification "${existingSpec.title}" (ID: ${id})`
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/search - Search specifications
  app.get('/api/search', async (req, res) => {
    try {
      await ensureInitialized();
      
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Query parameter "q" is required'
        });
      }
      
      const options = {
        limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
        minScore: req.query.min_score ? parseFloat(req.query.min_score as string) : 0.1,
        includeSnippets: req.query.snippets === 'true'
      };
      
      const searchResults = searchIndexService.search(query, options);
      
      // Convert search results to full specs
      const specs = [];
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const limit = options.limit;
      
      for (const result of searchResults) {
        if (specs.length < offset) continue;
        if (specs.length >= offset + limit) break;
        
        const spec = await fileSpecService.getSpecById(result.id);
        if (spec) {
          specs.push({
            ...spec,
            feature_group: spec.category,
            score: result.score,
            snippet: result.snippet
          });
        }
      }
      
      return res.json({
        success: true,
        results: specs,
        query,
        pagination: {
          offset,
          limit,
          total: searchResults.length,
          has_more: searchResults.length > offset + limit
        },
        search_stats: searchIndexService.getStats()
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/stats - Get system statistics
  app.get('/api/stats', async (_req, res) => {
    try {
      await ensureInitialized();
      
      const metadata = await fileSpecService.loadMetadata();
      const searchStats = searchIndexService.getStats();
      
      // Calculate distributions
      const categoryDistribution: Record<string, number> = {};
      const statusDistribution: Record<string, number> = {};
      const priorityDistribution: Record<string, number> = {};
      let totalFileSize = 0;
      
      for (const spec of Object.values(metadata.specs)) {
        const category = spec.category || 'uncategorized';
        categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
        
        const status = spec.status || 'unknown';
        statusDistribution[status] = (statusDistribution[status] || 0) + 1;
        
        const priority = spec.priority || 'medium';
        priorityDistribution[priority] = (priorityDistribution[priority] || 0) + 1;
        
        totalFileSize += spec.file_size || 0;
      }
      
      return res.json({
        success: true,
        stats: {
          total_specs: Object.keys(metadata.specs).length,
          file_system: {
            total_file_size_bytes: totalFileSize,
            metadata_version: metadata.version,
            next_id: metadata.next_id
          },
          search_index: searchStats,
          distributions: {
            by_category: categoryDistribution,
            by_status: statusDistribution,
            by_priority: priorityDistribution
          },
          settings: metadata.settings
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/categories - Get available categories
  app.get('/api/categories', async (_req, res) => {
    try {
      await ensureInitialized();
      
      const categories = categoryDetector.getCategories();
      const metadata = await fileSpecService.loadMetadata();
      
      // Get category usage statistics
      const usage: Record<string, number> = {};
      for (const spec of Object.values(metadata.specs)) {
        const category = spec.category || 'general';
        usage[category] = (usage[category] || 0) + 1;
      }
      
      return res.json({
        success: true,
        categories: categories.map(cat => ({
          name: cat,
          usage_count: usage[cat] || 0,
          info: categoryDetector.getCategoryInfo(cat)
        })),
        total_categories: categories.length
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/analyze-category - Analyze text for category detection
  app.post('/api/analyze-category', async (req, res) => {
    try {
      const { title, content } = req.body;
      
      if (!title && !content) {
        return res.status(400).json({
          success: false,
          error: 'Either title or content is required'
        });
      }
      
      const analysis = categoryDetector.analyze(title || '', content || '');
      
      return res.json({
        success: true,
        analysis
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/maintenance/health - Health check for maintenance
  app.get('/api/maintenance/health', async (req, res) => {
    try {
      await ensureInitialized();
      
      const metadata = await fileSpecService.loadMetadata();
      const stats = searchIndexService.getStats();
      
      // Check if all files referenced in metadata exist
      let missingFiles = 0;
      let corruptedFiles = 0;
      const fileChecks = [];
      
      for (const [id, spec] of Object.entries(metadata.specs)) {
        try {
          const specData = await fileSpecService.getSpecById(parseInt(id));
          if (!specData) {
            missingFiles++;
            fileChecks.push({
              id: parseInt(id),
              status: 'missing',
              file_path: spec.file_path
            });
          } else {
            fileChecks.push({
              id: parseInt(id),
              status: 'ok',
              file_path: spec.file_path
            });
          }
        } catch (error) {
          corruptedFiles++;
          fileChecks.push({
            id: parseInt(id),
            status: 'corrupted',
            file_path: spec.file_path,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
      
      const totalSpecs = Object.keys(metadata.specs).length;
      const healthScore = totalSpecs > 0 ? 
        Math.round(((totalSpecs - missingFiles - corruptedFiles) / totalSpecs) * 100) : 100;
      
      return res.json({
        success: true,
        health: {
          status: healthScore >= 90 ? 'healthy' : healthScore >= 70 ? 'warning' : 'critical',
          score: healthScore,
          total_specs: totalSpecs,
          missing_files: missingFiles,
          corrupted_files: corruptedFiles,
          metadata_version: metadata.version,
          search_index_stats: stats
        },
        file_checks: req.query.details === 'true' ? fileChecks : fileChecks.slice(0, 10),
        recommendations: [
          ...(missingFiles > 0 ? ['Run file system maintenance to clean up missing references'] : []),
          ...(corruptedFiles > 0 ? ['Check file permissions and disk space'] : []),
          ...(stats.documentCount !== totalSpecs ? ['Rebuild search index to sync with files'] : [])
        ]
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        health: {
          status: 'critical',
          score: 0
        }
      });
    }
  });

  // POST /api/maintenance/rebuild - Rebuild indexes and metadata
  app.post('/api/maintenance/rebuild', async (_req, res) => {
    try {
      // Force re-initialization
      initialized = false;
      await ensureInitialized();
      
      // Rebuild metadata index from files
      await fileSpecService.initialize();
      
      // Rebuild search index
      const metadata = await fileSpecService.loadMetadata();
      await searchIndexService.buildFromFiles(metadata);
      
      const stats = searchIndexService.getStats();
      
      return res.json({
        success: true,
        maintenance: {
          actions_performed: [
            'Rebuilt metadata index from file system',
            'Rebuilt search index',
            'Cleaned up empty directories',
            'Verified file integrity'
          ],
          stats: {
            total_specs: Object.keys(metadata.specs).length,
            search_index_documents: stats.documentCount,
            search_index_terms: stats.termCount
          },
          timestamp: new Date().toISOString()
        },
        message: 'File system maintenance completed successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Note: Root route "/" is handled by the main dashboard server
  // This keeps the API clean and focused

  // Error handling middleware
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Dashboard error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });

  return app;
}