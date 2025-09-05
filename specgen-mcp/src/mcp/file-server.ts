import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { fileSpecService, CreateSpecData } from '../services/file-spec.service.js';
import { searchIndexService } from '../services/search-index.service.js';

// Define Zod schemas for file-based tools
const listSpecsSchema = z.object({
  status: z.enum(['draft', 'todo', 'in-progress', 'done']).optional(),
  feature_group: z.string().optional(),
  theme_category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  created_via: z.string().optional(),
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional(),
  sort_by: z.enum(['id', 'title', 'created_at', 'updated_at', 'priority']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  group_by: z.enum(['feature_group', 'status', 'priority']).optional(),
  include_counts: z.boolean().optional(),
});

const createSpecSchema = z.object({
  title: z.string(),
  body_md: z.string(),
  status: z.enum(['draft', 'todo', 'in-progress', 'done']).optional(),
  feature_group: z.string().optional(),
  theme_category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  related_specs: z.array(z.number()).optional(),
  parent_spec_id: z.number().optional(),
  created_via: z.string().optional(),
});

const getSpecSchema = z.object({
  spec_id: z.number(),
  include_relations: z.boolean().optional(),
});

const searchSpecsSchema = z.object({
  query: z.string(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  min_score: z.number().min(0).max(1).optional(),
});

const updateSpecSchema = z.object({
  spec_id: z.number(),
  title: z.string().optional(),
  body_md: z.string().optional(),
  status: z.enum(['draft', 'todo', 'in-progress', 'done']).optional(),
  feature_group: z.string().optional(),
  theme_category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  related_specs: z.array(z.number()).optional(),
  parent_spec_id: z.number().optional(),
});

const deleteSpecSchema = z.object({
  spec_id: z.number(),
});

const launchDashboardSchema = z.object({
  port: z.number().min(1024).max(65535).optional(),
  host: z.string().optional(),
});

// setupProjectSchema removed - no longer needed

// Create the MCP server for file-based system
const server = new McpServer({
  name: 'specgen-mcp-file',
  version: '2.0.0',
  description: 'File-based specification management for Claude Code with MCP integration',
});

// Initialize the file system on server start
let initialized = false;
async function ensureInitialized(): Promise<void> {
  if (!initialized) {
    try {
      await fileSpecService.initialize();
      const metadata = await fileSpecService.loadMetadata();
      await searchIndexService.buildFromFiles(metadata);
      initialized = true;
      console.error('File-based SpecGen system initialized');
    } catch (error) {
      console.error('Failed to initialize file-based system:', error);
      throw error;
    }
  }
}

// Register list_specs tool
server.tool(
  'list_specs',
  'List specifications with optional filtering, pagination, and grouping',
  listSpecsSchema._def.shape(),
  async (params) => {
    try {
      await ensureInitialized();
      
      const validated = listSpecsSchema.parse(params);
      
      // Map feature_group to category for filtering
      const options: any = { ...validated };
      if (validated.feature_group) {
        options.category = validated.feature_group;
        delete options.feature_group;
      }
      
      const result = await fileSpecService.listSpecs(options);
      
      // Map category back to feature_group for backward compatibility
      const compatibleSpecs = result.specs.map(spec => ({
        ...spec,
        feature_group: spec.category
      }));
      
      // Add grouping functionality if requested
      if (validated.group_by) {
        const groupField = validated.group_by === 'feature_group' ? 'category' : validated.group_by;
        const grouped = compatibleSpecs.reduce((acc: any, spec: any) => {
          const key = spec[groupField] || 'uncategorized';
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(spec);
          return acc;
        }, {});

        const groupCounts = Object.keys(grouped).reduce((acc: any, key) => {
          acc[key] = grouped[key].length;
          return acc;
        }, {});

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              specs: compatibleSpecs,
              pagination: {
                offset: options.offset || 0,
                limit: options.limit || 100,
                total: result.total
              },
              grouped_specs: grouped,
              group_counts: groupCounts,
              group_by: validated.group_by
            }, null, 2)
          }]
        };
      }

      // Add category counts if requested
      if (validated.include_counts) {
        const categoryCounts = compatibleSpecs.reduce((acc, spec) => {
          const category = spec.feature_group || 'uncategorized';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              specs: compatibleSpecs,
              pagination: {
                offset: options.offset || 0,
                limit: options.limit || 100,
                total: result.total
              },
              category_counts: categoryCounts
            }, null, 2)
          }]
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            specs: compatibleSpecs,
            pagination: {
              offset: options.offset || 0,
              limit: options.limit || 100,
              total: result.total
            }
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Register create_spec tool
server.tool(
  'create_spec',
  'Create a new specification with auto-category detection',
  createSpecSchema._def.shape(),
  async (params) => {
    try {
      await ensureInitialized();
      
      const validated = createSpecSchema.parse(params);
      
      // Ensure required fields are present
      const createData: CreateSpecData = {
        title: validated.title,
        body_md: validated.body_md,
        status: validated.status,
        category: validated.feature_group || validated.theme_category,
        priority: validated.priority,
        related_specs: validated.related_specs,
        parent_spec_id: validated.parent_spec_id,
        created_via: validated.created_via
      };
      
      const spec = await fileSpecService.createSpec(createData);
      
      // Update search index
      const metadata = await fileSpecService.loadMetadata();
      await searchIndexService.buildFromFiles(metadata);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            spec: {
              ...spec,
              feature_group: spec.category
            },
            message: `Created specification "${spec.title}" with ID ${spec.id} in category "${spec.category}"`
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Register get_spec tool
server.tool(
  'get_spec',
  'Get a specific specification by ID with optional relations',
  getSpecSchema._def.shape(),
  async (params) => {
    try {
      await ensureInitialized();
      
      const validated = getSpecSchema.parse(params);
      const spec = await fileSpecService.getSpecById(validated.spec_id);
      
      if (!spec) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: `Specification with ID ${validated.spec_id} not found`
            }, null, 2)
          }]
        };
      }

      let result: any = { 
        success: true, 
        spec: {
          ...spec,
          feature_group: spec.category
        }
      };

      if (validated.include_relations && spec.related_specs && spec.related_specs.length > 0) {
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
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Register search_specs tool
server.tool(
  'search_specs',
  'Search specifications with category boosting support',
  searchSpecsSchema._def.shape(),
  async (params) => {
    try {
      await ensureInitialized();
      
      const validated = searchSpecsSchema.parse(params);
      
      const options = {
        limit: validated.limit || 100,
        minScore: validated.min_score || 0.1,
        includeSnippets: true
      };
      
      const searchResults = searchIndexService.search(validated.query, options);
      
      // Convert search results to full specs
      const specs = [];
      for (const result of searchResults) {
        if (validated.offset && specs.length < validated.offset) continue;
        if (validated.limit && specs.length >= validated.limit) break;
        
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
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            results: specs,
            query: validated.query,
            pagination: {
              offset: validated.offset || 0,
              limit: validated.limit || 100,
              total: searchResults.length,
              has_more: searchResults.length > (validated.limit || 100)
            },
            search_stats: searchIndexService.getStats()
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Register update_spec tool
server.tool(
  'update_spec',
  'Update an existing specification with new data',
  updateSpecSchema._def.shape(),
  async (params) => {
    try {
      await ensureInitialized();
      
      const validated = updateSpecSchema.parse(params);
      const { spec_id, ...updates } = validated;
      
      // Map feature_group to category
      if (validated.feature_group) {
        (updates as any).category = validated.feature_group;
      }
      
      const spec = await fileSpecService.updateSpec(spec_id, updates);
      
      if (!spec) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: `Specification with ID ${spec_id} not found`
            }, null, 2)
          }]
        };
      }
      
      // Update search index for the changed spec
      const metadata = await fileSpecService.loadMetadata();
      const specMeta = metadata.specs[spec_id];
      if (specMeta) {
        await searchIndexService.updateDocument(spec_id, specMeta.file_path);
      }
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            spec: {
              ...spec,
              feature_group: spec.category
            },
            message: `Updated specification "${spec.title}"`
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Register delete_spec tool
server.tool(
  'delete_spec',
  'Delete a specification by ID',
  deleteSpecSchema._def.shape(),
  async (params) => {
    try {
      await ensureInitialized();
      
      const validated = deleteSpecSchema.parse(params);
      await fileSpecService.deleteSpec(validated.spec_id);
      
      // Remove from search index
      searchIndexService.removeDocument(validated.spec_id);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: `Deleted specification with ID ${validated.spec_id}`
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Register launch_dashboard tool  
server.tool(
  'launch_dashboard',
  'Launch the SpecGen web dashboard on localhost with the specified port',
  launchDashboardSchema._def.shape(),
  async (params) => {
    let dashboardPath: string | undefined;
    try {
      await ensureInitialized();
      
      const validated = launchDashboardSchema.parse(params);
      const port = validated.port || 4567;
      const host = validated.host || 'localhost';
      
      // Import necessary modules for subprocess launching and browser opening
      const { spawn } = await import('child_process');
      const path = await import('path');
      const fs = await import('fs');
      const { fileURLToPath } = await import('url');
      const open = (await import('open')).default;
      
      // Get the directory of this file (file-server.js when compiled)
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      
      // Dashboard server is in the project root (two levels up from dist/mcp/)
      dashboardPath = path.join(__dirname, '..', '..', 'dashboard-server.js');
      
      // Check if the dashboard server exists
      let fallbackPath: string;
      try {
        await fs.promises.access(dashboardPath, fs.constants.F_OK);
      } catch {
        // Try current working directory as fallback
        fallbackPath = path.join(process.cwd(), 'dashboard-server.js');
        try {
          await fs.promises.access(fallbackPath, fs.constants.F_OK);
          dashboardPath = fallbackPath;
        } catch {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: 'Dashboard server not found. Please ensure dashboard-server.js is accessible.',
                searched_paths: [dashboardPath, fallbackPath],
                current_dir: process.cwd(),
                mcp_server_dir: __dirname
              }, null, 2)
            }],
            isError: true
          };
        }
      }
      
      // Set environment variables for the dashboard server
      const env = {
        ...process.env,
        PORT: port.toString(),
        HOST: host
      };
      
      // Launch the dashboard server as subprocess  
      const child = spawn('node', [dashboardPath], {
        env,
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe'],  // Capture output initially
        cwd: path.dirname(dashboardPath)
      });
      
      let startupOutput = '';
      let startupError = '';
      
      // Capture startup output for debugging
      if (child.stdout) {
        child.stdout.on('data', (data) => {
          startupOutput += data.toString();
        });
      }
      
      if (child.stderr) {
        child.stderr.on('data', (data) => {
          startupError += data.toString();
        });
      }
      
      // Give the process a moment to start
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Detach the process completely so it runs independently
      if (child.pid) {
        child.disconnect?.();
        child.unref();
      }
      
      // Wait a bit more to see if it stays alive
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if the server is responding instead of checking process state
      try {
        const response = await fetch(`http://${host}:${port}/health`);
        if (!response.ok) {
          throw new Error(`Health check failed: ${response.status}`);
        }
      } catch (healthError) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: `Dashboard server health check failed: ${healthError instanceof Error ? healthError.message : String(healthError)}`,
              startup_output: startupOutput,
              startup_error: startupError,
              exit_code: child.exitCode,
              dashboard_path: dashboardPath
            }, null, 2)
          }],
          isError: true
        };
      }
      
      // Open the dashboard in the default browser
      const dashboardUrl = `http://${host}:${port}`;
      try {
        await open(dashboardUrl);
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: `Dashboard launched and browser opened at ${dashboardUrl}`,
              url: dashboardUrl,
              port,
              host,
              pid: child.pid,
              browser_opened: true,
              endpoints: {
                dashboard: dashboardUrl,
                api_health: `http://${host}:${port}/health`,
                api_specs: `http://${host}:${port}/api/specs`,
                api_stats: `http://${host}:${port}/api/stats`
              },
              note: "Dashboard is running in background and has been opened in your default browser."
            }, null, 2)
          }]
        };
      } catch (openError) {
        // If browser opening fails, still report success but note the issue
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: `Dashboard launched successfully on ${dashboardUrl}`,
              url: dashboardUrl,
              port,
              host,
              pid: child.pid,
              browser_opened: false,
              browser_error: openError instanceof Error ? openError.message : String(openError),
              endpoints: {
                dashboard: dashboardUrl,
                api_health: `http://${host}:${port}/health`,
                api_specs: `http://${host}:${port}/api/specs`,
                api_stats: `http://${host}:${port}/api/stats`
              },
              note: "Dashboard is running in background. Please manually open the URL in your browser."
            }, null, 2)
          }]
        };
      }
    } catch (error) {
      console.error('Dashboard launch error:', error);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            details: 'Failed to launch dashboard server subprocess',
            currentDir: process.cwd(),
            dashboardPath: typeof dashboardPath !== 'undefined' ? dashboardPath : 'undefined'
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// setup_project tool removed - create_spec now handles folder creation automatically

// Setup error handling
process.on('SIGINT', async () => {
  console.error('Shutting down SpecGen File-based MCP Server...');
  process.exit(0);
});

/**
 * Start the file-based MCP server with stdio transport
 */
export async function startFileMCPServer(): Promise<void> {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('SpecGen File-based MCP Server started successfully');
  } catch (error) {
    console.error('Failed to start SpecGen File-based MCP Server:', error);
    process.exit(1);
  }
}

// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('SpecGen File-based MCP Server running...');
  } catch (error) {
    console.error('Error starting file-based server:', error);
    process.exit(1);
  }
}

// If run directly, start the server
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch(console.error);
}