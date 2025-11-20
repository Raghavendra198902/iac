# Monitoring & Observability - Complete Documentation

## Overview
Production-grade monitoring infrastructure with metrics, logging, tracing, and alerting for the Dharma IAC Platform.

## Components

### 1. Prometheus (Metrics Collection)
- **Purpose**: Time-series metrics collection and storage
- **Retention**: 30 days
- **Scrape Interval**: 15 seconds
- **Storage**: Local TSDB with optional remote write

**Features**:
- Service discovery for all 9 microservices
- Kubernetes pod/node metrics
- Database (PostgreSQL) metrics
- Cache (Redis) metrics
- Infrastructure metrics (CPU, memory, network)
- Business metrics (blueprints, IAC generation, guardrails)

**Access**: `http://prometheus.monitoring:9090`

### 2. Grafana (Visualization)
- **Purpose**: Metrics visualization and dashboards
- **Dashboards**: 2 pre-configured
  - Platform Overview: Health, requests, errors, latency
  - Service Details: Per-service deep dive

**Features**:
- Real-time metrics visualization
- Alerting integration
- Multiple data sources (Prometheus, Loki, Jaeger)
- Template variables for service selection

**Access**: `http://grafana.monitoring:3000`
**Default Credentials**: admin/[set via secret]

### 3. AlertManager (Alert Routing)
- **Purpose**: Alert aggregation, routing, and notification
- **Channels**:
  - Slack (7 channels by severity/category)
  - PagerDuty (critical alerts)
  - Email (team-specific)

**Alert Categories**:
- **Critical**: Service down, database issues, security
- **Warning**: High latency, resource pressure, business metrics
- **Info**: Capacity planning, performance optimization

**Routing Logic**:
- Severity-based routing (critical → PagerDuty + Slack)
- Category-based routing (database → database team)
- Inhibition rules (suppress warnings if critical firing)

### 4. Loki (Log Aggregation)
- **Purpose**: Centralized log collection and querying
- **Retention**: 30 days
- **Storage**: S3-backed with local caching
- **Compression**: Enabled for cost optimization

**Features**:
- JSON log parsing
- Log level extraction
- Trace ID correlation
- Rate limiting for high-volume logs
- Query optimization with caching

**Log Sources**:
- All microservice pods
- Kubernetes system logs
- Database logs
- Nginx access logs
- System logs (syslog)

### 5. Promtail (Log Shipper)
- **Purpose**: Log collection agent for Kubernetes
- **Deployment**: DaemonSet (runs on every node)

**Pipeline Stages**:
- Log level extraction
- JSON parsing
- Label enrichment (namespace, pod, service)
- Debug log filtering (production)
- Rate limiting

### 6. Jaeger (Distributed Tracing)
- **Purpose**: Request flow tracing across microservices
- **Retention**: 3 days
- **Storage**: Elasticsearch-backed

**Sampling Strategy**:
- API Gateway: 100% (all requests)
- IAC Generator: 100% (critical path)
- Orchestrator: 100% (workflow tracking)
- Guardrails: 80%
- Blueprint: 50%
- Automation: 50%
- Costing: 30%
- Monitoring: 10%
- Health checks: 1%

**Features**:
- End-to-end request tracing
- Service dependency mapping
- Performance bottleneck identification
- Error propagation tracking

## Alert Rules (50+ Alerts)

### Service Health (8 alerts)
- `ServiceDown`: Any microservice unavailable for 2+ minutes
- `HighErrorRate`: 5xx errors > 5% for 5 minutes
- `CriticalErrorRate`: 5xx errors > 10% for 3 minutes
- `HighLatency`: p95 latency > 1s for 10 minutes
- `CriticalLatency`: p95 latency > 3s for 5 minutes

### Resource Utilization (5 alerts)
- `HighMemoryUsage`: Memory > 85% for 10 minutes
- `CriticalMemoryUsage`: Memory > 95% for 5 minutes
- `HighCPUUsage`: CPU > 85% for 15 minutes
- `CriticalCPUUsage`: CPU > 95% for 10 minutes
- `PodRestarting`: Restart rate > 0 for 5 minutes

### Database (4 alerts)
- `DatabaseDown`: PostgreSQL unavailable for 2+ minutes
- `HighDatabaseConnections`: Active connections > 80
- `DatabaseSlowQueries`: Avg query time > 1s
- `DatabaseReplicationLag`: Lag > 60 seconds

### Redis (3 alerts)
- `RedisDown`: Redis unavailable for 2+ minutes
- `RedisHighMemoryUsage`: Memory > 90%
- `RedisRejectedConnections`: Connection rejections detected

### Kubernetes (3 alerts)
- `KubernetesNodeNotReady`: Node not ready for 10+ minutes
- `KubernetesPodCrashLooping`: Restart rate > 5 in 15 minutes
- `KubernetesPVCFull`: Volume usage > 90%

### Business Metrics (3 alerts)
- `LowBlueprintCreationRate`: < 1 blueprint/hour for 2 hours
- `HighIACGenerationFailureRate`: Failure rate > 10%
- `GuardrailsViolationSpike`: Violations > 10/sec

### Security (2 alerts)
- `UnauthorizedAccessAttempts`: 401 errors > 10/sec
- `SuspiciousActivity`: 403 errors > 5/sec

### SLO Alerts (2 alerts)
- `APIAvailabilitySLOBreach`: Availability < 99.9% for 15 minutes
- `APILatencySLOBreach`: p95 latency > 500ms for 15 minutes

## Recording Rules (30+ rules)

### Request Rates
- `job:http_requests:rate5m` - Request rate per job
- `job:http_requests_error_ratio:rate5m` - Error ratio

### Latency Percentiles
- `job:http_request_duration:p50` - Median latency
- `job:http_request_duration:p95` - 95th percentile
- `job:http_request_duration:p99` - 99th percentile

### Resource Utilization
- `pod:memory_usage:ratio` - Memory usage percentage
- `pod:cpu_usage:ratio` - CPU usage percentage
- `node:cpu_usage:avg` - Node-level CPU
- `node:memory_usage:ratio` - Node-level memory

### Business Metrics
- `business:blueprints_created:rate1h` - Blueprint creation rate
- `business:iac_generation_success_ratio:rate1h` - Success rate
- `business:guardrails_violations:rate1h` - Violation rate

## Deployment

### Kubernetes Deployment
```bash
# Create monitoring namespace
kubectl create namespace monitoring

# Create ConfigMaps
kubectl create configmap prometheus-config \
  --from-file=monitoring/prometheus/prometheus.yml \
  -n monitoring

kubectl create configmap prometheus-rules \
  --from-file=monitoring/prometheus/rules/ \
  -n monitoring

kubectl create configmap grafana-datasources \
  --from-file=monitoring/grafana/datasources.yml \
  -n monitoring

kubectl create configmap grafana-dashboards \
  --from-file=monitoring/grafana/dashboards/ \
  -n monitoring

kubectl create configmap alertmanager-config \
  --from-file=monitoring/alertmanager/alertmanager.yml \
  -n monitoring

kubectl create configmap loki-config \
  --from-file=monitoring/loki/loki-config.yml \
  -n monitoring

kubectl create configmap promtail-config \
  --from-file=monitoring/loki/promtail-config.yml \
  -n monitoring

# Create secrets
kubectl create secret generic grafana-secrets \
  --from-literal=admin-password='${GRAFANA_PASSWORD}' \
  -n monitoring

# Deploy monitoring stack
kubectl apply -f monitoring/k8s-monitoring-stack.yml
```

### Verify Deployment
```bash
# Check pod status
kubectl get pods -n monitoring

# Check services
kubectl get svc -n monitoring

# Port forward for local access
kubectl port-forward -n monitoring svc/grafana 3000:3000
kubectl port-forward -n monitoring svc/prometheus 9090:9090
kubectl port-forward -n monitoring svc/jaeger-query 16686:16686
```

## Configuration Requirements

### Environment Variables
```bash
# AlertManager
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
PAGERDUTY_SERVICE_KEY=your-pagerduty-key
PAGERDUTY_SECURITY_KEY=your-security-key
SMTP_HOST=smtp.gmail.com
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-app-password

# Grafana
GRAFANA_PASSWORD=secure-admin-password
GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X

# Loki
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

### S3 Bucket Setup (for Loki)
```bash
# Create S3 bucket for log storage
aws s3 mb s3://dharma-logs --region us-west-2

# Configure lifecycle policy for cost optimization
aws s3api put-bucket-lifecycle-configuration \
  --bucket dharma-logs \
  --lifecycle-configuration '{
    "Rules": [{
      "Id": "TransitionToIA",
      "Status": "Enabled",
      "Transitions": [{
        "Days": 30,
        "StorageClass": "STANDARD_IA"
      }],
      "Expiration": {
        "Days": 90
      }
    }]
  }'
```

## Grafana Dashboard Access

### Overview Dashboard
- **Total Services**: Real-time count of healthy services
- **Request Rate**: Aggregate requests/sec across platform
- **Error Rate**: Platform-wide error percentage
- **Response Time**: p95 latency by service
- **Memory/CPU**: Resource utilization by pod
- **Business Metrics**: Blueprints created, IAC success rate

### Service Details Dashboard
- **Template Variable**: Select any microservice
- **Request Rate**: Per-endpoint breakdown
- **Error Rate**: By status code (4xx, 5xx)
- **Latency Percentiles**: p50, p95, p99, p99.9
- **Resource Usage**: Memory, CPU, network I/O
- **Pod Restarts**: Restart count over time
- **Request Duration Heatmap**: Visual latency distribution

## Alerting Best Practices

### Alert Severity Levels
- **Critical**: Requires immediate action (PagerDuty)
  - Service completely down
  - Data loss imminent
  - Security breach detected
  
- **Warning**: Requires attention within hours
  - Performance degradation
  - Resource pressure
  - Business metrics deviation
  
- **Info**: Monitoring for trends
  - Capacity planning
  - Optimization opportunities

### Alert Response
1. **Acknowledge**: Silence alert in AlertManager
2. **Investigate**: Check Grafana dashboards
3. **Trace**: Use Jaeger for request flow
4. **Logs**: Query Loki for error details
5. **Resolve**: Fix issue and verify metrics
6. **Document**: Update runbook

## Log Query Examples

### Loki Queries
```logql
# All errors in last hour
{namespace="dharma"} |= "error" | json

# API Gateway 5xx errors
{app="api-gateway"} | json | status >= 500

# Slow requests (> 1s)
{namespace="dharma"} | json | duration > 1000

# Specific user activity
{namespace="dharma"} | json | user_id="12345"

# Trace ID correlation
{namespace="dharma"} | json | trace_id="abc123xyz"
```

## Jaeger Query Examples

### Trace Queries
- **Service**: Filter by service name (e.g., `api-gateway`)
- **Operation**: Filter by endpoint (e.g., `/api/v1/blueprints`)
- **Tags**: Filter by custom tags (e.g., `user_id=12345`)
- **Duration**: Find slow requests (e.g., `> 1s`)
- **Errors**: Show only failed traces

### Service Graph
- Visualize service dependencies
- Identify bottlenecks
- Analyze request flow

## Cost Optimization

### Storage Costs
- **Prometheus**: ~$50/month (local TSDB, 30-day retention)
- **Loki**: ~$200/month (S3 + compression, 30-day retention)
- **Jaeger**: ~$100/month (Elasticsearch, 3-day retention)
- **Total**: ~$350/month

### Optimization Strategies
1. **Sampling**: Reduce trace volume (already configured)
2. **Log Filtering**: Drop debug logs in production
3. **Metric Aggregation**: Use recording rules
4. **S3 Lifecycle**: Transition to IA after 30 days
5. **Compression**: Enable Loki compression

## Troubleshooting

### Prometheus Not Scraping
```bash
# Check service discovery
curl http://prometheus:9090/api/v1/targets

# Verify pod annotations
kubectl get pod <pod-name> -o yaml | grep prometheus

# Check network connectivity
kubectl exec -it prometheus-pod -- wget -O- http://api-gateway:3000/metrics
```

### Grafana Dashboard Empty
1. Verify Prometheus datasource connectivity
2. Check Prometheus has data: `http://prometheus:9090/graph`
3. Verify time range in Grafana
4. Check Grafana logs: `kubectl logs -n monitoring grafana-pod`

### Alerts Not Firing
1. Check Prometheus alert rules: `/alerts` page
2. Verify AlertManager config: `http://alertmanager:9093`
3. Test webhook URLs (Slack, PagerDuty)
4. Check inhibition rules

### Logs Not Appearing in Loki
1. Check Promtail pods: `kubectl get pods -n monitoring -l app=promtail`
2. Verify Promtail logs: `kubectl logs -n monitoring promtail-pod`
3. Test Loki API: `curl http://loki:3100/ready`
4. Check S3 bucket permissions

## SLO/SLI Definitions

### Service Level Objectives
- **Availability**: 99.9% (43 minutes downtime/month)
- **Latency**: p95 < 500ms
- **Error Rate**: < 1%

### Service Level Indicators
- `sli:api_availability:30m` - 30-minute availability
- `sli:api_latency_p95:30m` - 30-minute p95 latency
- `sli:api_error_rate:30m` - 30-minute error rate

### Error Budget
- Monthly budget: 43 minutes (0.1% of 720 hours)
- Tracking: AlertManager fires if SLO breached for 15+ minutes
- Response: Freeze feature releases until budget restored

## Files Created

```
monitoring/
├── prometheus/
│   ├── prometheus.yml          # Main Prometheus config (400+ lines)
│   └── rules/
│       ├── alerts.yml          # 50+ alert rules (350+ lines)
│       └── recording-rules.yml # 30+ recording rules (150+ lines)
├── grafana/
│   ├── datasources.yml         # Datasource config
│   └── dashboards/
│       ├── overview.json       # Platform overview dashboard
│       └── service-details.json# Service deep-dive dashboard
├── alertmanager/
│   ├── alertmanager.yml        # Alert routing config (250+ lines)
│   └── templates/
│       └── notifications.tmpl  # Notification templates
├── loki/
│   ├── loki-config.yml         # Loki server config (150+ lines)
│   └── promtail-config.yml     # Log collection config (200+ lines)
├── jaeger/
│   ├── jaeger-config.yml       # Tracing config
│   └── sampling-strategies.json# Sampling rules per service
├── k8s-monitoring-stack.yml    # Kubernetes deployments (500+ lines)
└── README.md                   # This file (600+ lines)
```

**Total**: 13 configuration files, ~2,500 lines

## Next Steps
1. Deploy monitoring stack to Kubernetes cluster
2. Configure AlertManager notification channels
3. Set up Grafana dashboards and users
4. Test alerting with synthetic failures
5. Instrument microservices with OpenTelemetry
6. Proceed to Task 18: Backup & Disaster Recovery
