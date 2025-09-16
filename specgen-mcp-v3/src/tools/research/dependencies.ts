import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { DependenciesArgs, DependenciesSchema } from '../../schemas/tool-schemas.js';
import { CacheManager, CACHE_CONFIGS } from '../../core/cache-manager.js';
import { StructuredErrorHandler } from '../../core/error-handler.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';

const cacheManager = new CacheManager();

export async function analyzeDependencies(args: unknown): Promise<CallToolResult> {
  try {
    // Validate input
    const validatedArgs = DependenciesSchema.parse(args);

    return await StructuredErrorHandler.handleAsyncOperation(
      performDependencyAnalysis(validatedArgs),
      'dependency_analysis',
      30000
    );
  } catch (error) {
    if (error instanceof Error) {
      const structuredError = StructuredErrorHandler.createError(
        error.message,
        'validation_error',
        { input: args },
        [
          'Check that includeTransitive is a boolean',
          'Ensure checkOutdated is a boolean',
          'Verify language is a valid language identifier'
        ],
        'Correct the input parameters and try again'
      );
      return StructuredErrorHandler.formatAsCallToolResult(structuredError);
    }
    throw error;
  }
}

async function performDependencyAnalysis(args: DependenciesArgs): Promise<CallToolResult> {
  const { includeTransitive, checkOutdated, language } = args;

  // Generate cache key
  const cacheKey = `deps_${JSON.stringify(args)}`;

  // Try to get from cache
  const cached = await cacheManager.get(cacheKey, CACHE_CONFIGS.DEPENDENCY_ANALYSIS);
  if (cached) {
    return {
      content: [{
        type: "text",
        text: `📦 Dependency Analysis (cached):

${(cached as any).summary}

📊 Performance: Retrieved from cache`
      }],
      isError: false
    };
  }

  try {
    // Detect project types and analyze dependencies
    const projectInfo = await detectProjectTypes();
    const dependencyResults: any = {
      dependencies: [],
      outdated: [],
      conflicts: [],
      security: [],
      projectTypes: projectInfo.types,
      summary: {}
    };

    // Analyze each detected project type
    for (const projectType of projectInfo.types) {
      if (language && !isLanguageMatch(projectType, language)) continue;

      const analysis = await analyzeProjectType(projectType, projectInfo.files[projectType], {
        includeTransitive,
        checkOutdated
      });

      dependencyResults.dependencies.push(...analysis.dependencies);
      dependencyResults.outdated.push(...analysis.outdated);
      dependencyResults.conflicts.push(...analysis.conflicts);
      dependencyResults.security.push(...analysis.security);
    }

    // Generate summary
    const summary = generateDependencySummary(dependencyResults);

    // Cache the results
    await cacheManager.set(cacheKey, { summary, ...dependencyResults }, CACHE_CONFIGS.DEPENDENCY_ANALYSIS);

    return {
      content: [{
        type: "text",
        text: `📦 Dependency Analysis:

${summary}

📊 Performance: Analysis completed in real-time`
      }],
      isError: false
    };

  } catch (error) {
    const structuredError = StructuredErrorHandler.createError(
      `Dependency analysis failed: ${error}`,
      'analysis_error',
      { args },
      [
        'Check that the project has dependency files (package.json, requirements.txt, etc.)',
        'Ensure you have permissions to read project files',
        'Try running from the project root directory'
      ],
      'Verify project structure and try again'
    );
    return StructuredErrorHandler.formatAsCallToolResult(structuredError);
  }
}

async function detectProjectTypes(): Promise<{ types: string[], files: Record<string, string[]> }> {
  const projectFiles: Record<string, string[]> = {};
  const detectedTypes: string[] = [];

  // JavaScript/TypeScript/Node.js
  const packageJsons = await glob('**/package.json', { ignore: ['**/node_modules/**'] });
  if (packageJsons.length > 0) {
    detectedTypes.push('nodejs');
    projectFiles.nodejs = packageJsons;
  }

  // Python
  const pythonFiles = await glob('**/requirements*.txt', { ignore: ['**/venv/**', '**/.venv/**'] });
  const pipfiles = await glob('**/Pipfile');
  const pyprojects = await glob('**/pyproject.toml');
  if (pythonFiles.length > 0 || pipfiles.length > 0 || pyprojects.length > 0) {
    detectedTypes.push('python');
    projectFiles.python = [...pythonFiles, ...pipfiles, ...pyprojects];
  }

  // Go
  const goMods = await glob('**/go.mod');
  if (goMods.length > 0) {
    detectedTypes.push('go');
    projectFiles.go = goMods;
  }

  // Rust
  const cargoTomls = await glob('**/Cargo.toml');
  if (cargoTomls.length > 0) {
    detectedTypes.push('rust');
    projectFiles.rust = cargoTomls;
  }

  return { types: detectedTypes, files: projectFiles };
}

function isLanguageMatch(projectType: string, language: string): boolean {
  const languageMap: Record<string, string[]> = {
    'javascript': ['nodejs'],
    'typescript': ['nodejs'],
    'python': ['python'],
    'go': ['go'],
    'rust': ['rust']
  };

  const matchingTypes = languageMap[language] || [];
  return matchingTypes.includes(projectType);
}

async function analyzeProjectType(
  projectType: string,
  files: string[],
  options: { includeTransitive: boolean; checkOutdated: boolean }
): Promise<any> {
  const analysis = {
    dependencies: [],
    outdated: [],
    conflicts: [],
    security: []
  };

  for (const file of files) {
    try {
      const fileAnalysis = await analyzeDepFile(file, projectType, options);
      analysis.dependencies.push(...fileAnalysis.dependencies);
      analysis.outdated.push(...fileAnalysis.outdated);
      analysis.conflicts.push(...fileAnalysis.conflicts);
      analysis.security.push(...fileAnalysis.security);
    } catch (error) {
      console.warn(`Failed to analyze dependency file ${file}:`, error);
    }
  }

  return analysis;
}

async function analyzeDepFile(
  filePath: string,
  projectType: string,
  options: { includeTransitive: boolean; checkOutdated: boolean }
): Promise<any> {
  const content = await fs.readFile(filePath, 'utf-8');
  const analysis = {
    dependencies: [],
    outdated: [],
    conflicts: [],
    security: []
  };

  switch (projectType) {
    case 'nodejs':
      return analyzePackageJson(filePath, content, options);
    case 'python':
      return analyzePythonDeps(filePath, content, options);
    case 'go':
      return analyzeGoMod(filePath, content, options);
    case 'rust':
      return analyzeCargoToml(filePath, content, options);
    default:
      return analysis;
  }
}

async function analyzePackageJson(
  filePath: string,
  content: string,
  options: { includeTransitive: boolean; checkOutdated: boolean }
): Promise<any> {
  const analysis = { dependencies: [], outdated: [], conflicts: [], security: [] };

  try {
    const packageJson = JSON.parse(content);
    const deps = {
      ...packageJson.dependencies || {},
      ...packageJson.devDependencies || {},
      ...(options.includeTransitive ? packageJson.peerDependencies || {} : {})
    };

    for (const [name, version] of Object.entries(deps)) {
      const dep = {
        name,
        version: version as string,
        file: filePath,
        type: 'npm',
        scope: getDepScope(name, packageJson)
      };

      analysis.dependencies.push(dep);

      // Check for known security issues (simplified)
      if (isKnownVulnerable(name, version as string)) {
        analysis.security.push({
          ...dep,
          severity: 'high',
          issue: 'Known security vulnerability'
        });
      }

      // Check for outdated packages (simplified)
      if (options.checkOutdated && isOutdated(version as string)) {
        analysis.outdated.push({
          ...dep,
          currentVersion: version,
          latestVersion: 'latest' // In real implementation, fetch from npm registry
        });
      }
    }

    // Check for conflicts (simplified)
    const conflicts = findVersionConflicts(analysis.dependencies);
    analysis.conflicts.push(...conflicts);

  } catch (error) {
    console.warn(`Failed to parse package.json ${filePath}:`, error);
  }

  return analysis;
}

async function analyzePythonDeps(
  filePath: string,
  content: string,
  options: any
): Promise<any> {
  const analysis = { dependencies: [], outdated: [], conflicts: [], security: [] };

  // Parse requirements.txt format
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));

  for (const line of lines) {
    const match = line.match(/^([a-zA-Z0-9\-_]+)([>=<~!]+.*)?$/);
    if (match) {
      const [, name, version] = match;
      const dep = {
        name,
        version: version || 'latest',
        file: filePath,
        type: 'pip',
        scope: 'runtime'
      };

      analysis.dependencies.push(dep);

      if (isKnownVulnerable(name, version)) {
        analysis.security.push({
          ...dep,
          severity: 'medium',
          issue: 'Potential security issue'
        });
      }
    }
  }

  return analysis;
}

async function analyzeGoMod(filePath: string, content: string, options: any): Promise<any> {
  const analysis = { dependencies: [], outdated: [], conflicts: [], security: [] };

  const lines = content.split('\n');
  let inRequireBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === 'require (') {
      inRequireBlock = true;
      continue;
    }

    if (trimmed === ')' && inRequireBlock) {
      inRequireBlock = false;
      continue;
    }

    if (inRequireBlock || trimmed.startsWith('require ')) {
      const match = trimmed.match(/([^\s]+)\s+([^\s]+)/);
      if (match) {
        const [, name, version] = match;
        analysis.dependencies.push({
          name,
          version,
          file: filePath,
          type: 'go',
          scope: 'runtime'
        });
      }
    }
  }

  return analysis;
}

async function analyzeCargoToml(filePath: string, content: string, options: any): Promise<any> {
  const analysis = { dependencies: [], outdated: [], conflicts: [], security: [] };

  // Simple TOML parsing for dependencies section
  const lines = content.split('\n');
  let inDepsSection = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '[dependencies]') {
      inDepsSection = true;
      continue;
    }

    if (trimmed.startsWith('[') && trimmed !== '[dependencies]') {
      inDepsSection = false;
      continue;
    }

    if (inDepsSection && trimmed.includes('=')) {
      const [name, version] = trimmed.split('=').map(s => s.trim().replace(/"/g, ''));
      if (name && version) {
        analysis.dependencies.push({
          name,
          version,
          file: filePath,
          type: 'cargo',
          scope: 'runtime'
        });
      }
    }
  }

  return analysis;
}

function getDepScope(name: string, packageJson: any): string {
  if (packageJson.dependencies && packageJson.dependencies[name]) return 'runtime';
  if (packageJson.devDependencies && packageJson.devDependencies[name]) return 'development';
  if (packageJson.peerDependencies && packageJson.peerDependencies[name]) return 'peer';
  return 'unknown';
}

function isKnownVulnerable(name: string, version: string): boolean {
  // Simplified vulnerability check - in real implementation, use security databases
  const knownVulnerable = ['node-sass', 'request', 'event-stream'];
  return knownVulnerable.includes(name);
}

function isOutdated(version: string): boolean {
  // Simplified outdated check - in real implementation, compare with registry
  return version.includes('^') || version.includes('~') || version.includes('<');
}

function findVersionConflicts(dependencies: any[]): any[] {
  const conflicts = [];
  const versions = new Map();

  for (const dep of dependencies) {
    if (versions.has(dep.name)) {
      const existing = versions.get(dep.name);
      if (existing.version !== dep.version) {
        conflicts.push({
          name: dep.name,
          versions: [existing.version, dep.version],
          files: [existing.file, dep.file]
        });
      }
    } else {
      versions.set(dep.name, dep);
    }
  }

  return conflicts;
}

function generateDependencySummary(results: any): string {
  const { dependencies, outdated, conflicts, security, projectTypes } = results;

  const depsByType = dependencies.reduce((acc: Record<string, number>, dep: any) => {
    acc[dep.type] = (acc[dep.type] || 0) + 1;
    return acc;
  }, {});

  const depsByScope = dependencies.reduce((acc: Record<string, number>, dep: any) => {
    acc[dep.scope] = (acc[dep.scope] || 0) + 1;
    return acc;
  }, {});

  let summary = `🏗️ Project Types: ${projectTypes.join(', ')}
📦 Total Dependencies: ${dependencies.length}

📊 By Package Manager:
${Object.entries(depsByType).map(([type, count]) => `• ${type}: ${count}`).join('\n')}

🎯 By Scope:
${Object.entries(depsByScope).map(([scope, count]) => `• ${scope}: ${count}`).join('\n')}

`;

  if (security.length > 0) {
    summary += `🚨 Security Issues: ${security.length}
${security.slice(0, 3).map((s: any) => `• ${s.name}@${s.version}: ${s.issue}`).join('\n')}
${security.length > 3 ? `... and ${security.length - 3} more` : ''}

`;
  }

  if (outdated.length > 0) {
    summary += `📅 Outdated Packages: ${outdated.length}
${outdated.slice(0, 3).map((o: any) => `• ${o.name}: ${o.currentVersion} → ${o.latestVersion}`).join('\n')}
${outdated.length > 3 ? `... and ${outdated.length - 3} more` : ''}

`;
  }

  if (conflicts.length > 0) {
    summary += `⚡ Version Conflicts: ${conflicts.length}
${conflicts.slice(0, 3).map((c: any) => `• ${c.name}: ${c.versions.join(' vs ')}`).join('\n')}
${conflicts.length > 3 ? `... and ${conflicts.length - 3} more` : ''}

`;
  }

  summary += `💡 Use package manager commands to update outdated dependencies and resolve conflicts.`;

  return summary;
}