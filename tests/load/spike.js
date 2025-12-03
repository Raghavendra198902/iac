/**
 * k6 Spike Load Test
 * 
 * Purpose: Test system under peak/burst traffic (Black Friday scenario)
 * Load: 10,000 concurrent users (peak)
 * Duration: 15 minutes
 * Pattern: Gradual ramp-up with sudden spike
 * 
 * Usage:
 *   k6 run tests/load/spike.js
 *   npm run load:spike
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
const circuitBreakerTrips = new Counter('circuit_breaker_trips');
const rateLimitHits = new Counter('rate_limit_hits');
const errorCounter = new Counter('errors');
const activeConnections = new Gauge('active_connections');
const pgBouncerPoolUtilization = new Gauge('pgbouncer_pool_utilization');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 500 },     // Normal load
    { duration: '3m', target: 1000 },    // Growing load
    { duration: '1m', target: 10000 },   // SPIKE! (Black Friday moment)
    { duration: '4m', target: 10000 },   // Sustain spike
    { duration: '2m', target: 1000 },    // Recovery
    { duration: '3m', target: 0 },       // Ramp-down
  ],
  thresholds: {
    // Response time thresholds (very relaxed for spike)
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    
    // Error rate threshold (relaxed for spike)
    'http_req_failed': ['rate<0.10'], // Less than 10% errors during spike
    
    // Throughput threshold
    'http_reqs': ['rate>1000'], // At least 1,000 req/sec at peak
    
    // Custom metrics thresholds
    'cache_hit_rate': ['rate>0.6'], // At least 60% cache hits (degraded)
    'auth_success_rate': ['rate>0.90'], // 90% auth success (degraded)
    'api_availability': ['rate>0.95'], // 95% uptime (degraded)
  },
};

// Test data
let authToken = '';
const testUsers = [];

// Generate more test users for spike
for (let i = 1; i <= 200; i++) {
  testUsers.push({
    email: `spike${i}@example.com`,
    password: 'Test123!@#',
  });
}

/**
 * Setup function - runs once before test
 */
export function setup() {
  console.log('🚀 Starting Spike Load Test');
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  console.log(`👥 Peak Users: 10,000 concurrent`);
  console.log(`⏱️  Duration: 15 minutes`);
  console.log(`⚠️  WARNING: This will stress test the system!`);
  
  // Health check
  const healthRes = http.get(`${API_BASE_URL}/health`);
  if (healthRes.status !== 200) {
    console.error('❌ API health check failed!');
    return { healthy: false };
  }
  
  console.log('✅ API is healthy');
  console.log('🔥 Starting spike test (brace for impact)...\n');
  
  return { healthy: true };
}

/**
 * Main test function - runs for each VU iteration
 */
export default function(data) {
  if (!data.healthy) {
    return;
  }
  
  activeConnections.add(1);
  
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  const scenario = Math.random();
  
  // More read-heavy during spike (80% reads, 20% writes)
  if (scenario < 0.10) {
    authenticateUser(user);
  } else if (scenario < 0.50) {
    // 40% - Quick reads (cacheable)
    getBlueprintsList();
  } else if (scenario < 0.75) {
    // 25% - Details (cacheable)
    getBlueprintDetails();
  } else if (scenario < 0.90) {
    // 15% - Infrastructure status
    getInfrastructureStatus();
  } else {
    // 10% - Writes (cache invalidation)
    createBlueprint();
  }
  
  activeConnections.add(-1);
  
  // Shorter think time during spike (0.1-1 second)
  sleep(Math.random() * 0.9 + 0.1);
}

function authenticateUser(user) {
  const loginPayload = JSON.stringify({
    email: user.email,
    password: user.password,
  });
  
  const params = {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'Auth_Login' },
  };
  
  const res = http.post(`${API_BASE_URL}/api/auth/login`, loginPayload, params);
  
  const success = check(res, {
    'auth status is 200': (r) => r.status === 200,
  });
  
  authSuccessRate.add(success);
  apiAvailability.add(res.status !== 0);
  
  // Track rate limiting
  if (res.status === 429) {
    rateLimitHits.add(1);
  }
  
  // Track circuit breaker
  if (res.status === 503) {
    circuitBreakerTrips.add(1);
  }
  
  if (success && res.json('token')) {
    authToken = res.json('token');
  } else if (res.status !== 429 && res.status !== 503) {
    errorCounter.add(1);
  }
}

function getBlueprintsList() {
  const params = {
    headers: { 'Authorization': `Bearer ${authToken}` },
    tags: { name: 'Blueprints_List' },
  };
  
  const res = http.get(`${API_BASE_URL}/api/blueprints`, params);
  
  const success = check(res, {
    'blueprints list status is 200': (r) => r.status === 200,
  });
  
  const isCacheHit = res.headers['X-Cache'] === 'HIT';
  cacheHitRate.add(isCacheHit);
  apiAvailability.add(res.status !== 0);
  
  if (res.status === 429) rateLimitHits.add(1);
  if (res.status === 503) circuitBreakerTrips.add(1);
  
  if (!success && res.status !== 429 && res.status !== 503) {
    errorCounter.add(1);
  }
}

function getBlueprintDetails() {
  const blueprintId = Math.floor(Math.random() * 5000) + 1;
  
  const params = {
    headers: { 'Authorization': `Bearer ${authToken}` },
    tags: { name: 'Blueprints_Details' },
  };
  
  const res = http.get(`${API_BASE_URL}/api/blueprints/${blueprintId}`, params);
  
  const isCacheHit = res.headers['X-Cache'] === 'HIT';
  cacheHitRate.add(isCacheHit);
  apiAvailability.add(res.status !== 0);
  
  if (res.status === 429) rateLimitHits.add(1);
  if (res.status === 503) circuitBreakerTrips.add(1);
}

function getInfrastructureStatus() {
  const params = {
    headers: { 'Authorization': `Bearer ${authToken}` },
    tags: { name: 'Infrastructure_Status' },
  };
  
  const res = http.get(`${API_BASE_URL}/api/infrastructure/status`, params);
  
  const isCacheHit = res.headers['X-Cache'] === 'HIT';
  cacheHitRate.add(isCacheHit);
  apiAvailability.add(res.status !== 0);
  
  if (res.status === 429) rateLimitHits.add(1);
  if (res.status === 503) circuitBreakerTrips.add(1);
}

function createBlueprint() {
  const blueprintPayload = JSON.stringify({
    name: `Spike Test ${Date.now()}`,
    description: 'Created during spike',
    provider: 'aws',
    region: 'us-east-1',
    resources: [{ type: 'ec2', name: 'test', instanceType: 't3.micro' }],
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    tags: { name: 'Blueprints_Create' },
  };
  
  const res = http.post(`${API_BASE_URL}/api/blueprints`, blueprintPayload, params);
  
  apiAvailability.add(res.status !== 0);
  
  if (res.status === 429) rateLimitHits.add(1);
  if (res.status === 503) circuitBreakerTrips.add(1);
  
  if (res.status !== 201 && res.status !== 429 && res.status !== 503) {
    errorCounter.add(1);
  }
}

/**
 * Teardown function
 */
export function teardown(data) {
  console.log('\n✅ Spike Load Test Complete');
  console.log('📊 Spike Performance Summary:');
  console.log('   - Peak: 10,000 concurrent users');
  console.log('   - Check error rate (<10% threshold)');
  console.log('   - Review circuit breaker trips');
  console.log('   - Analyze rate limit hits');
  console.log('   - Check system recovery time');
  console.log('\n💡 Key Metrics to Review:');
  console.log('   - Did the system stay up? (availability >95%)');
  console.log('   - How many errors during spike?');
  console.log('   - Did PgBouncer pool hold up?');
  console.log('   - Did Redis cache help reduce load?');
  console.log('   - How long to recover after spike?');
}
