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
    
    // Setup specdash directory  
    const specdashSource = path.join(packageDir, 'specdash');
    const specdashDest = path.join(currentWorkingDir, 'specdash');
    
    if (fs.existsSync(specdashSource) && !fs.existsSync(specdashDest)) {
      fs.copySync(specdashSource, specdashDest);
      console.log('✅ Copied SpecDash dashboard');
    }
    
    // Create docs directory if it doesn't exist
    const docsDir = path.join(currentWorkingDir, 'docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
      console.log('✅ Created docs directory');
    }
    
    console.log('\n🎉 SpecGen MCP setup complete!\n');
    
    // Find the global binary path
    let binaryPath;
    const globalBin = path.join(path.dirname(process.execPath), 'specgen-mcp');
    const npmGlobal = path.join(os.homedir(), '.npm', 'bin', 'specgen-mcp');
    
    if (fs.existsSync(globalBin)) {
      binaryPath = globalBin;
    } else if (fs.existsSync(npmGlobal)) {
      binaryPath = npmGlobal;
    } else {
      // Try to find via npm global root
      try {
        const { execSync } = require('child_process');
        const npmRoot = execSync('npm root -g', { encoding: 'utf-8' }).trim();
        binaryPath = path.join(npmRoot, 'specgen-mcp', 'dist', 'index.js');
      } catch {
        binaryPath = 'npx specgen-mcp';
      }
    }
    
    console.log('📋 Next steps to complete setup:\n');
    console.log('1. Add the MCP server to Claude Code:');
    console.log(`   claude mcp add specgen-mcp "${binaryPath}"`);
    console.log('');
    console.log('2. Restart Claude Code');
    console.log('');
    console.log('3. Test the setup:');
    console.log('   /architect "Add user authentication system"');
    console.log('');
    console.log('🚀 You now have:');
    console.log('   • Claude Code commands (/architect, /engineer, /reviewer)');
    console.log('   • Specialized agents for project exploration');
    console.log('   • SpecDash dashboard for visual spec management');
    console.log('   • MCP server for specification management');
    console.log('');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('');
    console.log('📋 Manual setup instructions:');
    console.log('1. Copy .claude directory contents manually');
    console.log('2. Run: claude mcp add specgen-mcp "npx specgen-mcp"');
    console.log('3. Restart Claude Code');
    process.exit(1);
  }
}

// Only run if called directly (not when required)
if (require.main === module) {
  setupSpecgenMcp();
}

module.exports = setupSpecgenMcp;