from prometheus_client import Counter, Histogram, Gauge, generate_latest
from fastapi import APIRouter
from fastapi.responses import Response
import time

router = APIRouter()

# Metrics
request_count = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

request_duration = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint']
)

active_generations = Gauge(
    'active_generations',
    'Number of active AI generations'
)

agent_execution_duration = Histogram(
    'agent_execution_duration_seconds',
    'Agent execution duration',
    ['agent_name']
)

llm_api_calls = Counter(
    'llm_api_calls_total',
    'Total LLM API calls',
    ['provider', 'model']
)

llm_api_errors = Counter(
    'llm_api_errors_total',
    'Total LLM API errors',
    ['provider', 'model']
)

artifacts_generated = Counter(
    'artifacts_generated_total',
    'Total artifacts generated',
    ['artifact_type']
)

@router.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint."""
    return Response(
        content=generate_latest(),
        media_type="text/plain"
    )

# Middleware for automatic metrics collection
async def metrics_middleware(request, call_next):
    """Collect metrics for each request."""
    start_time = time.time()
    
    response = await call_next(request)
    
    # Record metrics
    duration = time.time() - start_time
    
    request_count.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()
    
    request_duration.labels(
        method=request.method,
        endpoint=request.url.path
    ).observe(duration)
    
    return response
