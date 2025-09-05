# Agentic Workflows
*Stop juggling between 15 browser tabs, scattered notes, and endless context switching*

![Banner](assets/banner.png)

**Finally, AI workflows that actually work together.** Instead of asking Claude the same questions over and over, create specialized agents that remember context, build on each other's work, and turn complex development tasks into simple conversations.

---

## The Problem We're Solving

You know that feeling when you're deep in a complex feature, and you have to:
- Explain your entire codebase to Claude... again
- Switch between architecture planning and implementation  
- Keep track of decisions made 3 conversations ago
- Coordinate different types of analysis (security, performance, etc.)

**What if your AI agents could talk to each other and build lasting knowledge about your project?**

## Table of Contents

- [What Makes This Different](#what-makes-this-different)
- [How It Works](#how-it-works)  
- [Get Started in 2 Minutes](#-get-started-in-2-minutes)
- [Real Workflows That Save Time](#real-workflows-that-save-time)
- [Who's Using This](#-whos-using-this)
- [Join the Community](#-join-the-community)
- [Learn More](#-learn-more)

## What Makes This Different

🧠 **Agents That Remember**: Your project context persists across conversations
🔄 **Workflows That Connect**: Architecture → Implementation → Review in one flow  
📝 **Specs That Live**: Documentation that updates as you build
🎯 **Purpose-Built**: Each agent is specialized for specific development tasks

## How It Works

```
You → /architect → Research + Explore → Create Spec → /engineer → Build → /reviewer → Ship
       ↓              ↓                    ↓           ↓           ↓         ↓
   "Add auth"     Find patterns      Document plan   Implement   Quality   Done
```

## 🏗️ architecture

![SpecGen Architecture](assets/specgen-architecture.jpg)
*how claude code, commands, agents, and SpecGen MCP work together*

## 📦 Components

### Core Workflows (`/core-workflows`)

**Claude Code Configuration System**
- **Agents Directory**: Specialized AI agents for different development phases
  - **Explorers**: `backend-explorer`, `frontend-explorer`, `database-explorer`, `integration-explorer`, `researcher`
  - **Reviewers**: `quality`, `performance`, `security`
- **Commands Directory**: High-level workflow orchestrators
  - `architect` - Feature analysis and specification generation
  - `engineer` - Implementation and development
  - `reviewer` - Code quality and architecture review
  - `writer` - Documentation and content generation
- **Hooks Directory**: System notifications and integrations
- **Settings**: Local configuration for Claude Code

### SpecGen MCP (`/specgen-mcp`)

**Project Specification Management with MCP Integration**

- **File-based Storage**: Markdown specifications with automatic organization
- **MCP Protocol**: Direct integration with Claude Code for real-time spec management
- **Auto-categorization**: Intelligent grouping by feature, priority, and status
- **Dashboard Interface**: Web-based visualization and management
- **Search & Discovery**: Full-text search across all specifications
- **Agent Integration**: Seamless workflow between agents and specifications

**Key Features:**
- 📝 Create, update, and manage project specifications
- 🔍 Search and discover existing specs across projects
- 📊 Visual dashboard for specification overview
- 🔗 Direct MCP integration with Claude Code agents
- 📂 Automatic file organization and categorization
- 🚀 Real-time updates during agent workflows

## 🔗 Recommended MCPs

Enhance your workflow with these compatible MCPs:

- **[Static Analysis MCP](https://www.npmjs.com/package/@r-mcp/static-analysis)**: TypeScript code analysis, symbol tracking, and compilation error detection
- **Chrome MCP**: Browser automation and web interaction capabilities
- **Database MCPs**: PostgreSQL, SQLite, and other database integrations
- **Additional MCPs**: Extend functionality based on your project needs

## 🚀 Get Started in 2 Minutes

### The Easiest Way

Just ask Claude Code:

> **"Install specgen-mcp for me from https://github.com/pwnk77/agentic-workflows"**

That's it. Claude will:
- Install SpecGen MCP
- Configure everything for you
- Set up all the agents and commands
- Get you ready to build better

### See It Working

Once installed, try your first workflow:

```bash
# Ask Claude to architect a new feature
/architect "Add user profile editing with image upload"

# Watch as multiple agents coordinate:
# → Research agent finds best practices
# → Backend explorer analyzes your API patterns  
# → Frontend explorer checks your component structure
# → All findings get saved to a living specification

# Then implement it:
/engineer SPEC-20250105-user-profiles

# Finally review it:
/reviewer SPEC-20250105-user-profiles --security --performance
```

### Manual Installation

```bash
# Install SpecGen MCP
npm install -g specgen-mcp

# Configure Claude Code (if not auto-configured)
claude mcp add specgen -s user -- npx -y specgen-mcp@latest

# Initialize in your project
specgen init

# Launch dashboard
specgen dashboard
```

See [QUICKSTART.md](./QUICKSTART.md) for detailed setup instructions.

## Real Workflows That Save Time

### Before Agentic Workflows:
```
You: "Help me add authentication"
Claude: "What's your stack? Database? Auth method?"
You: *explains everything*
Claude: "OK, here's some generic code..."
You: "Wait, this doesn't match my patterns"
*Repeat conversation 3 more times*
```

### With Agentic Workflows:
```
/architect "Add authentication with social login"
# → Agents explore your codebase
# → Find your existing patterns
# → Research best practices
# → Create a spec that fits YOUR project

/engineer SPEC-20250105-auth
# → Reads the spec
# → Implements following YOUR patterns
# → Updates spec with what was built

/reviewer SPEC-20250105-auth --security
# → Reviews against the original requirements
# → Checks for security issues
# → Suggests improvements
```

**Result**: Instead of 3 hours of back-and-forth, you get a well-architected, implemented, and reviewed feature in 30 minutes.

### Specification Management

```bash
# Create new specification
specgen create "User Dashboard Redesign"

# Search existing specs
specgen search "authentication"

# Launch visual dashboard
specgen dashboard

# View specification details
specgen show SPEC-20250101-user-auth
```

## 🎯 Use Cases

- **Feature Development**: End-to-end feature planning, implementation, and review
- **Architecture Analysis**: Deep codebase exploration and architectural decision making
- **Code Review**: Multi-perspective code analysis with specialized review agents
- **Documentation**: Automated specification generation and maintenance
- **Research**: Best practice research and technology evaluation
- **Project Planning**: Specification-driven development planning

## 🌟 Who's Using This

*Real projects using Agentic Workflows will be featured here soon*

Have a cool project? [Share it with us!](./showcase/)

## 🤝 Join the Community

- 📖 [Documentation](./docs/) - Deep dives and guides
- 💬 [Discussions](https://github.com/pwnk77/agentic-workflows/discussions) - Questions and ideas
- 🐛 [Issues](https://github.com/pwnk77/agentic-workflows/issues) - Bug reports and feature requests
- 📢 [Changelog](./CHANGELOG.md) - See what's new

## 📚 Learn More

- [Quick Start Guide](./QUICKSTART.md) - Get up and running quickly
- [SpecGen MCP Documentation](./specgen-mcp/README.md) - Detailed SpecGen usage
- [Agent Reference](./core-workflows/claude-code/agents/) - Individual agent capabilities
- [Command Reference](./core-workflows/claude-code/commands/) - Workflow command details

## 🔧 Development

### Repository Structure

```
agentic-workflows/
├── README.md                    # This file
├── QUICKSTART.md               # Installation guide
├── core-workflows/
│   └── claude-code/            # Claude Code configuration
│       ├── agents/             # Specialized AI agents
│       ├── commands/           # Workflow commands
│       ├── hooks/              # System hooks
│       └── settings.local.json # Configuration
├── specgen-mcp/                # SpecGen MCP implementation
│   ├── src/                    # TypeScript source
│   ├── dist/                   # Compiled JavaScript
│   ├── public/                 # Dashboard assets
│   └── README.md              # SpecGen documentation
└── static-analysis/            # Static analysis MCP (standalone)
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Claude Code integration
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

**Ready to stop explaining your project over and over?** 

Just ask Claude Code: *"Install specgen-mcp for me from https://github.com/pwnk77/agentic-workflows"*

Then try: `/architect "your next feature idea"`

Watch the magic happen. ✨

---

*Built with ♥️ for developers who want AI workflows that actually work together*  
*Powered by [Claude Code](https://claude.ai/code) and [Model Context Protocol](https://modelcontextprotocol.io/)*