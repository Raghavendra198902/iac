from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from .project import Base

class ArtifactType(enum.Enum):
    EA = "ea"
    SA = "sa"
    TA = "ta"
    PM = "pm"
    SE = "se"
    COMPLIANCE = "compliance"

class ArtifactFormat(enum.Enum):
    PDF = "pdf"
    MARKDOWN = "md"
    JSON = "json"
    YAML = "yaml"
    PYTHON = "py"
    TERRAFORM = "tf"

class Artifact(Base):
    __tablename__ = "artifacts"

    id = Column(String(36), primary_key=True)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    
    name = Column(String(255), nullable=False)
    type = Column(SQLEnum(ArtifactType), nullable=False)
    format = Column(SQLEnum(ArtifactFormat), nullable=False)
    
    # File storage
    file_path = Column(String(500), nullable=False)
    size = Column(Integer, nullable=False)  # bytes
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_by = Column(String(50), nullable=False)  # Agent name
