import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { JSONMetadataService } from '../../core/metadata-manager.js';
import { CONFIG } from '../../core/config.js';
import { glob } from 'glob';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface GetSpecArgs {
  feature: string;
}

export async function getSpec(args: GetSpecArgs): Promise<CallToolResult> {
  const { feature } = args;

  let metadata = await JSONMetadataService.loadMetadata();

  // Find spec by filename or title
  let spec = Object.values(metadata.specs).find(s =>
    s.filename === feature ||
    s.filename.includes(feature) ||
    s.title.toLowerCase().includes(feature.toLowerCase())
  );

  // Auto-refresh fallback if spec not found
  if (!spec) {
    metadata = await JSONMetadataService.scanSpecs();
    spec = Object.values(metadata.specs).find(s =>
      s.filename === feature ||
      s.filename.includes(feature) ||
      s.title.toLowerCase().includes(feature.toLowerCase())
    );
  }

  if (!spec) {
    throw new Error(`Specification not found: ${feature}`);
  }

  // Load full content - need to find the actual file path since files are in subdirectories
  const pattern = path.join(CONFIG.docsPath, `**/${spec.filename}`);
  const filePaths = await glob(pattern);
  if (filePaths.length === 0) {
    throw new Error(`File not found: ${spec.filename}`);
  }
  const filePath = filePaths[0]; // Use first match
  const content = await fs.readFile(filePath, 'utf-8');

  // Format as proper MCP CallToolResult
  return {
    content: [{
      type: "text",
      text: content
    }],
    isError: false
  };
}