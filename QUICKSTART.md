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

```bash
# Add SpecGen MCP to Claude Code
claude mcp add specgen -s user -- npx -y specgen-mcp@latest

# Restart Claude Code to load the MCP
# (Claude Code will prompt you to restart)
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
3. **Reinstall if needed:**
   ```bash
   claude mcp remove specgen
   claude mcp add specgen -s user -- npx -y specgen-mcp@latest
   ```

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