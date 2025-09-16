import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { JSONMetadataService } from '../../core/metadata-manager.js';
import { CONFIG } from '../../core/config.js';
import { generateSpecId, extractTags, calculateRelevance, extractSnippet } from '../../utils/helpers.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface SearchSpecsArgs {
  query: string;
  limit?: number;
}

export async function searchSpecs(args: SearchSpecsArgs): Promise<CallToolResult> {
  const { query, limit = 100 } = args;

  const metadata = await JSONMetadataService.loadMetadata();
  const results = [];

  for (const [filename, spec] of Object.entries(metadata.specs)) {
    try {
      const filePath = path.join(CONFIG.docsPath, filename);
      const content = await fs.readFile(filePath, 'utf-8');
      const searchText = `${spec.title} ${content}`.toLowerCase();
      const queryLower = query.toLowerCase();

      if (searchText.includes(queryLower)) {
        const score = calculateRelevance(searchText, queryLower);
        const snippet = extractSnippet(content, query);

        results.push({
          id: generateSpecId(filename),
          title: spec.title,
          status: spec.status,
          category: spec.category,
          priority: spec.priority,
          created_at: spec.created,
          updated_at: spec.modified,
          created_via: 'discovery',
          related_specs: [],
          parent_spec_id: null,
          tags: extractTags(content),
          effort_estimate: null,
          completion: spec.status === 'done' ? 100 : 0,
          body_md: content,
          feature_group: spec.category.toLowerCase(),
          score: score,
          snippet: snippet
        });
      }
    } catch (error) {
      console.error(`Error reading ${filename}:`, error);
    }
  }

  // Sort by relevance and limit
  results.sort((a, b) => b.score - a.score);
  const limitedResults = results.slice(0, limit);

  // Format as proper MCP CallToolResult
  const responseText = `Search Results for "${query}":

${limitedResults.map(result => `• ${result.title} (${result.status}) - ${result.category}
  Snippet: ${result.snippet}`).join('\n\n')}

Found ${results.length} total matches, showing ${limitedResults.length}`;

  return {
    content: [{
      type: "text",
      text: responseText
    }],
    isError: false
  };
}