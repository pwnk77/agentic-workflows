import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { JSONMetadataService } from '../../core/metadata-manager.js';

export interface RefreshMetadataArgs {
  reason?: string;
}

export async function refreshMetadata(args: RefreshMetadataArgs = {}): Promise<CallToolResult> {
  const { reason } = args;

  const metadata = await JSONMetadataService.scanSpecs();
  const specCount = Object.keys(metadata.specs).length;

  // Format as proper MCP CallToolResult
  const responseText = `✅ Metadata refreshed successfully!

📊 Stats:
• Total specs found: ${specCount}
• Last scan: ${metadata.last_full_scan}
• Reason: ${reason || 'Manual refresh'}

📁 Specs discovered:
${Object.keys(metadata.specs).slice(0, 10).map(spec => `• ${spec}`).join('\n')}
${specCount > 10 ? `... and ${specCount - 10} more` : ''}`;

  return {
    content: [{
      type: "text",
      text: responseText
    }],
    isError: false
  };
}