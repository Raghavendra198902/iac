import logging
from logging.handlers import RotatingFileHandler
import sys
from pythonjsonlogger import jsonlogger

def setup_logging(app_name: str = "ai-orchestrator", log_level: str = "INFO"):
    """
    Configure structured logging for production.
    """
    # Create logger
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, log_level.upper()))
    
    # Remove existing handlers
    logger.handlers = []
    
    # JSON formatter for structured logs
    json_formatter = jsonlogger.JsonFormatter(
        fmt='%(asctime)s %(name)s %(levelname)s %(message)s',
        datefmt='%Y-%m-%dT%H:%M:%S'
    )
    
    # Console handler (stdout) - for container logs
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(json_formatter)
    logger.addHandler(console_handler)
    
    # File handler with rotation (optional, for local development)
    file_handler = RotatingFileHandler(
        f'/var/log/{app_name}/app.log',
        maxBytes=10485760,  # 10MB
        backupCount=10
    )
    file_handler.setFormatter(json_formatter)
    logger.addHandler(file_handler)
    
    # Reduce noise from third-party libraries
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("fastapi").setLevel(logging.WARNING)
    
    return logger

# Middleware for request logging
from fastapi import Request
import time

async def log_requests(request: Request, call_next):
    """Middleware to log all requests with timing."""
    logger = logging.getLogger(__name__)
    
    start_time = time.time()
    
    # Log request
    logger.info(
        "Request started",
        extra={
            "method": request.method,
            "path": request.url.path,
            "client": request.client.host if request.client else None,
        }
    )
    
    # Process request
    response = await call_next(request)
    
    # Calculate duration
    duration = time.time() - start_time
    
    # Log response
    logger.info(
        "Request completed",
        extra={
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": round(duration * 1000, 2),
        }
    )
    
    return response
