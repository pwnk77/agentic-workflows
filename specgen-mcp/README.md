# SpecGen MCP

Complete specification management system for Claude Code with MCP integration, commands, agents, and dashboard.

## 🚀 Quick Start (3 Commands)

```bash
# 1. Install globally (no project pollution)
npm install -g specgen-mcp

# 2. Setup in your project directory  
cd your-project
specgen-setup

# 3. Add to Claude Code
claude mcp add specgen-mcp "specgen-mcp"
```

**That's it!** Restart Claude Code and you're ready to go.

## 📦 What You Get

### Claude Code Integration
- **Commands**: `/architect`, `/engineer`, `/reviewer`
- **Specialized Agents**: Backend, Frontend, Database, Integration explorers
- **Performance & Security**: Code review agents
- **Hooks**: Notification systems

### Specification Management  
- **MCP Tools**: `list_specs`, `get_spec`, `search_specs`, `refresh_metadata`
- **Dashboard**: Visual spec management at http://localhost:4567
- **Shared Metadata**: Seamless sync between MCP and dashboard

### Clean Architecture
```
your-project/
├── .claude/          # Claude Code integration
├── docs/             # Specifications (SPEC-*.md files)
└── .specgen/         # MCP server & dashboard
```

## 💡 Usage

### Creating Specifications
```
/architect "Add user authentication system"
```
Creates `docs/SPEC-001-user-authentication.md` with detailed specification.

### Implementing Features  
```
/engineer "Implement the user authentication from SPEC-001"
```
Generates implementation code based on the specification.

### Code Review
```
/reviewer security "Review the authentication implementation"
```
Performs security analysis with actionable recommendations.

### Visual Management
```
# In Claude Code
refresh_metadata(reason: "preparing dashboard")
launch_dashboard()
```
Opens http://localhost:4567 for visual spec management.

## 🔧 MCP Tools

- **`list_specs`** - View all specifications with metadata
- **`get_spec`** - Read full specification content  
- **`search_specs`** - Full-text search across specs
- **`refresh_metadata`** - Update metadata cache
- **`launch_dashboard`** - Start web dashboard

## 🌟 Features

- ✅ **Zero project pollution** - Global install, clean setup
- ✅ **Works with existing projects** - No dependency conflicts
- ✅ **Cross-project usage** - Install once, use everywhere
- ✅ **Professional workflow** - Integrated with Claude Code
- ✅ **Visual dashboard** - Web-based spec management
- ✅ **Extensible agents** - Specialized for different domains

## 📁 Directory Structure

After running `specgen-setup`:

- **`.claude/`** - Claude Code commands, agents, and settings (required in project root)
- **`docs/`** - Your specifications and metadata (required in project root)
- **`.specgen/`** - MCP server and dashboard files (consolidated)

## 🔄 Multiple Projects

Use the same global installation across multiple projects:

```bash
# Project 1
cd /path/to/project1
specgen-setup

# Project 2  
cd /path/to/project2
specgen-setup

# Both projects now have SpecGen MCP ready to use!
```

## 🛠️ Development

- **Version**: 2.2.0
- **Node**: >=16.0.0
- **License**: MIT
- **Repository**: [agentic-workflows](https://github.com/anthropics/agentic-workflows)

## 📋 Commands

- `specgen-mcp` - Start MCP server
- `specgen-setup` - Setup project directories

---

**Ready to revolutionize your specification workflow!** 🎯