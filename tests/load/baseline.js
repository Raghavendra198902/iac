/**
 * k6 Baseline Load Test
 * 
 * Purpose: Establish performance baseline with light load
 * Load: 100 concurrent users
 * Duration: 5 minutes
 * Ramp-up: 30 seconds
 * 
 * Usage:
 *   k6 run tests/load/baseline.js
 *   npm run load:baseline
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Environment configuration
const API_BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3000';

// Custom metrics
const cacheHitRate = new Rate('cache_hit_rate');
const authSuccessRate = new Rate('auth_success_rate');
const apiAvailability = new Rate('api_availability');
const blueprintCreationTime = new Trend('blueprint_creation_time');
const errorCounter = new Counter('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 100 },  // Ramp-up to 100 users
    { duration: '4m', target: 100 },   // Stay at 100 users
    { duration: '30s', target: 0 },    // Ramp-down to 0
  ],
  thresholds: {
    // Response time thresholds
    'http_req_duration': ['p(95)<100', 'p(99)<200'],
    'http_req_waiting': ['p(95)<80'],
    
    // Error rate threshold
    'http_req_failed': ['rate<0.01'], // Less than 1% errors
    
    // Throughput threshold
    'http_reqs': ['rate>50'], // At least 50 req/sec
    
    // Custom metrics thresholds
    'cache_hit_rate': ['rate>0.5'], // At least 50% cache hits
    'auth_success_rate': ['rate>0.99'], // 99% auth success
    'api_availability': ['rate>0.999'], // 99.9% uptime
  },
};

// Test data
let authToken = '';
const testUsers = [
  { email: 'test1@example.com', password: 'Test123!@#' },
  { email: 'test2@example.com', password: 'Test123!@#' },
  { email: 'test3@example.com', password: 'Test123!@#' },
];

/**
 * Setup function - runs once before test
 */
export function setup() {
  console.log('🚀 Starting Baseline Load Test');
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  console.log(`👥 Target Users: 100`);
  console.log(`⏱️  Duration: 5 minutes`);
  
  // Health check
  const healthRes = http.get(`${API_BASE_URL}/health`);
  if (healthRes.status !== 200) {
    console.error('❌ API health check failed!');
    return { healthy: false };
  }
  
  console.log('✅ API is healthy, starting test...\n');
  return { healthy: true };
}

/**
 * Main test function - runs for each VU iteration
 */
export default function(data) {
  if (!data.healthy) {
    console.error('Skipping test - API not healthy');
    return;
  }
  
  // Select random user
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  // 1. Authentication (20% of requests)
  if (Math.random() < 0.2) {
    authenticateUser(user);
  }
  
  // 2. Get blueprints list (30% of requests)
  if (Math.random() < 0.3) {
    getBlueprintsList();
  }
  
  // 3. Get specific blueprint (25% of requests)
  if (Math.random() < 0.25) {
    getBlueprintDetails();
  }
  
  // 4. Create new blueprint (15% of requests)
  if (Math.random() < 0.15) {
    createBlueprint();
  }
  
  // 5. Get infrastructure status (10% of requests)
  if (Math.random() < 0.1) {
    getInfrastructureStatus();
  }
  
  // Think time between requests (1-3 seconds)
  sleep(Math.random() * 2 + 1);
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
  }
  
  if (!success) {
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
  
  const res = http.get(`${API_BASE_URL}/api/blueprints`, params);
  
  const success = check(res, {
    'blueprints list status is 200': (r) => r.status === 200,
    'blueprints list has data': (r) => r.json('data') !== undefined,
  });
  
  // Check if response came from cache
  const isCacheHit = res.headers['X-Cache'] === 'HIT';
  cacheHitRate.add(isCacheHit);
  apiAvailability.add(res.status !== 0);
  
  if (!success) {
    errorCounter.add(1);
  }
}

/**
 * Get specific blueprint details (cacheable)
 */
function getBlueprintDetails() {
  const blueprintId = Math.floor(Math.random() * 100) + 1; // Random blueprint ID
  
  const params = {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
    tags: { name: 'Blueprints_Details' },
  };
  
  const res = http.get(`${API_BASE_URL}/api/blueprints/${blueprintId}`, params);
  
  const success = check(res, {
    'blueprint details status is 200 or 404': (r) => r.status === 200 || r.status === 404,
  });
  
  // Check if response came from cache
  const isCacheHit = res.headers['X-Cache'] === 'HIT';
  cacheHitRate.add(isCacheHit);
  apiAvailability.add(res.status !== 0);
  
  if (!success) {
    errorCounter.add(1);
  }
}

/**
 * Create new blueprint (write operation, invalidates cache)
 */
function createBlueprint() {
  const blueprintPayload = JSON.stringify({
    name: `Test Blueprint ${Date.now()}`,
    description: 'Load test blueprint',
    provider: 'aws',
    region: 'us-east-1',
    resources: [
      {
        type: 'ec2',
        name: 'web-server',
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
  apiAvailability.add(res.status !== 0);
  
  if (!success) {
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
  
  apiAvailability.add(res.status !== 0);
  
  if (!success) {
    errorCounter.add(1);
  }
}

/**
 * Teardown function - runs once after test
 */
export function teardown(data) {
  console.log('\n✅ Baseline Load Test Complete');
  console.log('📊 Check metrics above for detailed results');
  console.log('💡 Tip: Compare with stress and spike tests to see performance degradation');
}
