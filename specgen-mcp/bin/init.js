#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeSpecgenMCP() {
  console.log('🚀 Initializing SpecGen MCP v2.0.0...\n');

  try {
    const homeDir = os.homedir();
    const claudeDir = path.join(homeDir, '.claude');
    const claudeConfigPath = path.join(claudeDir, '.claude.json');
    const packageRoot = path.resolve(__dirname, '..');

    // 1. Ensure .claude directory exists
    console.log('📁 Setting up .claude directory...');
    await fs.ensureDir(claudeDir);
    console.log(`✅ Created/verified: ${claudeDir}`);

    // 2. Copy claude-code bundle to .claude directory
    console.log('\n🔧 Installing Claude Code commands and agents...');
    const claudeCodeSource = path.join(packageRoot, 'claude-code');
    const claudeCodeDest = path.join(claudeDir);
    
    if (await fs.pathExists(claudeCodeSource)) {
      // Copy contents of claude-code into .claude directory
      await fs.copy(claudeCodeSource, claudeCodeDest, { overwrite: true });
      console.log('✅ Installed commands: /architect, /engineer, /reviewer');
      console.log('✅ Installed agents: performance, quality, security, explorers');
      console.log('✅ Installed hooks: notification scripts');
    } else {
      console.warn('⚠️  Claude Code bundle not found - commands may not be available');
    }

    // 3. Set executable permissions on hook scripts
    const hooksDir = path.join(claudeDir, 'hooks');
    if (await fs.pathExists(hooksDir)) {
      const hookFiles = await fs.readdir(hooksDir);
      for (const hookFile of hookFiles) {
        if (hookFile.endsWith('.sh')) {
          const hookPath = path.join(hooksDir, hookFile);
          await fs.chmod(hookPath, 0o755);
        }
      }
      console.log('✅ Set executable permissions on hook scripts');
    }

    // 4. Configure MCP server in .claude.json
    console.log('\n🔗 Configuring MCP server...');
    let claudeConfig = {};
    
    if (await fs.pathExists(claudeConfigPath)) {
      try {
        const configContent = await fs.readFile(claudeConfigPath, 'utf-8');
        claudeConfig = JSON.parse(configContent);
      } catch (error) {
        console.warn('⚠️  Could not parse existing .claude.json, creating new config');
      }
    }

    // Add specgen MCP server configuration
    if (!claudeConfig.mcpServers) {
      claudeConfig.mcpServers = {};
    }

    claudeConfig.mcpServers.specgen = {
      command: "node",
      args: [path.join(packageRoot, "dist/index.js")],
      cwd: packageRoot
    };

    await fs.writeFile(claudeConfigPath, JSON.stringify(claudeConfig, null, 2));
    console.log('✅ Added SpecGen MCP server to configuration');

    // 5. Create sample project structure
    console.log('\n📋 Setting up project structure...');
    const currentDir = process.cwd();
    const docsDir = path.join(currentDir, 'docs');
    
    await fs.ensureDir(docsDir);
    console.log(`✅ Created docs directory: ${docsDir}`);

    // Create sample metadata file
    const metadataPath = path.join(docsDir, '.spec-metadata.json');
    if (!(await fs.pathExists(metadataPath))) {
      const sampleMetadata = {
        metadata_version: "2.0.0",
        last_full_scan: new Date().toISOString(),
        specs: {}
      };
      await fs.writeFile(metadataPath, JSON.stringify(sampleMetadata, null, 2));
      console.log('✅ Created sample .spec-metadata.json');
    }

    // 6. Verify Claude Code CLI
    console.log('\n🔍 Verifying Claude Code CLI...');
    try {
      const { execSync } = await import('child_process');
      execSync('claude --version', { stdio: 'pipe' });
      console.log('✅ Claude Code CLI detected');
    } catch (error) {
      console.warn('⚠️  Claude Code CLI not found. Install from: https://claude.ai/code');
      console.warn('   Without Claude Code CLI, MCP integration may not work');
    }

    // 7. Success message
    console.log('\n🎉 SpecGen MCP v2.0.0 initialized successfully!\n');
    console.log('📚 Available commands:');
    console.log('   /architect <feature-description>  - Create detailed specifications');
    console.log('   /engineer <spec-file>            - Implement specifications');
    console.log('   /reviewer <code-files>           - Review code quality\n');
    console.log('🔧 Available MCP tools:');
    console.log('   list_specs, get_spec, search_specs, refresh_metadata, launch_dashboard\n');
    console.log('🚀 To get started:');
    console.log('   1. Restart Claude Code to load the MCP server');
    console.log('   2. Use /architect to create your first specification');
    console.log('   3. Use launch_dashboard tool to view specs in the web interface\n');
    console.log('📖 Documentation: https://github.com/anthropics/agentic-workflows');

  } catch (error) {
    console.error('\n❌ Initialization failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   - Ensure you have write permissions to ~/.claude');
    console.error('   - Check that Claude Code CLI is installed');
    console.error('   - Try running with sudo if permission issues persist');
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeSpecgenMCP();
}