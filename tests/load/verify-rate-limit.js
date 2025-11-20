const http = require('http');

/**
 * Quick Rate Limit Verification Test
 * Tests the new rate limiting configuration (60/min)
 */

const config = {
  baseUrl: 'http://localhost:3000',
  testDuration: 30, // 30 seconds
  requestsPerSecond: 2, // 2 RPS = 60 requests in 30 seconds (at limit)
};

let authToken = null;
const results = {
  total: 0,
  success: 0,
  rateLimited: 0,
  errors: 0,
};

/**
 * Make HTTP request
 */
function makeRequest(method, path) {
  return new Promise((resolve) => {
    const url = new URL(path, config.baseUrl);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data });
      });
    });

    req.on('error', () => {
      resolve({ statusCode: 0, data: 'Error' });
    });

    req.end();
  });
}

/**
 * Authenticate
 */
async function authenticate() {
  try {
    const response = await makeRequest('POST', '/api/auth/login');
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      authToken = data.token;
      return true;
    }
  } catch (error) {
    // Ignore
  }
  return false;
}

/**
 * Run test
 */
async function runTest() {
  console.log('\n======================================');
  console.log('🧪 Rate Limit Verification Test');
  console.log('======================================\n');
  console.log('Configuration:');
  console.log(`  Duration: ${config.testDuration} seconds`);
  console.log(`  Rate: ${config.requestsPerSecond} requests/second`);
  console.log(`  Expected Total: ${config.testDuration * config.requestsPerSecond} requests`);
  console.log(`  Rate Limit: 60 requests/minute\n`);

  console.log('Authenticating...');
  if (!await authenticate()) {
    console.log('✗ Authentication failed\n');
    return;
  }
  console.log('✓ Authentication successful\n');

  console.log('Running test...\n');

  const startTime = Date.now();
  const endTime = startTime + (config.testDuration * 1000);
  const interval = 1000 / config.requestsPerSecond;

  while (Date.now() < endTime) {
    const requestStart = Date.now();
    
    results.total++;
    const response = await makeRequest('GET', '/api/blueprints');

    if (response.statusCode === 200) {
      results.success++;
      process.stdout.write('.');
    } else if (response.statusCode === 429) {
      results.rateLimited++;
      process.stdout.write('R');
    } else {
      results.errors++;
      process.stdout.write('E');
    }

    // Maintain constant rate
    const elapsed = Date.now() - requestStart;
    const waitTime = Math.max(0, interval - elapsed);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  console.log('\n\n======================================');
  console.log('📊 Test Results');
  console.log('======================================\n');

  const duration = (Date.now() - startTime) / 1000;
  const actualRPS = (results.total / duration).toFixed(2);
  const successRate = ((results.success / results.total) * 100).toFixed(1);

  console.log('Summary:');
  console.log(`  Total Requests:      ${results.total}`);
  console.log(`  Successful:          ${results.success} (${successRate}%)`);
  console.log(`  Rate Limited:        ${results.rateLimited} (${((results.rateLimited/results.total)*100).toFixed(1)}%)`);
  console.log(`  Errors:              ${results.errors}`);
  console.log(`  Duration:            ${duration.toFixed(2)} seconds`);
  console.log(`  Actual Rate:         ${actualRPS} req/s\n`);

  console.log('Assessment:');
  if (results.rateLimited === 0) {
    console.log('✓ PASS: No rate limiting detected');
    console.log('  New rate limit (60/min) is working correctly!');
  } else if (results.rateLimited < results.total * 0.05) {
    console.log('✓ ACCEPTABLE: Minor rate limiting (<5%)');
    console.log('  This is expected at the boundary of the limit.');
  } else {
    console.log('✗ FAIL: Significant rate limiting detected');
    console.log('  Rate limit may still be too restrictive.');
  }

  if (successRate >= 95) {
    console.log('✓ PASS: Success rate >= 95%');
  } else if (successRate >= 90) {
    console.log('⚠ WARNING: Success rate 90-95%');
  } else {
    console.log('✗ FAIL: Success rate < 90%');
  }

  console.log('\n======================================');
  console.log('Conclusion');
  console.log('======================================\n');

  if (results.rateLimited === 0 && successRate >= 95) {
    console.log('✅ Rate limiting configuration is CORRECT!');
    console.log('   - 60 requests/minute limit allows normal traffic');
    console.log('   - Load testing can proceed');
    console.log('   - Ready for production testing\n');
  } else if (results.rateLimited < results.total * 0.1) {
    console.log('⚠️ Rate limiting configuration is ACCEPTABLE');
    console.log('   - Minor rate limiting at boundary');
    console.log('   - Should work for production');
    console.log('   - Monitor in production for adjustments\n');
  } else {
    console.log('❌ Rate limiting configuration needs MORE adjustment');
    console.log('   - Consider increasing to 100/minute');
    console.log('   - Or implement per-endpoint limits');
    console.log('   - Current limit still too restrictive\n');
  }

  console.log('Legend: . = success, R = rate limited, E = error\n');
}

runTest().catch(console.error);
