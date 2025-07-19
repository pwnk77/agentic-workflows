#!/bin/bash

# Claude Code File Edit Notification System
# Plays a subtle sound when files are edited/written

# Read JSON input from stdin
INPUT=$(cat)

# Determine event type
EVENT_TYPE=$(echo "$INPUT" | jq -r '.hook_event_name // "unknown"')

# Process different event types
case "$EVENT_TYPE" in
    "PostToolUse")
        # File edit/write: Play subtle Pop sound
        afplay "/System/Library/Sounds/Pop.aiff" &
        ;;
        
    "Stop")
        # Session completion: Purr sound + intelligent voice summary
        afplay "/System/Library/Sounds/Purr.aiff" &
        
        # Read session context from local file
        SESSION_CONTEXT_FILE="/Users/pawanraviee/Documents/GitHub/agentic-workflows/.claude/hooks/session_context.txt"
        
        if [ -f "$SESSION_CONTEXT_FILE" ] && [ -s "$SESSION_CONTEXT_FILE" ]; then
            SESSION_CONTEXT=$(cat "$SESSION_CONTEXT_FILE" 2>/dev/null)
            
            # Generate intelligent summary using claude CLI if available
            if command -v claude &> /dev/null; then
                VOICE_SUMMARY=$(echo "$SESSION_CONTEXT" | claude -p "Summarize this Claude Code session in 25 words or less, focusing on the main files modified and actions taken:" 2>/dev/null)
            fi
            
            # Fallback to simple extraction if claude CLI fails
            if [ -z "$VOICE_SUMMARY" ]; then
                # Extract key actions from session context
                FILES_MODIFIED=$(echo "$SESSION_CONTEXT" | grep -o "\.sh\|\.json\|\.txt\|\.py\|\.js\|\.ts" | sort -u | head -3 | tr '\n' ' ')
                if [ -n "$FILES_MODIFIED" ]; then
                    VOICE_SUMMARY="Modified files: $FILES_MODIFIED"
                else
                    VOICE_SUMMARY="Session complete"
                fi
            fi
            
            # Clean up session context file for next session
            > "$SESSION_CONTEXT_FILE"
        else
            VOICE_SUMMARY="Session complete"
        fi
        
        # Clean summary for speech synthesis
        VOICE_SUMMARY=$(echo "$VOICE_SUMMARY" | sed 's/[^a-zA-Z0-9 ]//g' | head -c 100)
        [ -z "$VOICE_SUMMARY" ] && VOICE_SUMMARY="Session complete"
        
        # Voice synthesis with intelligent summary
        say -v Samantha -r 175 "$VOICE_SUMMARY" &
        ;;
        
    "Notification")
        # Extract notification message to determine type
        NOTIFICATION_MSG=$(echo "$INPUT" | jq -r '.message // ""')
        
        if echo "$NOTIFICATION_MSG" | grep -q "needs your permission\|approval\|Approval\|APPROVAL"; then
            # Permission/Approval request: Ping sound + voice
            afplay "/System/Library/Sounds/Ping.aiff" &
            say -v Samantha -r 175 "Approval required" &
        elif echo "$NOTIFICATION_MSG" | grep -q "waiting for your input\|idle"; then
            # Idle timeout: Tink sound
            afplay "/System/Library/Sounds/Tink.aiff" &
        else
            # General notification: Glass sound
            afplay "/System/Library/Sounds/Glass.aiff" &
        fi
        ;;
        
    *)
        # Unknown event: Glass sound
        afplay "/System/Library/Sounds/Glass.aiff" &
        ;;
esac

exit 0