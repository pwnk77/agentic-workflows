#!/bin/bash

# Claude Code Notification System - Content Summarization Utility
# Provides content summarization for voice synthesis

# Function to summarize content using Claude
summarize_content() {
    local content="$1"
    local max_length="${2:-20}"
    
    # Check if claude command is available
    if ! command -v claude &> /dev/null; then
        # Fallback to simple truncation
        echo "$content" | cut -c1-$max_length
        return 0
    fi
    
    # Use Claude to summarize content
    local summary=$(echo "$content" | claude -p "Summarize the following content in $max_length characters or less: \"$content\"" 2>/dev/null)
    
    # If Claude fails, use fallback
    if [ -z "$summary" ]; then
        echo "$content" | cut -c1-$max_length
    else
        echo "$summary"
    fi
}

# Function to create voice-friendly summary
create_voice_summary() {
    local tool_name="$1"
    local tool_command="$2"
    local tool_description="$3"
    local tool_output="$4"
    
    # Build input string
    local input_string="$tool_name: $tool_command $tool_description"
    
    # Remove common noise words for better summarization
    input_string=$(echo "$input_string" | sed 's/\b\(the\|and\|or\|but\|in\|on\|at\|to\|for\|of\|with\|by\)\b//g')
    
    # Summarize for voice
    summarize_content "$input_string" 20
}

# Function to extract key information from PostToolUse event
extract_tool_info() {
    local json_input="$1"
    
    # Extract using jq
    local tool_name=$(echo "$json_input" | jq -r '.tool_name // "Unknown"')
    local tool_command=$(echo "$json_input" | jq -r '.tool_input.command // ""')
    local tool_description=$(echo "$json_input" | jq -r '.tool_input.description // ""')
    local tool_output=$(echo "$json_input" | jq -r '.tool_response.stdout // .tool_response.content // ""')
    
    # Create voice-friendly summary
    create_voice_summary "$tool_name" "$tool_command" "$tool_description" "$tool_output"
}

# Main execution
if [ $# -eq 0 ]; then
    # Read from stdin
    input=$(cat)
    extract_tool_info "$input"
else
    # Use command line arguments
    case "$1" in
        "summarize")
            summarize_content "$2" "$3"
            ;;
        "voice-summary")
            create_voice_summary "$2" "$3" "$4" "$5"
            ;;
        "extract")
            extract_tool_info "$2"
            ;;
        *)
            echo "Usage: $0 [summarize|voice-summary|extract] [content] [max_length]"
            echo "       cat json | $0"
            exit 1
            ;;
    esac
fi