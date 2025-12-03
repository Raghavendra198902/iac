from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Enum as SQLEnum, Float
import enum
from .project import Base

class AgentStatus(enum.Enum):
    IDLE = "idle"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class AgentExecution(Base):
    __tablename__ = "agent_executions"

    id = Column(String(36), primary_key=True)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    
    agent_id = Column(String(50), nullable=False)
    agent_name = Column(String(100), nullable=False)
    status = Column(SQLEnum(AgentStatus), default=AgentStatus.IDLE)
    
    progress = Column(Float, default=0.0)  # 0-100
    message = Column(String(500), nullable=True)
    
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    duration = Column(Integer, nullable=True)  # seconds
    
    error_message = Column(String(1000), nullable=True)
