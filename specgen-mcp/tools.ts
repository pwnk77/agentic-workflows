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
export class JSONMetadataService {
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
      // Use glob for recursive scanning of subdirectories
      const pattern = path.join(CONFIG.docsPath, '**/SPEC-*.md');
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
  let metadata = await JSONMetadataService.loadMetadata();
  
  // Find spec by filename or title
  let spec = Object.values(metadata.specs).find(s => 
    s.filename === feature || 
    s.filename.includes(feature) ||
    s.title.toLowerCase().includes(feature.toLowerCase())
  );

  // Auto-refresh fallback if spec not found
  if (!spec) {
    metadata = await JSONMetadataService.scanSpecs();
    spec = Object.values(metadata.specs).find(s => 
      s.filename === feature || 
      s.filename.includes(feature) ||
      s.title.toLowerCase().includes(feature.toLowerCase())
    );
  }

  if (!spec) {
    throw new Error(`Specification not found: ${feature}`);
  }

  // Load full content - need to find the actual file path since files are in subdirectories
  const pattern = path.join(CONFIG.docsPath, `**/${spec.filename}`);
  const filePaths = await glob(pattern);
  if (filePaths.length === 0) {
    throw new Error(`File not found: ${spec.filename}`);
  }
  const filePath = filePaths[0]; // Use first match
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

    // Wait for server to start with basic health verification
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Basic health check - try to verify server is responding
    const dashboardUrl = `http://localhost:${port}`;
    let healthCheckPassed = false;
    
    try {
      // Simple health verification - if we can fetch, server is likely up
      const http = await import('http');
      const healthPromise = new Promise((resolve) => {
        const req = http.request(`http://localhost:${port}`, { method: 'GET' }, (res) => {
          resolve(res.statusCode === 200 || res.statusCode === 404); // 404 is OK, means server is up
        });
        req.on('error', () => resolve(false));
        req.setTimeout(2000, () => {
          req.destroy();
          resolve(false);
        });
        req.end();
      });
      
      healthCheckPassed = await healthPromise as boolean;
    } catch (healthError) {
      // Health check failed, but server might still be starting
      console.error('Health check failed:', healthError);
    }
    
    return {
      success: true,
      message: `Dashboard launched at ${dashboardUrl}`,
      url: dashboardUrl,
      pid: serverProcess.pid,
      health_verified: healthCheckPassed,
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

// Frontmatter utility functions
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