import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of entries
  keyGenerator?: (input: any) => string;
}

export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private cacheDir: string;

  constructor(cacheDir: string = '.cache') {
    this.cacheDir = path.resolve(process.cwd(), cacheDir);
    this.ensureCacheDir();
  }

  private async ensureCacheDir() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      console.warn('Failed to create cache directory:', error);
    }
  }

  private generateKey(input: any, prefix: string = ''): string {
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(input) + prefix);
    return hash.digest('hex');
  }

  async get<T>(key: string, config: CacheConfig): Promise<T | null> {
    if (!config.enabled) return null;

    // Check memory cache first
    const memoryEntry = this.cache.get(key);
    if (memoryEntry && this.isValid(memoryEntry)) {
      return memoryEntry.data as T;
    }

    // Check disk cache
    try {
      const diskPath = path.join(this.cacheDir, `${key}.json`);
      const diskData = await fs.readFile(diskPath, 'utf-8');
      const diskEntry: CacheEntry<T> = JSON.parse(diskData);

      if (this.isValid(diskEntry)) {
        // Restore to memory cache
        this.cache.set(key, diskEntry);
        return diskEntry.data;
      } else {
        // Remove expired disk cache
        await fs.unlink(diskPath).catch(() => {});
      }
    } catch (error) {
      // Cache miss or read error
    }

    return null;
  }

  async set<T>(key: string, data: T, config: CacheConfig): Promise<void> {
    if (!config.enabled) return;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: config.ttl,
      key
    };

    // Store in memory
    this.cache.set(key, entry);

    // Store on disk for persistence
    try {
      const diskPath = path.join(this.cacheDir, `${key}.json`);
      await fs.writeFile(diskPath, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to write cache to disk:', error);
    }

    // Enforce max size
    if (this.cache.size > config.maxSize) {
      this.evictOldest();
    }
  }

  async cached<T>(
    key: string,
    fn: () => Promise<T>,
    config: CacheConfig
  ): Promise<T> {
    const cached = await this.get<T>(key, config);
    if (cached !== null) {
      return cached;
    }

    const result = await fn();
    await this.set(key, result, config);
    return result;
  }

  invalidate(key: string): void {
    this.cache.delete(key);

    // Remove from disk
    const diskPath = path.join(this.cacheDir, `${key}.json`);
    fs.unlink(diskPath).catch(() => {});
  }

  invalidatePattern(pattern: RegExp): void {
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.invalidate(key);
    }
  }

  clear(): void {
    this.cache.clear();

    // Clear disk cache
    fs.readdir(this.cacheDir).then(files => {
      for (const file of files) {
        if (file.endsWith('.json')) {
          fs.unlink(path.join(this.cacheDir, file)).catch(() => {});
        }
      }
    }).catch(() => {});
  }

  private isValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.invalidate(oldestKey);
    }
  }

  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const entry of this.cache.values()) {
      if (this.isValid(entry)) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      hitRate: validEntries / (validEntries + expiredEntries) || 0
    };
  }
}

// Default cache configurations for different types of operations
export const CACHE_CONFIGS = {
  TREE_SITTER_ANALYSIS: {
    enabled: true,
    ttl: 3600000, // 1 hour
    maxSize: 100
  },
  WEB_RESEARCH: {
    enabled: true,
    ttl: 86400000, // 24 hours
    maxSize: 50
  },
  DEPENDENCY_ANALYSIS: {
    enabled: true,
    ttl: 1800000, // 30 minutes
    maxSize: 200
  },
  SEARCH_RESULTS: {
    enabled: true,
    ttl: 900000, // 15 minutes
    maxSize: 300
  }
} as const;