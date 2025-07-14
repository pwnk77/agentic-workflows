Completion Notifications with /hooks in Claude Code (Banner + Voice)
Mindscape of a Music Tech Startup
Mindscape of a Music Tech Startup

Follow
2 min read
·
Jul 2, 2025
15


Here are some tips and sample code for implementing a notification feature with /hooks in Claude Code. 🚀

Goals
Notify when a command finishes or a file edit completes
Methods: banner alert (via osascript) and voice notification (say)
Content: a summary of the /hooks execution result
Implementation
To keep maintenance easy, put the notification logic in a separate script (notification.sh).
Use jq to extract key fields from the /hooks result and pass them to notification.sh.
Summarize the execution result with cc -p.
Prefer PostToolUse over Notification.
Debugging
Edit ~/.claude/settings.json directly, run /hooks, then press ESC immediately to reload settings.json.
For debugging, output the /hooks result to a file (tmp-last-hook-output.txt).
Use date to display timestamps and run simple prompts for quick tests.
Code
~/.claude/settings.json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash|Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "cat > ~/.claude/tmp-last-hook-output.txt"
          },
          {
            "type": "command",
            "command": "jq -r '\"\\n\\(.tool_input.command // \"\") - \\(.tool_input.description // \"\") - \\(.tool_response.stdout // \"\") - \\(.tool_response.content // \"\")\"' >> ~/.claude/tmp-last-hook-output.txt"
          },
          {
            "type": "command",
            "command": "jq -r '\"\\(.tool_input.command // \"\") - \\(.tool_input.description // \"\") - \\(.tool_response.stdout // \"\") - \\(.tool_response.content // \"\")\"' | notification.sh"
          }
        ]
      }
    ]
  }
}
Of the three hooks, the first two are for debugging, so you can delete them if you want.

notification.sh
#!/bin/bash
MESSAGE=$1
MESSAGE=$(claude -p "Summarize the following content in 20 characters or less. \"$MESSAGE\"")

# Show Mac notifications
osascript -e "display notification \"${MESSAGE}\" with title \"Claude Code\" sound name \"Blow\""
say "${MESSAGE}"
cc summarizes the input and passes it to “osascript” and “say” commands.

Result
# Use the date command to execute Bash commands
Use the date command to find out today's date.

A banner notification and the output result (in this case, the date) were read aloud.🚀