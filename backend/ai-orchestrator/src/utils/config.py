import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "AI Architecture Orchestrator"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # API Keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    PINECONE_API_KEY: str = os.getenv("PINECONE_API_KEY", "")
    PINECONE_ENVIRONMENT: str = os.getenv("PINECONE_ENVIRONMENT", "")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://iacuser:iacpassword@localhost:5432/iacdb")
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://iacuser:iacpassword@localhost:27017")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    RABBITMQ_URL: str = os.getenv("RABBITMQ_URL", "amqp://iacuser:iacpassword@localhost:5672")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080"
    ]
    
    # File Storage
    ARTIFACTS_DIR: str = os.getenv("ARTIFACTS_DIR", "/tmp/iac-artifacts")
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024  # 100MB
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
