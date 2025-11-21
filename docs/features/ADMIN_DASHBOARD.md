# Admin Monitoring Dashboard

## Overview

The Admin Monitoring Dashboard provides comprehensive real-time visibility into the Dharma IAC Platform's health, performance, and operations. It centralizes monitoring data from Prometheus, circuit breakers, cache systems, feature flags, and user activity.

## Access

**URL**: http://localhost:3000/admin

**Requirements**:
- Admin role authentication
- Valid Bearer token with admin privileges

## Dashboard Sections

### 1. Overview Tab

The Overview tab displays high-level system metrics and health indicators.

#### Metric Cards

**Total Requests**
- Real-time count of HTTP requests processed
- Change indicator (percentage increase/decrease)
- Color: Green
- Icon: Trending Up
- Refreshes every 30 seconds

**Average Response Time**
- Mean response time across all endpoints (milliseconds)
- Change indicator showing performance trend
- Color: Blue
- Icon: Speed
- Target: < 200ms for optimal performance

**Cache Hit Rate**
- Percentage of requests served from cache
- Higher is better (reduces database load)
- Color: Orange
- Icon: Memory
- Target: > 80% hit rate

**Active Connections**
- Current number of open HTTP connections
- Indicates system load
- Color: Purple
- Icon: Cloud
- Monitor for connection exhaustion

#### Circuit Breakers Status Table

Displays the health of all service circuit breakers:

| Column | Description |
|--------|-------------|
| Service | Service name (e.g., ai-engine, blueprint-service) |
| State | Current breaker state (open/closed/half-open) |
| Failures | Total number of failed calls |
| Success Rate | Percentage of successful calls |

**State Color Coding:**
- 🟢 **Closed (Green)**: Service healthy, all requests passing
- 🔴 **Open (Red)**: Service failing, requests blocked
- 🟡 **Half-Open (Yellow)**: Testing if service recovered

**When to Act:**
- State changes to Open → Investigate service immediately
- Success Rate < 95% → Check service logs
- Failures increasing → Review service dependencies

#### Cache Statistics Panel

**Metrics:**
- **Hit Rate**: Percentage with visual progress bar (target > 80%)
- **Total Keys**: Number of cached entries
- **Memory Usage**: Redis memory consumption in MB

**Optimization Tips:**
- Hit rate < 80% → Review TTL settings, add more caching
- Memory usage high → Consider eviction policies
- Growing keys → Check for cache key leaks

---

### 2. Feature Flags Tab

Manage feature flags with real-time updates.

#### Feature Flags Table

| Column | Description |
|--------|-------------|
| Name | Flag identifier (e.g., ai_recommendations) |
| Description | Human-readable flag purpose |
| Enabled | Toggle switch for on/off |
| Rollout | Percentage bar showing gradual rollout |
| Targeting | Subscription tiers or user count |
| Actions | Edit, History, Delete buttons |

#### Flag Operations

**Toggle On/Off**
- Click switch to instantly enable/disable
- No deployment required
- Takes effect immediately

**Create New Flag**
1. Click "New Flag" button
2. Enter flag name (snake_case)
3. Set description
4. Configure rollout percentage (0-100%)
5. Select target subscriptions
6. Choose environments
7. Save

**Edit Flag**
1. Click edit icon (✏️)
2. Modify rollout percentage
3. Update targeting rules
4. Save changes
5. View audit trail

**View History**
1. Click history icon (🕐)
2. See all changes with timestamps
3. Identify who made changes
4. Review rollout progression

**Delete Flag**
1. Click delete icon (🗑️)
2. Confirm deletion
3. Flag removed from system

#### Rollout Strategies

**Canary Deployment (1-5%)**
```
Enable: true
Rollout: 5%
Target: All subscriptions
Environment: Production
```
Monitor for 24-48 hours before increasing.

**Beta Testing (Pro/Enterprise)**
```
Enable: true
Rollout: 100%
Target: Pro, Enterprise
Environment: All
```
Premium users get early access.

**Environment Testing**
```
Enable: true
Rollout: 100%
Target: All
Environment: Staging
```
Test in staging before production.

---

### 3. Monitoring Tab

Links to external monitoring tools:

**Grafana Dashboards**
- **URL**: http://localhost:3030
- **Dashboards**:
  - API Gateway Performance
  - Circuit Breakers
  - Cache Performance
  - Rate Limiting
- **Login**: admin / admin (default)

**Jaeger Tracing**
- **URL**: http://localhost:16686
- **Features**:
  - Distributed trace visualization
  - Service dependency graph
  - Performance bottleneck identification
  - Error trace analysis

**Prometheus Metrics**
- **URL**: http://localhost:9090
- **Query Interface**: PromQL for custom queries
- **Targets**: View metric scraping health

---

### 4. Logs Tab

*(Coming Soon)*

Real-time log streaming with filtering:
- Error logs
- Warning logs
- Audit logs
- User activity logs

**Planned Features:**
- Search by log level
- Filter by service
- Time range selection
- Export logs

---

## API Endpoints

The dashboard uses these admin-only endpoints:

### Dashboard Overview
```http
GET /api/admin/dashboard/overview
Authorization: Bearer <admin_token>
```

Returns:
- Total requests
- Average response time
- Active connections
- Error rate
- Timestamp

### Metrics Summary
```http
GET /api/admin/metrics/summary
Authorization: Bearer <admin_token>
```

Returns:
- HTTP metrics
- Circuit breaker trips
- Cache hit rate
- Rate limit blocks

### Circuit Breaker Stats
```http
GET /api/admin/circuit-breakers/stats
Authorization: Bearer <admin_token>
```

Returns array of circuit breakers with:
- Name
- State (open/closed/half-open)
- Failure/success counts
- Last failure/success timestamps

### Cache Statistics
```http
GET /api/admin/cache/stats
Authorization: Bearer <admin_token>
```

Returns:
- Total keys
- Hit/miss counts
- Hit rate percentage
- Memory usage
- Evicted/expired keys

### Active User Sessions
```http
GET /api/admin/users/active
Authorization: Bearer <admin_token>
```

Returns:
- Session count
- User details (ID, email, subscription)
- Last activity timestamp
- IP address

### System Health
```http
GET /api/admin/health/detailed
Authorization: Bearer <admin_token>
```

Returns:
- Service health (Redis, Database, API Gateway)
- Latency measurements
- Uptime

### Rate Limit Stats
```http
GET /api/admin/rate-limits/stats
Authorization: Bearer <admin_token>
```

Returns:
- Total/blocked/allowed requests
- Block rate percentage
- Stats by subscription tier

### Error Logs
```http
GET /api/admin/logs/errors?limit=50
Authorization: Bearer <admin_token>
```

Returns recent error logs from Redis.

---

## Real-Time Updates

**Auto-Refresh Interval**: 30 seconds

**Manual Refresh**: Click "Refresh" button in top-right corner

**WebSocket Support** *(Coming Soon)*:
- Push-based updates
- Instant notification of circuit breaker state changes
- Real-time flag toggle events
- Live error alerts

---

## Alerting Scenarios

### Critical: Circuit Breaker Opens

**Symptoms:**
- Circuit breaker state changes to "Open"
- Success rate drops below 50%
- Failures spike

**Actions:**
1. Check service logs in Grafana
2. View traces in Jaeger for failing requests
3. Restart service if unrecoverable
4. Use kill switch: Disable feature flag

### Warning: Cache Hit Rate Drops

**Symptoms:**
- Hit rate falls below 80%
- Response times increase
- Database load increases

**Actions:**
1. Review cache TTL settings
2. Check for cache key invalidation issues
3. Analyze top cache key patterns
4. Consider increasing cache memory

### Warning: High Error Rate

**Symptoms:**
- Error rate > 5%
- 5xx status codes increasing

**Actions:**
1. Check error logs in dashboard
2. Review recent deployments
3. Examine traces for failing requests
4. Consider rolling back recent changes

### Warning: Rate Limit Blocks Increasing

**Symptoms:**
- Block rate > 10%
- Many users near quota limits

**Actions:**
1. Identify top users/IPs
2. Check for potential abuse
3. Consider increasing limits for legitimate users
4. Implement API key management

---

## Integration with Other Tools

### Grafana Dashboards

**Access from Dashboard**: Click "Monitoring" tab → Grafana link

**Key Dashboards:**
1. **API Gateway Performance**
   - Request rate, error rate, latency percentiles
   - Use for: General performance monitoring

2. **Circuit Breakers**
   - Breaker states, success rates, failure types
   - Use for: Service health monitoring

3. **Cache Performance**
   - Hit rates, operation duration, memory usage
   - Use for: Cache optimization

4. **Rate Limiting**
   - Requests by result, blocks by tier
   - Use for: Quota management

### Jaeger Tracing

**Access from Dashboard**: Click "Monitoring" tab → Jaeger link

**Use Cases:**
1. **Trace Failing Requests**
   - Find traces with errors
   - Identify which service failed
   - View error details and stack traces

2. **Performance Analysis**
   - View span durations
   - Identify slow database queries
   - Find bottlenecks in request flow

3. **Dependency Mapping**
   - Visualize service dependencies
   - Understand request flow
   - Plan infrastructure changes

### Prometheus

**Access from Dashboard**: Click "Monitoring" tab → Prometheus link

**Useful Queries:**
```promql
# Request rate by status
rate(http_requests_total[5m])

# P95 latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Cache hit rate
rate(cache_hits_total[5m]) / rate(cache_operations_total[5m])

# Circuit breaker state
circuit_breaker_state_open
```

---

## Security Considerations

### Authentication

**All admin endpoints require:**
- Valid JWT token with admin role
- Token in Authorization header: `Bearer <token>`

**Unauthorized Access:**
- Returns 401 Unauthorized
- Logs access attempt
- Triggers security alert

### Audit Trail

**All admin actions are logged:**
- Feature flag changes
- Dashboard access
- Configuration updates
- Timestamp and user ID

**Access logs via:**
```http
GET /api/admin/audit-trail
Authorization: Bearer <admin_token>
```

### Rate Limiting

**Admin endpoints have higher limits:**
- Standard users: 100 req/hour
- Admins: 10,000 req/hour

**Prevents:**
- Dashboard abuse
- API spam
- Resource exhaustion

---

## Performance Optimization

### Dashboard Loading

**Optimization techniques:**
- Parallel API calls for metrics
- In-memory caching (30s TTL)
- Debounced refresh button
- Lazy loading of tabs

**Load Times:**
- Initial load: < 2 seconds
- Refresh: < 500ms
- Tab switch: Instant (cached)

### Metric Collection

**Efficient data gathering:**
- Prometheus aggregates metrics (no raw data)
- Redis INFO commands (optimized)
- Circuit breaker stats (in-memory)
- No database queries for dashboard

---

## Troubleshooting

### Dashboard Not Loading

**Check:**
1. Admin role in JWT token
2. API Gateway running (port 3000)
3. Redis connection healthy
4. Browser console for errors

**Fix:**
```bash
# Verify API Gateway
curl http://localhost:3000/health

# Check Redis
redis-cli ping

# Review logs
docker-compose logs api-gateway
```

### Metrics Not Updating

**Check:**
1. Prometheus scraping (http://localhost:9090/targets)
2. Metrics endpoint (http://localhost:3000/metrics)
3. Refresh interval (should be 30s)

**Fix:**
```bash
# Restart metrics collectors
curl -X POST http://localhost:3000/api/admin/metrics/restart \
  -H "Authorization: Bearer <admin_token>"
```

### Feature Flag Toggle Not Working

**Check:**
1. Admin role in token
2. Redis connection
3. Browser console errors

**Fix:**
```bash
# Check Redis
redis-cli
> GET feature_flag:my_flag

# Verify API
curl -X PUT http://localhost:3000/api/feature-flags/my_flag \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

### Circuit Breaker Stats Missing

**Check:**
1. Services running
2. Circuit breakers initialized
3. API calls being made

**Fix:**
```typescript
// Verify circuit breakers exist
import { getCircuitBreakerStats } from './utils/circuitBreaker';
console.log(getCircuitBreakerStats());
```

---

## Best Practices

### Monitoring Routine

**Daily:**
- Check Overview tab for anomalies
- Review error rate trends
- Monitor cache hit rates
- Verify circuit breakers closed

**Weekly:**
- Review feature flag rollouts
- Analyze Grafana dashboards
- Check rate limit usage
- Plan capacity adjustments

**Monthly:**
- Review audit trail
- Clean up old flags
- Update alert thresholds
- Optimize cache policies

### Incident Response

**When alert triggers:**

1. **Check Dashboard Overview**
   - Identify affected component
   - Note error rate and timing

2. **Drill Down**
   - View specific metrics in Grafana
   - Find failing traces in Jaeger
   - Check logs for errors

3. **Mitigate**
   - Use kill switch (feature flags)
   - Restart failing services
   - Scale resources if needed

4. **Investigate**
   - Review recent deployments
   - Check dependency health
   - Analyze trace data

5. **Document**
   - Record in audit trail
   - Update runbooks
   - Create post-mortem

### Feature Rollout

**Recommended process:**

1. **Deploy with Flag Off**
   - Merge code to production
   - Flag at 0% rollout
   - Verify deployment successful

2. **Internal Testing**
   - Enable for admin users
   - Test thoroughly
   - Fix any issues

3. **Canary (1-5%)**
   - Increase to 5%
   - Monitor dashboard for 24h
   - Check error rates

4. **Gradual Increase**
   - 5% → 10% → 25% → 50%
   - Monitor at each step
   - Pause if issues arise

5. **Full Rollout**
   - Increase to 100%
   - Monitor for 1 week
   - Remove flag from code

---

## Future Enhancements

### Planned Features

**Q1 2024:**
- WebSocket real-time updates
- Custom alert configuration
- Log streaming interface
- User session replay

**Q2 2024:**
- ML-powered anomaly detection
- Predictive scaling recommendations
- Auto-remediation workflows
- Advanced analytics dashboard

**Q3 2024:**
- Multi-tenancy support
- Custom dashboard builder
- Report generation
- Mobile app

---

## Support

- **Dashboard URL**: http://localhost:3000/admin
- **API Docs**: `/docs/api/ADMIN_API.md`
- **Grafana**: http://localhost:3030
- **Jaeger**: http://localhost:16686
- **Prometheus**: http://localhost:9090

For technical support, contact the platform team or file an issue in the repository.
