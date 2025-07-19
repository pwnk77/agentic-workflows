#!/bin/bash

# Simple notification system for Claude Code
# PostToolUse: Activity logging + subtle sound
# Stop: Log + sound + meaningful claude -p summary + Samantha voice
# Notification: Log + sound + Samantha voice "approval required"

INPUT=$(cat)
LOG_FILE="/Users/pawanraviee/Documents/GitHub/agentic-workflows/.claude/hooks/hooks.log"
LOCK_FILE="/tmp/claude_stop_processing.lock"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Determine if input is JSON (Stop/Notification events) or text (PostToolUse)
if echo "$INPUT" | jq -e . >/dev/null 2>&1; then
    # JSON input - handle Stop/Notification events
    EVENT_TYPE=$(echo "$INPUT" | jq -r '.hook_event_name // "unknown"')
    
    case "$EVENT_TYPE" in
        "Stop")
            # Check if another Stop is already being processed
            if [ -f "$LOCK_FILE" ]; then
                # Another Stop is being processed, skip this one
                exit 0
            fi
            
            # Create lock file to prevent concurrent processing
            touch "$LOCK_FILE"
            
            # Log the stop event
            echo "[$TIMESTAMP] Stop event received - processing" >> "$LOG_FILE"
            
            # Play stop sound
            afplay "/System/Library/Sounds/Purr.aiff" &
            
            # Generate intelligent summary based on recent changes
            CONTEXT=""
            
            # Check git status for recent changes
            if command -v git &> /dev/null && git rev-parse --git-dir > /dev/null 2>&1; then
                GIT_STATUS=$(git status --porcelain 2>/dev/null | head -10)
                if [ -n "$GIT_STATUS" ]; then
                    CONTEXT="Recent git changes: $GIT_STATUS"
                fi
            fi
            
            # Check recent file modifications in project
            if [ -z "$CONTEXT" ]; then
                RECENT_FILES=$(find . -name "*.md" -o -name "*.json" -o -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.sh" -mmin -10 2>/dev/null | head -5)
                if [ -n "$RECENT_FILES" ]; then
                    CONTEXT="Recently modified files: $(echo "$RECENT_FILES" | tr '\n' ' ')"
                fi
            fi
            
            # Generate summary using claude -p with context
            if [ -n "$CONTEXT" ]; then
                MESSAGE=$(claude -p "Summarize this development work in 15 words or less: \"$CONTEXT\"" 2>/dev/null || echo "Development work completed")
            else
                MESSAGE="Claude Code session completed"
            fi
            
            # Use Samantha voice for summary
            say -v Samantha -r 175 "${MESSAGE}" &
            
            # Log completion
            echo "[$TIMESTAMP] Stop event completed: $MESSAGE" >> "$LOG_FILE"
            
            # Remove lock file
            rm -f "$LOCK_FILE"
            ;;
            
        "Notification")
            # Log the notification event
            echo "[$TIMESTAMP] Notification event received" >> "$LOG_FILE"
            
            # Play notification sound
            afplay "/System/Library/Sounds/Ping.aiff" &
            
            # Say approval required with Samantha voice
            say -v Samantha -r 175 "Approval required" &
            ;;
    esac
else
    # PostToolUse text input from jq pipe - just play subtle sound
    # (activity logging is handled by the first hook in settings)
    afplay "/System/Library/Sounds/Pop.aiff" &
fi

exit 0