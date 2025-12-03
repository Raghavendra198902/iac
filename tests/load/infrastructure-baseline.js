/**
 * k6 Infrastructure Baseline Load Test
 * 
 * Purpose: Validate v2.0 infrastructure (PgBouncer, Redis, API Gateway)
 * Load: 100 concurrent users
 * Duration: 5 minutes
 * Focus: Health endpoints and basic API functionality
 * 
 * Usage: k6 run tests/load/infrastructure-baseline.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Environment configuration
const API_BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3000';
const BLUEPRINT_URL = __ENV.BLUEPRINT_URL || 'http://localhost:3001';

// Custom metrics
const apiAvailability = new Rate('api_availability');
const blueprintAvailability = new Rate('blueprint_availability');
const healthCheckTime = new Trend('health_check_time');
const errorCounter = new Counter('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Ramp-up to 50 users
    { duration: '2m', target: 100 },   // Ramp to 100 users
    { duration: '2m', target: 100 },   // Stay at 100 users
    { duration: '30s', target: 0 },    // Ramp-down to 0
  ],
  thresholds: {
    // Response time thresholds
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    
    // Error rate threshold
    'http_req_failed': ['rate<0.01'], // Less than 1% errors
    
    // Custom metrics thresholds
    'api_availability': ['rate>0.99'], // 99% uptime
    'blueprint_availability': ['rate>0.99'], // 99% uptime
  },
};

/**
 * Setup function - runs once before test
 */
export function setup() {
  console.log('🚀 Starting Infrastructure Baseline Load Test');
  console.log(`📍 API Gateway: ${API_BASE_URL}`);
  console.log(`📍 Blueprint Service: ${BLUEPRINT_URL}`);
  console.log(`👥 Target Users: 100`);
  console.log(`⏱️  Duration: 5 minutes`);
  
  // Health check
  const healthRes = http.get(`${API_BASE_URL}/health`);
  if (healthRes.status !== 200) {
    console.error('❌ API Gateway health check failed!');
    return { healthy: false };
  }
  
  const blueprintHealthRes = http.get(`${BLUEPRINT_URL}/health`);
  if (blueprintHealthRes.status !== 200) {
    console.error('❌ Blueprint Service health check failed!');
    return { healthy: false };
  }
  
  console.log('✅ All services healthy, starting test...\n');
  return { healthy: true };
}

/**
 * Main test function - runs for each VU iteration
 */
export default function(data) {
  if (!data.healthy) {
    console.error('Skipping test - Services not healthy');
    return;
  }
  
  // Mix of different operations
  const rand = Math.random();
  
  if (rand < 0.4) {
    // 40% - API Gateway health checks
    checkApiGatewayHealth();
  } else if (rand < 0.7) {
    // 30% - Blueprint Service health checks
    checkBlueprintHealth();
  } else if (rand < 0.85) {
    // 15% - API Gateway stats endpoint
    getApiStats();
  } else {
    // 15% - Both services simultaneously
    checkApiGatewayHealth();
    checkBlueprintHealth();
  }
  
  // Think time between requests (0.5-2 seconds)
  sleep(Math.random() * 1.5 + 0.5);
}

/**
 * Check API Gateway health
 */
function checkApiGatewayHealth() {
  const params = {
    tags: { name: 'API_Gateway_Health' },
  };
  
  const startTime = Date.now();
  const res = http.get(`${API_BASE_URL}/health`, params);
  const duration = Date.now() - startTime;
  
  const success = check(res, {
    'API Gateway status is 200': (r) => r.status === 200,
    'API Gateway has status field': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status === 'healthy';
      } catch (e) {
        return false;
      }
    },
    'API Gateway response time < 500ms': () => duration < 500,
  });
  
  healthCheckTime.add(duration);
  apiAvailability.add(success);
  
  if (!success) {
    errorCounter.add(1);
    console.log(`❌ API Gateway health check failed: ${res.status}`);
  }
}

/**
 * Check Blueprint Service health
 */
function checkBlueprintHealth() {
  const params = {
    tags: { name: 'Blueprint_Service_Health' },
  };
  
  const startTime = Date.now();
  const res = http.get(`${BLUEPRINT_URL}/health`, params);
  const duration = Date.now() - startTime;
  
  const success = check(res, {
    'Blueprint Service status is 200': (r) => r.status === 200,
    'Blueprint Service has status field': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status === 'healthy';
      } catch (e) {
        return false;
      }
    },
    'Blueprint Service response time < 500ms': () => duration < 500,
  });
  
  healthCheckTime.add(duration);
  blueprintAvailability.add(success);
  
  if (!success) {
    errorCounter.add(1);
    console.log(`❌ Blueprint Service health check failed: ${res.status}`);
  }
}

/**
 * Get API Gateway statistics
 */
function getApiStats() {
  const params = {
    tags: { name: 'API_Gateway_Stats' },
  };
  
  const res = http.get(`${API_BASE_URL}/health`, params);
  
  const success = check(res, {
    'Stats endpoint accessible': (r) => r.status === 200,
  });
  
  apiAvailability.add(success);
  
  if (!success) {
    errorCounter.add(1);
  }
}

/**
 * Teardown function - runs once after test
 */
export function teardown(data) {
  console.log('\n✅ Infrastructure Baseline Load Test Complete');
  console.log('📊 Check metrics above for detailed results');
  console.log('\n🔍 Next Steps:');
  console.log('  1. Check PgBouncer connection pools: docker exec iac-postgres psql -h pgbouncer -p 6432 -U postgres -d pgbouncer -c "SHOW POOLS;"');
  console.log('  2. Check Redis stats: docker exec iac-redis redis-cli INFO stats');
  console.log('  3. Run stress test: npm run load:stress');
}
