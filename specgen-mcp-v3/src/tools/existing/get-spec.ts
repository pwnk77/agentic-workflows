import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { JSONMetadataService } from '../../core/metadata-manager.js';
import { JSONStorage } from '../../core/json-storage.js';
import { MarkdownGenerator } from '../../core/markdown-generator.js';
import { CONFIG } from '../../core/config.js';
import { glob } from 'glob';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface GetSpecArgs {
  feature: string;
  format?: 'markdown' | 'json' | 'auto';
}

export async function getSpec(args: GetSpecArgs): Promise<CallToolResult> {
  const { feature, format = 'auto' } = args;

  try {
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

    let content: string;

    // Handle JSON specs
    if (spec.source === 'json') {
      const id = spec.filename.replace('.json', '');
      const jsonSpec = await JSONStorage.load(id);

      if (!jsonSpec) {
        throw new Error(`JSON spec ${id} not found in storage`);
      }

      if (format === 'json') {
        content = JSON.stringify(jsonSpec, null, 2);
      } else {
        // Convert to markdown for display
        content = MarkdownGenerator.generateFromJSON(jsonSpec);
      }
    } else {
      // Handle traditional markdown specs
      const pattern = path.join(CONFIG.docsPath, `**/${spec.filename}`);
      const filePaths = await glob(pattern);
      if (filePaths.length === 0) {
        throw new Error(`File not found: ${spec.filename}`);
      }
      const filePath = filePaths[0]; // Use first match

      if (format === 'json') {
        // Convert markdown to JSON format
        const markdownContent = await fs.readFile(filePath, 'utf-8');
        const jsonSpec = MarkdownGenerator.parseToJSON(markdownContent);
        content = JSON.stringify(jsonSpec, null, 2);
      } else {
        // Return markdown as-is
        content = await fs.readFile(filePath, 'utf-8');
      }
    }

    // Format as proper MCP CallToolResult
    return {
      content: [{
        type: "text",
        text: content
      }],
      isError: false
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `❌ Failed to retrieve spec: ${error}`
      }],
      isError: true
    };
  }
}