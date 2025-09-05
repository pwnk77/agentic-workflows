import * as fs from 'fs/promises';
import { SpecsMetadataIndex, SpecFrontmatter } from './file-spec.service.js';

export interface SearchResult {
  id: number;
  score: number;
  title?: string;
  category?: string;
  status?: string;
  snippet?: string;
}

export interface SearchOptions {
  limit?: number;
  minScore?: number;
  includeSnippets?: boolean;
}

export class MarkdownSearchIndex {
  private index: Map<string, Set<number>> = new Map();
  private documents: Map<number, string> = new Map();
  private specMetadata: Map<number, { title: string; category: string; status: string }> = new Map();
  private idfCache: Map<string, number> = new Map();
  
  /**
   * Build search index from all markdown files
   */
  async buildFromFiles(metadata: SpecsMetadataIndex): Promise<void> {
    console.log('Building search index...');
    this.index.clear();
    this.documents.clear();
    this.specMetadata.clear();
    this.idfCache.clear();
    
    for (const [id, spec] of Object.entries(metadata.specs)) {
      try {
        const content = await fs.readFile(spec.file_path, 'utf-8');
        const { frontmatter, body } = this.parseMarkdown(content);
        
        // Store metadata for result enrichment
        this.specMetadata.set(parseInt(id), {
          title: frontmatter.title,
          category: frontmatter.category,
          status: frontmatter.status
        });
        
        // Create searchable text combining all relevant fields
        const searchableText = [
          frontmatter.title,
          frontmatter.category,
          frontmatter.status,
          ...(frontmatter.tags || []),
          body
        ].join(' ').toLowerCase();
        
        this.documents.set(parseInt(id), searchableText);
        
        // Tokenize and index with positional information
        const tokens = this.tokenize(searchableText);
        tokens.forEach(token => {
          if (!this.index.has(token)) {
            this.index.set(token, new Set());
          }
          this.index.get(token)!.add(parseInt(id));
        });
      } catch (error) {
        console.error(`Failed to index spec ${id}:`, error);
      }
    }
    
    // Pre-calculate IDF scores for all terms
    this.calculateIDFScores();
    
    console.log(`Search index built: ${this.documents.size} documents, ${this.index.size} unique terms`);
  }
  
  /**
   * Calculate IDF scores for all indexed terms
   */
  private calculateIDFScores(): void {
    const totalDocs = this.documents.size;
    
    for (const [term, docs] of this.index.entries()) {
      const idf = Math.log((totalDocs + 1) / (docs.size + 1));
      this.idfCache.set(term, idf);
    }
  }
  
  /**
   * Search with relevance scoring using TF-IDF
   */
  search(query: string, options: SearchOptions = {}): SearchResult[] {
    const queryTokens = this.tokenize(query.toLowerCase());
    
    if (queryTokens.length === 0) {
      return [];
    }
    
    const scores = new Map<number, number>();
    const matchedTerms = new Map<number, Set<string>>();
    
    // Calculate TF-IDF scores for each document
    queryTokens.forEach(token => {
      const matchingDocs = this.index.get(token) || new Set();
      const idf = this.idfCache.get(token) || 0;
      
      matchingDocs.forEach(docId => {
        const docText = this.documents.get(docId)!;
        const tf = this.getTermFrequency(token, docText);
        const tfidf = tf * idf;
        
        scores.set(docId, (scores.get(docId) || 0) + tfidf);
        
        // Track which terms matched for snippet generation
        if (!matchedTerms.has(docId)) {
          matchedTerms.set(docId, new Set());
        }
        matchedTerms.get(docId)!.add(token);
      });
    });
    
    // Apply boost for title and category matches
    queryTokens.forEach(token => {
      scores.forEach((score, docId) => {
        const meta = this.specMetadata.get(docId);
        if (meta) {
          // Boost if term appears in title
          if (meta.title.toLowerCase().includes(token)) {
            scores.set(docId, score * 2);
          }
          // Smaller boost for category match
          if (meta.category.toLowerCase().includes(token)) {
            scores.set(docId, score * 1.5);
          }
        }
      });
    });
    
    // Normalize scores by query length
    const normalizedScores = Array.from(scores.entries())
      .map(([id, score]) => ({
        id,
        score: score / queryTokens.length
      }));
    
    // Sort by relevance
    normalizedScores.sort((a, b) => b.score - a.score);
    
    // Apply filters
    let results = normalizedScores;
    
    if (options.minScore !== undefined) {
      results = results.filter(r => r.score >= options.minScore!);
    }
    
    if (options.limit) {
      results = results.slice(0, options.limit);
    }
    
    // Enrich results with metadata and snippets
    return results.map(result => {
      const meta = this.specMetadata.get(result.id);
      const enrichedResult: SearchResult = {
        id: result.id,
        score: result.score,
        title: meta?.title,
        category: meta?.category,
        status: meta?.status
      };
      
      if (options.includeSnippets) {
        const docText = this.documents.get(result.id);
        const terms = matchedTerms.get(result.id);
        if (docText && terms) {
          enrichedResult.snippet = this.generateSnippet(docText, Array.from(terms));
        }
      }
      
      return enrichedResult;
    });
  }
  
  /**
   * Calculate term frequency (TF) for a term in a document
   */
  private getTermFrequency(term: string, document: string): number {
    const tokens = this.tokenize(document);
    const termCount = tokens.filter(t => t === term).length;
    
    if (tokens.length === 0) return 0;
    
    // Use logarithmic normalization to prevent bias toward longer documents
    return 1 + Math.log(termCount);
  }
  
  /**
   * Tokenize text into searchable terms
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\W+/)
      .filter(token => token.length > 2 && token.length < 50)
      .filter(token => !this.isStopWord(token));
  }
  
  /**
   * Check if a word is a stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were',
      'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'must',
      'can', 'this', 'that', 'these', 'those', 'then', 'than',
      'not', 'more', 'less', 'most', 'least', 'into', 'onto'
    ]);
    
    return stopWords.has(word);
  }
  
  /**
   * Generate a snippet showing matched terms in context
   */
  private generateSnippet(document: string, matchedTerms: string[]): string {
    const maxLength = 200;
    const contextWords = 10;
    
    // Find first occurrence of any matched term
    let bestPosition = -1;
    
    for (const term of matchedTerms) {
      const position = document.toLowerCase().indexOf(term);
      if (position !== -1 && (bestPosition === -1 || position < bestPosition)) {
        bestPosition = position;
      }
    }
    
    if (bestPosition === -1) {
      return document.substring(0, maxLength) + '...';
    }
    
    // Extract context around the matched term
    const words = document.split(/\s+/);
    let currentPos = 0;
    let wordIndex = 0;
    
    // Find which word contains the match
    for (let i = 0; i < words.length; i++) {
      if (currentPos <= bestPosition && bestPosition < currentPos + words[i].length) {
        wordIndex = i;
        break;
      }
      currentPos += words[i].length + 1; // +1 for space
    }
    
    // Get surrounding context
    const start = Math.max(0, wordIndex - contextWords);
    const end = Math.min(words.length, wordIndex + contextWords);
    let snippet = words.slice(start, end).join(' ');
    
    // Add ellipsis if truncated
    if (start > 0) snippet = '...' + snippet;
    if (end < words.length) snippet = snippet + '...';
    
    // Highlight matched terms
    matchedTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      snippet = snippet.replace(regex, `**${term}**`);
    });
    
    return snippet;
  }
  
  /**
   * Parse markdown content with frontmatter
   */
  private parseMarkdown(content: string): { frontmatter: SpecFrontmatter; body: string } {
    if (!content.startsWith('---\n')) {
      throw new Error('Content does not have frontmatter');
    }
    
    const lines = content.split('\n');
    let frontmatterEnd = -1;
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i] === '---') {
        frontmatterEnd = i;
        break;
      }
    }
    
    if (frontmatterEnd === -1) {
      throw new Error('Invalid frontmatter format');
    }
    
    // Parse YAML frontmatter
    const frontmatterLines = lines.slice(1, frontmatterEnd);
    const frontmatter: any = {};
    
    for (const line of frontmatterLines) {
      const match = line.match(/^(\w+):\s*(.*)$/);
      if (match) {
        const [, key, value] = match;
        
        // Handle arrays
        if (value.startsWith('[') && value.endsWith(']')) {
          const items = value.slice(1, -1).split(',').map(v => v.trim());
          frontmatter[key] = items.map(item => {
            if ((item.startsWith('"') && item.endsWith('"')) ||
                (item.startsWith("'") && item.endsWith("'"))) {
              return item.slice(1, -1);
            }
            return item;
          }).filter(v => v);
        }
        // Handle null
        else if (value === 'null' || value === '') {
          frontmatter[key] = null;
        }
        // Handle numbers
        else if (!isNaN(Number(value))) {
          frontmatter[key] = Number(value);
        }
        // Handle strings with quotes
        else if ((value.startsWith('"') && value.endsWith('"')) || 
                 (value.startsWith("'") && value.endsWith("'"))) {
          frontmatter[key] = value.slice(1, -1);
        }
        // Default to string
        else {
          frontmatter[key] = value;
        }
      }
    }
    
    const body = lines.slice(frontmatterEnd + 1).join('\n').trim();
    
    return { frontmatter: frontmatter as SpecFrontmatter, body };
  }
  
  /**
   * Update index for a single document
   */
  async updateDocument(id: number, filePath: string): Promise<void> {
    // Remove old entries
    this.removeDocument(id);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const { frontmatter, body } = this.parseMarkdown(content);
      
      // Store metadata
      this.specMetadata.set(id, {
        title: frontmatter.title,
        category: frontmatter.category,
        status: frontmatter.status
      });
      
      // Create searchable text
      const searchableText = [
        frontmatter.title,
        frontmatter.category,
        frontmatter.status,
        ...(frontmatter.tags || []),
        body
      ].join(' ').toLowerCase();
      
      this.documents.set(id, searchableText);
      
      // Update index
      const tokens = this.tokenize(searchableText);
      tokens.forEach(token => {
        if (!this.index.has(token)) {
          this.index.set(token, new Set());
        }
        this.index.get(token)!.add(id);
      });
      
      // Recalculate IDF scores
      this.calculateIDFScores();
    } catch (error) {
      console.error(`Failed to update index for spec ${id}:`, error);
    }
  }
  
  /**
   * Remove a document from the index
   */
  removeDocument(id: number): void {
    const document = this.documents.get(id);
    if (document) {
      const tokens = this.tokenize(document);
      tokens.forEach(token => {
        const docs = this.index.get(token);
        if (docs) {
          docs.delete(id);
          if (docs.size === 0) {
            this.index.delete(token);
          }
        }
      });
    }
    
    this.documents.delete(id);
    this.specMetadata.delete(id);
    
    // Recalculate IDF scores
    this.calculateIDFScores();
  }
  
  /**
   * Get statistics about the search index
   */
  getStats(): {
    documentCount: number;
    termCount: number;
    avgDocumentLength: number;
    topTerms: Array<{ term: string; count: number }>;
  } {
    const docLengths = Array.from(this.documents.values()).map(d => d.length);
    const avgLength = docLengths.reduce((a, b) => a + b, 0) / (docLengths.length || 1);
    
    const termCounts = Array.from(this.index.entries())
      .map(([term, docs]) => ({ term, count: docs.size }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return {
      documentCount: this.documents.size,
      termCount: this.index.size,
      avgDocumentLength: Math.round(avgLength),
      topTerms: termCounts
    };
  }
  
  /**
   * Clear the entire index
   */
  clear(): void {
    this.index.clear();
    this.documents.clear();
    this.specMetadata.clear();
    this.idfCache.clear();
  }
}

// Export singleton instance
export const searchIndexService = new MarkdownSearchIndex();