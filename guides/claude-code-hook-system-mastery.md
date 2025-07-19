# Hook System Mastery: Advanced Monitoring and Session Intelligence

*Unlock Claude Code's hidden debugging and monitoring capabilities through intelligent hooks*

## Introduction: Beyond Basic Development

Most developers think Claude Code stops at architect and engineer commands. But there's a hidden layer of intelligence that transforms your development sessions into learning, monitoring, and debugging powerhouses: **the Hook System**.

Meet Alex, a senior developer who discovered that Claude Code can:
- **Automatically generate session summaries** with AI analysis
- **Monitor file changes** with intelligent context tracking
- **Provide audio feedback** for different development events
- **Build learning databases** from your coding sessions
- **Debug issues** with full session context

This isn't just another development tool—it's an intelligent development companion.

---

## Part 1: Understanding the Hook Ecosystem

### What Are Claude Code Hooks?

Hooks are automatic event triggers that fire during Claude Code sessions. Think of them as intelligent observers that:

- **Capture everything** that happens during development
- **Process events** with customizable scripts  
- **Provide feedback** through multiple channels
- **Accumulate knowledge** across sessions

### The Three Hook Types

#### 1. PostToolUse Hook: The Activity Monitor

Fires after every tool execution (file edits, command runs, code generations).

**Real Example from Alex's Session:**
```json
{
  "session_id": "31991137-71a4-4346-8209-3d687c1cc8eb",
  "hook_event_name": "PostToolUse",
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "/src/components/AuthForm.tsx",
    "old_string": "const [isLoading, setIsLoading] = useState(false);",
    "new_string": "const [isLoading, setIsLoading] = useState(false);\n  const [errors, setErrors] = useState<Record<string, string>>({});"
  }
}
```

**What Alex's Hook Does:**
- 🔊 **Audio Feedback**: Plays a subtle "Pop" sound for immediate confirmation
- 📝 **Context Tracking**: Logs the change to session context for AI summary
- 📊 **Pattern Analysis**: Builds a database of coding patterns over time

#### 2. Stop Hook: The Session Intelligence Engine

Fires when a Claude Code session ends—this is where the magic happens.

**Alex's Stop Hook Workflow:**
1. **Analyzes Complete Session**: Reviews all PostToolUse events collected
2. **Generates AI Summary**: Uses Claude CLI to create intelligent 20-word summaries
3. **Provides Audio Summary**: Converts summary to speech synthesis
4. **Builds Knowledge Base**: Stores session patterns for future reference

**Example AI-Generated Summary:**
> "Enhanced authentication form validation, added error handling, updated TypeScript interfaces, fixed database migration syntax"

#### 3. Notification Hook: The Interaction Manager

Fires for permission requests, idle timeouts, and system notifications.

**Alex's Notification Patterns:**
- **Approval Required**: "Ping" sound + voice "Approval required"
- **Idle Timeout**: Gentle "Tink" sound
- **General Notifications**: "Glass" sound for other events

---

## Part 2: Setting Up Your Hook System

### Step 1: Hook Configuration

Create or update your `settings.local.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash|Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '\"\\(.tool_input.command // \"\") - \\(.tool_input.description // \"\") - \\(.tool_response.stdout // \"\") - \\(.tool_response.content // \"\")\"' >> ~/.claude/hooks/session_context.txt"
          },
          {
            "type": "command", 
            "command": "~/.claude/hooks/notification.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/notification.sh"
          }
        ]
      }
    ],
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/notification.sh"
          }
        ]
      }
    ]
  }
}
```

### Step 2: The Intelligence Script

Create `~/.claude/hooks/notification.sh`:

```bash
#!/bin/bash

# Claude Code Intelligent Hook System
# Provides audio feedback and AI-powered session summaries

# Read JSON input from stdin
INPUT=$(cat)

# Set up logging
LOG_FILE="~/.claude/hooks/hooks.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Determine event type
EVENT_TYPE=$(echo "$INPUT" | jq -r '.hook_event_name // "unknown"')

# Process different event types
case "$EVENT_TYPE" in
    "PostToolUse")
        # File edit/write: Subtle confirmation
        afplay "/System/Library/Sounds/Pop.aiff" &
        echo "[$TIMESTAMP] PostToolUse: File modified" >> "$LOG_FILE"
        ;;
        
    "Stop")
        # Session completion: AI-powered summary
        LOCK_FILE="/tmp/claude_stop_lock"
        SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')
        
        # Prevent duplicate processing
        if [ -f "$LOCK_FILE" ]; then
            LAST_SESSION=$(cat "$LOCK_FILE" 2>/dev/null)
            if [ "$LAST_SESSION" = "$SESSION_ID" ]; then
                afplay "/System/Library/Sounds/Purr.aiff" &
                say -v Samantha -r 175 "Session complete" &
                exit 0
            fi
        fi
        
        # Lock this session
        echo "$SESSION_ID" > "$LOCK_FILE"
        afplay "/System/Library/Sounds/Purr.aiff" &
        
        # Generate AI summary
        SESSION_CONTEXT_FILE="~/.claude/hooks/session_context.txt"
        VOICE_SUMMARY="Session complete"
        
        if [ -f "$SESSION_CONTEXT_FILE" ] && [ -s "$SESSION_CONTEXT_FILE" ] && command -v claude &> /dev/null; then
            SESSION_CONTEXT=$(cat "$SESSION_CONTEXT_FILE" 2>/dev/null)
            
            if [ -n "$SESSION_CONTEXT" ]; then
                # Generate intelligent summary
                VOICE_SUMMARY=$(echo "$SESSION_CONTEXT" | timeout 8 claude -p "Summarize this Claude Code session in 20 words or less, focusing on main files modified and key actions:" 2>/dev/null)
                
                if [ -n "$VOICE_SUMMARY" ] && [ "$VOICE_SUMMARY" != "" ]; then
                    echo "[$TIMESTAMP] AI Summary: $VOICE_SUMMARY" >> "$LOG_FILE"
                    # Clear context for next session
                    > "$SESSION_CONTEXT_FILE"
                fi
            fi
        fi
        
        # Clean and speak summary
        VOICE_SUMMARY=$(echo "$VOICE_SUMMARY" | sed 's/[^a-zA-Z0-9 ]//g' | head -c 80)
        [ -z "$VOICE_SUMMARY" ] && VOICE_SUMMARY="Session complete"
        
        say -v Samantha -r 175 "$VOICE_SUMMARY" &
        ;;
        
    "Notification")
        # Smart notification handling
        NOTIFICATION_MSG=$(echo "$INPUT" | jq -r '.message // ""')
        
        if echo "$NOTIFICATION_MSG" | grep -q "needs your permission\\|approval\\|Approval\\|APPROVAL"; then
            afplay "/System/Library/Sounds/Ping.aiff" &
            say -v Samantha -r 175 "Approval required" &
        elif echo "$NOTIFICATION_MSG" | grep -q "waiting for your input\\|idle"; then
            afplay "/System/Library/Sounds/Tink.aiff" &
        else
            afplay "/System/Library/Sounds/Glass.aiff" &
        fi
        ;;
        
    *)
        afplay "/System/Library/Sounds/Glass.aiff" &
        ;;
esac

exit 0
```

### Step 3: Make It Executable

```bash
chmod +x ~/.claude/hooks/notification.sh
```

---

## Part 3: Advanced Hook Patterns

### Pattern 1: Project-Specific Session Analysis

Alex creates different hook behaviors for different projects:

```bash
# In notification.sh - project-aware summaries
PROJECT_DIR=$(basename "$(pwd)")

case "$PROJECT_DIR" in
    "frontend-app")
        SUMMARY_PROMPT="Summarize this React/TypeScript session focusing on components and state changes:"
        ;;
    "api-service")
        SUMMARY_PROMPT="Summarize this backend session focusing on endpoints and database changes:"
        ;;
    "docs")
        SUMMARY_PROMPT="Summarize this documentation session focusing on content and structure changes:"
        ;;
    *)
        SUMMARY_PROMPT="Summarize this development session in 20 words:"
        ;;
esac
```

### Pattern 2: Error Detection and Alerting

```bash
# Enhanced PostToolUse with error detection
"PostToolUse")
    # Check for errors in tool responses
    if echo "$INPUT" | jq -e '.tool_response.stderr // .tool_response.error' >/dev/null 2>&1; then
        # Error detected - different sound and voice alert
        afplay "/System/Library/Sounds/Sosumi.aiff" &
        say -v Samantha -r 175 "Error detected" &
        
        # Log error details
        ERROR_DETAIL=$(echo "$INPUT" | jq -r '.tool_response.stderr // .tool_response.error')
        echo "[$TIMESTAMP] ERROR: $ERROR_DETAIL" >> "$LOG_FILE"
    else
        # Normal operation
        afplay "/System/Library/Sounds/Pop.aiff" &
    fi
    ;;
```

### Pattern 3: Team Collaboration Hooks

```bash
# Team notification when significant changes occur
"PostToolUse")
    # Detect significant changes
    TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')
    
    if [ "$TOOL_NAME" = "Write" ] || [ "$TOOL_NAME" = "MultiEdit" ]; then
        FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path')
        
        # Notify team for important files
        if echo "$FILE_PATH" | grep -E "(package.json|tsconfig.json|docker-compose.yml|README.md)" >/dev/null; then
            # Send to team chat (Slack, Discord, etc.)
            curl -X POST -H 'Content-type: application/json' \
                --data "{\"text\":\"🔧 Important file modified: $(basename "$FILE_PATH") by $(whoami)\"}" \
                "$SLACK_WEBHOOK_URL" &
        fi
    fi
    ;;
```

### Pattern 4: Performance Monitoring

```bash
# Track session duration and complexity
"Stop")
    SESSION_START=$(echo "$INPUT" | jq -r '.session_start_time // empty')
    if [ -n "$SESSION_START" ]; then
        DURATION=$(($(date +%s) - $(date -d "$SESSION_START" +%s)))
        TOOL_COUNT=$(wc -l < "$SESSION_CONTEXT_FILE")
        
        echo "[$TIMESTAMP] Session Stats: ${DURATION}s duration, $TOOL_COUNT tools used" >> "$LOG_FILE"
        
        # Voice feedback for long sessions
        if [ "$DURATION" -gt 3600 ]; then  # > 1 hour
            say -v Samantha -r 175 "Long session complete. Consider taking a break." &
        fi
    fi
    ;;
```

---

## Part 4: Session Intelligence Features

### AI-Powered Session Summaries

The hook system's crown jewel is intelligent session summarization:

**How It Works:**
1. **Context Accumulation**: PostToolUse hooks capture every action
2. **AI Analysis**: Stop hook sends context to Claude CLI
3. **Intelligent Summary**: AI generates concise, relevant summaries
4. **Audio Delivery**: Text-to-speech provides hands-free feedback

**Example Session Summaries:**
- "Added user authentication, created login form, updated database schema, fixed TypeScript errors"
- "Refactored payment service, updated API endpoints, added error handling, improved test coverage"
- "Created documentation guide, enhanced code examples, fixed broken links, updated README structure"

### Context Learning Across Sessions

Each session builds institutional knowledge:

```bash
# Knowledge accumulation
SESSION_KNOWLEDGE_FILE="~/.claude/hooks/session_knowledge.json"

{
  "sessions": [
    {
      "date": "2025-01-19",
      "project": "authentication-system",
      "summary": "Added OAuth integration with Google and GitHub providers",
      "files_modified": ["auth.service.ts", "login.component.tsx", "user.model.ts"],
      "tools_used": 23,
      "duration": 2847
    }
  ]
}
```

### Pattern Recognition and Suggestions

Advanced hooks can analyze patterns and provide suggestions:

```bash
# Pattern analysis example
if grep -c "useState" "$SESSION_CONTEXT_FILE" > 5; then
    say -v Samantha -r 175 "Consider using useReducer for complex state" &
fi

if grep -c "console.log" "$SESSION_CONTEXT_FILE" > 3; then
    say -v Samantha -r 175 "Remember to remove debug logs before commit" &
fi
```

---

## Part 5: Debugging with Hook Intelligence

### Real-Time Debug Context

Hooks provide unprecedented debugging context:

**Scenario**: Alex encounters a mysterious bug during authentication implementation.

**Hook-Assisted Debug Process:**

1. **Session Context Available**: All previous tool uses captured
2. **AI Analysis**: "Authentication service created, database migration applied, OAuth endpoints added, then error occurred"
3. **Pattern Recognition**: Hook identifies the error happened after database changes
4. **Targeted Investigation**: Focus debug efforts on database migration timing

```bash
# Debug-specific hook enhancement
"PostToolUse")
    # Capture stack traces and error patterns
    if echo "$INPUT" | grep -q "error\\|Error\\|ERROR\\|failed\\|Failed"; then
        echo "[$TIMESTAMP] POTENTIAL_ISSUE: $(echo "$INPUT" | jq -r '.tool_response.stderr // .tool_response.content' | head -1)" >> "$LOG_FILE"
        
        # Auto-trigger debug mode reminder
        say -v Samantha -r 175 "Error detected. Consider using debug mode." &
    fi
    ;;
```

### Integration with Engineer Debug Mode

Hooks enhance engineer debug mode by providing:

- **Complete session history** for root cause analysis
- **Timeline of changes** leading to issues
- **Pattern recognition** from similar past issues
- **Automatic context preparation** for debug workflows

---

## Part 6: Enterprise Hook Patterns

### Multi-Developer Session Tracking

```bash
# Enterprise session coordination
"Stop")
    # Track team session patterns
    TEAM_SESSION_FILE="/shared/claude-sessions/team-activity.log"
    
    echo "[$TIMESTAMP] $(whoami): $VOICE_SUMMARY" >> "$TEAM_SESSION_FILE"
    
    # Check for concurrent work on same files
    if grep -q "$(basename "$(pwd)")" "$TEAM_SESSION_FILE" | tail -10; then
        say -v Samantha -r 175 "Team member recently worked on this project" &
    fi
    ;;
```

### Compliance and Audit Logging

```bash
# Regulatory compliance tracking
"PostToolUse")
    # Log all changes for audit
    AUDIT_LOG="/secure/claude-audit/$(date +%Y-%m).log"
    
    echo "[$TIMESTAMP] User:$(whoami) Project:$(pwd) Action:$(echo "$INPUT" | jq -r '.tool_name') File:$(echo "$INPUT" | jq -r '.tool_input.file_path // "N/A"')" >> "$AUDIT_LOG"
    ;;
```

### Performance Metrics Collection

```bash
# Enterprise performance monitoring
"Stop")
    # Collect development velocity metrics
    METRICS_FILE="/analytics/claude-metrics.json"
    
    jq -n \
        --arg date "$(date -Iseconds)" \
        --arg user "$(whoami)" \
        --arg project "$(basename "$(pwd)")" \
        --arg duration "$DURATION" \
        --arg tool_count "$TOOL_COUNT" \
        --arg summary "$VOICE_SUMMARY" \
        '{date: $date, user: $user, project: $project, duration: ($duration|tonumber), tool_count: ($tool_count|tonumber), summary: $summary}' \
        >> "$METRICS_FILE"
    ;;
```

---

## Part 7: Customization and Advanced Configuration

### Sound Customization

Create custom sound schemes for different contexts:

```bash
# Project-specific sounds
case "$(basename "$(pwd)")" in
    "production-app")
        SUCCESS_SOUND="/custom/sounds/production-success.aiff"
        ERROR_SOUND="/custom/sounds/production-alert.aiff"
        ;;
    "development")
        SUCCESS_SOUND="/System/Library/Sounds/Pop.aiff"
        ERROR_SOUND="/System/Library/Sounds/Basso.aiff"
        ;;
esac
```

### Voice Customization

Different voices for different event types:

```bash
# Context-aware voice selection
case "$EVENT_TYPE" in
    "PostToolUse")
        # Quick, efficient voice for frequent events
        say -v Daniel -r 200 "Modified" &
        ;;
    "Stop")
        # Detailed, clear voice for summaries
        say -v Samantha -r 175 "$VOICE_SUMMARY" &
        ;;
    "Notification")
        # Alert voice for attention
        say -v Alex -r 180 "Attention needed" &
        ;;
esac
```

### Integration with External Tools

Connect hooks to your existing development ecosystem:

```bash
# Integration examples
"PostToolUse")
    # Update time tracking
    curl -X POST "https://toggl.com/api/v9/time_entries" \
        -d "{\"description\":\"Claude Code: $(echo "$INPUT" | jq -r '.tool_name')\",\"duration\":60}" &
    
    # Update project management
    curl -X POST "https://api.linear.app/graphql" \
        -d "{\"query\":\"mutation { createComment(input: {issueId: \\\"$ISSUE_ID\\\", body: \\\"Progress: $VOICE_SUMMARY\\\"}) { success } }\"}" &
    
    # Analytics tracking
    curl -X POST "https://analytics.yourcompany.com/events" \
        -d "{\"event\":\"claude_tool_use\",\"tool\":\"$(echo "$INPUT" | jq -r '.tool_name')\",\"user\":\"$(whoami)\"}" &
    ;;
```

---

## Part 8: Troubleshooting and Best Practices

### Common Issues and Solutions

#### 1. Hook Not Firing

**Problem**: No audio feedback or logging
**Solution**:
```bash
# Test hook manually
echo '{"hook_event_name":"PostToolUse","tool_name":"test"}' | ~/.claude/hooks/notification.sh

# Check permissions
chmod +x ~/.claude/hooks/notification.sh

# Verify jq installation
which jq || brew install jq
```

#### 2. AI Summary Failing

**Problem**: Only getting "Session complete" summaries
**Solution**:
```bash
# Test Claude CLI
echo "test" | claude -p "Summarize this:"

# Check session context file
ls -la ~/.claude/hooks/session_context.txt

# Verify timeout settings
timeout 8 echo "test" # Should work
```

#### 3. Audio Not Playing

**Problem**: No sound feedback
**Solution**:
```bash
# Test audio directly
afplay "/System/Library/Sounds/Pop.aiff"

# Check system audio settings
sudo killall coreaudiod  # Restart audio on macOS

# Try alternative sounds
ls /System/Library/Sounds/
```

### Performance Optimization

#### 1. Efficient Context Management

```bash
# Limit context file size to prevent memory issues
MAX_LINES=1000
if [ "$(wc -l < "$SESSION_CONTEXT_FILE")" -gt "$MAX_LINES" ]; then
    tail -n "$MAX_LINES" "$SESSION_CONTEXT_FILE" > "${SESSION_CONTEXT_FILE}.tmp"
    mv "${SESSION_CONTEXT_FILE}.tmp" "$SESSION_CONTEXT_FILE"
fi
```

#### 2. Background Processing

```bash
# Run expensive operations in background
"Stop")
    # Don't block the hook completion
    (
        # Expensive AI analysis
        VOICE_SUMMARY=$(generate_detailed_summary)
        say -v Samantha -r 175 "$VOICE_SUMMARY"
    ) &
    
    # Quick completion feedback
    afplay "/System/Library/Sounds/Purr.aiff" &
    ;;
```

#### 3. Smart Filtering

```bash
# Only log significant changes
"PostToolUse")
    TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')
    
    case "$TOOL_NAME" in
        "Edit"|"MultiEdit"|"Write")
            # Log substantial changes
            log_to_context
            ;;
        "Read"|"LS"|"Glob")
            # Skip read-only operations
            ;;
    esac
    ;;
```

---

## Conclusion: Your Intelligent Development Companion

The Claude Code hook system transforms your development environment from a simple tool into an intelligent companion that:

### Learns from Your Patterns
- **Captures every action** for pattern analysis
- **Builds knowledge** across sessions
- **Provides context** for debugging and planning

### Provides Intelligent Feedback
- **AI-generated summaries** of development sessions
- **Audio feedback** for immediate confirmation
- **Error detection** and alerting

### Scales with Your Needs
- **Simple setups** for individual developers
- **Enterprise patterns** for team collaboration
- **Custom integrations** with existing tools

### Your Next Steps

1. **Start Simple**: Implement basic audio feedback
2. **Add Intelligence**: Enable AI-powered session summaries
3. **Customize**: Adapt patterns to your workflow
4. **Scale**: Implement team and enterprise features

The hook system represents the future of development tooling—intelligent, adaptive, and continuously learning from your work patterns.

**Ready to upgrade your development experience?**

Copy the hook configuration above, save it to your Claude Code settings, and experience the difference intelligent automation makes in your daily coding workflow.

---

*Continue your journey: [Unified Debug Workflow →](claude-code-unified-debug-workflow.md)*

*Previous: [Engineer Debug Integration ←](claude-code-engineer-debug-integration.md)*