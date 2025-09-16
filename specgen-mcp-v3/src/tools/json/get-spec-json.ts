import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { JSONStorage } from '../../core/json-storage.js';
import { JSONMetadataService } from '../../core/metadata-manager.js';

export interface GetSpecJSONArgs {
  feature: string;
  format?: 'pretty' | 'compact';
}

/**
 * Get spec in JSON format for LLM operations
 * Optimized for programmatic access and manipulation
 */
export async function getSpecJSON(args: GetSpecJSONArgs): Promise<CallToolResult> {
  const { feature, format = 'pretty' } = args;

  try {
    // First try to find by direct ID lookup
    let spec = await JSONStorage.load(feature);

    // If not found, search through metadata
    if (!spec) {
      const metadata = await JSONMetadataService.loadMetadata();

      // Find spec by filename or title
      const specInfo = Object.values(metadata.specs).find(s =>
        s.filename === feature ||
        s.filename.includes(feature) ||
        s.title.toLowerCase().includes(feature.toLowerCase()) ||
        s.filename === `${feature}.json` ||
        s.filename === `${feature}.md`
      );

      if (specInfo && specInfo.source === 'json') {
        // Extract ID from filename for JSON specs
        const id = specInfo.filename.replace('.json', '');
        spec = await JSONStorage.load(id);
      }
    }

    if (!spec) {
      throw new Error(`JSON specification not found: ${feature}`);
    }

    // Format output
    const jsonOutput = format === 'compact'
      ? JSON.stringify(spec)
      : JSON.stringify(spec, null, 2);

    return {
      content: [{
        type: "text",
        text: jsonOutput
      }],
      isError: false
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `❌ Failed to retrieve JSON spec: ${error}`
      }],
      isError: true
    };
  }
}