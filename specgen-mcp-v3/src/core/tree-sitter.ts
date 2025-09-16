import * as fs from 'fs/promises';
import * as path from 'path';

// Tree-sitter is disabled for now due to native compilation issues
// We'll use regex-based fallback parsing for the implementation

export interface ParsedFile {
  path: string;
  language: string;
  ast: any; // Placeholder for tree-sitter AST
  content: string;
}

export interface SymbolInfo {
  name: string;
  type: 'function' | 'class' | 'interface' | 'variable' | 'import' | 'export';
  startPosition: { row: number; column: number };
  endPosition: { row: number; column: number };
  text: string;
}

export interface PatternMatch {
  pattern: string;
  matches: Array<{
    text: string;
    startPosition: { row: number; column: number };
    endPosition: { row: number; column: number };
  }>;
}

export interface SearchResult {
  file: string;
  matches: PatternMatch[];
  score: number;
}

export class TreeSitterParser {
  private supportedLanguages = ['typescript', 'javascript', 'python', 'go', 'rust'];
  private initialized = true; // Using fallback regex parsing

  constructor() {
    // No native tree-sitter initialization needed
  }

  async parseFile(filePath: string, language?: string): Promise<ParsedFile> {
    const content = await fs.readFile(filePath, 'utf-8');
    const detectedLanguage = language || this.detectLanguage(filePath);

    // Mock AST for now - in a full implementation, this would be actual tree-sitter parsing
    const ast = {
      rootNode: {
        text: content,
        type: 'program'
      }
    };

    return {
      path: filePath,
      language: detectedLanguage,
      ast,
      content
    };
  }

  async extractSymbols(parsedFile: ParsedFile): Promise<SymbolInfo[]> {
    const { content, language } = parsedFile;
    return this.extractSymbolsWithRegex(content, language);
  }

  async findPatterns(parsedFile: ParsedFile, patterns: string[]): Promise<PatternMatch[]> {
    const matches: PatternMatch[] = [];
    const { content } = parsedFile;

    for (const pattern of patterns) {
      try {
        const regex = new RegExp(pattern, 'gm');
        const patternMatches: any[] = [];
        let match;

        while ((match = regex.exec(content)) !== null) {
          const lines = content.substring(0, match.index).split('\n');
          patternMatches.push({
            text: match[0],
            startPosition: { row: lines.length - 1, column: lines[lines.length - 1].length },
            endPosition: { row: lines.length - 1, column: lines[lines.length - 1].length + match[0].length }
          });
        }

        matches.push({
          pattern,
          matches: patternMatches
        });
      } catch (error) {
        console.warn(`Failed to execute pattern ${pattern}:`, error);
        matches.push({
          pattern,
          matches: []
        });
      }
    }

    return matches;
  }

  async semanticSearch(query: string, files: string[]): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    for (const file of files) {
      try {
        const parsedFile = await this.parseFile(file);
        const symbols = await this.extractSymbols(parsedFile);

        // Simple semantic matching - look for symbols that match the query
        const matchingSymbols = symbols.filter(symbol =>
          symbol.name.toLowerCase().includes(query.toLowerCase()) ||
          symbol.text.toLowerCase().includes(query.toLowerCase())
        );

        if (matchingSymbols.length > 0) {
          const score = this.calculateRelevanceScore(query, matchingSymbols);
          results.push({
            file,
            matches: [{
              pattern: query,
              matches: matchingSymbols.map(symbol => ({
                text: symbol.text,
                startPosition: symbol.startPosition,
                endPosition: symbol.endPosition
              }))
            }],
            score
          });
        }
      } catch (error) {
        console.warn(`Failed to process file ${file}:`, error);
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  private detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const extensionMap: { [key: string]: string } = {
      '.ts': 'typescript',
      '.tsx': 'tsx',
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.py': 'python',
      '.go': 'go',
      '.rs': 'rust'
    };
    return extensionMap[ext] || 'unknown';
  }


  private calculateRelevanceScore(query: string, symbols: SymbolInfo[]): number {
    let score = 0;
    const queryLower = query.toLowerCase();

    for (const symbol of symbols) {
      if (symbol.name.toLowerCase() === queryLower) {
        score += 10; // Exact match
      } else if (symbol.name.toLowerCase().includes(queryLower)) {
        score += 5; // Partial match
      }
      if (symbol.text.toLowerCase().includes(queryLower)) {
        score += 1; // Text content match
      }
    }

    return score;
  }

  getAvailableLanguages(): string[] {
    return this.supportedLanguages;
  }

  private extractSymbolsWithRegex(content: string, language: string): SymbolInfo[] {
    const symbols: SymbolInfo[] = [];
    const lines = content.split('\n');

    // Language-specific regex patterns
    const patterns = this.getRegexPatternsForLanguage(language);

    for (const [type, regex] of Object.entries(patterns)) {
      let match;
      while ((match = regex.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length - 1;
        const symbolName = match[1] || match[0];

        symbols.push({
          name: symbolName,
          type: type as any,
          startPosition: { row: lineNumber, column: match.index },
          endPosition: { row: lineNumber, column: match.index + match[0].length },
          text: match[0]
        });
      }
    }

    return symbols;
  }

  private getRegexPatternsForLanguage(language: string): Record<string, RegExp> {
    const patterns: Record<string, Record<string, RegExp>> = {
      typescript: {
        function: /(?:function|const|let|var)\s+(\w+)\s*(?:\([^)]*\)\s*(?::\s*[^{]*)?{|=\s*(?:\([^)]*\)\s*)?=>)/g,
        class: /class\s+(\w+)/g,
        interface: /interface\s+(\w+)/g,
        import: /import\s+.*?from\s+['"]([^'"]+)['"]/g
      },
      javascript: {
        function: /(?:function|const|let|var)\s+(\w+)\s*(?:\([^)]*\)\s*{|=\s*(?:\([^)]*\)\s*)?=>)/g,
        class: /class\s+(\w+)/g,
        import: /import\s+.*?from\s+['"]([^'"]+)['"]/g
      },
      python: {
        function: /def\s+(\w+)\s*\(/g,
        class: /class\s+(\w+)/g,
        import: /(?:import\s+(\w+)|from\s+(\w+)\s+import)/g
      },
      go: {
        function: /func\s+(\w+)\s*\(/g,
        struct: /type\s+(\w+)\s+struct/g,
        import: /import\s+['"]([^'"]+)['"]/g
      },
      rust: {
        function: /fn\s+(\w+)\s*\(/g,
        struct: /struct\s+(\w+)/g,
        import: /use\s+([^;]+);/g
      }
    };

    return patterns[language] || patterns.typescript;
  }

  // Backward compatibility methods
  async analyzeCodebase(paths: string[]): Promise<any> {
    const results = {
      filesAnalyzed: 0,
      symbolCount: 0,
      codebasePatterns: []
    };

    for (const path of paths.slice(0, 10)) { // Limit to prevent timeout
      try {
        const parsed = await this.parseFile(path);
        const symbols = await this.extractSymbols(parsed);
        results.filesAnalyzed++;
        results.symbolCount += symbols.length;

        // Extract common patterns
        const patterns = symbols.map(s => s.type).filter((v, i, a) => a.indexOf(v) === i);
        results.codebasePatterns.push(...patterns);
      } catch (error) {
        console.warn(`Failed to analyze ${path}:`, error);
      }
    }

    return results;
  }

  async analyzeDependencies(rootPath: string = '.'): Promise<any> {
    // Simple dependency analysis
    try {
      const packageJsonPath = `${rootPath}/package.json`;
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

      return {
        dependencies: Object.keys(packageJson.dependencies || {}),
        devDependencies: Object.keys(packageJson.devDependencies || {}),
        totalCount: Object.keys(packageJson.dependencies || {}).length + Object.keys(packageJson.devDependencies || {}).length
      };
    } catch (error) {
      return {
        dependencies: [],
        devDependencies: [],
        totalCount: 0,
        error: 'Could not analyze dependencies'
      };
    }
  }
}