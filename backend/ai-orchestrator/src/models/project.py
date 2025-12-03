from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON, Enum as SQLEnum
from sqlalchemy.orm import declarative_base
import enum

Base = declarative_base()

class ProjectStatus(enum.Enum):
    DRAFT = "draft"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"

class GenerationMode(enum.Enum):
    ONECLICK = "oneclick"
    ADVANCED = "advanced"

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(String(1000))
    user_id = Column(String(36), nullable=False, index=True)
    
    mode = Column(SQLEnum(GenerationMode), nullable=False)
    status = Column(SQLEnum(ProjectStatus), default=ProjectStatus.DRAFT)
    
    # Store the input data as JSON
    input_data = Column(JSON, nullable=False)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Progress tracking
    progress = Column(JSON, default={})
    error_message = Column(String(1000), nullable=True)
