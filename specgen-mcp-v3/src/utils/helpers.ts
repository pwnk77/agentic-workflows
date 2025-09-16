import * as fs from 'fs/promises';

// Utility functions from the original implementation

export function generateSpecId(filename: string): number {
  // Generate consistent ID from filename
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    const char = filename.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : 'Untitled';
}

export function formatFolderToCategory(folderPath: string): string {
  if (!folderPath) return 'General';

  // Extract the first folder from the relative path
  const firstFolder = folderPath.split('/')[0];
  if (!firstFolder) return 'General';

  // Convert folder name to category format:
  // 1. Remove trailing slashes
  // 2. Replace hyphens/underscores with spaces
  // 3. Capitalize each word
  return firstFolder
    .replace(/\/$/, '')
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function detectCategory(content: string, relativePath?: string): string {
  // Priority 1: Use folder-based mapping
  if (relativePath) {
    const folderCategory = formatFolderToCategory(relativePath);
    if (folderCategory !== 'General') {
      return folderCategory;
    }
  }

  // Priority 2: Check YAML frontmatter for explicit category
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const categoryMatch = frontmatterMatch[1].match(/^category:\s*(.+)$/m);
    if (categoryMatch) {
      return categoryMatch[1].trim().replace(/^["']|["']$/g, '');
    }
  }

  // Priority 3: Fall back to content analysis (existing logic)
  const contentLower = content.toLowerCase();

  if (contentLower.includes('api') || contentLower.includes('endpoint') || contentLower.includes('rest') || contentLower.includes('graphql')) {
    return 'API';
  }
  if (contentLower.includes('ui') || contentLower.includes('frontend') || contentLower.includes('component') || contentLower.includes('interface')) {
    return 'UI';
  }
  if (contentLower.includes('database') || contentLower.includes('schema') || contentLower.includes('sql') || contentLower.includes('migration')) {
    return 'Database';
  }
  if (contentLower.includes('backend') || contentLower.includes('server') || contentLower.includes('service')) {
    return 'Backend';
  }
  if (contentLower.includes('integration') || contentLower.includes('webhook') || contentLower.includes('external')) {
    return 'Integration';
  }
  if (contentLower.includes('architecture') || contentLower.includes('system') || contentLower.includes('design')) {
    return 'Architecture';
  }
  if (contentLower.includes('test') || contentLower.includes('testing') || contentLower.includes('qa') || contentLower.includes('quality')) {
    return 'Testing';
  }

  return 'General';
}

export function detectStatus(content: string): string {
  const lines = content.split('\n');

  // Look for execution logs or completion indicators
  for (const line of lines) {
    const lineLower = line.toLowerCase();
    if (lineLower.includes('completed') || lineLower.includes('✅') || lineLower.includes('done')) {
      return 'done';
    }
    if (lineLower.includes('in-progress') || lineLower.includes('implementing') || lineLower.includes('🔄')) {
      return 'in-progress';
    }
    if (lineLower.includes('todo') || lineLower.includes('pending') || lineLower.includes('⏳')) {
      return 'todo';
    }
  }

  return 'draft';
}

export function detectPriority(content: string): string {
  const contentLower = content.toLowerCase();

  if (contentLower.includes('high priority') || contentLower.includes('urgent') || contentLower.includes('critical')) {
    return 'high';
  }
  if (contentLower.includes('low priority') || contentLower.includes('nice to have') || contentLower.includes('optional')) {
    return 'low';
  }

  return 'medium';
}

export function extractTags(content: string): string[] {
  const tags: string[] = [];
  const contentLower = content.toLowerCase();

  const tagKeywords = ['backend', 'frontend', 'api', 'database', 'ui', 'integration', 'testing', 'security', 'performance'];

  for (const keyword of tagKeywords) {
    if (contentLower.includes(keyword)) {
      tags.push(keyword);
    }
  }

  return [...new Set(tags)]; // Remove duplicates
}

export function calculateRelevance(text: string, query: string): number {
  const words = query.split(' ').filter(w => w.length > 2);
  let score = 0;

  for (const word of words) {
    const matches = (text.match(new RegExp(word, 'gi')) || []).length;
    score += matches;
  }

  return score / words.length;
}

export function extractSnippet(content: string, query: string): string {
  const lines = content.split('\n');
  const queryLower = query.toLowerCase();

  for (const line of lines) {
    if (line.toLowerCase().includes(queryLower)) {
      const words = line.split(' ');
      const start = Math.max(0, words.length - 10);
      const end = Math.min(words.length, start + 20);
      return words.slice(start, end).join(' ') + '...';
    }
  }

  return content.substring(0, 100) + '...';
}

export function generateFileHashSync(content: string): string {
  // Simple hash function for change detection
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
}

export async function generateFileHash(content: string): Promise<string> {
  return generateFileHashSync(content);
}

// Frontmatter utility functions
export function hasFrontmatter(content: string): boolean {
  return content.trim().startsWith('---') && content.includes('\n---\n');
}

export function generateFrontmatter(title: string, category: string, status: string, priority: string): string {
  const now = new Date().toISOString();
  return `---
title: "${title}"
category: "${category}"
status: "${status}"
priority: "${priority}"
created: "${now}"
modified: "${now}"
---

`;
}

export async function addFrontmatterToFile(filePath: string, content: string, title: string, category: string, status: string, priority: string): Promise<void> {
  if (!hasFrontmatter(content)) {
    const frontmatter = generateFrontmatter(title, category, status, priority);
    const newContent = frontmatter + content;
    await fs.writeFile(filePath, newContent, 'utf-8');
  }
}