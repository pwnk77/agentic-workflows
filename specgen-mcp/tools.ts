import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema, CallToolRequestSchema, McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import { spawn } from 'child_process';

// Configuration - Shared JSON metadata system
const CONFIG = {
  docsPath: path.resolve(process.cwd(), '../docs'),
  metadataFile: path.resolve(process.cwd(), '../docs/.spec-metadata.json'),
  dashboardPath: path.resolve(process.cwd(), '../specdash')
};

// Shared JSON metadata interface (matches Dashboard format)
interface SpecMetadata {
  metadata_version: string;
  last_full_scan: string;
  specs: {
    [filename: string]: {
      filename: string;
      title: string;
      category: string;
      status: string;
      priority: string;
      modified: string;
      created: string;
      manualStatus?: boolean;
      manualPriority?: boolean;
    };
  };
}

export function setupTools(server: Server) {
  // Register all MCP tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'list_specs',
        description: 'List all specification files with metadata from shared JSON',
        inputSchema: { 
          type: 'object', 
          properties: {
            status: { type: 'string', description: 'Filter by status (draft, todo, in-progress, done)' },
            category: { type: 'string', description: 'Filter by category' },
            limit: { type: 'number', description: 'Limit results' }
          },
          required: [] 
        }
      },
      {
        name: 'get_spec', 
        description: 'Get specification content by filename or title',
        inputSchema: { 
          type: 'object',
          properties: { 
            feature: { type: 'string', description: 'Filename (SPEC-*.md) or title to search for' } 
          },
          required: ['feature']
        }
      },
      {
        name: 'search_specs',
        description: 'Search specifications by text query using shared JSON metadata',
        inputSchema: {
          type: 'object', 
          properties: { 
            query: { type: 'string', description: 'Search query' },
            limit: { type: 'number', description: 'Limit results (default: 100)' }
          },
          required: ['query']
        }
      },
      {
        name: 'create_spec',
        description: 'Create new specification file and update shared JSON metadata',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Specification title' },
            body_md: { type: 'string', description: 'Markdown content' },
            status: { type: 'string', description: 'Status (draft, todo, in-progress, done)', default: 'draft' },
            priority: { type: 'string', description: 'Priority (low, medium, high)', default: 'medium' }
          },
          required: ['title', 'body_md']
        }
      },
      {
        name: 'update_spec',
        description: 'Update existing specification and shared JSON metadata',
        inputSchema: {
          type: 'object',
          properties: {
            spec_id: { type: 'number', description: 'Spec ID (hash of filename)' },
            filename: { type: 'string', description: 'Filename (alternative to spec_id)' },
            title: { type: 'string', description: 'New title' },
            body_md: { type: 'string', description: 'New markdown content' },
            status: { type: 'string', description: 'New status' },
            priority: { type: 'string', description: 'New priority' }
          },
          required: []
        }
      },
      {
        name: 'refresh_metadata',
        description: 'Scan docs folder and refresh shared JSON metadata',
        inputSchema: {
          type: 'object',
          properties: { 
            reason: { type: 'string', description: 'Reason for refresh (optional)' } 
          },
          required: []
        }
      },
      {
        name: 'launch_dashboard',
        description: 'Launch web dashboard for visual spec management',
        inputSchema: {
          type: 'object',
          properties: { 
            port: { type: 'number', description: 'Port number (default: 3000)' } 
          },
          required: []
        }
      }
    ]
  }));

  // Handle all tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    try {
      switch (name) {
        case 'list_specs':
          return await handleListSpecs(args?.status as string, args?.category as string, args?.limit as number);
        case 'get_spec':
          return await handleGetSpec(args?.feature as string);
        case 'search_specs':
          return await handleSearchSpecs(args?.query as string, (args?.limit as number) || 100);
        case 'create_spec':
          return await handleCreateSpec(args?.title as string, args?.body_md as string, args?.status as string, args?.priority as string);
        case 'update_spec':
          return await handleUpdateSpec(args?.spec_id as number, args?.filename as string, args as any);
        case 'refresh_metadata':
          return await handleRefreshMetadata(args?.reason as string);
        case 'launch_dashboard':
          return await handleLaunchDashboard((args?.port as number) || 3000);
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Tool ${name} failed: ${error}`);
    }
  });
}

// JSON Metadata Service
class JSONMetadataService {
  static async loadMetadata(): Promise<SpecMetadata> {
    try {
      const content = await fs.readFile(CONFIG.metadataFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      // Create empty metadata if file doesn't exist
      return {
        metadata_version: "1.0.0",
        last_full_scan: new Date().toISOString(),
        specs: {}
      };
    }
  }

  static async saveMetadata(metadata: SpecMetadata): Promise<void> {
    await fs.writeFile(CONFIG.metadataFile, JSON.stringify(metadata, null, 2));
  }

  static async scanSpecs(): Promise<SpecMetadata> {
    try {
      const files = await fs.readdir(CONFIG.docsPath);
      const specs: any = {};
      
      for (const file of files) {
        if (file.startsWith('SPEC-') && file.endsWith('.md')) {
          const filePath = path.join(CONFIG.docsPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const stats = await fs.stat(filePath);
          const title = extractTitle(content);
          
          specs[file] = {
            filename: file,
            title,
            category: detectCategory(content),
            status: detectStatus(content),
            priority: detectPriority(content),
            modified: stats.mtime.toISOString(),
            created: stats.birthtime.toISOString()
          };
        }
      }

      const metadata: SpecMetadata = {
        metadata_version: "1.0.0",
        last_full_scan: new Date().toISOString(),
        specs: specs
      };

      await this.saveMetadata(metadata);
      return metadata;
    } catch (error) {
      throw new Error(`Failed to scan specs: ${error}`);
    }
  }
}

// Tool implementations using shared JSON
async function handleListSpecs(status?: string, category?: string, limit?: number) {
  const metadata = await JSONMetadataService.loadMetadata();
  let specs = Object.values(metadata.specs);

  // Apply filters
  if (status) {
    specs = specs.filter(spec => spec.status === status);
  }
  if (category) {
    specs = specs.filter(spec => spec.category.toLowerCase() === category.toLowerCase());
  }

  // Apply limit
  if (limit) {
    specs = specs.slice(0, limit);
  }

  // Convert to MCP format with generated IDs
  const mcpSpecs = specs.map(spec => ({
    id: generateSpecId(spec.filename),
    title: spec.title,
    status: spec.status,
    category: spec.category,
    priority: spec.priority,
    created_at: spec.created,
    updated_at: spec.modified,
    created_via: 'discovery',
    related_specs: [],
    parent_spec_id: null,
    tags: extractTags(spec.title + ' ' + spec.category),
    effort_estimate: null,
    completion: spec.status === 'done' ? 100 : 0,
    body_md: '', // Load on demand
    feature_group: spec.category.toLowerCase(),
    file_path: path.join(CONFIG.docsPath, spec.filename),
    file_size: 0,
    checksum: generateFileHashSync(spec.filename + spec.modified)
  }));

  return {
    success: true,
    specs: mcpSpecs,
    pagination: {
      offset: 0,
      limit: limit || specs.length,
      total: specs.length
    }
  };
}

async function handleGetSpec(feature: string) {
  const metadata = await JSONMetadataService.loadMetadata();
  
  // Find spec by filename or title
  const spec = Object.values(metadata.specs).find(s => 
    s.filename === feature || 
    s.filename.includes(feature) ||
    s.title.toLowerCase().includes(feature.toLowerCase())
  );

  if (!spec) {
    throw new Error(`Specification not found: ${feature}`);
  }

  // Load full content
  const filePath = path.join(CONFIG.docsPath, spec.filename);
  const content = await fs.readFile(filePath, 'utf-8');

  return {
    success: true,
    spec: {
      id: generateSpecId(spec.filename),
      title: spec.title,
      status: spec.status,
      category: spec.category,
      priority: spec.priority,
      created_at: spec.created,
      updated_at: spec.modified,
      created_via: 'discovery',
      related_specs: [],
      parent_spec_id: null,
      tags: extractTags(content),
      effort_estimate: null,
      completion: spec.status === 'done' ? 100 : 0,
      body_md: content,
      feature_group: spec.category.toLowerCase()
    }
  };
}

async function handleSearchSpecs(query: string, limit: number = 100) {
  const metadata = await JSONMetadataService.loadMetadata();
  const results = [];

  for (const [filename, spec] of Object.entries(metadata.specs)) {
    try {
      const filePath = path.join(CONFIG.docsPath, filename);
      const content = await fs.readFile(filePath, 'utf-8');
      const searchText = `${spec.title} ${content}`.toLowerCase();
      const queryLower = query.toLowerCase();

      if (searchText.includes(queryLower)) {
        const score = calculateRelevance(searchText, queryLower);
        const snippet = extractSnippet(content, query);

        results.push({
          id: generateSpecId(filename),
          title: spec.title,
          status: spec.status,
          category: spec.category,
          priority: spec.priority,
          created_at: spec.created,
          updated_at: spec.modified,
          created_via: 'discovery',
          related_specs: [],
          parent_spec_id: null,
          tags: extractTags(content),
          effort_estimate: null,
          completion: spec.status === 'done' ? 100 : 0,
          body_md: content,
          feature_group: spec.category.toLowerCase(),
          score: score,
          snippet: snippet
        });
      }
    } catch (error) {
      console.error(`Error reading ${filename}:`, error);
    }
  }

  // Sort by relevance and limit
  results.sort((a, b) => b.score - a.score);
  const limitedResults = results.slice(0, limit);

  return {
    success: true,
    results: limitedResults,
    query: query,
    pagination: {
      offset: 0,
      limit: limit,
      total: results.length,
      has_more: results.length > limit
    }
  };
}

async function handleCreateSpec(title: string, bodyMd: string, status: string = 'draft', priority: string = 'medium') {
  // Generate filename
  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const slugTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50);
  const filename = `SPEC-${timestamp}-${slugTitle}.md`;
  
  // Create markdown content
  const content = `# ${title}

${bodyMd}
`;

  // Write file
  const filePath = path.join(CONFIG.docsPath, filename);
  await fs.writeFile(filePath, content);

  // Refresh metadata to include new spec
  await JSONMetadataService.scanSpecs();

  return {
    success: true,
    message: `Created specification: ${filename}`,
    filename: filename,
    spec: {
      id: generateSpecId(filename),
      title: title,
      status: status,
      category: detectCategory(content),
      priority: priority,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      body_md: content
    }
  };
}

async function handleUpdateSpec(specId?: number, filename?: string, updates: any = {}) {
  const metadata = await JSONMetadataService.loadMetadata();
  
  // Find spec by ID or filename
  let targetSpec: any;
  let targetFilename: string = '';

  if (filename) {
    targetSpec = metadata.specs[filename];
    targetFilename = filename;
  } else if (specId) {
    // Find by generated ID
    for (const [fname, spec] of Object.entries(metadata.specs)) {
      if (generateSpecId(fname) === specId) {
        targetSpec = spec;
        targetFilename = fname;
        break;
      }
    }
  }

  if (!targetSpec || !targetFilename) {
    throw new Error(`Specification not found: ${specId || filename}`);
  }

  // Read current content
  const filePath = path.join(CONFIG.docsPath, targetFilename);
  let content = await fs.readFile(filePath, 'utf-8');

  // Apply updates
  if (updates.title) {
    content = content.replace(/^#\s+.+/m, `# ${updates.title}`);
  }
  if (updates.body_md) {
    content = updates.body_md;
  }

  // Write updated content
  await fs.writeFile(filePath, content);

  // Update metadata with manual flags for status/priority
  if (updates.status || updates.priority) {
    const updatedMetadata = await JSONMetadataService.loadMetadata();
    if (updatedMetadata.specs[targetFilename]) {
      if (updates.status) {
        updatedMetadata.specs[targetFilename].status = updates.status;
        updatedMetadata.specs[targetFilename].manualStatus = true;
      }
      if (updates.priority) {
        updatedMetadata.specs[targetFilename].priority = updates.priority;
        updatedMetadata.specs[targetFilename].manualPriority = true;
      }
      updatedMetadata.specs[targetFilename].modified = new Date().toISOString();
      await JSONMetadataService.saveMetadata(updatedMetadata);
    }
  }

  // Refresh metadata
  await JSONMetadataService.scanSpecs();

  return {
    success: true,
    message: `Updated specification: ${targetFilename}`,
    filename: targetFilename,
    spec: {
      id: generateSpecId(targetFilename),
      title: updates.title || targetSpec.title,
      status: updates.status || targetSpec.status,
      updated_at: new Date().toISOString(),
      body_md: content
    }
  };
}

async function handleRefreshMetadata(reason?: string) {
  const metadata = await JSONMetadataService.scanSpecs();
  const specCount = Object.keys(metadata.specs).length;

  return {
    success: true,
    message: `Metadata refreshed: ${specCount} specs found`,
    reason: reason || 'Manual refresh',
    timestamp: metadata.last_full_scan,
    spec_count: specCount,
    specs_found: Object.keys(metadata.specs)
  };
}

async function handleLaunchDashboard(port: number = 3000) {
  try {
    // Start dashboard server
    const serverProcess = spawn('node', ['server.js'], {
      cwd: CONFIG.dashboardPath,
      env: { ...process.env, PORT: port.toString() },
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    const dashboardUrl = `http://localhost:${port}`;
    
    return {
      success: true,
      message: `Dashboard launched at ${dashboardUrl}`,
      url: dashboardUrl,
      pid: serverProcess.pid,
      note: "Dashboard is running in background and uses shared JSON metadata"
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
      details: "Failed to launch dashboard server",
      dashboardPath: CONFIG.dashboardPath
    };
  }
}

// Utility functions
function generateSpecId(filename: string): number {
  // Generate consistent ID from filename
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    const char = filename.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : 'Untitled';
}

function detectCategory(content: string): string {
  const contentLower = content.toLowerCase();
  
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
  const lines = content.split('\n');
  
  // Look for execution logs or completion indicators
  for (const line of lines) {
    const lineLower = line.toLowerCase();
    if (lineLower.includes('completed') || lineLower.includes('✅') || lineLower.includes('done')) {
      return 'done';
    }
    if (lineLower.includes('in-progress') || lineLower.includes('implementing') || lineLower.includes('🔄')) {
      return 'in-progress';
    }
    if (lineLower.includes('todo') || lineLower.includes('pending') || lineLower.includes('⏳')) {
      return 'todo';
    }
  }
  
  return 'draft';
}

function detectPriority(content: string): string {
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('high priority') || contentLower.includes('urgent') || contentLower.includes('critical')) {
    return 'high';
  }
  if (contentLower.includes('low priority') || contentLower.includes('nice to have') || contentLower.includes('optional')) {
    return 'low';
  }
  
  return 'medium';
}

function extractTags(content: string): string[] {
  const tags: string[] = [];
  const contentLower = content.toLowerCase();
  
  const tagKeywords = ['backend', 'frontend', 'api', 'database', 'ui', 'integration', 'testing', 'security', 'performance'];
  
  for (const keyword of tagKeywords) {
    if (contentLower.includes(keyword)) {
      tags.push(keyword);
    }
  }
  
  return [...new Set(tags)]; // Remove duplicates
}

function calculateRelevance(text: string, query: string): number {
  const words = query.split(' ').filter(w => w.length > 2);
  let score = 0;
  
  for (const word of words) {
    const matches = (text.match(new RegExp(word, 'gi')) || []).length;
    score += matches;
  }
  
  return score / words.length;
}

function extractSnippet(content: string, query: string): string {
  const lines = content.split('\n');
  const queryLower = query.toLowerCase();
  
  for (const line of lines) {
    if (line.toLowerCase().includes(queryLower)) {
      const words = line.split(' ');
      const start = Math.max(0, words.length - 10);
      const end = Math.min(words.length, start + 20);
      return words.slice(start, end).join(' ') + '...';
    }
  }
  
  return content.substring(0, 100) + '...';
}

function generateFileHashSync(content: string): string {
  // Simple hash function for change detection
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
}

async function generateFileHash(content: string): Promise<string> {
  return generateFileHashSync(content);
}