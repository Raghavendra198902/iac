"""
Configuration management for AIOps Engine
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # Service
    service_name: str = "aiops-engine"
    service_port: int = 8100
    log_level: str = "info"
    environment: str = "development"
    
    # Database
    database_url: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/iac_aiops"
    )
    timescale_url: str = Field(
        default="postgresql://postgres:postgres@localhost:5433/iac_timeseries"
    )
    redis_url: str = Field(default="redis://localhost:6379/0")
    
    # Kafka
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_consumer_group: str = "aiops-engine"
    kafka_topics: List[str] = ["metrics", "logs", "events", "traces"]
    
    # ML Models
    model_storage_path: str = "/app/models"
    mlflow_tracking_uri: str = "http://localhost:5000"
    feast_feature_store_path: str = "/app/feast"
    
    # Metrics Sources
    prometheus_url: str = "http://localhost:9090"
    elasticsearch_url: str = "http://localhost:9200"
    jaeger_url: str = "http://localhost:16686"
    
    # Auto-Remediation
    auto_remediation_enabled: bool = True
    approval_required: bool = False
    max_actions_per_minute: int = 10
    circuit_breaker_threshold: float = 0.8
    
    # Kubernetes
    k8s_in_cluster: bool = False
    k8s_kubeconfig_path: str = "~/.kube/config"
    
    # Notifications
    slack_webhook_url: str = ""
    pagerduty_key: str = ""
    email_recipients: str = "ops@company.com"
    
    # Security
    jwt_secret: str = "your-secret-key-here"
    api_key: str = "your-api-key-here"
    
    # Feature Flags
    enable_failure_prediction: bool = True
    enable_threat_detection: bool = True
    enable_capacity_forecasting: bool = True
    enable_auto_remediation: bool = True
    enable_root_cause_analysis: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
