import { Request, Response, NextFunction } from 'express';
import { checkRateLimit, LIMIT_REQUESTS, WINDOW_SECONDS } from '../services/rateLimiterService';

/**
 * Middleware to enforce rate limiting on incoming requests.
 * Extracts identification key from headers or IP and validates against the rate limiter service.
 */
export async function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  // 1. Extract identification key
  // Priority 1: Authorization Header (API Key)
  // Priority 2: X-Forwarded-For (Proxy IP)
  // Priority 3: req.ip (Direct IP)
  const apiKey = req.headers['authorization'];
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor || req.ip || 'unknown';

  const key = apiKey ? `apikey:${apiKey}` : `ip:${ip}`;

  // 2. Initialize context for use in downstream handlers
  req.context = {
    ip: typeof ip === 'string' ? ip : 'unknown',
    apiKey: typeof apiKey === 'string' ? apiKey : undefined
  };

  try {
    // 3. Check Rate Limit
    const result = await checkRateLimit(key, LIMIT_REQUESTS, WINDOW_SECONDS);

    // 4. Set Rate Limit Headers (Informative)
    res.setHeader('X-RateLimit-Limit', LIMIT_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', result.remaining);

    if (!result.allowed) {
      // 5. Handle Rate Limit Exceeded
      res.setHeader('Retry-After', WINDOW_SECONDS); // Simplified: retry after the full window duration
      return res.status(429).json({
        error: 'Too Many Requests',
        message: result.message || 'Rate limit exceeded',
        retry_after_seconds: WINDOW_SECONDS
      });
    }

    // 6. Proceed to next handler
    next();
  } catch (error) {
    console.error('Rate Limit Middleware Error:', error);
    // In case of internal error, we usually allow the request to pass to avoid blocking users due to DB issues
    // but this depends on the security policy.
    next();
  }
}
