/**
 * MCP resource handler for HTML dashboard
 */
import { logger } from '../../services/logging.service.js';
import { SpecService, SearchService } from '../../services/index.js';
export class DashboardResourceHandler {
    specService;
    searchService;
    constructor() {
        this.specService = new SpecService();
        this.searchService = new SearchService();
    }
    async read() {
        try {
            logger.debug('Generating dashboard HTML');
            // Get basic statistics
            const [specStats, searchStats, recentSpecs] = await Promise.all([
                this.specService.getSpecStats(),
                this.searchService.getSearchStats(),
                this.specService.listSpecs({ limit: 10, sortBy: 'updated_at', sortOrder: 'DESC' })
            ]);
            const htmlContent = this.generateDashboardHTML(specStats, searchStats, recentSpecs.specs);
            return {
                contents: [
                    {
                        uri: 'dashboard.html://index',
                        mimeType: 'text/html',
                        text: htmlContent
                    }
                ]
            };
        }
        catch (error) {
            logger.error('Failed to generate dashboard', error);
            throw error;
        }
    }
    generateDashboardHTML(specStats, searchStats, recentSpecs) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SpecGen MCP Server Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 10px;
            margin-bottom: 2rem;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }

        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }

        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 0.5rem;
        }

        .stat-label {
            color: #666;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin: 1rem 0;
        }

        .status-item {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid;
        }

        .status-draft { border-color: #6c757d; }
        .status-todo { border-color: #ffc107; }
        .status-in-progress { border-color: #007bff; }
        .status-done { border-color: #28a745; }

        .recent-specs {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .spec-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid #eee;
        }

        .spec-item:last-child {
            border-bottom: none;
        }

        .spec-title {
            font-weight: 600;
            color: #333;
        }

        .spec-meta {
            display: flex;
            gap: 1rem;
            font-size: 0.9rem;
            color: #666;
        }

        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .badge-draft { background: #6c757d; color: white; }
        .badge-todo { background: #ffc107; color: #212529; }
        .badge-in-progress { background: #007bff; color: white; }
        .badge-done { background: #28a745; color: white; }

        .timestamp {
            font-size: 0.8rem;
            color: #999;
        }

        .section-title {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: #333;
        }

        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .spec-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SpecGen MCP Server</h1>
            <p>TypeScript MCP server for SPEC file management with SQLite backend</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${specStats.total}</div>
                <div class="stat-label">Total Specifications</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${searchStats.totalDocuments}</div>
                <div class="stat-label">Searchable Documents</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Math.round(searchStats.indexSize / 1024)} KB</div>
                <div class="stat-label">Search Index Size</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${searchStats.avgDocumentLength}</div>
                <div class="stat-label">Avg Document Length</div>
            </div>
        </div>

        <div class="stat-card">
            <h3 class="section-title">Specifications by Status</h3>
            <div class="status-grid">
                <div class="status-item status-draft">
                    <div class="stat-number">${specStats.byStatus.draft || 0}</div>
                    <div class="stat-label">Draft</div>
                </div>
                <div class="status-item status-todo">
                    <div class="stat-number">${specStats.byStatus.todo || 0}</div>
                    <div class="stat-label">Todo</div>
                </div>
                <div class="status-item status-in-progress">
                    <div class="stat-number">${specStats.byStatus['in-progress'] || 0}</div>
                    <div class="stat-label">In Progress</div>
                </div>
                <div class="status-item status-done">
                    <div class="stat-number">${specStats.byStatus.done || 0}</div>
                    <div class="stat-label">Done</div>
                </div>
            </div>
        </div>

        <div class="recent-specs">
            <h3 class="section-title">Recent Specifications</h3>
            ${recentSpecs.map(spec => `
                <div class="spec-item">
                    <div>
                        <div class="spec-title">${this.escapeHtml(spec.title)}</div>
                        <div class="spec-meta">
                            <span>ID: ${spec.id}</span>
                            <span>Version: ${spec.version}</span>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <span class="status-badge badge-${spec.status.replace('-', '')}">${spec.status}</span>
                        <div class="timestamp">${new Date(spec.updatedAt).toLocaleString()}</div>
                    </div>
                </div>
            `).join('')}
        </div>

        <div style="text-align: center; margin-top: 2rem; color: #666; font-size: 0.9rem;">
            <p>Generated at ${new Date().toLocaleString()}</p>
            <p>SpecGen MCP Server v1.0.0</p>
        </div>
    </div>
</body>
</html>`;
    }
    escapeHtml(text) {
        const div = { innerHTML: '' };
        const textNode = { textContent: text, innerHTML: '' };
        return textNode.innerHTML || text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}
//# sourceMappingURL=dashboard-resource.js.map