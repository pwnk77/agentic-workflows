#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Post-install script for SpecGen MCP
 * Sets up .claude configuration in the installation directory
 */

async function postInstall() {
  console.log('🚀 Setting up SpecGen MCP...');

  try {
    // Get the installation directory (where this package is installed)
    const packageDir = path.dirname(__dirname);
    const distDir = path.join(packageDir, 'dist');
    const configSource = path.join(distDir, 'config');
    
    // Find the user's project root (where they ran npm install from)
    // This could be the current working directory or a parent directory
    let projectRoot = process.cwd();
    
    // If we're in node_modules, go up to the project root
    if (projectRoot.includes('node_modules')) {
      const parts = projectRoot.split(path.sep);
      const nodeModulesIndex = parts.indexOf('node_modules');
      projectRoot = parts.slice(0, nodeModulesIndex).join(path.sep);
    }
    
    // Target .claude directory in the project root
    const claudeTarget = path.join(projectRoot, '.claude');
    
    // Check if source config exists
    if (!fs.existsSync(configSource)) {
      console.log('⚠️  No bundled configuration found - skipping .claude setup');
      console.log('✅ SpecGen MCP installed successfully! Run "specgen --help" to get started.');
      return;
    }
    
    // Check if .claude directory already exists and has our config
    if (fs.existsSync(claudeTarget)) {
      const agentsDir = path.join(claudeTarget, 'agents');
      const commandsDir = path.join(claudeTarget, 'commands');
      
      if (fs.existsSync(agentsDir) && fs.existsSync(commandsDir)) {
        console.log('✅ Claude Code configuration already exists');
        console.log('✅ SpecGen MCP installed successfully! Run "specgen --help" to get started.');
        return;
      }
    }
    
    // Copy configuration files
    console.log('🔧 Setting up Claude Code configuration...');
    copyDirectoryRecursive(configSource, claudeTarget);
    
    // Make hook scripts executable
    const hooksDir = path.join(claudeTarget, 'hooks');
    if (fs.existsSync(hooksDir)) {
      const hookFiles = fs.readdirSync(hooksDir);
      for (const hookFile of hookFiles) {
        const hookPath = path.join(hooksDir, hookFile);
        const stat = fs.statSync(hookPath);
        if (stat.isFile() && hookFile.endsWith('.sh')) {
          fs.chmodSync(hookPath, '755');
        }
      }
    }
    
    console.log('✅ Claude Code configuration installed');
    console.log(`   📁 Location: ${claudeTarget}`);
    console.log('   🤖 Agents, commands, and hooks are now available');
    console.log('✅ SpecGen MCP installed successfully! Run "specgen --help" to get started.');
    
  } catch (error) {
    console.warn('⚠️  Failed to set up Claude Code configuration:', error.message);
    console.log('✅ SpecGen MCP core functionality installed successfully!');
    console.log('   💡 You can manually copy configuration with: specgen init');
  }
}

/**
 * Recursively copy directory contents
 */
function copyDirectoryRecursive(source, target) {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  
  // Get list of files/directories in source
  const items = fs.readdirSync(source);
  
  for (const item of items) {
    const sourcePath = path.join(source, item);
    const targetPath = path.join(target, item);
    const stat = fs.statSync(sourcePath);
    
    if (stat.isDirectory()) {
      // Recursively copy subdirectory
      copyDirectoryRecursive(sourcePath, targetPath);
    } else {
      // Copy file
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

// Run the post-install setup
postInstall().catch(console.error);

export { postInstall };