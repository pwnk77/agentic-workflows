#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { setupTools } from './tools.js';

// MCP Usage Instructions - Following MCP Best Practices
const MCP_INSTRUCTIONS = `
# SpecGen MCP Server v2.0.0
## Specification Management with Dashboard Integration

### 🔧 AVAILABLE TOOLS (5 total)

**list_specs** - List all specification files with metadata
• Returns: All SPEC-*.md files with title, category, status, modified date
• Parameters: None required
• Usage: Get overview of all specifications in the project

**get_spec** - Retrieve full specification content
• Parameters: feature (string) - filename or feature name
• Returns: Complete markdown content of specification
• Usage: Read detailed specification for implementation

**search_specs** - Full-text search across specifications
• Parameters: query (string) - search text
• Returns: Matching specs with highlighted context
• Usage: Find specifications containing specific keywords

**refresh_metadata** - Scan and update metadata cache
• Parameters: reason (string, optional) - why refresh is needed
• Updates: Shared .spec-metadata.json file
• Usage: Call after file changes (especially post-architect/engineer)

**launch_dashboard** - Start web dashboard interface
• Parameters: port (number, optional) - default: 3000
• Returns: Dashboard URL (http://localhost:3000)
• Usage: Launch CRUD interface for visual spec management

### 📋 WORKFLOW INTEGRATION

**After architect command:**
\`\`\`
refresh_metadata(reason: "architect command completed")
\`\`\`

**After engineer command:**
\`\`\`
refresh_metadata(reason: "engineer command completed")
\`\`\`

**For dashboard access:**
\`\`\`
launch_dashboard() // Spawns at http://localhost:3000
\`\`\`

### 📁 FILE STRUCTURE
• Specs: ../docs/SPEC-*.md
• Metadata: ../docs/.spec-metadata.json (shared with dashboard)
• Dashboard: ../specdash/ (auto-launched)

### ⚡ CAPABILITIES
• Read-only operations on markdown files
• Shared metadata management with dashboard
• Process spawning for dashboard launch
• File system monitoring integration
• JSON-RPC 2.0 compliant error handling

### 🔒 SECURITY
• No direct file write operations (read-only)
• Metadata updates via atomic writes
• Path validation and sanitization
• Dashboard launches in controlled environment
`;

class SpecGenMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      { 
        name: 'specgen-mcp', 
        version: '2.0.0',
        description: 'Specification management with metadata and dashboard integration'
      },
      { capabilities: { tools: {} } }
    );
    
    // Setup all tools from tools.ts
    setupTools(this.server);
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('SpecGen MCP Server started');
    console.error(MCP_INSTRUCTIONS); // Output instructions to stderr for Claude
  }
}

new SpecGenMCPServer().start().catch(console.error);