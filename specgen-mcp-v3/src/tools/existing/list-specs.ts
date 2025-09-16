import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { JSONMetadataService } from '../../core/metadata-manager.js';
import { CONFIG } from '../../core/config.js';
import { generateSpecId, extractTags, generateFileHashSync } from '../../utils/helpers.js';
import * as path from 'path';

export interface ListSpecsArgs {
  status?: string;
  category?: string;
  limit?: number;
}

export async function listSpecs(args: ListSpecsArgs = {}): Promise<CallToolResult> {
  const { status, category, limit } = args;

  const metadata = await JSONMetadataService.loadMetadata();
  let specs = Object.values(metadata.specs);

  // Apply filters
  if (status) {
    specs = specs.filter(spec => spec.status === status);
  }
  if (category) {
    specs = specs.filter(spec => spec.category.toLowerCase() === category.toLowerCase());
  }

  // Apply limit
  if (limit) {
    specs = specs.slice(0, limit);
  }

  // Convert to MCP format with generated IDs
  const mcpSpecs = specs.map(spec => ({
    id: generateSpecId(spec.filename),
    title: spec.title,
    status: spec.status,
    category: spec.category,
    priority: spec.priority,
    created_at: spec.created,
    updated_at: spec.modified,
    created_via: 'discovery',
    related_specs: [],
    parent_spec_id: null,
    tags: extractTags(spec.title + ' ' + spec.category),
    effort_estimate: null,
    completion: spec.status === 'done' ? 100 : 0,
    body_md: '', // Load on demand
    feature_group: spec.category.toLowerCase(),
    file_path: path.join(CONFIG.docsPath, spec.filename),
    file_size: 0,
    checksum: generateFileHashSync(spec.filename + spec.modified)
  }));

  // Format as proper MCP CallToolResult
  const responseText = `Found ${specs.length} specification(s):

${mcpSpecs.map(spec => `• ${spec.title} (${spec.status}) - ${spec.category} - ${spec.priority} priority`).join('\n')}

Total specs in metadata: ${Object.keys(metadata.specs).length}`;

  return {
    content: [{
      type: "text",
      text: responseText
    }],
    isError: false
  };
}