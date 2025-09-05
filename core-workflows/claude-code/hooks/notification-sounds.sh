#!/bin/bash

# Sound-only notification system for Claude Code
# PostToolUse: Activity sound only
# Stop: Completion sound (Purr)
# Notification: Approval required sound (Ping)

INPUT=$(cat)
LOG_FILE="/Users/pawanraviee/Documents/GitHub/agentic-workflows/.claude/hooks/hooks.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Determine if input is JSON (Stop/Notification events) or text (PostToolUse)
if echo "$INPUT" | jq -e . >/dev/null 2>&1; then
    # JSON input - handle Stop/Notification events
    EVENT_TYPE=$(echo "$INPUT" | jq -r '.hook_event_name // "unknown"')
    
    case "$EVENT_TYPE" in
        "Stop")
            # Log and play completion sound
            echo "[$TIMESTAMP] Stop event triggered" >> "$LOG_FILE"
            afplay "/System/Library/Sounds/Purr.aiff" &
            ;;
            
        "Notification")
            # Log and play approval required sound
            echo "[$TIMESTAMP] Notification event triggered" >> "$LOG_FILE"
            afplay "/System/Library/Sounds/Ping.aiff" &
            ;;
    esac
else
    # PostToolUse text input - just play subtle activity sound
    afplay "/System/Library/Sounds/Pop.aiff" &
fi

exit 0