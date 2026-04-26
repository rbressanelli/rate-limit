import * as http from 'http';

/**
 * HTTP Verification script for Step 4.
 * Performs 15 requests to the local server to verify the middleware behavior.
 */
async function makeRequest(i: number): Promise<number | null> {
  return new Promise((resolve) => {
    const options: http.RequestOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/endpoint-protegido',
      method: 'GET',
    };

    const req = http.request(options, (res: http.IncomingMessage) => {
      let data = '';
      res.on('data', (chunk: any) => data += chunk);
      res.on('end', () => {
        const remaining = res.headers['x-ratelimit-remaining'];
        const status = res.statusCode === 200 ? '✅ 200 OK' : `❌ ${res.statusCode} ${res.statusMessage}`;
        console.log(`Request #${i.toString().padStart(2, '0')}: ${status} | Remaining: ${remaining}`);
        resolve(res.statusCode || null);
      });
    });

    req.on('error', (err: Error) => {
      console.error(`Request #${i} failed: ${err.message}`);
      resolve(null);
    });

    req.end();
  });
}

async function runTest() {
  console.log('--- Starting HTTP Rate Limiter Test ---');
  console.log('Target: http://localhost:3000\n');

  for (let i = 1; i <= 15; i++) {
    await makeRequest(i);
    // Small delay to ensure order in console
    await new Promise(r => setTimeout(r, 100));
  }

  console.log('\n--- Test Finished ---');
  process.exit(0);
}

runTest();
