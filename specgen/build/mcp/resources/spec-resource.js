/**
 * MCP resource handlers for spec documents
 */
import { SpecService } from '../../services/spec.service.js';
import { logger } from '../../services/logging.service.js';
export class SpecResourceHandler {
    specService;
    constructor() {
        this.specService = new SpecService();
    }
    async list() {
        try {
            logger.debug('Listing spec resources');
            const specs = await this.specService.listSpecs({ limit: 1000 }); // Get all specs for resource listing
            return specs.specs.map(spec => ({
                uri: `spec://${spec.id}`,
                name: spec.title,
                description: `Specification document: ${spec.title} (${spec.status})`,
                mimeType: 'text/markdown'
            }));
        }
        catch (error) {
            logger.error('Failed to list spec resources', error);
            return [];
        }
    }
    async read(uri) {
        try {
            logger.debug('Reading spec resource', { uri });
            // Parse spec ID from URI (format: spec://123)
            const match = uri.match(/^spec:\/\/(\d+)$/);
            if (!match) {
                throw new Error(`Invalid spec resource URI format: ${uri}`);
            }
            const specId = parseInt(match[1], 10);
            if (isNaN(specId)) {
                throw new Error(`Invalid spec ID in URI: ${uri}`);
            }
            const spec = await this.specService.getSpec(specId);
            // Format spec as markdown document
            const markdownContent = this.formatSpecAsMarkdown(spec);
            return {
                contents: [
                    {
                        uri,
                        mimeType: 'text/markdown',
                        text: markdownContent
                    }
                ]
            };
        }
        catch (error) {
            logger.error('Failed to read spec resource', error, { uri });
            throw error;
        }
    }
    formatSpecAsMarkdown(spec) {
        const lines = [
            `# ${spec.title}`,
            '',
            `**Status**: ${spec.status}`,
            `**ID**: ${spec.id}`,
            `**Version**: ${spec.version}`,
            `**Created**: ${spec.createdAt.toISOString()}`,
            `**Updated**: ${spec.updatedAt.toISOString()}`,
            '',
            '---',
            '',
            spec.bodyMd
        ];
        // Add todos if they exist
        if (spec.todos && spec.todos.length > 0) {
            lines.push('', '## Todo Items', '');
            spec.todos.forEach((todo, index) => {
                const status = todo.status === 'completed' ? '✅' :
                    todo.status === 'in-progress' ? '🔄' : '⏸️';
                lines.push(`${index + 1}. ${status} ${todo.text || 'No description'} (${todo.status})`);
            });
        }
        // Add execution logs if they exist
        if (spec.execLogs && spec.execLogs.length > 0) {
            lines.push('', '## Execution Logs', '');
            spec.execLogs.forEach((log) => {
                lines.push(`### ${log.layer} - ${log.status}`);
                lines.push(`**Created**: ${log.createdAt.toISOString()}`);
                if (log.summary) {
                    lines.push(`**Summary**: ${log.summary}`);
                }
                if (log.tasksCompleted) {
                    try {
                        const tasks = JSON.parse(log.tasksCompleted);
                        lines.push(`**Tasks**: ${tasks.join(', ')}`);
                    }
                    catch {
                        lines.push(`**Tasks**: ${log.tasksCompleted}`);
                    }
                }
                lines.push('');
            });
        }
        // Add issue logs if they exist
        if (spec.issueLogs && spec.issueLogs.length > 0) {
            lines.push('', '## Issue Logs', '');
            spec.issueLogs.forEach((log) => {
                lines.push(`### ${log.taskId}: ${log.taskDescription}`);
                lines.push(`**Layer**: ${log.layer}`);
                lines.push(`**Status**: ${log.status}`);
                lines.push(`**Created**: ${log.createdAt.toISOString()}`);
                if (log.error) {
                    lines.push(`**Error**: ${log.error}`);
                }
                if (log.rootCause) {
                    lines.push(`**Root Cause**: ${log.rootCause}`);
                }
                if (log.resolution) {
                    lines.push(`**Resolution**: ${log.resolution}`);
                }
                lines.push('');
            });
        }
        return lines.join('\n');
    }
}
//# sourceMappingURL=spec-resource.js.map