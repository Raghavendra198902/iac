// k6 Load Test for IAC Dharma API
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');
const TARGET_URL = __ENV.TARGET_URL || 'http://localhost:3000';

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp-up to 10 users
    { duration: '1m', target: 50 },   // Ramp-up to 50 users
    { duration: '3m', target: 50 },   // Stay at 50 users for 3 minutes
    { duration: '1m', target: 100 },  // Ramp-up to 100 users
    { duration: '3m', target: 100 },  // Stay at 100 users for 3 minutes
    { duration: '30s', target: 0 },   // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% < 500ms, 99% < 1s
    http_req_failed: ['rate<0.01'],  // Error rate < 1%
    errors: ['rate<0.1'],            // Error rate < 10%
  },
};

export default function () {
  // Test 1: Health check
  let healthRes = http.get(`${TARGET_URL}/health/live`);
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: API Gateway info
  let apiRes = http.get(`${TARGET_URL}/api`);
  check(apiRes, {
    'API info status is 200': (r) => r.status === 200,
    'API response contains message': (r) => r.json('message') !== undefined,
  }) || errorRate.add(1);

  sleep(1);

  // Test 3: Circuit breakers endpoint
  let circuitRes = http.get(`${TARGET_URL}/api/circuit-breakers`);
  check(circuitRes, {
    'circuit breakers status is 200': (r) => r.status === 200,
    'circuit breakers response is valid': (r) => r.json('success') === true,
  }) || errorRate.add(1);

  sleep(1);

  // Test 4: Cache stats
  let cacheRes = http.get(`${TARGET_URL}/api/cache/stats`);
  check(cacheRes, {
    'cache stats status is 200': (r) => r.status === 200,
    'cache stats has keys info': (r) => r.json('stats.keys') !== undefined,
  }) || errorRate.add(1);

  sleep(1);

  // Test 5: Rate limit config
  let rateLimitRes = http.get(`${TARGET_URL}/api/rate-limits/config`);
  check(rateLimitRes, {
    'rate limit config status is 200': (r) => r.status === 200,
    'rate limit has tiers': (r) => r.json('data.tiers') !== undefined,
  }) || errorRate.add(1);

  sleep(2);
}

export function handleSummary(data) {
  return {
    'k6-results.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;
  
  let summary = `
${indent}Execution Summary:
${indent}  scenarios: ${data.root_group.checks.length}
${indent}  checks: ${data.metrics.checks.values.passes} passed, ${data.metrics.checks.values.fails} failed
${indent}  http_reqs: ${data.metrics.http_reqs.values.count}
${indent}  http_req_duration: avg=${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
${indent}                     p95=${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
${indent}                     p99=${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms
${indent}  error_rate: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%
`;
  
  return summary;
}
