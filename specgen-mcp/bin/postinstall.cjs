#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

async function setupSpecgenMcp() {
  console.log('\n🚀 Setting up SpecGen MCP...\n');
  
  try {
    // Get package installation directory
    const packageDir = path.dirname(__dirname);
    const currentWorkingDir = process.cwd();
    
    console.log('📦 Package installed at:', packageDir);
    console.log('🏠 Setting up in:', currentWorkingDir);
    
    // Setup .claude directory with commands and agents
    const claudeDir = path.join(currentWorkingDir, '.claude');
    
    if (!fs.existsSync(claudeDir)) {
      fs.mkdirSync(claudeDir, { recursive: true });
      console.log('✅ Created .claude directory');
    }
    
    // Copy commands from claude-code bundle
    const commandsSource = path.join(packageDir, 'claude-code', 'commands');
    const commandsDest = path.join(claudeDir, 'commands');
    
    if (fs.existsSync(commandsSource)) {
      fs.copySync(commandsSource, commandsDest);
      console.log('✅ Copied Claude Code commands');
    }
    
    // Copy agents from claude-code bundle
    const agentsSource = path.join(packageDir, 'claude-code', 'agents');
    const agentsDest = path.join(claudeDir, 'agents');
    
    if (fs.existsSync(agentsSource)) {
      fs.copySync(agentsSource, agentsDest);
      console.log('✅ Copied Claude Code agents');
    }
    
    // Copy hooks from claude-code bundle
    const hooksSource = path.join(packageDir, 'claude-code', 'hooks');
    const hooksDest = path.join(claudeDir, 'hooks');
    
    if (fs.existsSync(hooksSource)) {
      fs.copySync(hooksSource, hooksDest);
      console.log('✅ Copied Claude Code hooks');
    }
    
    // Copy settings if they exist
    const settingsSource = path.join(packageDir, 'claude-code', 'settings.local.json');
    const settingsDest = path.join(claudeDir, 'settings.local.json');
    
    if (fs.existsSync(settingsSource)) {
      fs.copySync(settingsSource, settingsDest);
      console.log('✅ Copied Claude Code settings');
    }
    
    // Create .specgen directory for consolidated structure
    const specgenDir = path.join(currentWorkingDir, '.specgen');
    if (!fs.existsSync(specgenDir)) {
      fs.mkdirSync(specgenDir, { recursive: true });
      console.log('✅ Created .specgen directory');
    }
    
    // Setup specdash directory inside .specgen
    const specdashSource = path.join(packageDir, 'specdash');
    const specdashDest = path.join(specgenDir, 'specdash');
    
    if (fs.existsSync(specdashSource) && !fs.existsSync(specdashDest)) {
      fs.copySync(specdashSource, specdashDest);
      console.log('✅ Copied SpecDash dashboard to .specgen/specdash');
    }
    
    // Create docs directory if it doesn't exist
    const docsDir = path.join(currentWorkingDir, 'docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
      console.log('✅ Created docs directory');
    }
    
    console.log('\n🎉 SpecGen MCP automatic setup complete!\n');
    
    // Provide clear instructions for adding MCP server
    console.log('📋 Next steps to complete setup:\n');
    console.log('1. Add the MCP server to Claude Code:');
    console.log('   claude mcp add specgen-mcp "specgen-mcp"');
    console.log('');
    console.log('2. Restart Claude Code');
    console.log('');
    console.log('🚀 You now have:');
    console.log('   • Claude Code commands (/architect, /engineer, /reviewer)');
    console.log('   • Specialized agents for project exploration');
    console.log('   • SpecDash dashboard for visual spec management');
    console.log('   • MCP server for specification management');
    console.log('');
    
  } catch (error) {
    console.error('❌ Automatic setup failed:', error.message);
    console.log('');
    console.log('📋 Complete setup with:');
    console.log('');
    console.log('1. Run setup command:');
    console.log('   specgen-setup');
    console.log('');
    console.log('2. Add MCP server:');
    console.log('   claude mcp add specgen-mcp "specgen-mcp"');
    console.log('');
    console.log('3. Restart Claude Code');
    process.exit(1);
  }
}

// Only run if called directly (not when required)
if (require.main === module) {
  setupSpecgenMcp();
}

module.exports = setupSpecgenMcp;