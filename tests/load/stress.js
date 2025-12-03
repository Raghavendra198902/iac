/**
 * k6 Stress Load Test
 * 
 * Purpose: Test system under expected production load
 * Load: 1,000 concurrent users
 * Duration: 10 minutes
 * Ramp-up: 2 minutes
 * 
 * Usage:
 *   k6 run tests/load/stress.js
 *   npm run load:stress
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

// Environment configuration
const API_BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3000';

// Custom metrics
const cacheHitRate = new Rate('cache_hit_rate');
const authSuccessRate = new Rate('auth_success_rate');
const apiAvailability = new Rate('api_availability');
const blueprintCreationTime = new Trend('blueprint_creation_time');
const databaseQueryTime = new Trend('database_query_time');
const cacheResponseTime = new Trend('cache_response_time');
const errorCounter = new Counter('errors');
const activeConnections = new Gauge('active_connections');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 1000 },   // Ramp-up to 1,000 users
    { duration: '5m', target: 1000 },   // Stay at 1,000 users
    { duration: '2m', target: 1500 },   // Spike to 1,500 users
    { duration: '1m', target: 0 },      // Ramp-down to 0
  ],
  thresholds: {
    // Response time thresholds (relaxed for stress test)
    'http_req_duration': ['p(95)<150', 'p(99)<300'],
    'http_req_waiting': ['p(95)<120'],
    
    // Error rate threshold
    'http_req_failed': ['rate<0.05'], // Less than 5% errors under stress
    
    // Throughput threshold
    'http_reqs': ['rate>500'], // At least 500 req/sec
    
    // Custom metrics thresholds
    'cache_hit_rate': ['rate>0.7'], // At least 70% cache hits
    'auth_success_rate': ['rate>0.95'], // 95% auth success
    'api_availability': ['rate>0.99'], // 99% uptime
    
    // Database and cache performance
    'database_query_time': ['p(95)<100'],
    'cache_response_time': ['p(95)<10'],
  },
};

// Test data
let authToken = '';
const testUsers = [];

// Generate test users
for (let i = 1; i <= 50; i++) {
  testUsers.push({
    email: `test${i}@example.com`,
    password: 'Test123!@#',
  });
}

/**
 * Setup function - runs once before test
 */
export function setup() {
  console.log('🚀 Starting Stress Load Test');
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  console.log(`👥 Target Users: 1,000 (peak: 1,500)`);
  console.log(`⏱️  Duration: 10 minutes`);
  
  // Health check
  const healthRes = http.get(`${API_BASE_URL}/health`);
  if (healthRes.status !== 200) {
    console.error('❌ API health check failed!');
    return { healthy: false };
  }
  
  // Check cache service
  const cacheRes = http.get(`${API_BASE_URL}/api/cache/stats`);
  const cacheHealthy = cacheRes.status === 200;
  
  console.log('✅ API is healthy');
  console.log(`${cacheHealthy ? '✅' : '⚠️ '} Cache service ${cacheHealthy ? 'healthy' : 'unavailable'}`);
  console.log('🔥 Starting stress test...\n');
  
  return { 
    healthy: true,
    cacheEnabled: cacheHealthy,
  };
}

/**
 * Main test function - runs for each VU iteration
 */
export default function(data) {
  if (!data.healthy) {
    console.error('Skipping test - API not healthy');
    return;
  }
  
  activeConnections.add(1);
  
  // Select random user
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  // Simulate realistic user behavior with weighted requests
  const scenario = Math.random();
  
  if (scenario < 0.15) {
    // 15% - Authentication
    authenticateUser(user);
  } else if (scenario < 0.45) {
    // 30% - Browse blueprints (read-heavy)
    getBlueprintsList();
    sleep(0.5);
    getBlueprintDetails();
  } else if (scenario < 0.65) {
    // 20% - View infrastructure
    getInfrastructureStatus();
    sleep(0.3);
    getInfrastructureList();
  } else if (scenario < 0.80) {
    // 15% - Cost analysis
    getCostAnalysis();
  } else if (scenario < 0.90) {
    // 10% - Create blueprint (write operation)
    createBlueprint();
  } else {
    // 10% - Update/delete operations
    updateBlueprint();
  }
  
  activeConnections.add(-1);
  
  // Think time between requests (0.5-2 seconds under stress)
  sleep(Math.random() * 1.5 + 0.5);
}

/**
 * Authenticate user and get JWT token
 */
function authenticateUser(user) {
  const loginPayload = JSON.stringify({
    email: user.email,
    password: user.password,
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { name: 'Auth_Login' },
  };
  
  const res = http.post(`${API_BASE_URL}/api/auth/login`, loginPayload, params);
  
  const success = check(res, {
    'auth status is 200': (r) => r.status === 200,
    'auth has token': (r) => r.json('token') !== undefined,
  });
  
  authSuccessRate.add(success);
  apiAvailability.add(res.status !== 0);
  
  if (success && res.json('token')) {
    authToken = res.json('token');
  } else {
    errorCounter.add(1);
  }
}

/**
 * Get blueprints list (cacheable)
 */
function getBlueprintsList() {
  const params = {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
    tags: { name: 'Blueprints_List' },
  };
  
  const startTime = Date.now();
  const res = http.get(`${API_BASE_URL}/api/blueprints`, params);
  const duration = Date.now() - startTime;
  
  const success = check(res, {
    'blueprints list status is 200': (r) => r.status === 200,
    'blueprints list has data': (r) => r.json('data') !== undefined,
  });
  
  // Track cache performance
  const isCacheHit = res.headers['X-Cache'] === 'HIT';
  cacheHitRate.add(isCacheHit);
  
  if (isCacheHit) {
    cacheResponseTime.add(duration);
  } else {
    databaseQueryTime.add(duration);
  }
  
  apiAvailability.add(res.status !== 0);
  
  if (!success) {
    errorCounter.add(1);
  }
}

/**
 * Get specific blueprint details (cacheable)
 */
function getBlueprintDetails() {
  const blueprintId = Math.floor(Math.random() * 1000) + 1;
  
  const params = {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
    tags: { name: 'Blueprints_Details' },
  };
  
  const startTime = Date.now();
  const res = http.get(`${API_BASE_URL}/api/blueprints/${blueprintId}`, params);
  const duration = Date.now() - startTime;
  
  const success = check(res, {
    'blueprint details status is 200 or 404': (r) => r.status === 200 || r.status === 404,
  });
  
  // Track cache performance
  const isCacheHit = res.headers['X-Cache'] === 'HIT';
  cacheHitRate.add(isCacheHit);
  
  if (isCacheHit) {
    cacheResponseTime.add(duration);
  } else {
    databaseQueryTime.add(duration);
  }
  
  apiAvailability.add(res.status !== 0);
  
  if (!success) {
    errorCounter.add(1);
  }
}

/**
 * Create new blueprint (write operation)
 */
function createBlueprint() {
  const blueprintPayload = JSON.stringify({
    name: `Stress Test Blueprint ${Date.now()}`,
    description: 'Created during stress test',
    provider: ['aws', 'azure', 'gcp'][Math.floor(Math.random() * 3)],
    region: 'us-east-1',
    resources: [
      {
        type: 'compute',
        name: `instance-${Math.random().toString(36).substr(2, 9)}`,
        instanceType: 't3.micro',
      },
    ],
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    tags: { name: 'Blueprints_Create' },
  };
  
  const startTime = Date.now();
  const res = http.post(`${API_BASE_URL}/api/blueprints`, blueprintPayload, params);
  const duration = Date.now() - startTime;
  
  const success = check(res, {
    'create blueprint status is 201': (r) => r.status === 201,
    'create blueprint has id': (r) => r.json('id') !== undefined,
  });
  
  blueprintCreationTime.add(duration);
  databaseQueryTime.add(duration);
  apiAvailability.add(res.status !== 0);
  
  if (!success) {
    errorCounter.add(1);
  }
}

/**
 * Update existing blueprint
 */
function updateBlueprint() {
  const blueprintId = Math.floor(Math.random() * 1000) + 1;
  
  const updatePayload = JSON.stringify({
    description: `Updated at ${Date.now()}`,
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    tags: { name: 'Blueprints_Update' },
  };
  
  const res = http.put(`${API_BASE_URL}/api/blueprints/${blueprintId}`, updatePayload, params);
  
  const success = check(res, {
    'update blueprint status is 200 or 404': (r) => r.status === 200 || r.status === 404,
  });
  
  apiAvailability.add(res.status !== 0);
  
  if (!success && res.status !== 404) {
    errorCounter.add(1);
  }
}

/**
 * Get infrastructure status
 */
function getInfrastructureStatus() {
  const params = {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
    tags: { name: 'Infrastructure_Status' },
  };
  
  const res = http.get(`${API_BASE_URL}/api/infrastructure/status`, params);
  
  const success = check(res, {
    'infrastructure status is 200': (r) => r.status === 200,
  });
  
  const isCacheHit = res.headers['X-Cache'] === 'HIT';
  cacheHitRate.add(isCacheHit);
  apiAvailability.add(res.status !== 0);
  
  if (!success) {
    errorCounter.add(1);
  }
}

/**
 * Get infrastructure list
 */
function getInfrastructureList() {
  const params = {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
    tags: { name: 'Infrastructure_List' },
  };
  
  const res = http.get(`${API_BASE_URL}/api/infrastructure`, params);
  
  const success = check(res, {
    'infrastructure list status is 200': (r) => r.status === 200,
  });
  
  const isCacheHit = res.headers['X-Cache'] === 'HIT';
  cacheHitRate.add(isCacheHit);
  apiAvailability.add(res.status !== 0);
  
  if (!success) {
    errorCounter.add(1);
  }
}

/**
 * Get cost analysis (expensive operation)
 */
function getCostAnalysis() {
  const params = {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
    tags: { name: 'Cost_Analysis' },
  };
  
  const startTime = Date.now();
  const res = http.get(`${API_BASE_URL}/api/cost/analysis`, params);
  const duration = Date.now() - startTime;
  
  const success = check(res, {
    'cost analysis status is 200': (r) => r.status === 200,
  });
  
  const isCacheHit = res.headers['X-Cache'] === 'HIT';
  cacheHitRate.add(isCacheHit);
  
  if (isCacheHit) {
    cacheResponseTime.add(duration);
  } else {
    databaseQueryTime.add(duration);
  }
  
  apiAvailability.add(res.status !== 0);
  
  if (!success) {
    errorCounter.add(1);
  }
}

/**
 * Teardown function - runs once after test
 */
export function teardown(data) {
  console.log('\n✅ Stress Load Test Complete');
  console.log('📊 Performance Summary:');
  console.log('   - Check metrics above for detailed results');
  console.log('   - Compare cache hit rate vs target (>70%)');
  console.log('   - Review error rate (<5% threshold)');
  console.log('   - Analyze p95 response times (<150ms target)');
  console.log('\n💡 Next Steps:');
  console.log('   - If thresholds passed: Run spike test');
  console.log('   - If errors occurred: Check logs and adjust pool sizes');
  console.log('   - Review Grafana dashboards for detailed metrics');
}
