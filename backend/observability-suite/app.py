"""
Advanced Observability & Telemetry Suite for IAC Dharma v3.0
OpenTelemetry integration with distributed tracing, metrics, and logs
"""

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from enum import Enum
from datetime import datetime, timedelta
import asyncio
import random
import uuid
import logging
import time
from collections import defaultdict
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST, CollectorRegistry
from prometheus_fastapi_instrumentator import Instrumentator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Advanced Observability & Telemetry Suite",
    description="OpenTelemetry-based distributed tracing, metrics correlation, and SLO tracking",
    version="3.0.0"
)

# Prometheus metrics
registry = CollectorRegistry()

traces_total = Counter(
    'observability_traces_total',
    'Total traces processed',
    ['service'],
    registry=registry
)

spans_total = Counter(
    'observability_spans_total',
    'Total spans processed',
    ['span_kind'],
    registry=registry
)

slo_violations = Counter(
    'observability_slo_violations_total',
    'Total SLO violations',
    ['slo_name', 'severity'],
    registry=registry
)

trace_duration = Histogram(
    'observability_trace_duration_seconds',
    'Trace duration in seconds',
    ['service'],
    registry=registry
)

# Initialize Instrumentator
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Data Models & Enums
# ============================================================================

class SpanKind(str, Enum):
    """OpenTelemetry span kinds"""
    INTERNAL = "internal"
    SERVER = "server"
    CLIENT = "client"
    PRODUCER = "producer"
    CONSUMER = "consumer"

class MetricType(str, Enum):
    """Metric types"""
    COUNTER = "counter"
    GAUGE = "gauge"
    HISTOGRAM = "histogram"
    SUMMARY = "summary"

class SLOStatus(str, Enum):
    """SLO compliance status"""
    HEALTHY = "healthy"
    WARNING = "warning"
    CRITICAL = "critical"
    BREACHED = "breached"

class Span(BaseModel):
    """Distributed tracing span"""
    trace_id: str
    span_id: str
    parent_span_id: Optional[str] = None
    name: str
    kind: SpanKind
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_ms: Optional[float] = None
    service_name: str
    attributes: Dict[str, Any] = {}
    status: str = "ok"
    error: Optional[str] = None

class Trace(BaseModel):
    """Complete distributed trace"""
    trace_id: str
    root_span: Span
    spans: List[Span]
    total_duration_ms: float
    service_count: int
    span_count: int
    error_count: int
    start_time: datetime
    end_time: datetime

class Metric(BaseModel):
    """Telemetry metric"""
    name: str
    type: MetricType
    value: float
    timestamp: datetime
    labels: Dict[str, str] = {}
    unit: str = ""

class SLO(BaseModel):
    """Service Level Objective"""
    id: str = Field(default_factory=lambda: f"slo-{uuid.uuid4().hex[:8]}")
    name: str
    service: str
    description: str
    target_percentage: float  # e.g., 99.9
    window_days: int = 30
    metric: str  # e.g., "availability", "latency", "error_rate"
    threshold: float  # e.g., 500ms for latency
    current_percentage: float = 100.0
    status: SLOStatus = SLOStatus.HEALTHY
    error_budget_remaining: float = 100.0  # percentage
    last_updated: datetime = Field(default_factory=datetime.now)

class SLI(BaseModel):
    """Service Level Indicator measurement"""
    slo_id: str
    timestamp: datetime
    value: float
    passed: bool

class CorrelationEvent(BaseModel):
    """Correlated observability event"""
    id: str = Field(default_factory=lambda: f"evt-{uuid.uuid4().hex[:8]}")
    timestamp: datetime
    event_type: str  # "incident", "deployment", "alert", "anomaly"
    title: str
    description: str
    affected_services: List[str]
    related_traces: List[str] = []
    related_metrics: List[str] = []
    related_logs: List[str] = []
    severity: str = "info"

class ServiceHealth(BaseModel):
    """Service health status"""
    service_name: str
    status: str  # "healthy", "degraded", "down"
    availability: float  # percentage
    avg_latency_ms: float
    error_rate: float  # percentage
    request_rate: float  # req/s
    last_deployment: Optional[datetime] = None
    active_alerts: int = 0

# ============================================================================
# Observability Engine
# ============================================================================

class ObservabilityEngine:
    """Main observability and telemetry orchestration engine"""
    
    def __init__(self):
        self.traces: Dict[str, Trace] = {}
        self.spans: Dict[str, List[Span]] = defaultdict(list)
        self.metrics: List[Metric] = []
        self.slos: Dict[str, SLO] = {}
        self.slis: Dict[str, List[SLI]] = defaultdict(list)
        self.correlation_events: List[CorrelationEvent] = []
        self.service_health: Dict[str, ServiceHealth] = {}
        
        # Initialize sample SLOs
        self._initialize_sample_slos()
        
    def _initialize_sample_slos(self):
        """Initialize sample SLOs for key services"""
        sample_slos = [
            SLO(
                name="API Gateway Availability",
                service="api-gateway",
                description="API Gateway must be available 99.9% of the time",
                target_percentage=99.9,
                metric="availability",
                threshold=99.9
            ),
            SLO(
                name="API Response Time",
                service="api-gateway",
                description="95% of requests must complete within 500ms",
                target_percentage=95.0,
                metric="latency",
                threshold=500.0
            ),
            SLO(
                name="Database Query Performance",
                service="postgres",
                description="99% of queries must complete within 100ms",
                target_percentage=99.0,
                metric="latency",
                threshold=100.0
            ),
            SLO(
                name="Error Rate SLO",
                service="api-gateway",
                description="Error rate must stay below 1%",
                target_percentage=99.0,
                metric="error_rate",
                threshold=1.0
            ),
            SLO(
                name="Self-Healing Success Rate",
                service="self-healing-engine",
                description="Auto-remediation success rate must exceed 85%",
                target_percentage=85.0,
                metric="success_rate",
                threshold=85.0
            )
        ]
        
        for slo in sample_slos:
            self.slos[slo.id] = slo
    
    async def create_trace(self, service_name: str, operation: str) -> Trace:
        """Create a new distributed trace"""
        trace_id = f"trace-{uuid.uuid4().hex}"
        span_id = f"span-{uuid.uuid4().hex[:16]}"
        
        root_span = Span(
            trace_id=trace_id,
            span_id=span_id,
            name=operation,
            kind=SpanKind.SERVER,
            start_time=datetime.now(),
            service_name=service_name,
            attributes={
                "http.method": "GET",
                "http.url": f"/api/{operation}",
                "http.status_code": 200
            }
        )
        
        # Simulate trace with multiple spans
        spans = [root_span]
        
        # Add child spans for downstream services
        downstream_services = [
            ("database", "query", 25),
            ("cache", "get", 5),
            ("external-api", "call", 150)
        ]
        
        current_time = root_span.start_time
        for service, op, duration in downstream_services:
            child_span = Span(
                trace_id=trace_id,
                span_id=f"span-{uuid.uuid4().hex[:16]}",
                parent_span_id=span_id,
                name=f"{service}.{op}",
                kind=SpanKind.CLIENT,
                start_time=current_time,
                end_time=current_time + timedelta(milliseconds=duration),
                duration_ms=duration,
                service_name=service,
                attributes={
                    "db.system": "postgresql" if service == "database" else None,
                    "cache.hit": random.choice([True, False]) if service == "cache" else None
                }
            )
            spans.append(child_span)
            current_time = child_span.end_time
        
        # Complete root span
        total_duration = sum(s.duration_ms or 0 for s in spans[1:]) + random.randint(10, 30)
        root_span.end_time = root_span.start_time + timedelta(milliseconds=total_duration)
        root_span.duration_ms = total_duration
        
        trace = Trace(
            trace_id=trace_id,
            root_span=root_span,
            spans=spans,
            total_duration_ms=total_duration,
            service_count=len(set(s.service_name for s in spans)),
            span_count=len(spans),
            error_count=0,
            start_time=root_span.start_time,
            end_time=root_span.end_time
        )
        
        self.traces[trace_id] = trace
        self.spans[service_name].extend(spans)
        
        logger.info(f"Created trace {trace_id} with {len(spans)} spans across {trace.service_count} services")
        
        return trace
    
    async def record_metric(self, name: str, value: float, metric_type: MetricType,
                          labels: Dict[str, str] = None, unit: str = "") -> Metric:
        """Record a telemetry metric"""
        metric = Metric(
            name=name,
            type=metric_type,
            value=value,
            timestamp=datetime.now(),
            labels=labels or {},
            unit=unit
        )
        
        self.metrics.append(metric)
        
        # Keep only last 1000 metrics
        if len(self.metrics) > 1000:
            self.metrics = self.metrics[-1000:]
        
        return metric
    
    async def evaluate_slo(self, slo_id: str) -> SLO:
        """Evaluate an SLO and update its status"""
        if slo_id not in self.slos:
            raise ValueError(f"SLO {slo_id} not found")
        
        slo = self.slos[slo_id]
        
        # Simulate SLI measurements
        recent_slis = self.slis.get(slo_id, [])
        
        # Generate sample SLI data if none exists
        if not recent_slis:
            for _ in range(100):
                value = random.uniform(0, 100)
                passed = value >= slo.threshold if slo.metric != "error_rate" else value <= slo.threshold
                
                sli = SLI(
                    slo_id=slo_id,
                    timestamp=datetime.now() - timedelta(minutes=random.randint(0, 1440)),
                    value=value,
                    passed=passed
                )
                recent_slis.append(sli)
            
            self.slis[slo_id] = recent_slis
        
        # Calculate current compliance
        total_measurements = len(recent_slis)
        passed_measurements = sum(1 for sli in recent_slis if sli.passed)
        current_percentage = (passed_measurements / total_measurements * 100) if total_measurements > 0 else 100.0
        
        slo.current_percentage = round(current_percentage, 2)
        
        # Calculate error budget
        error_budget_consumed = max(0, slo.target_percentage - current_percentage)
        error_budget_total = 100 - slo.target_percentage
        slo.error_budget_remaining = round(
            max(0, (error_budget_total - error_budget_consumed) / error_budget_total * 100),
            2
        )
        
        # Update status
        if current_percentage >= slo.target_percentage:
            slo.status = SLOStatus.HEALTHY
        elif current_percentage >= slo.target_percentage - 0.5:
            slo.status = SLOStatus.WARNING
        elif current_percentage >= slo.target_percentage - 1.0:
            slo.status = SLOStatus.CRITICAL
        else:
            slo.status = SLOStatus.BREACHED
        
        slo.last_updated = datetime.now()
        
        logger.info(f"Evaluated SLO {slo.name}: {current_percentage:.2f}% (target: {slo.target_percentage}%)")
        
        return slo
    
    async def correlate_events(self, time_window_minutes: int = 60) -> List[CorrelationEvent]:
        """Correlate traces, metrics, and logs to identify patterns"""
        cutoff_time = datetime.now() - timedelta(minutes=time_window_minutes)
        
        # Find recent slow traces
        slow_traces = [
            t for t in self.traces.values()
            if t.start_time > cutoff_time and t.total_duration_ms > 1000
        ]
        
        # Find recent high error rate metrics
        error_metrics = [
            m for m in self.metrics
            if m.timestamp > cutoff_time and m.name == "error_rate" and m.value > 5
        ]
        
        # Create correlation events
        events = []
        
        if slow_traces:
            event = CorrelationEvent(
                timestamp=datetime.now(),
                event_type="anomaly",
                title="High Latency Detected",
                description=f"{len(slow_traces)} traces exceeded 1000ms in the last {time_window_minutes} minutes",
                affected_services=list(set(t.root_span.service_name for t in slow_traces)),
                related_traces=[t.trace_id for t in slow_traces[:5]],
                severity="warning"
            )
            events.append(event)
            self.correlation_events.append(event)
        
        if error_metrics:
            event = CorrelationEvent(
                timestamp=datetime.now(),
                event_type="alert",
                title="Elevated Error Rate",
                description=f"Error rate spiked above 5% (avg: {sum(m.value for m in error_metrics) / len(error_metrics):.2f}%)",
                affected_services=list(set(m.labels.get("service", "unknown") for m in error_metrics)),
                related_metrics=[m.name for m in error_metrics[:5]],
                severity="critical"
            )
            events.append(event)
            self.correlation_events.append(event)
        
        return events
    
    def get_service_health(self, service_name: str) -> ServiceHealth:
        """Get current health status for a service"""
        # Get recent spans for the service
        service_spans = [
            s for s in self.spans.get(service_name, [])
            if s.end_time and s.end_time > datetime.now() - timedelta(minutes=5)
        ]
        
        if not service_spans:
            # Return default healthy status
            return ServiceHealth(
                service_name=service_name,
                status="healthy",
                availability=99.9,
                avg_latency_ms=125.0,
                error_rate=0.5,
                request_rate=150.0
            )
        
        # Calculate metrics
        total_spans = len(service_spans)
        error_spans = sum(1 for s in service_spans if s.status != "ok")
        avg_latency = sum(s.duration_ms or 0 for s in service_spans) / total_spans
        
        availability = ((total_spans - error_spans) / total_spans * 100) if total_spans > 0 else 100.0
        error_rate = (error_spans / total_spans * 100) if total_spans > 0 else 0.0
        
        # Determine status
        if availability >= 99.5 and avg_latency < 500 and error_rate < 1:
            status = "healthy"
        elif availability >= 95 and error_rate < 5:
            status = "degraded"
        else:
            status = "down"
        
        health = ServiceHealth(
            service_name=service_name,
            status=status,
            availability=round(availability, 2),
            avg_latency_ms=round(avg_latency, 2),
            error_rate=round(error_rate, 2),
            request_rate=round(total_spans / 5 * 60, 2),  # spans per minute
            last_deployment=datetime.now() - timedelta(hours=random.randint(1, 48))
        )
        
        self.service_health[service_name] = health
        
        return health

# Initialize engine
observability_engine = ObservabilityEngine()

# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/")
async def root():
    """Service information"""
    return {
        "service": "Advanced Observability & Telemetry Suite",
        "version": "3.0.0",
        "status": "operational",
        "traces_tracked": len(observability_engine.traces),
        "metrics_collected": len(observability_engine.metrics),
        "slos_monitored": len(observability_engine.slos)
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/v3/observability/trace", response_model=Trace)
async def create_trace(service_name: str, operation: str):
    """Create a new distributed trace"""
    trace = await observability_engine.create_trace(service_name, operation)
    return trace

@app.get("/api/v3/observability/traces", response_model=List[Trace])
async def get_traces(limit: int = 20, service: Optional[str] = None):
    """Get recent traces"""
    traces = list(observability_engine.traces.values())
    
    if service:
        traces = [t for t in traces if t.root_span.service_name == service]
    
    return sorted(traces, key=lambda x: x.start_time, reverse=True)[:limit]

@app.get("/api/v3/observability/trace/{trace_id}", response_model=Trace)
async def get_trace(trace_id: str):
    """Get specific trace details"""
    if trace_id not in observability_engine.traces:
        raise HTTPException(status_code=404, detail="Trace not found")
    return observability_engine.traces[trace_id]

@app.post("/api/v3/observability/metric", response_model=Metric)
async def record_metric(
    name: str,
    value: float,
    type: MetricType = MetricType.GAUGE,
    labels: Dict[str, str] = None,
    unit: str = ""
):
    """Record a telemetry metric"""
    metric = await observability_engine.record_metric(name, value, type, labels, unit)
    return metric

@app.get("/api/v3/observability/metrics")
async def get_metrics(limit: int = 100, name: Optional[str] = None):
    """Get recent metrics"""
    metrics = observability_engine.metrics
    
    if name:
        metrics = [m for m in metrics if m.name == name]
    
    return sorted(metrics, key=lambda x: x.timestamp, reverse=True)[:limit]

@app.get("/api/v3/observability/slos", response_model=List[SLO])
async def get_slos(service: Optional[str] = None):
    """Get all SLOs"""
    slos = list(observability_engine.slos.values())
    
    if service:
        slos = [s for s in slos if s.service == service]
    
    return slos

@app.get("/api/v3/observability/slo/{slo_id}", response_model=SLO)
async def get_slo(slo_id: str):
    """Get specific SLO with current status"""
    slo = await observability_engine.evaluate_slo(slo_id)
    return slo

@app.post("/api/v3/observability/slo", response_model=SLO)
async def create_slo(
    name: str,
    service: str,
    description: str,
    target_percentage: float,
    metric: str,
    threshold: float,
    window_days: int = 30
):
    """Create a new SLO"""
    slo = SLO(
        name=name,
        service=service,
        description=description,
        target_percentage=target_percentage,
        metric=metric,
        threshold=threshold,
        window_days=window_days
    )
    
    observability_engine.slos[slo.id] = slo
    return slo

@app.get("/api/v3/observability/correlate")
async def correlate_events(time_window_minutes: int = 60):
    """Correlate observability events to identify patterns"""
    events = await observability_engine.correlate_events(time_window_minutes)
    return {
        "time_window_minutes": time_window_minutes,
        "events_found": len(events),
        "events": events
    }

@app.get("/api/v3/observability/service/{service_name}/health", response_model=ServiceHealth)
async def get_service_health(service_name: str):
    """Get service health status"""
    health = observability_engine.get_service_health(service_name)
    return health

@app.get("/api/v3/observability/dashboard")
async def get_dashboard_data():
    """Get comprehensive dashboard data"""
    # Evaluate all SLOs
    slos_status = []
    for slo_id in observability_engine.slos:
        slo = await observability_engine.evaluate_slo(slo_id)
        slos_status.append({
            "name": slo.name,
            "service": slo.service,
            "status": slo.status,
            "current": slo.current_percentage,
            "target": slo.target_percentage,
            "error_budget": slo.error_budget_remaining
        })
    
    # Get service health for key services
    services = ["api-gateway", "postgres", "self-healing-engine", "chaos-engineering"]
    services_health = [
        observability_engine.get_service_health(service)
        for service in services
    ]
    
    # Recent correlation events
    recent_events = observability_engine.correlation_events[-10:]
    
    return {
        "timestamp": datetime.now().isoformat(),
        "slos": slos_status,
        "services_health": services_health,
        "recent_events": recent_events,
        "total_traces": len(observability_engine.traces),
        "total_metrics": len(observability_engine.metrics)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8800)
