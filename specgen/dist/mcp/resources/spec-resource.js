import { SpecService } from '../../services/spec.service.js';
import { ProjectService } from '../../services/project.service.js';
export class SpecResourceHandler {
    static getSpecUri(specId) {
        return `spec://specs/${specId}`;
    }
    static async listSpecResources() {
        try {
            const result = SpecService.listSpecs({ limit: 100 });
            return result.specs.map(spec => ({
                uri: this.getSpecUri(spec.id),
                name: spec.title,
                description: `${spec.status} specification in ${spec.feature_group} group`,
                mimeType: 'text/markdown'
            }));
        }
        catch {
            return [];
        }
    }
    static async readSpecResource(uri) {
        const match = uri.match(/spec:\/\/specs\/(\d+)/);
        if (!match) {
            throw new Error('Invalid spec resource URI');
        }
        const specId = parseInt(match[1], 10);
        const spec = SpecService.getSpecById(specId);
        if (!spec) {
            throw new Error(`Specification with ID ${specId} not found`);
        }
        const metadataHeader = `---
title: ${spec.title}
status: ${spec.status}
feature_group: ${spec.feature_group}
created_at: ${spec.created_at}
updated_at: ${spec.updated_at}
spec_id: ${spec.id}
---

`;
        return {
            uri,
            mimeType: 'text/markdown',
            text: metadataHeader + spec.body_md
        };
    }
}
export class ProjectResourceHandler {
    static async listProjectResources() {
        try {
            const project = ProjectService.getCurrentProject();
            const stats = await ProjectService.getProjectStats();
            return [
                {
                    uri: 'spec://project/info',
                    name: 'Project Information',
                    description: `Information about ${project.name} project`,
                    mimeType: 'application/json'
                },
                {
                    uri: 'spec://project/stats',
                    name: 'Project Statistics',
                    description: `Statistics for ${stats.total} specifications`,
                    mimeType: 'application/json'
                },
                {
                    uri: 'spec://project/summary',
                    name: 'Project Summary',
                    description: 'Human-readable project summary with statistics',
                    mimeType: 'text/markdown'
                }
            ];
        }
        catch {
            return [];
        }
    }
    static async readProjectResource(uri) {
        switch (uri) {
            case 'spec://project/info':
                const project = ProjectService.getCurrentProject();
                return {
                    uri,
                    mimeType: 'application/json',
                    text: JSON.stringify(project, null, 2)
                };
            case 'spec://project/stats':
                const stats = await ProjectService.getProjectStats();
                return {
                    uri,
                    mimeType: 'application/json',
                    text: JSON.stringify(stats, null, 2)
                };
            case 'spec://project/summary':
                const summary = await this.generateProjectSummary();
                return {
                    uri,
                    mimeType: 'text/markdown',
                    text: summary
                };
            default:
                throw new Error(`Unknown project resource: ${uri}`);
        }
    }
    static async generateProjectSummary() {
        const project = ProjectService.getCurrentProject();
        const stats = await ProjectService.getProjectStats();
        let summary = `# ${project.name} - SpecGen Project Summary\n\n`;
        summary += `**Version:** ${project.version}\n`;
        summary += `**Location:** ${project.root}\n`;
        summary += `**Database:** ${project.databasePath}\n\n`;
        summary += `## Statistics\n\n`;
        summary += `- **Total Specifications:** ${stats.total}\n`;
        if (stats.recentActivity > 0) {
            summary += `- **Recent Activity:** ${stats.recentActivity} specs updated in last 7 days\n`;
        }
        summary += `\n### By Status\n\n`;
        Object.entries(stats.byStatus).forEach(([status, count]) => {
            const icon = getStatusIcon(status);
            const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : '0';
            summary += `- ${icon} **${status}**: ${count} (${percentage}%)\n`;
        });
        if (Object.keys(stats.byGroup).length > 0) {
            summary += `\n### By Feature Group\n\n`;
            Object.entries(stats.byGroup).forEach(([group, count]) => {
                const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : '0';
                summary += `- **${group}**: ${count} (${percentage}%)\n`;
            });
        }
        summary += `\n---\n*Generated by SpecGen MCP v1.0.0*\n`;
        return summary;
    }
}
export class SpecGenResourceHandler {
    static async listAllResources() {
        const [projectResources, specResources] = await Promise.all([
            ProjectResourceHandler.listProjectResources(),
            SpecResourceHandler.listSpecResources()
        ]);
        return [...projectResources, ...specResources];
    }
    static async readResource(uri) {
        if (uri.startsWith('spec://project/')) {
            return ProjectResourceHandler.readProjectResource(uri);
        }
        else if (uri.startsWith('spec://specs/')) {
            return SpecResourceHandler.readSpecResource(uri);
        }
        else {
            throw new Error(`Unknown resource URI: ${uri}`);
        }
    }
}
function getStatusIcon(status) {
    switch (status) {
        case 'done': return '✅';
        case 'in-progress': return '🔄';
        case 'todo': return '📋';
        case 'draft': return '📝';
        default: return '📄';
    }
}
//# sourceMappingURL=spec-resource.js.map