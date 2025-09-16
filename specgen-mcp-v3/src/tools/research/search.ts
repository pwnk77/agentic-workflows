import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { SearchArgs, SearchSchema } from '../../schemas/tool-schemas.js';
import { TreeSitterParser } from '../../core/tree-sitter.js';
import { CacheManager, CACHE_CONFIGS } from '../../core/cache-manager.js';
import { StructuredErrorHandler } from '../../core/error-handler.js';
import { glob } from 'glob';
import * as path from 'path';
import * as fs from 'fs/promises';

const cacheManager = new CacheManager();
const parser = new TreeSitterParser();

export async function searchCode(args: unknown): Promise<CallToolResult> {
  try {
    // Validate input
    const validatedArgs = SearchSchema.parse(args);

    return await StructuredErrorHandler.handleAsyncOperation(
      performSearch(validatedArgs),
      'code_search',
      30000
    );
  } catch (error) {
    if (error instanceof Error) {
      const structuredError = StructuredErrorHandler.createError(
        error.message,
        'validation_error',
        { input: args },
        [
          'Check that query is at least 3 characters long',
          'Ensure scope is one of: symbols, imports, patterns, all',
          'Verify maxResults is between 1 and 100'
        ],
        'Correct the input parameters and try again'
      );
      return StructuredErrorHandler.formatAsCallToolResult(structuredError);
    }
    throw error;
  }
}

async function performSearch(args: SearchArgs): Promise<CallToolResult> {
  const { query, scope, language, maxResults, includeContext } = args;

  // Generate cache key
  const cacheKey = `search_${JSON.stringify(args)}`;

  // Try to get from cache
  const cached = await cacheManager.get(cacheKey, CACHE_CONFIGS.SEARCH_RESULTS);
  if (cached) {
    return {
      content: [{
        type: "text",
        text: `🔍 Search Results (cached) for "${query}":

${(cached as any).summary}

📊 Performance: Retrieved from cache`
      }],
      isError: false
    };
  }

  // Find files to search
  const searchPatterns = language ? [`**/*.${getExtensionForLanguage(language)}`] : [
    '**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.py', '**/*.go', '**/*.rs'
  ];

  const allFiles: string[] = [];
  for (const pattern of searchPatterns) {
    try {
      const matches = await glob(pattern, {
        ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**']
      });
      allFiles.push(...matches);
    } catch (error) {
      console.warn(`Failed to find files with pattern ${pattern}:`, error);
    }
  }

  if (allFiles.length === 0) {
    const error = StructuredErrorHandler.createError(
      'No files found to search',
      'no_files_found',
      { language, searchPatterns },
      [
        'Check that the specified language has files in the project',
        'Verify the current directory contains a codebase',
        'Try without specifying a language to search all files'
      ],
      'Adjust the search parameters or check the working directory'
    );
    return StructuredErrorHandler.formatAsCallToolResult(error);
  }

  // Perform semantic search
  const searchResults = await parser.semanticSearch(query, allFiles.slice(0, 100)); // Limit for performance

  // Filter and enhance results based on scope
  const filteredResults = await filterAndEnhanceResults(searchResults, scope, query, includeContext);

  // Limit results
  const limitedResults = filteredResults.slice(0, maxResults);

  // Generate summary
  const summary = generateSearchSummary(limitedResults, query, scope, allFiles.length);

  // Cache the results
  await cacheManager.set(cacheKey, { summary, results: limitedResults }, CACHE_CONFIGS.SEARCH_RESULTS);

  return {
    content: [{
      type: "text",
      text: `🔍 Search Results for "${query}":

${summary}

📊 Performance: Search completed across ${allFiles.length} files`
    }],
    isError: false
  };
}

function getExtensionForLanguage(language: string): string {
  const languageMap: Record<string, string> = {
    'typescript': 'ts',
    'javascript': 'js',
    'python': 'py',
    'go': 'go',
    'rust': 'rs'
  };
  return languageMap[language] || '*';
}

async function filterAndEnhanceResults(
  searchResults: any[],
  scope: string,
  query: string,
  includeContext: boolean
): Promise<any[]> {
  const enhanced = [];

  for (const result of searchResults) {
    try {
      const content = await fs.readFile(result.file, 'utf-8');
      const lines = content.split('\n');

      const enhancedResult = {
        file: result.file,
        score: result.score,
        matches: []
      };

      for (const match of result.matches) {
        for (const patternMatch of match.matches) {
          const lineNumber = patternMatch.startPosition.row;
          const line = lines[lineNumber] || '';

          // Filter by scope
          if (scope !== 'all') {
            if (scope === 'symbols' && !isSymbolMatch(patternMatch.text)) continue;
            if (scope === 'imports' && !isImportMatch(patternMatch.text)) continue;
            if (scope === 'patterns' && !isPatternMatch(patternMatch.text, query)) continue;
          }

          const matchInfo: any = {
            text: patternMatch.text,
            line: lineNumber + 1,
            column: patternMatch.startPosition.column,
            snippet: line.trim()
          };

          // Add context if requested
          if (includeContext) {
            const contextLines = [];
            for (let i = Math.max(0, lineNumber - 2); i <= Math.min(lines.length - 1, lineNumber + 2); i++) {
              contextLines.push(`${i + 1}: ${lines[i]}`);
            }
            matchInfo.context = contextLines;
          }

          enhancedResult.matches.push(matchInfo);
        }
      }

      if (enhancedResult.matches.length > 0) {
        enhanced.push(enhancedResult);
      }
    } catch (error) {
      console.warn(`Failed to enhance result for ${result.file}:`, error);
    }
  }

  return enhanced.sort((a, b) => b.score - a.score);
}

function isSymbolMatch(text: string): boolean {
  // Check if the match looks like a symbol (function, class, variable)
  return /(?:function|class|const|let|var|def|func|fn|struct|interface)\s+\w+/.test(text);
}

function isImportMatch(text: string): boolean {
  // Check if the match looks like an import statement
  return /(?:import|from|use|require|include)\s+/.test(text);
}

function isPatternMatch(text: string, query: string): boolean {
  // Check if the match contains the query as a pattern
  return text.toLowerCase().includes(query.toLowerCase());
}

function generateSearchSummary(results: any[], query: string, scope: string, totalFiles: number): string {
  const totalMatches = results.reduce((sum, result) => sum + result.matches.length, 0);
  const fileCount = results.length;

  let summary = `🎯 Query: "${query}" (scope: ${scope})
📁 Files searched: ${totalFiles}
📄 Files with matches: ${fileCount}
🔗 Total matches: ${totalMatches}

`;

  if (results.length === 0) {
    summary += `❌ No matches found.

💡 Try:
• Broadening the search scope to 'all'
• Using different keywords
• Checking spelling and syntax`;
  } else {
    // Show top matches
    const topResults = results.slice(0, 5);
    summary += `🏆 Top Results:\n`;

    for (const result of topResults) {
      const relativeFile = path.relative(process.cwd(), result.file);
      const matchCount = result.matches.length;
      const topMatch = result.matches[0];

      summary += `
• ${relativeFile} (${matchCount} match${matchCount > 1 ? 'es' : ''})
  Line ${topMatch.line}: ${topMatch.snippet}`;
    }

    if (results.length > 5) {
      summary += `\n\n... and ${results.length - 5} more files with matches`;
    }

    summary += `\n\n💡 Use specgen.research.analyze for deeper symbol analysis`;
  }

  return summary;
}