#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { setupTools } from './tools.js';

// MCP Usage Instructions - Following MCP Best Practices
const MCP_INSTRUCTIONS = `
# SpecGen MCP Server v2.0.0
## Specification Management with Dashboard Integration

### 🔧 AVAILABLE TOOLS (5 total - READ-ONLY MCP)

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
• Parameters: port (number, optional) - default: 4567
• Returns: Dashboard URL (http://localhost:PORT)
• Usage: Launch CRUD interface for visual spec management
• IMPORTANT: Run refresh_metadata first to populate dashboard with specs

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
# IMPORTANT: Always refresh metadata before launching dashboard
refresh_metadata(reason: "preparing dashboard data")
launch_dashboard(port: 4567) // Spawns dashboard with all specs visible
\`\`\`

**Note:** The dashboard requires metadata to be refreshed first to see all specifications from subdirectories.

### 📁 FILE STRUCTURE & DOCS DETECTION

**Project Structure Required:**
• Specs: ./docs/SPEC-*.md (relative to where MCP is run)
• Metadata: ./docs/.spec-metadata.json (shared with dashboard)
• Dashboard: Uses globally installed specdash (auto-detected)

**How Docs Folder Detection Works:**
• MCP always looks for specs in the 'docs/' folder relative to your current directory
• Run MCP commands from your project root (where you want docs/ to be)
• Global install: Dashboard from /opt/homebrew/lib/node_modules/specgen-mcp/specdash
• Local install: Dashboard from project/.specgen/specdash
• Specs always from: {your-current-directory}/docs/

**Troubleshooting:**
• No specs found? Ensure you're in the right directory with a docs/ folder
• Dashboard not launching? Check that specgen-mcp is installed globally or locally
• Wrong specs showing? Make sure you're running from the correct project root

### ⚡ CAPABILITIES
• Read-only operations on markdown files
• Shared metadata management with dashboard
• Process spawning for dashboard launch
• File system monitoring integration
• JSON-RPC 2.0 compliant error handling

### 🔒 SECURITY & ARCHITECTURE
• READ-ONLY MCP operations (no create_spec/update_spec tools)
• Write operations handled by /architect and /engineer commands
• Metadata updates via atomic writes
• Path validation and sanitization
• Dashboard launches in controlled environment

### 📝 WRITE OPERATIONS (Via Commands)
• Use /architect command to create new specs
• Use /engineer command to update existing specs
• MCP refresh_metadata called automatically after commands
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