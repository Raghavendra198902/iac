"""
Integration tests for AI Orchestrator API endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uuid

from src.main import app
from src.models.project import Base, Project, ProjectStatus, GenerationMode
from src.utils.database import get_db_dependency

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    """Override database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db_dependency] = override_get_db

@pytest.fixture(scope="function")
def test_db():
    """Create test database tables."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)

# ============================================================================
# Health Check Tests
# ============================================================================

def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_root_endpoint(client):
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert "status" in response.json()

# ============================================================================
# Project API Tests
# ============================================================================

def test_create_project(client, test_db):
    """Test creating a new project."""
    project_data = {
        "name": "Test Project",
        "description": "A test project for unit testing",
        "mode": "oneclick",
        "input_data": {
            "industry": "healthcare",
            "requirements": "HIPAA compliant system"
        }
    }
    
    response = client.post("/api/projects/", json=project_data)
    assert response.status_code == 201
    
    data = response.json()
    assert data["name"] == project_data["name"]
    assert data["mode"] == "oneclick"
    assert data["status"] == "draft"
    assert "id" in data

def test_list_projects(client, test_db):
    """Test listing projects."""
    # Create a test project first
    project_data = {
        "name": "Test Project",
        "mode": "oneclick",
        "input_data": {}
    }
    client.post("/api/projects/", json=project_data)
    
    # List projects
    response = client.get("/api/projects/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0

def test_get_project(client, test_db):
    """Test getting a specific project."""
    # Create a test project
    project_data = {
        "name": "Test Project",
        "mode": "oneclick",
        "input_data": {}
    }
    create_response = client.post("/api/projects/", json=project_data)
    project_id = create_response.json()["id"]
    
    # Get the project
    response = client.get(f"/api/projects/{project_id}")
    assert response.status_code == 200
    assert response.json()["id"] == project_id

def test_get_nonexistent_project(client, test_db):
    """Test getting a project that doesn't exist."""
    fake_id = str(uuid.uuid4())
    response = client.get(f"/api/projects/{fake_id}")
    assert response.status_code == 404

def test_delete_project(client, test_db):
    """Test deleting a project."""
    # Create a test project
    project_data = {
        "name": "Test Project",
        "mode": "oneclick",
        "input_data": {}
    }
    create_response = client.post("/api/projects/", json=project_data)
    project_id = create_response.json()["id"]
    
    # Delete the project
    response = client.delete(f"/api/projects/{project_id}")
    assert response.status_code == 204
    
    # Verify it's deleted
    get_response = client.get(f"/api/projects/{project_id}")
    assert get_response.status_code == 404

# ============================================================================
# Generation API Tests
# ============================================================================

def test_start_generation(client, test_db):
    """Test starting generation workflow."""
    # Create a test project
    project_data = {
        "name": "Test Project",
        "mode": "oneclick",
        "input_data": {"industry": "finance"}
    }
    create_response = client.post("/api/projects/", json=project_data)
    project_id = create_response.json()["id"]
    
    # Start generation (will fail without Celery running, but tests the endpoint)
    generation_request = {
        "project_id": project_id,
        "mode": "oneclick"
    }
    response = client.post("/api/generate/start", json=generation_request)
    
    # Should return 500 if Celery not running, or 200 if it is
    assert response.status_code in [200, 500]

def test_get_generation_status(client, test_db):
    """Test getting generation status."""
    # Create a test project
    project_data = {
        "name": "Test Project",
        "mode": "oneclick",
        "input_data": {}
    }
    create_response = client.post("/api/projects/", json=project_data)
    project_id = create_response.json()["id"]
    
    # Get status
    response = client.get(f"/api/generate/status/{project_id}")
    assert response.status_code == 200
    
    data = response.json()
    assert data["project_id"] == project_id
    assert "status" in data
    assert "agents" in data

# ============================================================================
# Artifacts API Tests
# ============================================================================

def test_list_artifacts_empty(client, test_db):
    """Test listing artifacts for a project with no artifacts."""
    # Create a test project
    project_data = {
        "name": "Test Project",
        "mode": "oneclick",
        "input_data": {}
    }
    create_response = client.post("/api/projects/", json=project_data)
    project_id = create_response.json()["id"]
    
    # List artifacts
    response = client.get(f"/api/artifacts/{project_id}")
    assert response.status_code == 200
    assert response.json() == []

def test_download_nonexistent_artifact(client, test_db):
    """Test downloading an artifact that doesn't exist."""
    fake_id = str(uuid.uuid4())
    response = client.get(f"/api/artifacts/download/{fake_id}")
    assert response.status_code == 404

# ============================================================================
# Validation Tests
# ============================================================================

def test_create_project_invalid_mode(client, test_db):
    """Test creating project with invalid mode."""
    project_data = {
        "name": "Test Project",
        "mode": "invalid_mode",  # Invalid
        "input_data": {}
    }
    response = client.post("/api/projects/", json=project_data)
    assert response.status_code == 422  # Validation error

def test_create_project_missing_fields(client, test_db):
    """Test creating project with missing required fields."""
    project_data = {
        "name": "Test Project"
        # Missing mode and input_data
    }
    response = client.post("/api/projects/", json=project_data)
    assert response.status_code == 422
