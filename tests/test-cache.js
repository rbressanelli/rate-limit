const http = require('http');

const apiKey = 'test-api-key-' + Math.floor(Date.now() / 1000);

async function makeRequest(i) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/users',
      method: 'GET',
      headers: {
        'Authorization': apiKey
      }
    };
    http.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`Request ${i}: Status ${res.statusCode} - Remaining: ${res.headers['x-ratelimit-remaining']}`);
        resolve();
      });
    }).on('error', (err) => {
      console.error(`Request ${i} error:`, err.message);
      resolve();
    });
  });
}

async function runTest() {
  console.log(`--- Testing Rate Limiting with Key: ${apiKey} ---`);
  for (let i = 1; i <= 12; i++) {
    await makeRequest(i);
  }
}

runTest();
