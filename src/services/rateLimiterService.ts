import { dbManager } from '../database/dbManager';
import { cacheService } from './cacheService';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  message?: string;
}

interface CachedCounter {
  count: number;
  window_start: number;
}

// Default constants
export const LIMIT_REQUESTS = 10;
export const WINDOW_SECONDS = 60;

/**
 * Service to check and update rate limits using a Fixed Window Counter algorithm.
 * Now enhanced with a caching layer to reduce database load.
 * 
 * @param key Unique identifier for the client (IP, API Key, etc.)
 * @param limit Maximum number of requests allowed in the window
 * @param windowSeconds Duration of the window in seconds
 * @returns Promise<RateLimitResult>
 */
export async function checkRateLimit(
  key: string,
  limit: number = LIMIT_REQUESTS,
  windowSeconds: number = WINDOW_SECONDS
): Promise<RateLimitResult> {
  const currentTime = Math.floor(Date.now() / 1000);
  // Normalize windowStart to the beginning of the current bucket (Fixed Window)
  const windowStart = Math.floor(currentTime / windowSeconds) * windowSeconds;
  
  // 1. Check Cache First
  let cached = cacheService.get<CachedCounter>(key);

  // If cached and window is still valid (same bucket)
  if (cached && cached.window_start === windowStart) {
    if (cached.count >= limit) {
      // FAST REJECT: Limit already reached in memory
      return {
        allowed: false,
        remaining: 0,
        message: 'Rate Limit Exceeded (Cached)'
      };
    }
  }

  // 2. Atomic Database Operation (Upsert + Get Count)
  // This single call replaces the previous SELECT + INSERT/UPDATE logic
  const db = dbManager.getDb();

  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO request_counters (key, window_start, count, last_updated)
      VALUES (?, ?, 1, ?)
      ON CONFLICT(key, window_start) DO UPDATE SET 
        count = count + 1,
        last_updated = excluded.last_updated
      RETURNING count;
    `;

    db.get(sql, [key, windowStart, currentTime], (err, row: any) => {
      if (err) {
        return reject(err);
      }

      const newCount = row.count;

      // Update Cache
      cacheService.set(key, { count: newCount, window_start: windowStart }, windowSeconds);

      if (newCount <= limit) {
        resolve({
          allowed: true,
          remaining: limit - newCount
        });
      } else {
        resolve({
          allowed: false,
          remaining: 0,
          message: 'Rate Limit Exceeded'
        });
      }
    });
  });
}
