const http = require('http');

/**
 * Simple Load Testing Tool for IAC Dharma Platform
 * Tests API endpoints under concurrent load
 */

// Configuration
const config = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  concurrency: parseInt(process.env.CONCURRENCY || '50'),
  duration: parseInt(process.env.DURATION || '60'), // seconds
  rampUp: parseInt(process.env.RAMP_UP || '10'), // seconds
};

// Test results
const results = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [],
  statusCodes: {},
  errors: {},
  startTime: null,
  endTime: null,
};

// Authentication token
let authToken = null;

/**
 * Make HTTP request
 */
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
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

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const startTime = Date.now();
    const req = http.request(url, options, (res) => {
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
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
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
    const response = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@iacdharma.com',
      password: 'admin',
    });

    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      authToken = data.token;
      console.log('✓ Authentication successful');
      return true;
    } else {
      console.log('✗ Authentication failed:', response.statusCode);
      return false;
    }
  } catch (error) {
    console.log('✗ Authentication error:', error.message);
    return false;
  }
}

/**
 * Test endpoint
 */
async function testEndpoint(method, path) {
  results.totalRequests++;

  try {
    const response = await makeRequest(method, path);
    
    results.responseTimes.push(response.responseTime);
    results.statusCodes[response.statusCode] = 
      (results.statusCodes[response.statusCode] || 0) + 1;

    if (response.statusCode >= 200 && response.statusCode < 400) {
      results.successfulRequests++;
    } else {
      results.failedRequests++;
    }

    return response;
  } catch (error) {
    results.failedRequests++;
    results.errors[error.message] = (results.errors[error.message] || 0) + 1;
    throw error;
  }
}

/**
 * Run load test scenario
 */
async function runLoadTest() {
  console.log('\n======================================');
  console.log('🚀 IAC Dharma Load Testing');
  console.log('======================================\n');
  console.log(`Configuration:`);
  console.log(`  Base URL: ${config.baseUrl}`);
  console.log(`  Concurrency: ${config.concurrency} users`);
  console.log(`  Duration: ${config.duration} seconds`);
  console.log(`  Ramp-up: ${config.rampUp} seconds\n`);

  // Authenticate first
  console.log('Authenticating...');
  if (!await authenticate()) {
    console.log('Cannot proceed without authentication');
    process.exit(1);
  }

  // Test endpoints
  const endpoints = [
    { method: 'GET', path: '/health' },
    { method: 'GET', path: '/api' },
    { method: 'GET', path: '/api/blueprints' },
    { method: 'GET', path: '/api/iac/templates' },
    { method: 'GET', path: '/api/costing/estimations' },
    { method: 'GET', path: '/api/pm/projects' },
  ];

  results.startTime = Date.now();
  
  console.log('\nStarting load test...\n');

  // Calculate requests per second during ramp-up
  const targetRPS = (config.concurrency * endpoints.length) / config.rampUp;
  const totalRequests = Math.floor(targetRPS * config.duration);

  console.log(`Target: ${Math.floor(targetRPS)} requests/second`);
  console.log(`Expected total requests: ${totalRequests}\n`);

  // Run test
  const activeRequests = new Set();
  let requestCount = 0;
  let isRunning = true;

  // Stop after duration
  setTimeout(() => {
    isRunning = false;
  }, config.duration * 1000);

  // Progress indicator
  const progressInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - results.startTime) / 1000);
    const rps = Math.floor(results.totalRequests / (elapsed || 1));
    process.stdout.write(`\rProgress: ${elapsed}s | Requests: ${results.totalRequests} | RPS: ${rps} | Active: ${activeRequests.size}  `);
  }, 1000);

  // Generate load
  while (isRunning || activeRequests.size > 0) {
    if (isRunning && activeRequests.size < config.concurrency) {
      const endpoint = endpoints[requestCount % endpoints.length];
      requestCount++;

      const promise = testEndpoint(endpoint.method, endpoint.path)
        .finally(() => {
          activeRequests.delete(promise);
        });

      activeRequests.add(promise);

      // Small delay to control request rate
      await new Promise(resolve => setTimeout(resolve, 10));
    } else {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  clearInterval(progressInterval);
  results.endTime = Date.now();

  // Print results
  printResults();
}

/**
 * Calculate statistics
 */
function calculateStats(values) {
  if (values.length === 0) return { min: 0, max: 0, avg: 0, p50: 0, p95: 0, p99: 0 };

  const sorted = values.sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: Math.round(sum / sorted.length),
    p50: sorted[Math.floor(sorted.length * 0.5)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)],
  };
}

/**
 * Print test results
 */
function printResults() {
  console.log('\n\n======================================');
  console.log('📊 Load Test Results');
  console.log('======================================\n');

  const duration = (results.endTime - results.startTime) / 1000;
  const stats = calculateStats(results.responseTimes);
  const rps = Math.round(results.totalRequests / duration);
  const successRate = Math.round((results.successfulRequests / results.totalRequests) * 100);

  console.log('Summary:');
  console.log(`  Total Requests:      ${results.totalRequests}`);
  console.log(`  Successful:          ${results.successfulRequests} (${successRate}%)`);
  console.log(`  Failed:              ${results.failedRequests}`);
  console.log(`  Duration:            ${duration.toFixed(2)} seconds`);
  console.log(`  Requests/Second:     ${rps}\n`);

  console.log('Response Times:');
  console.log(`  Minimum:             ${stats.min}ms`);
  console.log(`  Maximum:             ${stats.max}ms`);
  console.log(`  Average:             ${stats.avg}ms`);
  console.log(`  Median (p50):        ${stats.p50}ms`);
  console.log(`  95th Percentile:     ${stats.p95}ms`);
  console.log(`  99th Percentile:     ${stats.p99}ms\n`);

  console.log('Status Code Distribution:');
  Object.entries(results.statusCodes)
    .sort(([a], [b]) => a - b)
    .forEach(([code, count]) => {
      const percentage = Math.round((count / results.totalRequests) * 100);
      console.log(`  HTTP ${code}:             ${count} (${percentage}%)`);
    });

  if (Object.keys(results.errors).length > 0) {
    console.log('\nErrors:');
    Object.entries(results.errors).forEach(([error, count]) => {
      console.log(`  ${error}: ${count}`);
    });
  }

  console.log('\n======================================');
  console.log('Performance Assessment');
  console.log('======================================\n');

  // Performance assessment
  if (stats.p95 < 100) {
    console.log('✓ EXCELLENT: p95 < 100ms');
  } else if (stats.p95 < 200) {
    console.log('✓ GOOD: p95 < 200ms');
  } else if (stats.p95 < 500) {
    console.log('⚠ ACCEPTABLE: p95 < 500ms');
  } else {
    console.log('✗ POOR: p95 > 500ms');
  }

  if (successRate >= 99) {
    console.log('✓ EXCELLENT: Success rate >= 99%');
  } else if (successRate >= 95) {
    console.log('✓ GOOD: Success rate >= 95%');
  } else if (successRate >= 90) {
    console.log('⚠ ACCEPTABLE: Success rate >= 90%');
  } else {
    console.log('✗ POOR: Success rate < 90%');
  }

  if (rps >= 100) {
    console.log('✓ HIGH THROUGHPUT: >= 100 req/s');
  } else if (rps >= 50) {
    console.log('✓ GOOD THROUGHPUT: >= 50 req/s');
  } else if (rps >= 20) {
    console.log('⚠ MODERATE THROUGHPUT: >= 20 req/s');
  } else {
    console.log('⚠ LOW THROUGHPUT: < 20 req/s');
  }

  console.log('\n');
}

// Run the load test
runLoadTest().catch(console.error);
