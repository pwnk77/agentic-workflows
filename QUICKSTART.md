# Quick Start Guide
*Get your AI agents working together in under 5 minutes*

This guide gets you from zero to productive AI workflows that actually remember your project context.

> **How it works now**: Agents automatically create and manage specifications through MCP integration. No manual spec creation needed - just use the workflow commands and watch the magic happen!

## 🚀 One-Command Installation (Recommended)

The easiest way to get started is through Claude Code's built-in intelligence:

### Ask Claude Code

Simply type this prompt in Claude Code:

```
Install specgen-mcp for me from https://github.com/pwnk77/agentic-workflows
```

**What this does automatically:**
- ✅ Fetches the repository and reads installation instructions
- ✅ Installs the latest SpecGen MCP from npm
- ✅ Configures Claude Code MCP integration
- ✅ Copies `.claude` workflow configuration files
- ✅ Sets up specialized agents (explorers, reviewers)
- ✅ Enables workflow commands (architect, engineer, reviewer)
- ✅ Configures notification hooks
- ✅ Restarts Claude Code to load new configurations

### Alternative Prompts

If you want more specific control:

```
# For just SpecGen MCP
Install specgen-mcp from https://github.com/pwnk77/agentic-workflows with MCP integration

# For development workflow setup  
Set up the agentic development workflow from https://github.com/pwnk77/agentic-workflows

# For existing project integration
Add SpecGen specification management from https://github.com/pwnk77/agentic-workflows to my project
```

## 📦 Manual Installation

If you prefer to install manually or need more control:

### Step 1: Install SpecGen MCP

```bash
# Global installation
npm install -g specgen-mcp

# Or use npx for latest version
npx specgen-mcp@latest --help
```

### Step 2: Configure Claude Code MCP

**Option A: NPX Method (Recommended for Development)**
```bash
# Add SpecGen MCP using NPX - most reliable method
claude mcp add specgen-mcp "npx specgen-mcp"

# Restart Claude Code to load the MCP
# (Claude Code will prompt you to restart)
```

**Option B: Global Installation Method**
```bash
# Find global installation path
which specgen-mcp
# or npm list -g specgen-mcp --depth=0

# Add with absolute path (replace with your actual path)
claude mcp add specgen-mcp "/usr/local/lib/node_modules/specgen-mcp/bin/specgen-mcp.js"
```

**Option C: Local Project Method**
```bash
# Install in your project directory
cd your-project
npm install specgen-mcp

# Add with absolute path to local installation
claude mcp add specgen-mcp "node $(pwd)/node_modules/specgen-mcp/dist/index.js"
```

### Step 3: Initialize Your Project

```bash
# Navigate to your project directory
cd your-project

# Initialize SpecGen for your project
specgen init
```

### Step 4: Verify Installation

Test that everything is working in Claude Code:

```bash
# Test the workflow (in Claude Code)
/architect "Add a user profile page"

# Watch as agents automatically:
# → Create specifications
# → Research best practices  
# → Analyze your codebase
# → Store everything for future use
```

## 🔧 Configuration

### Project Setup

After installation, the setup is automatic:

1. **Initialize SpecGen in your project (optional):**
   ```bash
   specgen init
   ```
   *This is optional - agents will create the structure automatically*

2. **Start using workflows in Claude Code:**
   ```
   /architect "Add user authentication system"
   ```
   *Agents automatically create and manage specifications - no manual commands needed!*

### Claude Code Integration

The installation automatically configures:

- **Agents**: Specialized AI agents in `.claude/agents/`
- **Commands**: Workflow commands in `.claude/commands/`
- **Hooks**: Notification systems in `.claude/hooks/`
- **Settings**: Local configuration in `.claude/settings.local.json`

## 💡 First Steps

### 1. Try the Architect Command

Create your first AI-driven specification:

```
/architect "Build a todo list API with authentication"
```

Watch the magic happen:
- 🔍 Research agents find best practices
- 📋 Backend explorer analyzes your code patterns
- 📝 Specification gets created automatically
- 🎯 Everything saved for future agents to use

### 2. View the Dashboard

See your specifications visually in Claude Code:

```javascript
// Ask Claude to launch the dashboard
"Launch the SpecGen dashboard for me"

// Claude will use the MCP tool to start the dashboard
// Usually opens at http://localhost:4567
```

Dashboard shows:
- 📊 Visual overview of all specifications
- 🔍 Search and filter capabilities
- 📈 Progress tracking
- 🎯 Smart categorization

### 3. Use Engineer Command

Implement the feature Claude just architected:

```
/engineer SPEC-20250105-todo-api
```

Claude automatically:
- 📝 Reads the specification created by `/architect`
- 🛠️ Follows your existing code patterns
- 📊 Updates the spec as work progresses

### 4. Review Your Work

Get specialized analysis of your implementation:

```
/reviewer SPEC-20250105-todo-api --security --performance
```

Deployment of expert review agents:
- 🔒 Security agent finds vulnerabilities
- ⚡ Performance agent spots bottlenecks
- 📝 Updates specifications with findings

## 📚 Example Workflows

### Feature Development Flow

```bash
# 1. Architecture & Planning
/architect "Add real-time notifications using WebSocket"

# 2. Implementation
/engineer SPEC-20250104-websocket-notifications  

# 3. Review & Quality Check
/reviewer --all

# 4. Documentation
/writer "Update API documentation for WebSocket endpoints"
```

### Specification Management

Specifications are managed automatically by agents:

```bash
# Agents create specs during workflows
/architect "User Dashboard Redesign"
/architect "Payment Integration" 

# View your specs in the dashboard
"Show me the SpecGen dashboard"

# Search happens automatically when agents need context
# Agents find related specs and build upon them

# Check what specs you have (optional)
specgen status
```

## 🛠️ Troubleshooting

### MCP Not Working

If MCP commands aren't available:

1. **Restart Claude Code** (required after MCP installation)

2. **Check MCP configuration:**
   ```bash
   claude mcp list
   ```
   Look for `specgen-mcp: ✓ Connected` or `✗ Failed to connect`

3. **Test MCP server independently:**
   ```bash
   # Test the server directly
   npx specgen-mcp
   # Should show server banner with 5 available tools
   ```

4. **Fix connection issues:**
   ```bash
   # Remove old configuration
   claude mcp remove specgen-mcp
   
   # Re-add with NPX method (most reliable)
   claude mcp add specgen-mcp "npx specgen-mcp"
   
   # Restart Claude Code
   ```

5. **Validate MCP protocol compliance:**
   ```bash
   # Use MCP inspector to test server
   npx @modelcontextprotocol/inspector npx specgen-mcp
   ```

### Common Connection Issues

**"Failed to Connect" Error**:
- Verify server builds correctly: `npm run build` in specgen-mcp directory
- Check Node.js version compatibility (Node 18+ recommended)
- Ensure all dependencies installed: `npm install`

**Server Not Found**:
- Use absolute paths instead of relative paths
- Verify executable permissions: `chmod +x /path/to/server`
- Check PATH includes npm global binaries

**Protocol Errors**:
- Update to latest @modelcontextprotocol/sdk version
- Test JSON-RPC communication manually
- Review server logs for detailed error messages

### Commands Not Available

If `/architect`, `/engineer` commands aren't working:

1. **Check `.claude` directory exists in your project**
2. **Verify configuration files were copied:**
   ```bash
   ls -la .claude/
   ```
3. **Reinstall with copy fix:**
   ```
   Ask Claude Code: "Reinstall specgen-mcp and fix the .claude configuration files"
   ```

### Dashboard Not Loading

If the dashboard won't start when requested:

1. **Ask Claude to launch it:**
   ```
   "Launch the SpecGen dashboard for me"
   ```
   Claude will use the MCP tool to start the dashboard

2. **Check project initialization:**
   ```bash
   specgen status
   ```

3. **Reinitialize if needed:**
   ```bash
   specgen init
   ```

## 🔗 Next Steps

Now that you're set up:

1. **Read the [SpecGen Documentation](./specgen-mcp/README.md)** for detailed usage
2. **Explore [Agent Capabilities](./core-workflows/claude-code/agents/)** to understand each agent
3. **Try [Advanced Workflows](./README.md#example-workflows)** for complex development tasks
4. **Configure [Additional MCPs](./README.md#recommended-mcps)** for enhanced functionality


---

**Ready to see AI agents that actually work together?**

Just try: `/architect "your first feature idea"`

Watch your project context get captured and used by every future conversation. ✨