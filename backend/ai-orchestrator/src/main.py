from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn

from .api import projects, generation, artifacts, websocket
from .utils.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting AI Orchestrator Service...")
    print(f"   Environment: {'DEBUG' if settings.DEBUG else 'PRODUCTION'}")
    print(f"   Database: {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else 'Not configured'}")
    print("✅ Service initialized")
    yield
    # Shutdown
    print("👋 Shutting down AI Orchestrator Service...")

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered Enterprise Architecture System",
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(projects.router)
app.include_router(generation.router)
app.include_router(artifacts.router)
app.include_router(websocket.router)

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ai-orchestrator",
        "version": settings.APP_VERSION
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "IAC Dharma AI Orchestrator API",
        "docs": "/docs",
        "health": "/health"
    }

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
