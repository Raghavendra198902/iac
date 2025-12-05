import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const requestCount = new Counter('requests');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 users
    { duration: '2m', target: 200 },   // Ramp up to 200 users
    { duration: '5m', target: 200 },   // Stay at 200 users
    { duration: '2m', target: 500 },   // Spike to 500 users
    { duration: '5m', target: 500 },   // Stay at 500 users
    { duration: '2m', target: 0 },     // Ramp down to 0 users
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'], // 95% of requests under 500ms, 99% under 1s
    'http_req_failed': ['rate<0.01'],                  // Error rate should be less than 1%
    'errors': ['rate<0.05'],                           // Custom error rate threshold
  },
};

// Test scenarios
export default function () {
  const scenarios = [
    testHealthCheck,
    testBlueprintsList,
    testBlueprintDetail,
    testIACGeneration,
    testCostEstimation,
  ];

  // Randomly execute one scenario
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  scenario();
  
  sleep(1);
}

function testHealthCheck() {
  const res = http.get(`${BASE_URL}/health`);
  
  const passed = check(res, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 100ms': (r) => r.timings.duration < 100,
  });

  errorRate.add(!passed);
  responseTime.add(res.timings.duration);
  requestCount.add(1);
}

function testBlueprintsList() {
  const res = http.get(`${BASE_URL}/api/blueprints`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const passed = check(res, {
    'blueprints list status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'blueprints list response time < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!passed);
  responseTime.add(res.timings.duration);
  requestCount.add(1);
}

function testBlueprintDetail() {
  const blueprintId = Math.floor(Math.random() * 100) + 1;
  const res = http.get(`${BASE_URL}/api/blueprints/${blueprintId}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const passed = check(res, {
    'blueprint detail response is valid': (r) => r.status === 200 || r.status === 404 || r.status === 401,
    'blueprint detail response time < 300ms': (r) => r.timings.duration < 300,
  });

  errorRate.add(!passed);
  responseTime.add(res.timings.duration);
  requestCount.add(1);
}

function testIACGeneration() {
  const payload = JSON.stringify({
    name: `test-infrastructure-${Date.now()}`,
    provider: 'aws',
    resources: [
      { type: 'vpc', name: 'main-vpc' },
      { type: 'subnet', name: 'public-subnet' },
    ],
  });

  const res = http.post(`${BASE_URL}/api/iac/generate`, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const passed = check(res, {
    'iac generation response is valid': (r) => r.status === 200 || r.status === 400 || r.status === 401,
    'iac generation response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  errorRate.add(!passed);
  responseTime.add(res.timings.duration);
  requestCount.add(1);
}

function testCostEstimation() {
  const payload = JSON.stringify({
    provider: 'aws',
    region: 'us-east-1',
    resources: [
      { type: 't3.medium', quantity: 2 },
      { type: 'rds.t3.small', quantity: 1 },
    ],
  });

  const res = http.post(`${BASE_URL}/api/costing/estimate`, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const passed = check(res, {
    'cost estimation response is valid': (r) => r.status === 200 || r.status === 400 || r.status === 401,
    'cost estimation response time < 800ms': (r) => r.timings.duration < 800,
  });

  errorRate.add(!passed);
  responseTime.add(res.timings.duration);
  requestCount.add(1);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'performance-test-results.json': JSON.stringify(data),
  };
}

function textSummary(data, options) {
  const { indent = '', enableColors = false } = options || {};
  let summary = '\n';
  
  summary += `${indent}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  summary += `${indent}  PERFORMANCE TEST SUMMARY\n`;
  summary += `${indent}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  summary += `${indent}Total Requests:      ${data.metrics.requests.values.count}\n`;
  summary += `${indent}Failed Requests:     ${data.metrics.http_req_failed.values.passes}\n`;
  summary += `${indent}Error Rate:          ${(data.metrics.errors.values.rate * 100).toFixed(2)}%\n`;
  summary += `${indent}Avg Response Time:   ${data.metrics.response_time.values.avg.toFixed(2)}ms\n`;
  summary += `${indent}P95 Response Time:   ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += `${indent}P99 Response Time:   ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n`;
  summary += `${indent}Max Response Time:   ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n`;
  summary += `${indent}Requests/sec:        ${data.metrics.http_reqs.values.rate.toFixed(2)}\n`;
  
  summary += `\n${indent}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  
  return summary;
}
