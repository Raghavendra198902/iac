# Observability

Comprehensive monitoring and observability for IAC Dharma.

---

## Observability Stack

```
┌─────────────────────────────────────────┐
│           Application Services           │
│  (API Gateway, Blueprint, IAC Gen, etc) │
└─────────┬─────────────┬─────────────┬───┘
          │             │             │
   Metrics│      Logs   │    Traces   │
          ▼             ▼             ▼
    ┌─────────┐   ┌─────────┐   ┌─────────┐
    │Prometheus│   │  Loki   │   │ Jaeger  │
    │  :9090   │   │  :3100  │   │ :16686  │
    └────┬─────┘   └────┬────┘   └────┬────┘
         │              │             │
         └──────────────┼─────────────┘
                        ▼
                  ┌─────────┐
                  │ Grafana │
                  │  :3030  │
                  └─────────┘
```

---

## Metrics (Prometheus)

### Access Prometheus

```
URL: http://localhost:9090
```

### Key Metrics

**API Metrics**:
```promql
# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m])

# Request duration (P95)
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Throughput
sum(rate(http_requests_total[1m]))
```

**System Metrics**:
```promql
# CPU usage
process_cpu_seconds_total

# Memory usage
process_resident_memory_bytes

# Goroutines/Threads
go_goroutines
```

**Database Metrics**:
```promql
# Connection pool
pg_stat_activity_count

# Query duration
rate(pg_stat_statements_mean_time[5m])

# Slow queries
pg_stat_statements_calls{mean_time > 100}
```

### Alerting Rules

```yaml
# prometheus/rules/alerts.yml
groups:
  - name: api_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"
```

---

## Dashboards (Grafana)

### Access Grafana

```
URL: http://localhost:3030
Default Login: admin/admin
```

### Pre-configured Dashboards

1. **System Overview**
   - Service health status
   - Request rates and errors
   - Resource usage (CPU, memory)
   - Active users and deployments

2. **API Performance**
   - Request latency (P50, P95, P99)
   - Throughput by endpoint
   - Error rates by service
   - Response time distribution

3. **Database Metrics**
   - Connection pool usage
   - Query performance
   - Slow query log
   - Transaction rates

4. **Infrastructure Monitoring**
   - Container metrics
   - Network I/O
   - Disk usage
   - Service dependencies

### Creating Custom Dashboards

```bash
# Import dashboard JSON
curl -X POST http://localhost:3030/api/dashboards/db \
  -H "Content-Type: application/json" \
  -d @dashboard.json

# Export dashboard
curl http://localhost:3030/api/dashboards/uid/abc123
```

---

## Distributed Tracing (Jaeger)

### Access Jaeger UI

```
URL: http://localhost:16686
```

### Viewing Traces

1. Navigate to Jaeger UI
2. Select service (e.g., "api-gateway")
3. Click "Find Traces"
4. View trace details and spans

### Trace Propagation

```typescript
// Automatic trace context propagation
import { trace } from '@opentelemetry/api';

const span = trace.getActiveSpan();
span?.setAttribute('user.id', userId);
span?.addEvent('Blueprint created');
```

### Sampling Configuration

```bash
# Environment variable
JAEGER_SAMPLING_RATE=0.1  # 10% sampling

# For debugging, use 100%
JAEGER_SAMPLING_RATE=1.0
```

---

## Logging (Loki)

### Access Logs in Grafana

1. Go to Grafana → Explore
2. Select Loki data source
3. Enter LogQL query:

```logql
# All logs from api-gateway
{container="api-gateway"}

# Error logs only
{container="api-gateway"} |= "error"

# Logs with specific user
{container="api-gateway"} | json | user_id="123"

# Rate of errors
rate({container="api-gateway"} |= "error" [5m])
```

### Structured Logging

```typescript
// Use structured logs
logger.info('Blueprint created', {
  blueprintId: '123',
  userId: 'user-456',
  provider: 'aws',
  timestamp: new Date()
});
```

### Log Levels

```
ERROR - Critical issues
WARN  - Warning messages
INFO  - General information
DEBUG - Debugging details
```

---

## Alerts and Notifications

### Alertmanager Configuration

```yaml
# alertmanager/config.yml
route:
  receiver: 'slack'
  
receivers:
  - name: 'slack'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/...'
        channel: '#alerts'
```

### Alert Examples

```yaml
# High CPU usage
- alert: HighCPUUsage
  expr: rate(process_cpu_seconds_total[1m]) > 0.8
  for: 5m
  annotations:
    summary: "CPU usage above 80%"

# Service down
- alert: ServiceDown
  expr: up{job="api-gateway"} == 0
  for: 1m
  annotations:
    summary: "API Gateway is down"
```

---

## Health Checks

### Service Health Endpoints

```bash
# API Gateway
curl http://localhost:3000/health

# Blueprint Service
curl http://localhost:3001/health

# IAC Generator
curl http://localhost:3002/health
```

### Health Check Response

```json
{
  "status": "healthy",
  "timestamp": "2025-11-21T10:00:00Z",
  "uptime": 3600,
  "checks": {
    "database": "healthy",
    "redis": "healthy",
    "external_api": "healthy"
  }
}
```

---

## Performance Monitoring

### Real User Monitoring (RUM)

```typescript
// Track user interactions
window.addEventListener('load', () => {
  performance.mark('page-load-complete');
  
  const loadTime = performance.now();
  analytics.track('page_load', { loadTime });
});
```

### Custom Metrics

```typescript
// Instrument code with custom metrics
import { metrics } from './monitoring';

metrics.counter('blueprint.created').inc();
metrics.histogram('blueprint.generation_time').observe(duration);
metrics.gauge('active_deployments').set(count);
```

---

## Troubleshooting

### No Metrics in Prometheus

```bash
# Check targets
curl http://localhost:9090/api/v1/targets

# Verify service exposes metrics
curl http://localhost:3000/metrics

# Check Prometheus logs
docker logs prometheus
```

### Grafana Dashboard Empty

```bash
# Test data source connection
curl -X POST http://localhost:3030/api/datasources/proxy/1/api/v1/query \
  -d 'query=up'

# Check Grafana logs
docker logs grafana
```

### Missing Traces in Jaeger

```bash
# Verify Jaeger agent
docker ps | grep jaeger

# Check sampling rate
echo $JAEGER_SAMPLING_RATE

# View application logs for trace export
docker logs api-gateway | grep "trace"
```

---

## Best Practices

1. **Use consistent naming** for metrics and logs
2. **Add context** with labels and attributes
3. **Set appropriate sampling rates** (10% for production)
4. **Create actionable alerts** with clear thresholds
5. **Document dashboard queries**
6. **Use structured logging** with JSON format
7. **Monitor business metrics** in addition to technical metrics
8. **Set up SLIs and SLOs** for key services

---

Last Updated: November 21, 2025 | [Back to Home](Home)
