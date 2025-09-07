# Quick Start Guide
*Get your AI agents working together in under 5 minutes*

This guide gets you from zero to productive AI workflows that actually remember your project context.

> **How it works**: Agents automatically create and manage specifications through MCP integration. No manual spec creation needed - just use the workflow commands and watch the magic happen!

## 🚀 Choose Your Installation Method

### Option 1: 3-Command Quick Start (Recommended)

The fastest way to get started with full control:

```bash
# 1. Install SpecGen globally
npm install -g specgen-mcp

# 2. Add MCP integration to Claude Code
claude mcp add specgen-mcp "npx specgen-mcp"

# 3. Set up your project (creates .claude configs automatically)
specgen setup
```

**That's it!** Restart Claude Code and you're ready to use `/architect`, `/engineer`, and `/reviewer` commands.

### Option 2: AI-Assisted Installation

Let Claude Code handle everything for you:

```
Install and set up the complete agentic workflow from https://github.com/pwnk77/agentic-workflows

Follow the 3-command quickstart: npm install -g specgen-mcp, claude mcp add specgen-mcp, and specgen setup after referring the quickstart.md file from the repository
```

**What Claude Code does automatically:**
- ✅ Fetches the repository and reads installation instructions
- ✅ Runs the 3-command installation sequence
- ✅ Verifies MCP connection and setup
- ✅ Copies `.claude` workflow configuration files
- ✅ Sets up specialized agents (explorers, reviewers)
- ✅ Enables workflow commands (architect, engineer, reviewer)
- ✅ Configures notification hooks
- ✅ Tests the installation and provides next steps

---

## 🔧 What Gets Installed

After installation, you'll have:

### Claude Code Integration
- **MCP Server**: `specgen-mcp` connected and ready
- **Agents**: Specialized AI agents in `.claude/agents/`
- **Commands**: Workflow commands in `.claude/commands/`
- **Hooks**: Notification systems in `.claude/hooks/`
- **Settings**: Local configuration in `.claude/settings.local.json`

### Project Structure
- **Specifications**: Auto-generated in `docs/SPEC-*.md`
- **Dashboard**: Web interface for visual spec management
- **Metadata**: Shared cache for fast spec operations

---

## 💡 First Steps

### 1. Verify Installation

Check that everything is working:

```bash
# Verify MCP connection
claude mcp list
# Should show: specgen-mcp: ✓ Connected

# Test the server
npx specgen-mcp --help
# Should show available MCP tools
```

### 2. Try the Architect Command

Create your first AI-driven specification:

```
/architect "Build a todo list API with authentication"
```

Watch the magic happen:
- 🔍 Research agents find best practices
- 📋 Backend explorer analyzes your code patterns
- 📝 Specification gets created automatically
- 🎯 Everything saved for future agents to use

### 3. View the Dashboard

See your specifications visually:

```javascript
// Ask Claude to launch the dashboard
"Launch the SpecGen dashboard for me"

// Usually opens at http://localhost:4567
```

Dashboard features:
- 📊 Visual overview of all specifications
- 🔍 Search and filter capabilities
- 📈 Progress tracking
- 🎯 Smart categorization

### 4. Use Engineer Command

Implement the feature Claude just architected:

```
/engineer SPEC-20250105-todo-api
```

Claude automatically:
- 📝 Reads the specification created by `/architect`
- 🛠️ Follows your existing code patterns
- 📊 Updates the spec as work progresses

### 5. Review Your Work

Get specialized analysis of your implementation:

```
/reviewer SPEC-20250105-todo-api --security --performance
```

Expert review agents:
- 🔒 Security agent finds vulnerabilities
- ⚡ Performance agent spots bottlenecks
- 📝 Updates specifications with findings

---

## 📚 Example Workflows

### Feature Development Flow

```bash
# 1. Architecture & Planning
/architect "Add real-time notifications using WebSocket"

# 2. Implementation
/engineer SPEC-20250104-websocket-notifications  

# 3. Review & Quality Check
/reviewer --all

# 4. Documentation (if needed)
/writer "Update API documentation for WebSocket endpoints"
```

### Multi-Feature Development

```bash
# Create multiple related features
/architect "User Dashboard Redesign"
/architect "Payment Integration" 

# View your specs in the dashboard
"Show me the SpecGen dashboard"

# Agents automatically find related specs and build upon them
```

---

## 🛠️ Troubleshooting

### Installation Issues

**Command not found: specgen**
```bash
# Check global installation
npm list -g specgen-mcp

# Reinstall if needed
npm install -g specgen-mcp --force
```

**MCP Not Connected**
```bash
# Check MCP status
claude mcp list

# Remove and re-add if needed
claude mcp remove specgen-mcp
claude mcp add specgen-mcp "npx specgen-mcp"

# Restart Claude Code (required)
```

**Commands Not Available**
```bash
# Check .claude directory exists
ls -la .claude/

# Re-run setup if missing
specgen setup
```

### Connection Issues

**"Failed to Connect" Error**:
- Restart Claude Code after MCP changes
- Check Node.js version (18+ recommended)
- Verify npm global path is accessible

**Server Not Found**:
- Use `npx specgen-mcp` method (most reliable)
- Check PATH includes npm global binaries
- Verify executable permissions

**Protocol Errors**:
- Update to latest version: `npm install -g specgen-mcp@latest`
- Test independently: `npx specgen-mcp --help`
- Use MCP inspector: `npx @modelcontextprotocol/inspector npx specgen-mcp`

### Dashboard Issues

**Dashboard Won't Start**:
```javascript
// Ask Claude to launch it
"Launch the SpecGen dashboard for me"
```

**No Specifications Visible**:
```bash
# Check project has specs
ls docs/SPEC-*.md

# Create your first spec
/architect "test feature"
```

---

## 🔗 Next Steps

Now that you're set up:

1. **Try the workflow**: `/architect "your first feature idea"`
2. **Read the [SpecGen Documentation](./specgen-mcp/README.md)** for advanced usage
3. **Explore [Agent Capabilities](./core-workflows/claude-code/agents/)** to understand each agent
4. **Configure [Additional MCPs](./README.md#recommended-mcps)** for enhanced functionality

---

**Ready to see AI agents that actually work together?**

Just try: `/architect "your first feature idea"`

Watch your project context get captured and used by every future conversation. ✨