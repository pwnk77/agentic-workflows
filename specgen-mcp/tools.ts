import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema, CallToolRequestSchema, McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import { spawn } from 'child_process';

// Configuration
const CONFIG = {
  docsPath: path.resolve(process.cwd(), '../docs'),
  metadataFile: path.resolve(process.cwd(), '../docs/.spec-metadata.json'),
  dashboardPath: path.resolve(process.cwd(), '../specdash')
};

export function setupTools(server: Server) {
  // Register all tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'list_specs',
        description: 'List all specification files with metadata',
        inputSchema: { type: 'object', properties: {}, required: [] }
      },
      {
        name: 'get_spec', 
        description: 'Get specification content by filename or feature name',
        inputSchema: { 
          type: 'object',
          properties: { feature: { type: 'string', description: 'Filename or feature name' } },
          required: ['feature']
        }
      },
      {
        name: 'search_specs',
        description: 'Search specifications by text query',
        inputSchema: {
          type: 'object', 
          properties: { query: { type: 'string', description: 'Search query' } },
          required: ['query']
        }
      },
      {
        name: 'refresh_metadata',
        description: 'Scan docs folder and refresh metadata file',
        inputSchema: {
          type: 'object',
          properties: { reason: { type: 'string', description: 'Reason for refresh' } },
          required: []
        }
      },
      {
        name: 'launch_dashboard',
        description: 'Launch web dashboard for CRUD operations',
        inputSchema: {
          type: 'object',
          properties: { port: { type: 'number', description: 'Port number (default: 3000)' } },
          required: []
        }
      }
    ]
  }));

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    try {
      switch (name) {
        case 'list_specs':
          return await handleListSpecs();
        case 'get_spec':
          return await handleGetSpec(args?.feature as string);
        case 'search_specs':
          return await handleSearchSpecs(args?.query as string);
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

// Tool implementations

async function handleListSpecs() {
  try {
    await ensureMetadataFile();
    const metadata = await readMetadata();
    const specs = Object.values(metadata.specs || {});
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(specs, null, 2)
        }
      ]
    };
  } catch (error) {
    throw new McpError(ErrorCode.InternalError, `Failed to list specs: ${error}`);
  }
}

async function handleGetSpec(feature: string) {
  if (!feature) {
    throw new McpError(ErrorCode.InvalidParams, 'Feature parameter is required');
  }

  try {
    const specFile = await findSpecFile(feature);
    const content = await fs.readFile(path.join(CONFIG.docsPath, specFile), 'utf-8');
    
    return {
      content: [
        {
          type: "text",
          text: content
        }
      ]
    };
  } catch (error) {
    throw new McpError(ErrorCode.InternalError, `Failed to get spec: ${error}`);
  }
}

async function handleSearchSpecs(query: string) {
  if (!query) {
    throw new McpError(ErrorCode.InvalidParams, 'Query parameter is required');
  }

  try {
    const specFiles = await glob('SPEC-*.md', { cwd: CONFIG.docsPath });
    const results = [];
    
    for (const file of specFiles) {
      const content = await fs.readFile(path.join(CONFIG.docsPath, file), 'utf-8');
      if (content.toLowerCase().includes(query.toLowerCase())) {
        const lines = content.split('\n');
        const matchingLines = lines.filter(line => 
          line.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3);
        
        results.push({
          filename: file,
          title: extractTitle(content),
          matches: matchingLines
        });
      }
    }
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(results, null, 2)
        }
      ]
    };
  } catch (error) {
    throw new McpError(ErrorCode.InternalError, `Failed to search specs: ${error}`);
  }
}

async function handleRefreshMetadata(reason?: string) {
  try {
    const metadata = await scanDocsFolder();
    await writeMetadata(metadata, reason);
    
    return {
      content: [
        {
          type: "text",
          text: `Metadata refreshed successfully. Found ${Object.keys(metadata.specs).length} specifications.${reason ? ` Reason: ${reason}` : ''}`
        }
      ]
    };
  } catch (error) {
    throw new McpError(ErrorCode.InternalError, `Failed to refresh metadata: ${error}`);
  }
}

async function handleLaunchDashboard(port: number) {
  try {
    // Check if dashboard directory exists
    await fs.access(CONFIG.dashboardPath);
    
    // Spawn dashboard process
    const child = spawn('node', ['server.js'], {
      cwd: CONFIG.dashboardPath,
      env: { ...process.env, PORT: port.toString() },
      detached: true,
      stdio: 'ignore'
    });
    
    child.unref();
    
    const dashboardUrl = `http://localhost:${port}`;
    
    return {
      content: [
        {
          type: "text",
          text: `Dashboard launched successfully at ${dashboardUrl}`
        }
      ]
    };
  } catch (error) {
    throw new McpError(ErrorCode.InternalError, `Failed to launch dashboard: ${error}`);
  }
}

// Helper functions

async function ensureMetadataFile() {
  try {
    await fs.access(CONFIG.metadataFile);
  } catch {
    await writeMetadata({
      metadata_version: "1.0.0",
      last_full_scan: new Date().toISOString(),
      specs: {}
    });
  }
}

async function readMetadata() {
  try {
    const content = await fs.readFile(CONFIG.metadataFile, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {
      metadata_version: "1.0.0",
      last_full_scan: new Date().toISOString(),
      specs: {}
    };
  }
}

async function writeMetadata(metadata: any, reason?: string) {
  const metadataWithTimestamp = {
    ...metadata,
    last_full_scan: new Date().toISOString(),
    ...(reason && { last_refresh_reason: reason })
  };
  
  await fs.writeFile(CONFIG.metadataFile, JSON.stringify(metadataWithTimestamp, null, 2));
}

async function scanDocsFolder() {
  const specFiles = await glob('SPEC-*.md', { cwd: CONFIG.docsPath });
  const specs: any = {};
  
  for (const file of specFiles) {
    const filePath = path.join(CONFIG.docsPath, file);
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

async function findSpecFile(feature: string): Promise<string> {
  // First try exact filename match
  const specFiles = await glob('SPEC-*.md', { cwd: CONFIG.docsPath });
  
  for (const file of specFiles) {
    if (file === feature || file.toLowerCase().includes(feature.toLowerCase())) {
      return file;
    }
  }
  
  // Search by title/content
  for (const file of specFiles) {
    const content = await fs.readFile(path.join(CONFIG.docsPath, file), 'utf-8');
    const title = extractTitle(content);
    if (title.toLowerCase().includes(feature.toLowerCase())) {
      return file;
    }
  }
  
  throw new Error(`Specification not found: ${feature}`);
}

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