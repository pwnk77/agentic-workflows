# SpecGen MCP
*Because losing project context between AI conversations is painful*

![SpecGen Banner](assets/banner.png)

**Tired of re-explaining your project every time you start a new Claude conversation?** SpecGen keeps your project specs, decisions, and context in one place where all your AI agents can access and build upon them.

---

## The Context Problem

Every developer knows this frustration:
- You have a great architecture discussion with Claude
- Two days later, you need to implement it
- Claude has no memory of your previous conversation
- You start over, explaining everything again

**SpecGen solves this by giving your AI workflows a persistent memory.**

## Table of Contents

- [See It In Action](#see-it-in-action)
- [How SpecGen Works](#how-specgen-works)
- [Get Started Right Now](#-get-started-right-now)
- [How to Use It](#-how-to-use-it)
- [Dashboard Interface](#-dashboard-interface)
- [Claude Code Integration](#-claude-code-integration)
- [Who's Using SpecGen](#-whos-using-specgen)
- [Join the Community](#-join-the-community)

## See It In Action

### Before SpecGen:
```
You: "Can you help implement user authentication?"
Claude: "Sure! What's your tech stack? What type of auth? Where's your user model?"
You: *explains everything again*
```

### With SpecGen:
```
You: "/architect user authentication"  
Claude: *reads existing specs* "I see you're using JWT with PostgreSQL. 
Let me build on the user model we defined in SPEC-123..."
```

![Dashboard Overview](assets/dashboard-overview.png)
*Your specifications, organized and accessible to all your AI agents*

![Specs Management](assets/dashboard-specs.png)  
*Track progress, manage relationships, and keep everything connected*

## How SpecGen Works

```
Agent Request → MCP Tools → File System → Dashboard
       ↓             ↓          ↓           ↓
   Read/Write → Process Specs → Store → Visualize
```

🧠 **Persistent Memory**: Your specs survive across all conversations  
🔄 **Live Updates**: Agents read and write specs in real-time  
📊 **Smart Organization**: Auto-categorization by content and context  
🎯 **Visual Management**: Dashboard for easy browsing and editing

## 🚀 Get Started Right Now

### The Fastest Way

```bash
# Just run this one command:
claude mcp add specgen -s user -- npx -y specgen-mcp@latest
```

**That's it!** Restart Claude Code and your agents now have persistent memory.

### Try It Immediately

```bash
# Create your first spec
/architect "Add a user settings page"

# Watch SpecGen capture all the context
# Later, continue the conversation:
/engineer SPEC-20250105-user-settings

# Claude remembers everything from the architecture phase
```

### Other Ways to Install

```bash
# Install globally if you prefer
npm install -g specgen-mcp

# Or run directly in your project
npx specgen-mcp@latest init
```

### Know It's Working

After installation, try any `/architect` command in Claude Code. You'll see SpecGen automatically capturing and organizing your project specs in the background. No configuration needed!

## 📚 How to Use It

### It Just Works

Once installed, SpecGen works automatically behind the scenes. Your agents use it without you having to think about it.

```bash
# Initialize in your project (optional)
specgen init

# Check what specs you have
specgen status

# Launch the visual dashboard
specgen dashboard
```

### The Magic Happens in Claude Code

Your agents automatically use SpecGen through MCP tools:
- 📝 Create specs during `/architect` commands
- 🔍 Search existing specs when implementing
- 📊 Update specs as work progresses
- 📊 Track relationships between features

### MCP Tool Examples

```javascript
// Create with metadata
await mcp__specgen-mcp__create_spec({
  title: "Payment Integration",
  body_md: "...",
  priority: "high",
  status: "todo"
})

// Filter listings
await mcp__specgen-mcp__list_specs({
  status: "in-progress",
  priority: "high"
})

// Search with options
await mcp__specgen-mcp__search_specs({
  query: "API",
  limit: 10,
  min_score: 0.5
})

// Update specification
await mcp__specgen-mcp__update_spec({
  spec_id: 123,
  status: "in-progress"
})

// Delete specification
await mcp__specgen-mcp__delete_spec({
  spec_id: 456
})
```

## 🔧 MCP Tools

SpecGen provides these MCP tools for Claude Code agents:

### Specification Management
- `mcp__specgen-mcp__create_spec`: Create new specifications with auto-categorization
- `mcp__specgen-mcp__get_spec`: Retrieve specification by ID with optional relations
- `mcp__specgen-mcp__update_spec`: Update existing specifications with new data
- `mcp__specgen-mcp__delete_spec`: Remove specifications by ID

### Discovery & Search
- `mcp__specgen-mcp__list_specs`: List specifications with filtering and pagination
- `mcp__specgen-mcp__search_specs`: Full-text search with relevance scoring

### Project Management  
- `mcp__specgen-mcp__setup_project`: Initialize SpecGen in new or existing projects
- `mcp__specgen-mcp__launch_dashboard`: Start web dashboard for visual management

## 🎨 Dashboard Interface

Launch the visual dashboard using the MCP tool:

```javascript
// In Claude Code, use the MCP tool:
mcp__specgen-mcp__launch_dashboard()
// Dashboard opens on http://localhost:4567

// Or with custom port:
mcp__specgen-mcp__launch_dashboard({ port: 4568 })
```

### Dashboard Features

- **📋 Specification Overview**: Card-based view of all specifications
- **🎯 Category Organization**: Auto-grouped by feature area and theme  
- **🔍 Advanced Search**: Filter by status, priority, category, and content
- **📈 Progress Tracking**: Visual indicators of project completion
- **🔗 Relationship Mapping**: See connections between specifications
- **✏️ Quick Actions**: Create, edit, and update directly from dashboard

### Dashboard Navigation

- **Home**: Overview with recent specifications and statistics
- **Categories**: Browse specifications organized by auto-detected categories
- **Search**: Advanced search with filters and sorting options
- **Status Board**: Kanban-style view by specification status
- **Analytics**: Project metrics and progress insights

## 🤖 Claude Code Integration

### Workflow Commands

SpecGen integrates seamlessly with Claude Code workflow commands:

#### Architect Command
```bash
# Creates comprehensive specifications via MCP
/architect "Build a real-time chat system"
```

**What happens:**
1. Agent analyzes the feature request
2. Deploys explorer agents for codebase analysis  
3. Uses `mcp__specgen-mcp__create_spec` to create specification
4. Research agents update specification with findings
5. Complete specification ready for implementation

#### Engineer Command
```bash
# Reads specifications and implements features
/engineer SPEC-20250104-chat-system
```

**What happens:**
1. Uses `mcp__specgen-mcp__get_spec` to read specification
2. Implements feature following architectural decisions
3. Updates specification with implementation details
4. Creates sub-tasks and tracks progress

#### Reviewer Command
```bash
# Reviews implementations against specifications
/reviewer SPEC-20250104-chat-system --security --performance
```

**What happens:**
1. Reads specification for review context
2. Deploys specialized review agents
3. Updates specification with review findings
4. Tracks quality metrics and recommendations

### Agent Integration Examples

**Research Agent**:
```typescript
// Agent reads specification context
const spec = await mcp.get_spec({ spec_id: 123 });

// Conducts research based on spec requirements
const research = await conductResearch(spec.body_md);

// Updates specification with findings
await mcp.update_spec({
  spec_id: 123,
  body_md: spec.body_md + `\n### Research Findings\n${research}`
});
```

**Backend Explorer Agent**:
```typescript
// Analyzes codebase architecture
const architectureAnalysis = await exploreBackend();

// Updates spec with architectural insights
await mcp.update_spec({
  spec_id: 123,
  body_md: addSection(spec.body_md, "Backend Architecture", architectureAnalysis)
});
```

## 📁 File Organization

### Automatic Structure

SpecGen automatically organizes specifications:

```
your-project/
├── docs/
│   ├── features/
│   │   ├── SPEC-20250104-user-auth.md
│   │   └── SPEC-20250104-payment-system.md
│   ├── infrastructure/  
│   │   └── SPEC-20250104-deployment.md
│   └── api/
│       └── SPEC-20250104-rest-endpoints.md
├── .specgen/
│   ├── metadata.json      # Specification index
│   └── config.json        # Project configuration
└── specs-metadata.json    # Global specification registry
```

### Category Detection

SpecGen automatically categorizes specifications based on:

- **Folder Structure**: Specifications in `docs/api/` → `api` category
- **Content Analysis**: Keywords like "database", "frontend", "API" 
- **Technology Detection**: Framework and library mentions
- **Pattern Recognition**: Common development patterns and architectures

## ⚙️ Configuration

### Project Configuration

Initialize with custom settings:

```bash
# Initialize with options
specgen init --project-name "My App" --auto-organize true

# Configure discovery
specgen config set discover-existing true
```

### Global Settings

```bash
# Set default dashboard port
specgen config set dashboard-port 3456

# Configure search behavior
specgen config set search-min-score 0.3
```

### Environment Variables

```bash
# Custom database location
export SPECGEN_DB_PATH="/custom/path/specs.db"

# Dashboard configuration
export SPECGEN_DASHBOARD_HOST="0.0.0.0"
export SPECGEN_DASHBOARD_PORT="3000"
```

## 🔄 Specification Lifecycle

### Development Flow

1. **Creation**: Use `/architect` or `specgen create`
2. **Research**: Agents populate with research findings
3. **Planning**: Architecture and implementation details added
4. **Implementation**: Engineers read specs and implement features
5. **Review**: Quality agents review against specifications
6. **Completion**: Specifications marked as done with outcomes

### Status Progression

```
Draft → Todo → In-Progress → Done
  ↓       ↓         ↓         ↓
Auto   Ready    Active    Complete
save   queue   develop   archive
```

### Metadata Evolution

Specifications evolve with automatic metadata updates:

- **Created**: Timestamp and creation method
- **Updated**: Last modification time and source
- **Category**: Auto-detected and refined over time
- **Relationships**: Links discovered through content analysis
- **Progress**: Status updates from agent workflows

## 🛠️ Development & Extension

### Custom Agents

Create agents that integrate with SpecGen:

```typescript
// Agent template for SpecGen integration
class CustomAgent {
  async processSpec(specId: number) {
    // Read specification
    const spec = await mcp.get_spec({ spec_id: specId });
    
    // Perform custom analysis
    const analysis = await this.customAnalysis(spec);
    
    // Update specification
    await mcp.update_spec({
      spec_id: specId,
      body_md: this.addSection(spec.body_md, "Custom Analysis", analysis)
    });
  }
}
```

### Custom Commands

Extend workflow commands to use SpecGen:

```markdown
---
description: Custom workflow command with SpecGen integration
allowed-tools: Task, mcp__specgen-mcp__*
---

# My Custom Command

1. Read existing specifications: mcp__specgen-mcp__search_specs
2. Create new specification: mcp__specgen-mcp__create_spec  
3. Update with results: mcp__specgen-mcp__update_spec
```

## 📊 Analytics & Insights

### Project Metrics

```bash
# View project statistics
specgen stats

# Export metrics
specgen export --format json --output project-metrics.json
```

### Dashboard Analytics

Access analytics in the dashboard:

- **Specification Count**: Total, by status, by category
- **Progress Tracking**: Completion rates over time
- **Agent Activity**: Which agents are most active
- **Search Patterns**: Most searched terms and categories

## 🧪 Testing

### Unit Tests

```bash
# Run SpecGen test suite
npm test

# Test MCP integration
npm run test:mcp

# Test dashboard functionality  
npm run test:dashboard
```

### Integration Testing

```bash
# Test with Claude Code integration
specgen test-integration

# Verify MCP tools
specgen test-mcp-tools
```

## 🔧 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| MCP tools not available | Restart Claude Code after installation |
| Dashboard won't start | Check port availability, try `--port 3001` |
| Specifications not found | Run `specgen init` in project root |
| Search results empty | Check database with `specgen status` |
| Auto-categorization wrong | Update with `specgen update --category correct-name` |

### Debug Commands

```bash
# Check SpecGen status
specgen status --verbose

# Verify database health
specgen db-health-check

# Reset if corrupted
specgen db-maintenance --rebuild

# Export for debugging
specgen export --include-metadata
```

### Log Analysis

```bash
# Enable debug logging
export DEBUG=specgen:*

# View MCP communication logs
specgen logs --mcp

# Dashboard server logs
specgen logs --dashboard
```

## 📚 API Reference

### MCP Tool Parameters

#### create_spec
```typescript
{
  title: string;           // Specification title
  body_md: string;        // Markdown content
  status?: "draft" | "todo" | "in-progress" | "done";
  priority?: "low" | "medium" | "high";
  feature_group?: string; // Custom grouping
  parent_spec_id?: number; // Parent specification
  related_specs?: number[]; // Related specification IDs
}
```

#### search_specs  
```typescript
{
  query: string;          // Search query
  limit?: number;         // Max results (default: 20)
  offset?: number;        // Pagination offset
  min_score?: number;     // Minimum relevance score
}
```

#### list_specs
```typescript
{
  status?: "draft" | "todo" | "in-progress" | "done";
  priority?: "low" | "medium" | "high";
  feature_group?: string;
  sort_by?: "id" | "title" | "created_at" | "updated_at" | "priority";
  sort_order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}
```

## 🌟 Who's Using SpecGen

*Coming soon: Real projects and teams using SpecGen MCP*

Using SpecGen in a cool project? [Tell us about it!](https://github.com/pawanraviee/agentic-workflows/discussions)

## 🤝 Join the Community

- 💬 [Discussions](https://github.com/pawanraviee/agentic-workflows/discussions) - Questions, ideas, and sharing
- 🐛 [Issues](https://github.com/pawanraviee/agentic-workflows/issues) - Bug reports and feature requests  
- 📖 [Main Documentation](../README.md) - Complete workflow guide
- 🚀 [Quick Start](../QUICKSTART.md) - Get up and running fast

## 🐛 Want to Contribute?

We'd love your help! Whether it's:
- 📝 Improving documentation
- 🐞 Fixing bugs
- ✨ Adding features  
- 💬 Sharing feedback

[Check out our contributor guide](../CONTRIBUTING.md) to get started.

### Development Setup

```bash
# Clone and setup
git clone https://github.com/pawanraviee/agentic-workflows.git
cd agentic-workflows/specgen-mcp

# Install dependencies
npm install

# Build project
npm run build

# Run tests
npm test

# Start development server
npm run dev
```

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

---

**Tired of repeating yourself to AI agents?**

Just run: `claude mcp add specgen -s user -- npx -y specgen-mcp@latest`

Then try: `/architect "your feature idea"`

Watch your AI agents finally remember what you talked about. ✨

---

*Built with ♥️ for developers who want AI workflows that actually remember*  
*Powered by [Claude Code](https://claude.ai/code) and [Model Context Protocol](https://modelcontextprotocol.io/)*