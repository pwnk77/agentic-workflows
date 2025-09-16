import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { AnalyzeArgs, AnalyzeSchema } from '../../schemas/tool-schemas.js';
import { TreeSitterParser } from '../../core/tree-sitter.js';
import { CacheManager, CACHE_CONFIGS } from '../../core/cache-manager.js';
import { StructuredErrorHandler } from '../../core/error-handler.js';
import { glob } from 'glob';
import * as path from 'path';
import * as fs from 'fs/promises';

const cacheManager = new CacheManager();
const parser = new TreeSitterParser();

export async function analyzeCode(args: unknown): Promise<CallToolResult> {
  try {
    // Validate input
    const validatedArgs = AnalyzeSchema.parse(args);

    return await StructuredErrorHandler.handleAsyncOperation(
      performAnalysis(validatedArgs),
      'code_analysis',
      30000
    );
  } catch (error) {
    if (error instanceof Error) {
      const structuredError = StructuredErrorHandler.createError(
        error.message,
        'validation_error',
        { input: args },
        [
          'Check that paths array contains valid file paths',
          'Ensure language is one of: typescript, python, go, rust, javascript, auto',
          'Verify extractSymbols is a boolean'
        ],
        'Correct the input parameters and try again'
      );
      return StructuredErrorHandler.formatAsCallToolResult(structuredError);
    }
    throw error;
  }
}

async function performAnalysis(args: AnalyzeArgs): Promise<CallToolResult> {
  const { paths, language, extractSymbols, findPatterns, includeTests } = args;

  // Generate cache key
  const cacheKey = `analyze_${JSON.stringify({ paths, language, extractSymbols, findPatterns, includeTests })}`;

  // Try to get from cache
  const cached = await cacheManager.get(cacheKey, CACHE_CONFIGS.TREE_SITTER_ANALYSIS);
  if (cached) {
    return {
      content: [{
        type: "text",
        text: `🔄 Analysis Results (cached):

${(cached as any).summary}

📊 Performance: Retrieved from cache`
      }],
      isError: false
    };
  }

  // Expand paths to actual files
  const allFiles: string[] = [];
  for (const pathPattern of paths) {
    try {
      const matches = await glob(pathPattern, {
        ignore: includeTests ? [] : ['**/*.test.*', '**/*.spec.*', '**/test/**', '**/tests/**']
      });
      allFiles.push(...matches);
    } catch (error) {
      console.warn(`Failed to expand path pattern ${pathPattern}:`, error);
    }
  }

  if (allFiles.length === 0) {
    const error = StructuredErrorHandler.createError(
      'No files found matching the specified paths',
      'no_files_found',
      { paths, includeTests },
      [
        'Check that the file paths exist',
        'Verify glob patterns are correct',
        'Try including test files if needed'
      ],
      'Adjust the paths parameter to match existing files'
    );
    return StructuredErrorHandler.formatAsCallToolResult(error);
  }

  // Perform analysis
  const results = {
    symbols: {} as Record<string, any>,
    dependencies: {} as Record<string, any>,
    patterns: [] as any[],
    fileStats: {
      totalFiles: allFiles.length,
      byLanguage: {} as Record<string, number>,
      totalLines: 0
    },
    cached: false,
    timestamp: new Date().toISOString()
  };

  // Analyze each file
  for (const filePath of allFiles.slice(0, 50)) { // Limit to prevent timeout
    try {
      const detectedLang = language === 'auto' ? detectLanguageFromPath(filePath) : language;

      // Update language stats
      results.fileStats.byLanguage[detectedLang] = (results.fileStats.byLanguage[detectedLang] || 0) + 1;

      // Count lines
      const content = await fs.readFile(filePath, 'utf-8');
      results.fileStats.totalLines += content.split('\n').length;

      // Parse with tree-sitter if supported
      const availableLanguages = parser.getAvailableLanguages();
      if (availableLanguages.includes(detectedLang)) {
        const parsedFile = await parser.parseFile(filePath, detectedLang);

        if (extractSymbols) {
          const symbols = await parser.extractSymbols(parsedFile);
          results.symbols[filePath] = symbols;
        }

        if (findPatterns && findPatterns.length > 0) {
          const patterns = await parser.findPatterns(parsedFile, findPatterns);
          results.patterns.push({
            file: filePath,
            patterns
          });
        }
      } else {
        // Basic text analysis for unsupported languages
        results.symbols[filePath] = await performBasicAnalysis(content, filePath);
      }
    } catch (error) {
      console.warn(`Failed to analyze file ${filePath}:`, error);
    }
  }

  // Generate summary
  const summary = generateAnalysisSummary(results);

  // Cache the results
  await cacheManager.set(cacheKey, { summary, ...results }, CACHE_CONFIGS.TREE_SITTER_ANALYSIS);

  return {
    content: [{
      type: "text",
      text: `🔍 Code Analysis Results:

${summary}

📊 Performance: Analysis completed in real-time`
    }],
    isError: false
  };
}

function detectLanguageFromPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const extensionMap: Record<string, string> = {
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.py': 'python',
    '.go': 'go',
    '.rs': 'rust'
  };
  return extensionMap[ext] || 'unknown';
}

async function performBasicAnalysis(content: string, filePath: string) {
  const lines = content.split('\n');
  const symbols: any[] = [];

  // Basic regex-based symbol extraction
  const functionRegex = /(?:function|def|func|fn)\s+(\w+)/g;
  const classRegex = /(?:class|struct|interface)\s+(\w+)/g;
  const importRegex = /(?:import|from|use|require)\s+['"](.*?)['"]|import\s+(\w+)/g;

  let match;
  while ((match = functionRegex.exec(content)) !== null) {
    symbols.push({
      name: match[1],
      type: 'function',
      startPosition: { row: content.substring(0, match.index).split('\n').length - 1, column: 0 },
      text: match[0]
    });
  }

  while ((match = classRegex.exec(content)) !== null) {
    symbols.push({
      name: match[1],
      type: 'class',
      startPosition: { row: content.substring(0, match.index).split('\n').length - 1, column: 0 },
      text: match[0]
    });
  }

  while ((match = importRegex.exec(content)) !== null) {
    symbols.push({
      name: match[1] || match[2],
      type: 'import',
      startPosition: { row: content.substring(0, match.index).split('\n').length - 1, column: 0 },
      text: match[0]
    });
  }

  return symbols;
}

function generateAnalysisSummary(results: any): string {
  const { symbols, fileStats, patterns } = results;

  const symbolCounts = {
    functions: 0,
    classes: 0,
    imports: 0,
    other: 0
  };

  // Count symbols by type
  for (const fileSymbols of Object.values(symbols)) {
    if (Array.isArray(fileSymbols)) {
      for (const symbol of fileSymbols) {
        if (symbol.type === 'function') symbolCounts.functions++;
        else if (symbol.type === 'class') symbolCounts.classes++;
        else if (symbol.type === 'import') symbolCounts.imports++;
        else symbolCounts.other++;
      }
    }
  }

  const languageBreakdown = Object.entries(fileStats.byLanguage)
    .map(([lang, count]) => `• ${lang}: ${count} files`)
    .join('\n');

  return `📁 Files Analyzed: ${fileStats.totalFiles}
📏 Total Lines: ${fileStats.totalLines}

🏗️ Symbol Summary:
• Functions: ${symbolCounts.functions}
• Classes: ${symbolCounts.classes}
• Imports: ${symbolCounts.imports}
• Other: ${symbolCounts.other}

🔤 Language Breakdown:
${languageBreakdown}

${patterns.length > 0 ? `🔍 Pattern Matches: ${patterns.reduce((sum, p) => sum + p.patterns.length, 0)}` : ''}

💡 Analysis completed successfully. Use specgen.research.search for targeted symbol queries.`;
}