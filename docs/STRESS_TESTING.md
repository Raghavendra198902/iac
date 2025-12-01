# Stress Testing Suite

Comprehensive stress testing for the IAC Dharma platform to validate system behavior under extreme load conditions.

## Overview

The stress testing suite includes 4 main test scenarios designed to identify system limits, memory leaks, and performance degradation under various load patterns.

## Test Scenarios

### 1. Spike Test 🚀
**Duration:** ~2 minutes  
**Purpose:** Test system response to sudden traffic surges

**Phases:**
- **Normal Load:** 20 concurrent users for 60s
- **Spike:** 200 concurrent users for 30s (10x increase)
- **Recovery:** 20 concurrent users for 30s

**Success Criteria:**
- 95%+ success rate during spike
- System recovers within 30s
- No cascading failures

### 2. Soak Test ⏱️
**Duration:** 5 minutes (configurable)  
**Purpose:** Identify memory leaks and resource degradation over time

**Test Pattern:**
- Sustained 100 concurrent users
- Continuous requests for extended period
- Monitor resource usage trends

**Success Criteria:**
- 95%+ success rate throughout
- Response times remain stable
- No memory leaks detected
- No resource exhaustion

### 3. Breakpoint Test 💥
**Duration:** Variable (until breaking point found)  
**Purpose:** Find maximum system capacity

**Test Pattern:**
- Start: 10 concurrent users
- Increment: +10 every 20 seconds
- Stop: When success rate < 90%

**Success Criteria:**
- Identifies clear breaking point
- Graceful degradation
- System doesn't crash

### 4. Recovery Test 🔄
**Duration:** ~2 minutes  
**Purpose:** Validate system resilience and recovery

**Phases:**
- **Normal:** 20 concurrent for 20s
- **Overload:** 300 concurrent for 10s
- **Cool Down:** 10s pause
- **Recovery:** 20 concurrent for 30s

**Success Criteria:**
- System survives overload
- Recovers to normal performance
- 95%+ success rate after recovery

## Usage

### Interactive Mode

```bash
./tests/stress-test-runner.sh
```

Menu options:
1. Spike Test
2. Soak Test
3. Breakpoint Test
4. Recovery Test
5. Quick Test (all scenarios, reduced duration)
6. Full Suite (all scenarios, full duration)
7. View Summary
8. Exit

### Command Line

```bash
# Run specific test
./tests/stress-test-runner.sh spike
./tests/stress-test-runner.sh soak
./tests/stress-test-runner.sh breakpoint
./tests/stress-test-runner.sh recovery

# Run quick test (all scenarios, reduced)
./tests/stress-test-runner.sh quick

# Run full suite
./tests/stress-test-runner.sh full

# View previous results
./tests/stress-test-runner.sh summary
```

### Direct Execution

```bash
cd tests/load

# Spike test
TEST_TYPE=spike API_BASE_URL=http://localhost:3001 node stress-test.js

# Soak test (5 minutes)
TEST_TYPE=soak DURATION=300 API_BASE_URL=http://localhost:3001 node stress-test.js

# Breakpoint test
TEST_TYPE=breakpoint MAX_CONCURRENCY=500 API_BASE_URL=http://localhost:3001 node stress-test.js

# Recovery test
TEST_TYPE=recovery API_BASE_URL=http://localhost:3001 node stress-test.js
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `API_BASE_URL` | `http://localhost:3001` | API Gateway URL |
| `TEST_TYPE` | `spike` | Test type (spike/soak/breakpoint/recovery) |
| `MAX_CONCURRENCY` | `500` | Maximum concurrent users |
| `DURATION` | `300` | Test duration in seconds |
| `RAMP_UP` | `30` | Ramp-up time in seconds |

### Custom Configuration

```bash
# Custom spike test
TEST_TYPE=spike \
MAX_CONCURRENCY=300 \
API_BASE_URL=http://production-api.com:3001 \
node stress-test.js

# Extended soak test
TEST_TYPE=soak \
DURATION=600 \
API_BASE_URL=http://localhost:3001 \
node stress-test.js
```

## Test Results

### Output Location

Results are saved to:
```
tests/results/stress/
├── spike-test-YYYYMMDD-HHMMSS.log
├── soak-test-YYYYMMDD-HHMMSS.log
├── breakpoint-test-YYYYMMDD-HHMMSS.log
└── recovery-test-YYYYMMDD-HHMMSS.log
```

### Metrics Reported

Each test reports:

**Request Statistics:**
- Total Requests
- Successful Requests
- Failed Requests
- Timeouts
- Peak Concurrency

**Performance Metrics:**
- Throughput (req/s)
- Average Response Time
- P95 Response Time
- P99 Response Time

**Status Codes:**
- Distribution of HTTP status codes
- Error types and counts

**Pass/Fail Determination:**
- Success Rate ≥ 95% → ✅ PASSED
- Success Rate < 95% → ❌ FAILED

### Sample Output

```
╔════════════════════════════════════════════════════════════════╗
║         IAC DHARMA - STRESS TESTING SUITE                     ║
╚════════════════════════════════════════════════════════════════╝

Configuration:
  Base URL:       http://localhost:3001
  Test Type:      spike
  Max Concurrency: 200
  Duration:       120s

🔐 Authenticating...
✅ Authentication successful

🚀 SPIKE TEST - Sudden traffic surge

Phase 1: Normal load (20 concurrent)...
  0s - Requests: 0, Success: 0
  10s - Requests: 200, Success: 198
  ...

Phase 2: SPIKE (200 concurrent)...
  0s - Requests: 1200, Success: 1195
  ...

Phase 3: Recovery (20 concurrent)...
  0s - Requests: 7200, Success: 7150
  ...

⏳ Waiting for pending requests...

================================================================================
STRESS TEST RESULTS
================================================================================

Test Type: SPIKE
Duration: 120.45s

📊 REQUEST STATISTICS:
  Total Requests:      7250
  Successful:          7190 (99.17%)
  Failed:              60 (0.83%)
  Timeouts:            0
  Peak Concurrency:    200

⚡ PERFORMANCE METRICS:
  Throughput:          59 req/s
  Avg Response Time:   145ms
  P95 Response Time:   280ms
  P99 Response Time:   450ms

📈 STATUS CODES:
  200: 7190 (99.17%)
  429: 45 (0.62%)
  500: 15 (0.21%)

✅ TEST CRITERIA:
  Success Rate:        99.17% (Required: 95%)
  Status:              ✅ PASSED

================================================================================
```

## Best Practices

### Before Running Tests

1. **Start required services:**
   ```bash
   docker-compose up -d
   cd backend/api-gateway && npm run dev
   ```

2. **Verify API is running:**
   ```bash
   curl http://localhost:3001/api/health
   ```

3. **Check system resources:**
   - Ensure sufficient RAM (4GB+ available)
   - Monitor CPU usage
   - Check disk space for logs

### During Tests

- Monitor system resources (htop, docker stats)
- Watch API logs for errors
- Observe database connections
- Check for memory leaks

### After Tests

1. **Review results:**
   ```bash
   ./tests/stress-test-runner.sh summary
   ```

2. **Analyze failures:**
   - Check error logs
   - Identify bottlenecks
   - Review resource usage

3. **Optimize as needed:**
   - Tune connection pools
   - Adjust rate limits
   - Scale resources

## Troubleshooting

### API Not Responding

```bash
# Check if API is running
curl http://localhost:3001/api/health

# Start API
cd backend/api-gateway && npm run dev
```

### High Failure Rate

- **Cause:** API rate limiting
- **Solution:** Adjust rate limits or reduce concurrency

### Memory Issues

- **Cause:** Memory leaks or insufficient RAM
- **Solution:** Increase Node.js memory limit
  ```bash
  NODE_OPTIONS="--max-old-space-size=4096" node stress-test.js
  ```

### Connection Timeouts

- **Cause:** Slow responses or network issues
- **Solution:** Increase timeout in test configuration

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Stress Tests

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:

jobs:
  stress-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Start services
        run: docker-compose up -d
      
      - name: Wait for API
        run: |
          timeout 60 bash -c 'until curl -sf http://localhost:3001/api/health; do sleep 2; done'
      
      - name: Run stress tests
        run: ./tests/stress-test-runner.sh quick
      
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: stress-test-results
          path: tests/results/stress/
```

## Performance Benchmarks

### Expected Results

| Test | Throughput | P95 Response | Success Rate |
|------|-----------|--------------|--------------|
| Spike | 50-60 req/s | <300ms | >95% |
| Soak | 80-100 req/s | <200ms | >98% |
| Breakpoint | Variable | Variable | Degrades gracefully |
| Recovery | 50-60 req/s | <250ms | >95% |

### System Capacity

- **Optimal Load:** 50-80 concurrent users
- **Maximum Capacity:** 150-200 concurrent users
- **Breaking Point:** ~250+ concurrent users
- **Recovery Time:** <30 seconds

## See Also

- [Testing Guide](../../docs/wiki/Testing-Guide.md)
- [Load Testing](./realistic-load-test.js)
- [Performance Tuning](../../docs/wiki/Performance-Tuning.md)
- [Monitoring](../../docs/wiki/Observability.md)
