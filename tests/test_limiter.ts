import { dbManager } from '../src/database/dbManager';
import { checkRateLimit } from '../src/services/rateLimiterService';

/**
 * Verification script for Step 3.
 * Simulates multiple requests to verify the rate limiting logic.
 */
async function runTest() {
  console.log('--- Starting Rate Limiter Logic Test ---');
  
  try {
    // 1. Initialize Database
    await dbManager.initialize();
    console.log('Database initialized.\n');

    const testKey = 'test-client-ip';
    const limit = 10;
    const window = 60;

    console.log(`Testing with Key: ${testKey}, Limit: ${limit}, Window: ${window}s\n`);

    // 2. Perform 12 requests (10 should pass, 2 should fail)
    for (let i = 1; i <= 12; i++) {
      const result = await checkRateLimit(testKey, limit, window);
      const status = result.allowed ? '✅ ALLOWED' : '❌ BLOCKED';
      const message = result.message ? ` - ${result.message}` : '';
      
      console.log(`Request #${i.toString().padStart(2, '0')}: ${status} | Remaining: ${result.remaining}${message}`);
    }

    console.log('\n--- Test Finished ---');
    
    // Give a small delay to ensure SQLite closes properly if needed, though here we just exit
    setTimeout(() => process.exit(0), 500);
  } catch (error) {
    console.error('Test failed with error:', error);
    process.exit(1);
  }
}

runTest();
