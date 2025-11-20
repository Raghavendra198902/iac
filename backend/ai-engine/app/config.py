from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Server
    app_name: str = "IAC DHARMA AI Engine"
    app_version: str = "1.0.0"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = False
    
    # Database
    database_url: Optional[str] = None
    redis_url: Optional[str] = None
    
    # AI/ML Models
    model_cache_dir: str = "/tmp/models"
    use_gpu: bool = False
    
    # OpenAI (optional for enhanced NLP)
    openai_api_key: Optional[str] = None
    
    # Service URLs
    blueprint_service_url: str = "http://blueprint-service:3001"
    orchestrator_service_url: str = "http://orchestrator-service:3004"
    costing_service_url: str = "http://costing-service:3005"
    
    # Logging
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"


settings = Settings()
