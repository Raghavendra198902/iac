"""
Pytest configuration for tests.
"""
import pytest
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

@pytest.fixture(scope="session")
def test_env():
    """Set up test environment variables."""
    import os
    os.environ["DATABASE_URL"] = "sqlite:///./test.db"
    os.environ["OPENAI_API_KEY"] = "test-key"
    os.environ["ANTHROPIC_API_KEY"] = "test-key"
    os.environ["REDIS_URL"] = "redis://localhost:6379"
    os.environ["RABBITMQ_URL"] = "amqp://localhost:5672"
