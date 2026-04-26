import NodeCache from 'node-cache';

/**
 * Centralized Cache Service to manage in-memory data.
 * Currently used for rate limiting to reduce database hits.
 */
class CacheService {
  private static instance: CacheService;
  private cache: NodeCache;

  private constructor() {
    // Default TTL of 60 seconds (matching our default rate limit window)
    this.cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Retrieves a value from the cache.
   */
  public get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  /**
   * Sets a value in the cache with an optional TTL.
   */
  public set<T>(key: string, value: T, ttl?: number): boolean {
    return ttl ? this.cache.set(key, value, ttl) : this.cache.set(key, value);
  }

  /**
   * Deletes a value from the cache.
   */
  public del(key: string): number {
    return this.cache.del(key);
  }

  /**
   * Clears the entire cache.
   */
  public flush(): void {
    this.cache.flushAll();
  }
}

export const cacheService = CacheService.getInstance();
