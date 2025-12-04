"""
Database model tests.
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.models.project import Base, Project, ProjectStatus, GenerationMode
from src.models.artifact import Artifact, ArtifactType, ArtifactFormat
from src.models.agent_execution import AgentExecution, AgentStatus
import uuid

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """Create a test database session."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)

def test_create_project(db_session):
    """Test creating a project model."""
    project = Project(
        id=str(uuid.uuid4()),
        name="Test Project",
        description="Test description",
        user_id="user-123",
        mode=GenerationMode.ONECLICK,
        status=ProjectStatus.DRAFT,
        input_data={"industry": "healthcare"}
    )
    
    db_session.add(project)
    db_session.commit()
    
    # Query back
    retrieved = db_session.query(Project).filter(Project.id == project.id).first()
    assert retrieved is not None
    assert retrieved.name == "Test Project"
    assert retrieved.mode == GenerationMode.ONECLICK

def test_create_artifact(db_session):
    """Test creating an artifact model."""
    # Create project first
    project = Project(
        id=str(uuid.uuid4()),
        name="Test Project",
        user_id="user-123",
        mode=GenerationMode.ONECLICK,
        status=ProjectStatus.DRAFT,
        input_data={}
    )
    db_session.add(project)
    db_session.commit()
    
    # Create artifact
    artifact = Artifact(
        id=str(uuid.uuid4()),
        project_id=project.id,
        name="Enterprise Architecture.pdf",
        type=ArtifactType.EA,
        format=ArtifactFormat.PDF,
        file_path="/tmp/ea.pdf",
        size=1024000,
        created_by="Enterprise Architect"
    )
    
    db_session.add(artifact)
    db_session.commit()
    
    # Query back
    retrieved = db_session.query(Artifact).filter(Artifact.id == artifact.id).first()
    assert retrieved is not None
    assert retrieved.name == "Enterprise Architecture.pdf"
    assert retrieved.type == ArtifactType.EA

def test_create_agent_execution(db_session):
    """Test creating an agent execution model."""
    # Create project first
    project = Project(
        id=str(uuid.uuid4()),
        name="Test Project",
        user_id="user-123",
        mode=GenerationMode.ONECLICK,
        status=ProjectStatus.DRAFT,
        input_data={}
    )
    db_session.add(project)
    db_session.commit()
    
    # Create agent execution
    execution = AgentExecution(
        id=str(uuid.uuid4()),
        project_id=project.id,
        agent_id="chief",
        agent_name="Chief Architect",
        status=AgentStatus.PROCESSING,
        progress=50.0,
        message="Analyzing requirements..."
    )
    
    db_session.add(execution)
    db_session.commit()
    
    # Query back
    retrieved = db_session.query(AgentExecution).filter(
        AgentExecution.id == execution.id
    ).first()
    assert retrieved is not None
    assert retrieved.agent_id == "chief"
    assert retrieved.progress == 50.0
    assert retrieved.status == AgentStatus.PROCESSING

def test_project_status_enum(db_session):
    """Test project status enum values."""
    project = Project(
        id=str(uuid.uuid4()),
        name="Test",
        user_id="user-123",
        mode=GenerationMode.ONECLICK,
        status=ProjectStatus.GENERATING,
        input_data={}
    )
    
    db_session.add(project)
    db_session.commit()
    
    retrieved = db_session.query(Project).first()
    assert retrieved.status == ProjectStatus.GENERATING
    assert retrieved.status.value == "generating"
