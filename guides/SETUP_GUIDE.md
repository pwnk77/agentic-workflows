# Claude Code Audio Hooks Setup Guide

## Overview
This guide helps you set up and validate the Claude Code audio notification system that provides specialized sounds for your architect/engineer workflow.

## Quick Start

### 1. Test the Audio System
```bash
# Run the test suite to validate installation
cd .claude/hooks
./test_audio_hooks.sh
```

### 2. Create Sample Sound Files
```bash
# Create sample .aiff files using TTS
cd .claude/hooks
source audio_utils.sh
create_sample_sounds
```

### 3. Test Individual Components

#### Test Voice Selection
```bash
# Test different voices
say -v Daniel "Architecture specification ready for review"
say -v Samantha "Database layer implementation complete"
say -v Victoria "Frontend layer implementation complete"
```

#### Test Hook Scripts Manually
```bash
# Test stop notification
echo '{"event": "architect", "status": "complete"}' | python3 .claude/hooks/stop_notification.py

# Test subagent notification  
echo '{"layer": "database", "status": "complete"}' | python3 .claude/hooks/subagent_notification.py

# Test task notification
echo '{"tool_name": "Edit", "status": "complete"}' | python3 .claude/hooks/task_notification.py
```

## Validation Checklist

### ✅ Configuration Files
- [ ] `.claude/settings.json` exists and is valid JSON
- [ ] `.claude/voice_profiles.json` exists and is valid JSON
- [ ] All hook scripts are executable (`chmod +x`)

### ✅ Audio System
- [ ] `say` command available on macOS
- [ ] Different voices work (Daniel, Alex, Samantha, Victoria, Fred)
- [ ] Audio playback completes without errors

### ✅ Hook Integration
- [ ] Stop hook triggers on command completion
- [ ] SubagentStop hook triggers on layer completion
- [ ] PostToolUse hook triggers on file modifications
- [ ] Error handling works (graceful fallback to system beep)

### ✅ Workflow Integration
- [ ] Architect command completion plays Daniel voice
- [ ] Engineer command completion plays Alex voice
- [ ] Different layers use different voices
- [ ] File edit operations trigger quick audio feedback

## Troubleshooting

### Audio Not Playing
1. Check if `say` command works: `say "test"`
2. Verify voice availability: `say -v '?'`
3. Check hook script permissions: `ls -la .claude/hooks/`
4. Review audio log: `cat .claude/audio_log.txt`

### Hook Not Triggering
1. Verify Claude Code hook configuration in settings
2. Check JSON syntax in `.claude/settings.json`
3. Test hook scripts manually (see commands above)
4. Ensure Python 3 is available: `which python3`

### Voice Quality Issues
1. Try different voices from `say -v '?'`
2. Adjust speech rate in voice_profiles.json (120-250)
3. Create custom sound files in `.claude/sounds/`

## Customization

### Custom Voices
Edit `.claude/voice_profiles.json` to:
- Change voice assignments
- Modify messages
- Adjust speech rates
- Add new event types

### Custom Sound Files
Place custom audio files in `.claude/sounds/`:
- `architect_complete.aiff`
- `engineer_complete.aiff`
- `layer_complete.aiff`
- `task_complete.aiff`
- `error.aiff`
- `warning.aiff`

### Event Mapping
Modify hook scripts to:
- Add new event detection patterns
- Change audio trigger conditions
- Customize error handling

## Usage Examples

### Architect Workflow
1. Run: `/architect "new feature request"`
2. Audio: "Architecture specification ready for review" (Daniel voice)

### Engineer Workflow  
1. Run: `/engineer docs/SPEC-file.md`
2. Audio for each layer completion:
   - Database: "Database layer implementation complete" (Samantha)
   - Backend: "Backend layer implementation complete" (Daniel)
   - Frontend: "Frontend layer implementation complete" (Victoria)
3. Final: "Engineer implementation complete" (Alex)

### File Operations
- Edit operations: "File modification complete" (Samantha)
- Write operations: "File creation complete" (Victoria)
- Errors: "Task execution failed" (Fred, slower pace)

## Support

If you encounter issues:
1. Run the test suite: `./test_audio_hooks.sh`
2. Check the audio log: `.claude/audio_log.txt`
3. Verify macOS audio permissions
4. Test basic TTS: `say "hello world"`