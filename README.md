# 🤖 Agentic Workflows Hub

*Complete Claude Code configuration for systematic AI-powered development*

## 📋 What's Available

This repository provides a complete Claude Code setup with specialized workflows, intelligent hooks, and security configurations for development automation.

### 🔧 Core Components

**Two Development Modes:**
- **Auto Mode**: Automated agent orchestration (`/build`, `/fix`, `/quality-check`, `/user-check`)
- **Control Mode**: Manual workflow selection (`architect`, `engineer`, `security`, `performance`, `quality`, `user`, `analyst`, `debugger`)

**Shared context management:**
- Dedicated SPEC docs driving agent development and sharing context across workflows / agents
- Serves as a common log window for observability

**Intelligent Hooks System:**
- Audio feedback for development actions
- AI-generated session summaries with voice synthesis
- Permission-based notification system

**Security Configuration:**
- Granular permission controls for safe AI operations
- Development server protection and dangerous command blocking

## 🏗️ Repository Structure

```
.claude/
├── commands/                   # Auto mode workflows
│   ├── build.md               # Complete feature development
│   ├── fix.md                 # Systematic bug resolution  
│   ├── quality-check.md       # Comprehensive quality analysis
│   └── user-check.md          # UX validation and testing
├── agents/                    # Control mode workflows (individual)
│   ├── architect.md           # System design and planning
│   ├── engineer.md            # Implementation execution
│   ├── analyst.md             # Database analysis & optimization
│   ├── debugger.md            # Issue resolution and debugging
│   ├── security.md            # Security audit and compliance
│   ├── performance.md         # Performance optimization
│   ├── quality.md             # Code quality and maintainability
│   └── user.md                # UX testing and validation
├── hooks/                     # Intelligent development feedback
│   ├── notification.sh        # Audio notifications and summaries
│   └── hooks.log             # Session activity tracking
└── settings.local.json        # Security permissions and hook configuration

guides/
├── claude-code-control-mode-guide.md    # Manual workflow orchestration
├── claude-code-auto-mode-guide.md       # Automated development workflows
├── claude-code-agents-overview.md       # Complete workflow reference
├── claude-code-hooks-usage.md           # Notification system setup
└── cursor-rules-beginner-development-lifecycle.md

core-workflows/
├── claude-code/               # Production-ready configuration
├── claude-desktop/           # MCP integration patterns
└── cursor-rules/             # Structured development phases
```

## 🚀 Quick Setup

> **👀 New to this? Start with our [Complete Installation Guide](quickstart.md) for one-command setup!**

### Option 1: Complete Configuration
```bash
# Copy all configurations
cp -r core-workflows/claude-code/.claude/ .

# Start with auto mode
/build "your feature description"
```

### Option 2: Individual Components
```bash
# Just the workflows
cp core-workflows/claude-code/commands/* .claude/commands/
cp core-workflows/claude-code/agents/* .claude/agents/

# Add intelligent hooks
cp core-workflows/claude-code/hooks/notification.sh .claude/hooks/
cp core-workflows/claude-code/settings.local.json .claude/
```

### MCP Tools Quick Install
```bash
# SpecGen MCP - Project specification management
claude mcp add specgen -s user -- npx -y specgen-mcp@latest

# Static Analysis MCP - TypeScript code analysis  
claude mcp add static-analysis -s user -- npx -y @r-mcp/static-analysis@latest
```

## 🤖 Auto Mode: Orchestrated Development

**Use when**: Building features, fixing bugs, conducting quality reviews

**Available Commands:**
- **`/build`**: Complete feature development (architecture → implementation → testing)
- **`/fix`**: Systematic bug resolution with quality verification
- **`/quality-check`**: Parallel security, performance, and code quality analysis  
- **`/user-check`**: UX validation with authentic user behavior simulation

**Example Usage:**
```bash
# Complete feature development
/build "add user authentication with OAuth and JWT tokens"

# Bug resolution
/fix "checkout process fails on mobile Safari with payment validation errors"

# Quality assurance
/quality-check "review entire payment system before production deployment"

# User experience validation
/user-check "new user completes account setup and makes first purchase"
```

## ⚙️ Control Mode: Manual Workflow Selection

**Use when**: Learning the system, specialized analysis, custom development processes

**Available Workflows:**
- **`architect`**: System design and feature planning
- **`engineer`**: Implementation execution from specifications
- **`analyst`**: Database analysis and optimization
- **`debugger`**: Root cause analysis and issue resolution
- **`security`**: Security audits and compliance validation
- **`performance`**: Performance optimization and scalability analysis
- **`quality`**: Code maintainability and technical debt assessment
- **`user`**: UX testing with realistic user scenarios

**Example Usage:**
```bash
# System design
architect "design real-time notification system with email and push delivery"

# Implementation
engineer "docs/SPEC-20250129-notifications.md"

# Security audit
security "audit authentication system for OWASP compliance"

# Performance analysis
performance "optimize API response times for mobile client"

# UX validation
user "test mobile onboarding flow for new users"
```

## 🔊 Intelligent Hooks System

### Audio Feedback Features
- **PostToolUse**: Subtle sound confirmation for every file modification
- **Session Summaries**: AI-generated voice summary of work completed
- **Permission Alerts**: Immediate audio notification when approval needed

### Setup
```bash
# Enable hooks in settings.local.json
{
  "hooks": {
    "PostToolUse": [{"matcher": "Bash|Edit|MultiEdit|Write|Task", "hooks": [{"type": "command", "command": "./hooks/notification.sh"}]}],
    "Stop": [{"matcher": "", "hooks": [{"type": "command", "command": "./hooks/notification.sh"}]}],
    "Notification": [{"matcher": "", "hooks": [{"type": "command", "command": "./hooks/notification.sh"}]}]
  }
}
```

### Experience
- Work with gentle audio confirmation of each action
- End sessions hearing "Implemented user authentication with JWT token validation"
- Get called back to computer when permissions needed: "Approval required"

## 🔒 Security Configuration

### Permission Controls
```json
{
  "permissions": {
    "allow": [
      "Read:*", "Write:*", "Edit:*", "MultiEdit:*",
      "Bash(git status:*)", "Bash(npm test:*)", "Bash(npm run build:*)"
    ],
    "deny": [
      "Bash(rm -rf:*)", "Bash(sudo:*)", "Bash(git push:*)",
      "Bash(npm run dev:*)", "Bash(kill:*)"
    ]
  }
}
```

### What's Protected
- **File Operations**: Full read/write access for development files
- **Development Tools**: Safe access to testing, building, and git operations
- **Dangerous Commands**: Blocked destructive operations and system modifications
- **Server Control**: User maintains control over development server startup

## 📚 Learning Resources

### Getting Started
1. **[🚀 Complete Installation Guide](quickstart.md)** - One-command setup for everything
2. **[Agents Overview](guides/claude-code-agents-overview.md)** - Complete workflow reference
3. **[Auto Mode Guide](guides/claude-code-auto-mode-guide.md)** - Automated development workflows
4. **[Control Mode Guide](guides/claude-code-control-mode-guide.md)** - Manual workflow orchestration

### Advanced Usage
- **[Hooks Usage](guides/claude-code-hooks-usage.md)** - Complete notification system setup
- **[Cursor Rules](guides/cursor-rules-beginner-development-lifecycle.md)** - Structured development phases

## 🔄 Workflow Examples

### E-Commerce Feature Development
```bash
# Auto mode approach
/build "add express checkout with Apple Pay and guest options"

# Control mode approach  
architect "express checkout system with multiple payment methods"
engineer "docs/SPEC-20250129-checkout.md"
security "audit payment processing implementation"
performance "optimize checkout conversion speed"
user "test checkout flow across devices and browsers"
```

### Bug Investigation
```bash
# Auto mode
/fix "users can't upload profile images - getting 413 errors"

# Control mode
debugger "investigate profile image upload failures with 413 errors"
engineer "implement fix for file size handling"
user "validate image upload works across file types and sizes"
```

### Quality Assurance
```bash
# Comprehensive analysis
/quality-check "review authentication system before security audit"

# Targeted analysis
security "conduct OWASP security audit of user authentication"
performance "analyze authentication API response times"
quality "review authentication code for maintainability"
```

## 🎯 Quick Wins

### Immediate Benefits
- **Setup Time**: 5 minutes to complete configuration
- **Learning Curve**: Auto mode works immediately, control mode for customization
- **Audio Feedback**: Ambient awareness of development progress
- **Security**: Safe AI operations with granular permission controls

### Development Experience
- Describe features in natural language, get systematic implementation
- Audio summaries provide clear progress tracking
- Permission system prevents accidental dangerous operations
- Workflows handle coordination between different development phases

## 🤝 Community

### Contributing
Share your experience through:
- **Success Stories**: Real usage examples and outcomes in GitHub issues
- **Documentation Feedback**: Improvements and clarifications needed
- **Feature Requests**: Missing workflows or capabilities
- **Bug Reports**: Issues with configurations or workflows

### Support
- **Documentation**: Complete guides for all workflows and configurations
- **Examples**: Working implementations in `core-workflows/`
- **Community**: GitHub issues for questions and shared experiences

## 📄 License

MIT License - Use, modify, and share as needed.

---

*Complete Claude Code configuration for systematic AI-powered development. Choose auto mode for guided workflows or control mode for precise orchestration.*