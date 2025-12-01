/**
 * Stress Testing Tool for IAC Dharma Platform
 * Tests system behavior under extreme load conditions
 * 
 * Scenarios:
 * 1. Spike Test - Sudden traffic increase
 * 2. Soak Test - Sustained high load
 * 3. Breakpoint Test - Find system limits
 * 4. Recovery Test - System recovery after failure
 */

const http = require('http');
const https = require('https');

// Configuration
const config = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
  testType: process.env.TEST_TYPE || 'spike', // spike, soak, breakpoint, recovery
  maxConcurrency: parseInt(process.env.MAX_CONCURRENCY || '500'),
  duration: parseInt(process.env.DURATION || '300'), // 5 minutes
  rampUpTime: parseInt(process.env.RAMP_UP || '30'), // seconds
};

// Test results
const results = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  timeouts: 0,
  errors: {},
  responseTimes: [],
  statusCodes: {},
  peakConcurrency: 0,
  avgResponseTime: 0,
  p95ResponseTime: 0,
  p99ResponseTime: 0,
  throughput: 0,
  errorRate: 0,
  startTime: null,
  endTime: null,
};

// Active requests tracking
let activeRequests = 0;
let testRunning = true;
let authToken = null;

/**
 * Make HTTP request with timeout
 */
function makeRequest(method, path, data = null, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, config.baseUrl);
    const protocol = url.protocol === 'https:' ? https : http;
    
    const options = {
      method,
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'IAC-Dharma-StressTest/1.0',
      },
      timeout,
    };

    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (data) {
      const body = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const startTime = Date.now();
    const req = protocol.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        resolve({
          statusCode: res.statusCode,
          responseTime,
          data: responseData,
          headers: res.headers,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Authenticate and get token
 */
async function authenticate() {
  try {
    console.log('🔐 Authenticating...');
    const response = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@iac.dharma',
      password: 'admin123',
    });

    if (response.statusCode === 200 || response.statusCode === 201) {
      const data = JSON.parse(response.data);
      authToken = data.token || data.access_token;
      console.log('✅ Authentication successful');
      return true;
    } else {
      console.log(`⚠️  Auth response: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`⚠️  Authentication skipped: ${error.message}`);
    return true; // Continue without auth for public endpoints
  }
}

/**
 * Record request result
 */
function recordResult(response, error = null) {
  results.totalRequests++;

  if (error) {
    results.failedRequests++;
    if (error.message === 'Request timeout') {
      results.timeouts++;
    }
    results.errors[error.message] = (results.errors[error.message] || 0) + 1;
  } else {
    if (response.statusCode >= 200 && response.statusCode < 400) {
      results.successfulRequests++;
    } else {
      results.failedRequests++;
    }
    results.statusCodes[response.statusCode] = (results.statusCodes[response.statusCode] || 0) + 1;
    results.responseTimes.push(response.responseTime);
  }

  activeRequests--;
  if (activeRequests > results.peakConcurrency) {
    results.peakConcurrency = activeRequests;
  }
}

/**
 * Test endpoints
 */
const endpoints = [
  { method: 'GET', path: '/api/health', weight: 10 },
  { method: 'GET', path: '/api/blueprints', weight: 5 },
  { method: 'GET', path: '/api/deployments', weight: 5 },
  { method: 'GET', path: '/api/monitoring/metrics', weight: 3 },
  { method: 'GET', path: '/api/costing/analysis', weight: 2 },
  { method: 'POST', path: '/api/blueprints/validate', weight: 2, data: { name: 'test', resources: [] } },
];

/**
 * Select random endpoint based on weight
 */
function selectEndpoint() {
  const totalWeight = endpoints.reduce((sum, e) => sum + e.weight, 0);
  let random = Math.random() * totalWeight;

  for (const endpoint of endpoints) {
    random -= endpoint.weight;
    if (random <= 0) {
      return endpoint;
    }
  }
  return endpoints[0];
}

/**
 * Execute single request
 */
async function executeRequest() {
  if (!testRunning) return;

  activeRequests++;
  const endpoint = selectEndpoint();

  try {
    const response = await makeRequest(endpoint.method, endpoint.path, endpoint.data);
    recordResult(response);
  } catch (error) {
    recordResult(null, error);
  }
}

/**
 * Spike Test - Sudden increase in traffic
 */
async function runSpikeTest() {
  console.log('\n🚀 SPIKE TEST - Sudden traffic surge\n');
  
  // Normal load
  console.log('Phase 1: Normal load (20 concurrent)...');
  const normalConcurrency = 20;
  for (let i = 0; i < 60; i++) {
    for (let j = 0; j < normalConcurrency; j++) {
      executeRequest();
    }
    await sleep(1000);
    if (i % 10 === 0) {
      console.log(`  ${i}s - Requests: ${results.totalRequests}, Success: ${results.successfulRequests}`);
    }
  }

  // Spike
  console.log('\nPhase 2: SPIKE (200 concurrent)...');
  const spikeConcurrency = 200;
  for (let i = 0; i < 30; i++) {
    for (let j = 0; j < spikeConcurrency; j++) {
      executeRequest();
    }
    await sleep(1000);
    if (i % 5 === 0) {
      console.log(`  ${i}s - Requests: ${results.totalRequests}, Success: ${results.successfulRequests}`);
    }
  }

  // Recovery
  console.log('\nPhase 3: Recovery (20 concurrent)...');
  for (let i = 0; i < 30; i++) {
    for (let j = 0; j < normalConcurrency; j++) {
      executeRequest();
    }
    await sleep(1000);
    if (i % 10 === 0) {
      console.log(`  ${i}s - Requests: ${results.totalRequests}, Success: ${results.successfulRequests}`);
    }
  }
}

/**
 * Soak Test - Sustained high load
 */
async function runSoakTest() {
  console.log('\n⏱️  SOAK TEST - Sustained load over time\n');
  
  const concurrency = 100;
  const durationSeconds = config.duration;

  console.log(`Running ${concurrency} concurrent requests for ${durationSeconds}s...`);
  
  for (let i = 0; i < durationSeconds; i++) {
    for (let j = 0; j < concurrency; j++) {
      executeRequest();
    }
    await sleep(1000);
    
    if (i % 30 === 0) {
      const successRate = ((results.successfulRequests / results.totalRequests) * 100).toFixed(2);
      console.log(`  ${i}s - Total: ${results.totalRequests}, Success: ${successRate}%, Active: ${activeRequests}`);
    }
  }
}

/**
 * Breakpoint Test - Find system limits
 */
async function runBreakpointTest() {
  console.log('\n💥 BREAKPOINT TEST - Finding system limits\n');
  
  let concurrency = 10;
  const maxConcurrency = config.maxConcurrency;
  const step = 10;
  const testDuration = 20; // seconds per level

  while (concurrency <= maxConcurrency && testRunning) {
    console.log(`\nTesting ${concurrency} concurrent requests...`);
    const beforeRequests = results.totalRequests;
    const beforeSuccess = results.successfulRequests;

    for (let i = 0; i < testDuration; i++) {
      for (let j = 0; j < concurrency; j++) {
        executeRequest();
      }
      await sleep(1000);
    }

    const requestsMade = results.totalRequests - beforeRequests;
    const successMade = results.successfulRequests - beforeSuccess;
    const successRate = ((successMade / requestsMade) * 100).toFixed(2);

    console.log(`  Completed: ${requestsMade} requests, Success rate: ${successRate}%`);

    // If success rate drops below 90%, we've found the breaking point
    if (successRate < 90) {
      console.log(`\n⚠️  Breaking point found at ${concurrency} concurrent requests`);
      break;
    }

    concurrency += step;
  }
}

/**
 * Recovery Test - System recovery after failure
 */
async function runRecoveryTest() {
  console.log('\n🔄 RECOVERY TEST - System resilience\n');
  
  // Phase 1: Normal operation
  console.log('Phase 1: Normal operation...');
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 20; j++) {
      executeRequest();
    }
    await sleep(1000);
  }

  // Phase 2: Overload
  console.log('\nPhase 2: Overload (300 concurrent)...');
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 300; j++) {
      executeRequest();
    }
    await sleep(1000);
  }

  // Phase 3: Cool down
  console.log('\nPhase 3: Cool down...');
  await sleep(10000);

  // Phase 4: Recovery test
  console.log('\nPhase 4: Testing recovery...');
  const beforeRecovery = results.totalRequests;
  for (let i = 0; i < 30; i++) {
    for (let j = 0; j < 20; j++) {
      executeRequest();
    }
    await sleep(1000);
    if (i % 10 === 0) {
      const recentSuccess = results.successfulRequests - beforeRecovery;
      const recentTotal = results.totalRequests - beforeRecovery;
      const successRate = ((recentSuccess / recentTotal) * 100).toFixed(2);
      console.log(`  ${i}s - Recovery success rate: ${successRate}%`);
    }
  }
}

/**
 * Calculate statistics
 */
function calculateStats() {
  if (results.responseTimes.length === 0) return;

  results.responseTimes.sort((a, b) => a - b);
  
  const sum = results.responseTimes.reduce((a, b) => a + b, 0);
  results.avgResponseTime = Math.round(sum / results.responseTimes.length);
  
  const p95Index = Math.floor(results.responseTimes.length * 0.95);
  results.p95ResponseTime = results.responseTimes[p95Index] || 0;
  
  const p99Index = Math.floor(results.responseTimes.length * 0.99);
  results.p99ResponseTime = results.responseTimes[p99Index] || 0;

  const durationSeconds = (results.endTime - results.startTime) / 1000;
  results.throughput = Math.round(results.successfulRequests / durationSeconds);
  results.errorRate = ((results.failedRequests / results.totalRequests) * 100).toFixed(2);
}

/**
 * Print results
 */
function printResults() {
  calculateStats();

  console.log('\n' + '='.repeat(80));
  console.log('STRESS TEST RESULTS');
  console.log('='.repeat(80));
  console.log(`\nTest Type: ${config.testType.toUpperCase()}`);
  console.log(`Duration: ${((results.endTime - results.startTime) / 1000).toFixed(2)}s`);
  console.log(`\n📊 REQUEST STATISTICS:`);
  console.log(`  Total Requests:      ${results.totalRequests}`);
  console.log(`  Successful:          ${results.successfulRequests} (${(100 - results.errorRate).toFixed(2)}%)`);
  console.log(`  Failed:              ${results.failedRequests} (${results.errorRate}%)`);
  console.log(`  Timeouts:            ${results.timeouts}`);
  console.log(`  Peak Concurrency:    ${results.peakConcurrency}`);
  
  console.log(`\n⚡ PERFORMANCE METRICS:`);
  console.log(`  Throughput:          ${results.throughput} req/s`);
  console.log(`  Avg Response Time:   ${results.avgResponseTime}ms`);
  console.log(`  P95 Response Time:   ${results.p95ResponseTime}ms`);
  console.log(`  P99 Response Time:   ${results.p99ResponseTime}ms`);

  console.log(`\n📈 STATUS CODES:`);
  Object.entries(results.statusCodes)
    .sort(([a], [b]) => a - b)
    .forEach(([code, count]) => {
      const percentage = ((count / results.totalRequests) * 100).toFixed(2);
      console.log(`  ${code}: ${count} (${percentage}%)`);
    });

  if (Object.keys(results.errors).length > 0) {
    console.log(`\n❌ ERRORS:`);
    Object.entries(results.errors)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([error, count]) => {
        console.log(`  ${error}: ${count}`);
      });
  }

  // Pass/Fail criteria
  console.log(`\n✅ TEST CRITERIA:`);
  const passThreshold = 95;
  const successRate = 100 - parseFloat(results.errorRate);
  const passed = successRate >= passThreshold;
  
  console.log(`  Success Rate:        ${successRate.toFixed(2)}% (Required: ${passThreshold}%)`);
  console.log(`  Status:              ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  
  console.log('\n' + '='.repeat(80));

  // Exit with appropriate code
  process.exit(passed ? 0 : 1);
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main execution
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║         IAC DHARMA - STRESS TESTING SUITE                     ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(`\nConfiguration:`);
  console.log(`  Base URL:       ${config.baseUrl}`);
  console.log(`  Test Type:      ${config.testType}`);
  console.log(`  Max Concurrency: ${config.maxConcurrency}`);
  console.log(`  Duration:       ${config.duration}s`);

  // Authenticate
  await authenticate();

  results.startTime = Date.now();

  // Run appropriate test
  try {
    switch (config.testType) {
      case 'spike':
        await runSpikeTest();
        break;
      case 'soak':
        await runSoakTest();
        break;
      case 'breakpoint':
        await runBreakpointTest();
        break;
      case 'recovery':
        await runRecoveryTest();
        break;
      default:
        console.error(`Unknown test type: ${config.testType}`);
        process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test execution error:', error);
  }

  testRunning = false;
  
  // Wait for all requests to complete
  console.log('\n⏳ Waiting for pending requests...');
  while (activeRequests > 0) {
    await sleep(100);
  }

  results.endTime = Date.now();
  printResults();
}

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Test interrupted by user');
  testRunning = false;
  results.endTime = Date.now();
  setTimeout(() => {
    printResults();
  }, 2000);
});

// Run tests
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
