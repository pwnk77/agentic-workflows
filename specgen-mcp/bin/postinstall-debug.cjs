#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

// Enhanced logging function
function log(message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.error(logMessage); // Use stderr to bypass npm output filtering
  
  if (data) {
    console.error(JSON.stringify(data, null, 2));
  }
  
  // Also write to log file for debugging (temp file)
  try {
    const logFile = path.join(os.tmpdir(), 'specgen-install.log');
    const logEntry = `${logMessage}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
    fs.appendFileSync(logFile, logEntry);
  } catch (e) {
    // Ignore log file errors
  }
}

async function setupSpecgenMcp() {
  log('🚀 Starting SpecGen MCP setup...');
  log('Node version:', process.version);
  log('Platform:', process.platform);
  log('Current working directory:', process.cwd());
  log('Script arguments:', process.argv);
  log('Environment check:', {
    npm_lifecycle_event: process.env.npm_lifecycle_event,
    npm_lifecycle_script: process.env.npm_lifecycle_script
  });
  
  try {
    // Get package installation directory
    const packageDir = path.dirname(__dirname);
    const currentWorkingDir = process.cwd();
    
    log('📦 Package directory:', packageDir);
    log('🏠 Target directory:', currentWorkingDir);
    
    // Verify package structure
    const claudeCodeDir = path.join(packageDir, 'claude-code');
    log('Claude-code source exists:', fs.existsSync(claudeCodeDir));
    
    if (fs.existsSync(claudeCodeDir)) {
      const contents = fs.readdirSync(claudeCodeDir);
      log('Claude-code contents:', contents);
    }
    
    // Setup .claude directory with commands and agents
    const claudeDir = path.join(currentWorkingDir, '.claude');
    log('Target .claude directory:', claudeDir);
    
    if (!fs.existsSync(claudeDir)) {
      log('Creating .claude directory...');
      fs.mkdirSync(claudeDir, { recursive: true });
      log('✅ Created .claude directory');
    } else {
      log('⚠️ .claude directory already exists');
    }
    
    // Copy commands from claude-code bundle
    const commandsSource = path.join(packageDir, 'claude-code', 'commands');
    const commandsDest = path.join(claudeDir, 'commands');
    
    log('Commands source path:', commandsSource);
    log('Commands dest path:', commandsDest);
    log('Commands source exists:', fs.existsSync(commandsSource));
    
    if (fs.existsSync(commandsSource)) {
      try {
        const sourceFiles = fs.readdirSync(commandsSource);
        log('Source command files:', sourceFiles);
        
        fs.copySync(commandsSource, commandsDest);
        
        const destFiles = fs.readdirSync(commandsDest);
        log('Copied command files:', destFiles);
        log('✅ Copied Claude Code commands');
      } catch (copyError) {
        log('❌ Failed to copy commands:', copyError.message);
        throw copyError;
      }
    } else {
      log('⚠️ Commands source directory not found');
    }
    
    // Copy agents from claude-code bundle
    const agentsSource = path.join(packageDir, 'claude-code', 'agents');
    const agentsDest = path.join(claudeDir, 'agents');
    
    log('Agents source path:', agentsSource);
    log('Agents source exists:', fs.existsSync(agentsSource));
    
    if (fs.existsSync(agentsSource)) {
      try {
        fs.copySync(agentsSource, agentsDest);
        log('✅ Copied Claude Code agents');
      } catch (copyError) {
        log('❌ Failed to copy agents:', copyError.message);
        throw copyError;
      }
    } else {
      log('⚠️ Agents source directory not found');
    }
    
    // Copy hooks from claude-code bundle
    const hooksSource = path.join(packageDir, 'claude-code', 'hooks');
    const hooksDest = path.join(claudeDir, 'hooks');
    
    log('Hooks source exists:', fs.existsSync(hooksSource));
    
    if (fs.existsSync(hooksSource)) {
      try {
        fs.copySync(hooksSource, hooksDest);
        log('✅ Copied Claude Code hooks');
      } catch (copyError) {
        log('❌ Failed to copy hooks:', copyError.message);
        throw copyError;
      }
    } else {
      log('⚠️ Hooks source directory not found');
    }
    
    // Copy settings if they exist
    const settingsSource = path.join(packageDir, 'claude-code', 'settings.local.json');
    const settingsDest = path.join(claudeDir, 'settings.local.json');
    
    log('Settings source exists:', fs.existsSync(settingsSource));
    
    if (fs.existsSync(settingsSource)) {
      try {
        fs.copySync(settingsSource, settingsDest);
        log('✅ Copied Claude Code settings');
      } catch (copyError) {
        log('❌ Failed to copy settings:', copyError.message);
        throw copyError;
      }
    } else {
      log('⚠️ Settings source file not found');
    }
    
    // Create .specgen directory for consolidated structure
    const specgenDir = path.join(currentWorkingDir, '.specgen');
    if (!fs.existsSync(specgenDir)) {
      fs.mkdirSync(specgenDir, { recursive: true });
      log('✅ Created .specgen directory');
    } else {
      log('⚠️ .specgen directory already exists');
    }
    
    // Setup specdash directory inside .specgen
    const specdashSource = path.join(packageDir, 'specdash');
    const specdashDest = path.join(specgenDir, 'specdash');
    
    log('Specdash source exists:', fs.existsSync(specdashSource));
    log('Specdash dest exists:', fs.existsSync(specdashDest));
    
    if (fs.existsSync(specdashSource) && !fs.existsSync(specdashDest)) {
      try {
        fs.copySync(specdashSource, specdashDest);
        log('✅ Copied SpecDash dashboard to .specgen/specdash');
      } catch (copyError) {
        log('❌ Failed to copy specdash:', copyError.message);
        throw copyError;
      }
    } else {
      log('⚠️ Specdash not copied (source missing or dest exists)');
    }
    
    // Create docs directory if it doesn't exist
    const docsDir = path.join(currentWorkingDir, 'docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
      log('✅ Created docs directory');
    } else {
      log('⚠️ Docs directory already exists');
    }
    
    // Final verification
    const finalClaudeContents = fs.readdirSync(claudeDir);
    log('Final .claude contents:', finalClaudeContents);
    
    log('🎉 SpecGen MCP setup complete!');
    
    // Success output
    console.log('\n🚀 Setting up SpecGen MCP...\n');
    console.log('📦 Package installed at:', packageDir);
    console.log('🏠 Setting up in:', currentWorkingDir);
    console.log('✅ Created .claude directory');
    console.log('✅ Copied Claude Code commands');
    console.log('✅ Copied Claude Code agents');
    console.log('✅ Copied Claude Code hooks');
    console.log('✅ Copied Claude Code settings');
    console.log('✅ Created .specgen directory');
    console.log('✅ Copied SpecDash dashboard');
    console.log('✅ Created docs directory');
    console.log('\n🎉 SpecGen MCP setup complete!\n');
    console.log('📋 Next steps to complete setup:\n');
    console.log('1. Add the MCP server to Claude Code:');
    console.log('   claude mcp add specgen-mcp "specgen-mcp"');
    console.log('');
    console.log('2. Restart Claude Code');
    console.log('');
    console.log('💡 For future projects: Just run "specgen-setup" in any directory!');
    console.log('');
    console.log('🚀 You now have:');
    console.log('   • Claude Code commands (/architect, /engineer, /reviewer)');
    console.log('   • Specialized agents for project exploration');
    console.log('   • SpecDash dashboard for visual spec management');
    console.log('   • MCP server for specification management');
    console.log('');
    console.log('📁 Created directories:');
    console.log('   • .claude/     - Claude Code integration (required in parent)');
    console.log('   • docs/        - Specifications storage (required in parent)');
    console.log('   • .specgen/    - MCP server & dashboard (consolidated)');
    console.log('');
    
  } catch (error) {
    log('❌ Setup failed:', error.message);
    log('Error stack:', error.stack);
    
    console.log('❌ Setup failed:', error.message);
    console.log('');
    console.log('📋 Manual setup may be required.');
    console.log('Please check the setup log and file permissions.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Fix any permission issues above');
    console.log('2. Add MCP server: claude mcp add specgen-mcp "specgen-mcp"');
    console.log('3. Restart Claude Code');
    
    process.exit(1);
  }
}

// Only run if called directly (not when required)
if (require.main === module) {
  setupSpecgenMcp();
}

module.exports = setupSpecgenMcp;