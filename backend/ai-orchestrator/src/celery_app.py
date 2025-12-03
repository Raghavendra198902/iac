from celery import Celery
import os

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://iacuser:iacpassword@localhost:5672")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

celery_app = Celery(
    "ai_orchestrator",
    broker=RABBITMQ_URL,
    backend=REDIS_URL,
    include=["src.workflows.orchestrator"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour max
    task_soft_time_limit=3000,  # 50 minutes soft limit
)
