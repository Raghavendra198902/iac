const http = require('http');

/**
 * Realistic Load Testing Tool for IAC Dharma Platform
 * Simulates realistic user behavior with think times
 */

// Configuration
const config = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  concurrency: parseInt(process.env.CONCURRENCY || '20'), // Reduced from 50
  duration: parseInt(process.env.DURATION || '120'), // 2 minutes
  thinkTime: parseInt(process.env.THINK_TIME || '500'), // ms between requests
};

// Test results
const results = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  rateLimited: 0,
  responseTimes: [],
  statusCodes: {},
  errors: {},
  endpointStats: {},
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
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Test endpoint
 */
async function testEndpoint(method, path, name) {
  results.totalRequests++;

  // Initialize endpoint stats
  if (!results.endpointStats[name]) {
    results.endpointStats[name] = {
      requests: 0,
      successful: 0,
      failed: 0,
      rateLimited: 0,
      responseTimes: [],
    };
  }

  const stats = results.endpointStats[name];
  stats.requests++;

  try {
    const response = await makeRequest(method, path);
    
    stats.responseTimes.push(response.responseTime);
    results.responseTimes.push(response.responseTime);
    results.statusCodes[response.statusCode] = 
      (results.statusCodes[response.statusCode] || 0) + 1;

    if (response.statusCode === 429) {
      results.rateLimited++;
      stats.rateLimited++;
      results.failedRequests++;
      stats.failed++;
    } else if (response.statusCode >= 200 && response.statusCode < 400) {
      results.successfulRequests++;
      stats.successful++;
    } else {
      results.failedRequests++;
      stats.failed++;
    }

    return response;
  } catch (error) {
    results.failedRequests++;
    stats.failed++;
    results.errors[error.message] = (results.errors[error.message] || 0) + 1;
    throw error;
  }
}

/**
 * Simulate user session
 */
async function simulateUser(userId) {
  const endpoints = [
    { method: 'GET', path: '/health', name: 'Health Check' },
    { method: 'GET', path: '/api', name: 'API Info' },
    { method: 'GET', path: '/api/blueprints', name: 'List Blueprints' },
    { method: 'GET', path: '/api/iac/templates', name: 'List IAC Templates' },
    { method: 'GET', path: '/api/costing/estimations', name: 'List Estimations' },
    { method: 'GET', path: '/api/pm/projects', name: 'List Projects' },
  ];

  while (Date.now() < results.endTime) {
    // Pick random endpoint
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    
    try {
      await testEndpoint(endpoint.method, endpoint.path, endpoint.name);
      
      // Think time between requests (realistic user behavior)
      await new Promise(resolve => 
        setTimeout(resolve, config.thinkTime + Math.random() * config.thinkTime)
      );
    } catch (error) {
      // Continue on error
    }
  }
}

/**
 * Run load test
 */
async function runLoadTest() {
  console.log('\n======================================');
  console.log('🚀 IAC Dharma Realistic Load Test');
  console.log('======================================\n');
  console.log(`Configuration:`);
  console.log(`  Base URL: ${config.baseUrl}`);
  console.log(`  Concurrent Users: ${config.concurrency}`);
  console.log(`  Test Duration: ${config.duration} seconds`);
  console.log(`  Think Time: ${config.thinkTime}ms\n`);

  // Authenticate
  console.log('Authenticating...');
  if (!await authenticate()) {
    console.log('✗ Authentication failed');
    process.exit(1);
  }
  console.log('✓ Authentication successful\n');

  results.startTime = Date.now();
  results.endTime = results.startTime + (config.duration * 1000);

  console.log('Starting load test...\n');

  // Progress indicator
  const progressInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - results.startTime) / 1000);
    const remaining = Math.max(0, config.duration - elapsed);
    const rps = Math.floor(results.totalRequests / (elapsed || 1));
    const successRate = results.totalRequests > 0 
      ? Math.floor((results.successfulRequests / results.totalRequests) * 100)
      : 0;
    
    process.stdout.write(
      `\rTime: ${elapsed}s/${config.duration}s | ` +
      `Requests: ${results.totalRequests} | ` +
      `RPS: ${rps} | ` +
      `Success: ${successRate}% | ` +
      `Rate Limited: ${results.rateLimited}    `
    );
  }, 1000);

  // Simulate concurrent users
  const users = [];
  for (let i = 0; i < config.concurrency; i++) {
    users.push(simulateUser(i));
  }

  await Promise.all(users);
  
  clearInterval(progressInterval);
  console.log('\n');

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
  console.log('======================================');
  console.log('📊 Load Test Results');
  console.log('======================================\n');

  const duration = (Date.now() - results.startTime) / 1000;
  const stats = calculateStats(results.responseTimes);
  const rps = Math.round(results.totalRequests / duration);
  const successRate = Math.round((results.successfulRequests / results.totalRequests) * 100);

  console.log('Summary:');
  console.log(`  Total Requests:      ${results.totalRequests}`);
  console.log(`  Successful:          ${results.successfulRequests} (${successRate}%)`);
  console.log(`  Failed:              ${results.failedRequests}`);
  console.log(`  Rate Limited:        ${results.rateLimited} (${Math.round(results.rateLimited/results.totalRequests*100)}%)`);
  console.log(`  Duration:            ${duration.toFixed(2)} seconds`);
  console.log(`  Throughput:          ${rps} requests/second\n`);

  console.log('Response Times (Successful Requests):');
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

  console.log('\nPer-Endpoint Statistics:');
  Object.entries(results.endpointStats)
    .sort(([, a], [, b]) => b.requests - a.requests)
    .forEach(([name, stats]) => {
      const avgTime = stats.responseTimes.length > 0
        ? Math.round(stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length)
        : 0;
      const successRate = Math.round((stats.successful / stats.requests) * 100);
      
      console.log(`  ${name}:`);
      console.log(`    Requests: ${stats.requests} | Success: ${successRate}% | Avg: ${avgTime}ms`);
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
    console.log('✓ EXCELLENT: p95 response time < 100ms');
  } else if (stats.p95 < 200) {
    console.log('✓ GOOD: p95 response time < 200ms');
  } else if (stats.p95 < 500) {
    console.log('⚠ ACCEPTABLE: p95 response time < 500ms');
  } else {
    console.log('✗ POOR: p95 response time > 500ms');
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

  if (results.rateLimited / results.totalRequests > 0.1) {
    console.log('⚠ HIGH RATE LIMITING: >10% requests rate limited');
    console.log('   Consider: Reducing concurrent users or increasing rate limits');
  } else if (results.rateLimited / results.totalRequests > 0.05) {
    console.log('⚠ MODERATE RATE LIMITING: >5% requests rate limited');
  } else {
    console.log('✓ LOW RATE LIMITING: <5% requests rate limited');
  }

  if (rps >= 50) {
    console.log('✓ HIGH THROUGHPUT: >= 50 req/s');
  } else if (rps >= 20) {
    console.log('✓ GOOD THROUGHPUT: >= 20 req/s');
  } else {
    console.log('⚠ MODERATE THROUGHPUT: < 20 req/s');
  }

  console.log('\n======================================');
  console.log('Recommendations');
  console.log('======================================\n');

  if (results.rateLimited > 0) {
    console.log('Rate Limiting Detected:');
    console.log('  Current rate limit: 100 requests per 15 minutes (production)');
    console.log('  Consider for production:');
    console.log('    - Implement user-specific rate limiting');
    console.log('    - Add caching to reduce request load');
    console.log('    - Use Redis for distributed rate limiting');
    console.log('    - Implement request queuing for burst traffic');
  }

  if (stats.p95 > 100) {
    console.log('\nPerformance Optimization:');
    console.log('  - Add database indexes for frequently queried fields');
    console.log('  - Implement response caching');
    console.log('  - Consider connection pool tuning');
    console.log('  - Review slow queries with EXPLAIN ANALYZE');
  }

  console.log('\nScaling Recommendations:');
  const estimatedCapacity = Math.floor((results.successfulRequests / duration) * 60);
  console.log(`  Current capacity: ~${estimatedCapacity} successful requests/minute`);
  console.log(`  For higher load, consider:`);
  console.log(`    - Horizontal scaling (multiple API gateway instances)`);
  console.log(`    - Load balancer with session affinity`);
  console.log(`    - Database read replicas`);
  console.log(`    - CDN for static content`);

  console.log('\n');
}

// Run the load test
runLoadTest().catch(console.error);
