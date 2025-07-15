#!/bin/bash

# Claude Code Simplified Notification System
# Tool events: Sound only | Stop events: Sound + Voice summary

# Centralized logging
LOG_FILE="/Users/pawanraviee/Documents/GitHub/agentic-workflows/.claude/hooks/hooks.log"
STOP_LOCK_FILE="/tmp/claude_stop_lock"
STOP_DEBOUNCE_FILE="/tmp/claude_stop_debounce"

log_event() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Debounce function for Stop events
check_stop_debounce() {
    local current_time=$(date +%s)
    local debounce_seconds=10
    
    if [ -f "$STOP_DEBOUNCE_FILE" ]; then
        local last_time=$(cat "$STOP_DEBOUNCE_FILE" 2>/dev/null || echo "0")
        local time_diff=$((current_time - last_time))
        
        if [ $time_diff -lt $debounce_seconds ]; then
            log_event "Stop: Debounced - ignoring (${time_diff}s since last)"
            return 1
        fi
    fi
    
    echo "$current_time" > "$STOP_DEBOUNCE_FILE"
    return 0
}

# Read JSON input from stdin
INPUT=$(cat)
log_event "Hook triggered - Input received"

# Determine event type
EVENT_TYPE=$(echo "$INPUT" | jq -r '.hook_event_name // "unknown"')
log_event "Event type: $EVENT_TYPE"

# Process different event types
case "$EVENT_TYPE" in
    "PostToolUse")
        # Tool completion: No sound notification (per user request)
        log_event "PostToolUse: Sound notification disabled"
        ;;
        
    "Stop")
        # Check debounce before processing Stop event
        if ! check_stop_debounce; then
            exit 0
        fi
        
        # Add recursion lock
        if [ -f "$STOP_LOCK_FILE" ]; then
            log_event "Stop: Lock file exists - skipping to prevent recursion"
            exit 0
        fi
        
        # Create lock file
        echo "$$" > "$STOP_LOCK_FILE"
        
        # Session completion: Banner notification + Purr sound + intelligent voice summary
        log_event "Stop: Displaying banner and generating intelligent session summary"
        
        # Display banner notification (simplified to avoid triggering events)
        osascript -e 'display notification "Session completed successfully" with title "Claude Code" sound name "Purr"' > /dev/null 2>&1 &
        
        # Generate intelligent session summary using claude -p (following notifications.md pattern)
        SESSION_CONTEXT=$(echo "$INPUT" | jq -r '.context // .message // .session_summary // "Session completed"' 2>/dev/null || echo "Session completed")
        
        # Create voice-friendly summary using claude -p for natural language processing
        if command -v claude &> /dev/null && [ -n "$SESSION_CONTEXT" ] && [ "$SESSION_CONTEXT" != "Session completed" ]; then
            VOICE_SUMMARY=$(echo "$SESSION_CONTEXT" | claude -p "Summarize this Claude Code session in 8 words or less for voice announcement: \"$SESSION_CONTEXT\"" 2>/dev/null)
            
            # Fallback to context extraction if claude -p fails
            if [ -z "$VOICE_SUMMARY" ] || [ "$VOICE_SUMMARY" = "null" ]; then
                VOICE_SUMMARY=$(echo "$SESSION_CONTEXT" | head -c 40 | sed 's/[^a-zA-Z0-9 ]//g' | awk '{print $1, $2, $3, "completed"}')
            fi
        else
            VOICE_SUMMARY="Session complete"
        fi
        
        # Ensure voice summary is reasonable length and clean
        VOICE_SUMMARY=$(echo "$VOICE_SUMMARY" | head -c 50 | sed 's/[^a-zA-Z0-9 ]//g')
        [ -z "$VOICE_SUMMARY" ] && VOICE_SUMMARY="Session complete"
        
        # Voice synthesis with intelligent summary
        say -v Samantha -r 175 "$VOICE_SUMMARY" > /dev/null 2>&1 &
        VOICE_PID=$!
        log_event "Stop: Banner displayed, intelligent voice summary started with PID $VOICE_PID: $VOICE_SUMMARY"
        
        # Remove lock file after completion
        rm -f "$STOP_LOCK_FILE" 2>/dev/null
        ;;
        
    "Notification")
        # Extract notification message to determine type
        NOTIFICATION_MSG=$(echo "$INPUT" | jq -r '.message // ""')
        
        if echo "$NOTIFICATION_MSG" | grep -q "needs your permission\|approval\|Approval\|APPROVAL"; then
            # Permission/Approval request: Banner + Ping sound + Samantha voice
            log_event "Notification: Approval required - Displaying banner, playing Ping sound and voice"
            osascript -e "display notification \"$NOTIFICATION_MSG\" with title \"Claude Code\" subtitle \"Approval Required\" sound name \"Ping\"" &
            say -v Samantha -r 175 "Approval required" &
        elif echo "$NOTIFICATION_MSG" | grep -q "waiting for your input\|idle"; then
            # Idle timeout: Tink sound
            log_event "Notification: Idle timeout - Playing Tink sound"
            afplay "/System/Library/Sounds/Tink.aiff" &
        else
            # General notification: Glass sound
            log_event "Notification: General alert - Playing Glass sound"
            afplay "/System/Library/Sounds/Glass.aiff" &
        fi
        ;;
        
    *)
        log_event "Unknown event type: $EVENT_TYPE - Playing default Glass sound"
        afplay "/System/Library/Sounds/Glass.aiff" &
        ;;
esac

log_event "Hook execution completed for $EVENT_TYPE"
exit 0