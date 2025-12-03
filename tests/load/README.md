# Load Testing with k6

## Overview
This directory contains k6 load testing scripts for the IAC Platform v2.0. Tests are designed to validate performance targets and scalability.

## Performance Targets (v2.0)
- **Concurrent Users**: 10,000
- **API Response Time**: <100ms (p95)
- **Throughput**: >5,000 req/sec
- **Cache Hit Rate**: >80%
- **PgBouncer Pool Efficiency**: >90%
- **Error Rate**: <0.1%

## Test Scenarios

### 1. Baseline Test (`baseline.js`)
- **Purpose**: Establish performance baseline
- **Load**: 100 concurrent users
- **Duration**: 5 minutes
- **Ramp-up**: 30 seconds
- **Use Case**: Initial validation, regression testing

### 2. Stress Test (`stress.js`)
- **Purpose**: Test system under expected production load
- **Load**: 1,000 concurrent users
- **Duration**: 10 minutes
- **Ramp-up**: 2 minutes
- **Use Case**: Production readiness validation

### 3. Spike Test (`spike.js`)
- **Purpose**: Test system under peak/burst traffic
- **Load**: 10,000 concurrent users
- **Duration**: 15 minutes
- **Ramp-up**: 5 minutes, spike at 10 min
- **Use Case**: Black Friday, product launches

### 4. Soak Test (`soak.js`)
- **Purpose**: Test system stability over extended period
- **Load**: 500 concurrent users
- **Duration**: 4 hours
- **Use Case**: Memory leaks, resource exhaustion

### 5. API Test (`api-endpoints.js`)
- **Purpose**: Test all critical API endpoints
- **Load**: 200 concurrent users
- **Duration**: 10 minutes
- **Coverage**: Authentication, blueprints, infrastructure, cost analysis

## Installation

### macOS
```bash
brew install k6
```

### Linux (Debian/Ubuntu)
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Docker (Alternative)
```bash
docker pull grafana/k6:latest
alias k6='docker run --rm -i --network=host grafana/k6'
```

## Running Tests

### Prerequisites
1. Start v2.0 services:
   ```bash
   docker-compose -f docker-compose.v2.yml up -d
   ```

2. Wait for health checks (30-60 seconds):
   ```bash
   docker-compose -f docker-compose.v2.yml ps
   ```

### Run Individual Tests
```bash
# Baseline test (100 users)
npm run load:baseline

# Stress test (1,000 users)
npm run load:stress

# Spike test (10,000 users)
npm run load:spike

# Soak test (4 hours)
npm run load:soak

# API endpoints test
npm run load:api
```

### Run All Tests
```bash
npm run load:all
```

### Run with Custom Options
```bash
# Custom VUs and duration
k6 run --vus 500 --duration 10m tests/load/stress.js

# Output to file
k6 run --out json=results.json tests/load/baseline.js

# Run with environment variables
API_BASE_URL=https://staging.example.com k6 run tests/load/baseline.js
```

## Configuration

### Environment Variables
- `API_BASE_URL`: Base URL for API (default: http://localhost:3000)
- `K6_VUS`: Number of virtual users (overrides script default)
- `K6_DURATION`: Test duration (overrides script default)
- `K6_ITERATIONS`: Total iterations (alternative to duration)

### Thresholds
All tests include the following thresholds:
- `http_req_duration{p(95)<100}`: 95th percentile < 100ms
- `http_req_duration{p(99)<200}`: 99th percentile < 200ms
- `http_req_failed<0.01`: Error rate < 1%
- `http_reqs>50`: Minimum 50 req/sec throughput

## Metrics

### Key Metrics
- **http_req_duration**: Request duration (includes all phases)
- **http_req_waiting**: Time to first byte (TTFB)
- **http_req_connecting**: TCP connection time
- **http_req_sending**: Time sending data
- **http_req_receiving**: Time receiving data
- **http_reqs**: Total HTTP requests
- **http_req_failed**: Failed HTTP requests
- **vus**: Current number of active virtual users
- **vus_max**: Maximum virtual users
- **iterations**: Total completed iterations
- **data_received**: Total data received
- **data_sent**: Total data sent

### Custom Metrics
- **cache_hit_rate**: Percentage of requests served from cache
- **auth_success_rate**: Authentication success rate
- **api_availability**: API uptime during test

## Analysis

### Real-time Monitoring
```bash
# Terminal output with live updates
k6 run tests/load/stress.js

# Output to InfluxDB + Grafana
k6 run --out influxdb=http://localhost:8086/k6 tests/load/stress.js
```

### Post-test Analysis
```bash
# Generate JSON report
k6 run --out json=results/stress-$(date +%Y%m%d-%H%M%S).json tests/load/stress.js

# Generate HTML report (with k6-reporter)
k6 run --out json=results.json tests/load/stress.js
k6-to-junit results.json > results.xml
```

### Compare Results
```bash
# Compare baseline vs stress
k6 run --out json=baseline.json tests/load/baseline.js
k6 run --out json=stress.json tests/load/stress.js
# Use external tools to compare JSON outputs
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure services are running: `docker-compose -f docker-compose.v2.yml ps`
   - Check API Gateway logs: `docker-compose -f docker-compose.v2.yml logs api-gateway`

2. **High Error Rate**
   - Check PgBouncer pool: `psql -h localhost -p 6432 -U postgres -c 'SHOW POOLS'`
   - Check Redis memory: `redis-cli -h localhost INFO memory`
   - Review rate limiting configuration

3. **Slow Response Times**
   - Check cache hit rate: `redis-cli -h localhost INFO stats`
   - Review database slow queries: Check PostgreSQL logs
   - Monitor CPU/memory usage: `docker stats`

4. **Resource Exhaustion**
   - Increase Docker resources (CPU/memory)
   - Tune PgBouncer pool size
   - Increase Redis max memory
   - Check system ulimits: `ulimit -a`

## Best Practices

1. **Gradual Load Increase**: Always start with baseline, then stress, then spike
2. **Warm-up Period**: Include ramp-up time to avoid cold start issues
3. **Cool-down Period**: Include ramp-down to gracefully release resources
4. **Realistic Scenarios**: Mix read/write operations matching production patterns
5. **Data Cleanup**: Reset test data between runs for consistent results
6. **Monitoring**: Watch system metrics during tests (CPU, memory, disk I/O)
7. **Iteration**: Run tests multiple times and average results

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Load Testing
on: [pull_request]
jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Start services
        run: docker-compose -f docker-compose.v2.yml up -d
      - name: Install k6
        run: |
          sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      - name: Run baseline test
        run: k6 run tests/load/baseline.js
```

## Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Examples](https://github.com/grafana/k6-examples)
- [Performance Testing Methodology](https://k6.io/docs/testing-guides/test-types/)
- [k6 Cloud](https://k6.io/cloud/) (optional SaaS platform)

## Support

For issues or questions:
1. Check k6 documentation
2. Review test script comments
3. Check Docker Compose logs
4. Review ROADMAP_v2.0.md for performance targets
5. Contact DevOps team
