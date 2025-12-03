from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid

from ..models.project import Project, ProjectStatus
from ..models.agent_execution import AgentExecution, AgentStatus
from ..utils.database import get_db_dependency
from ..workflows.orchestrator import start_generation_workflow

router = APIRouter(prefix="/api/generate", tags=["generation"])

class GenerationRequest(BaseModel):
    project_id: str
    mode: str  # "oneclick" or "advanced"

class GenerationStatusResponse(BaseModel):
    project_id: str
    status: str
    progress: dict
    agents: list

@router.post("/start", response_model=dict)
async def start_generation(
    request: GenerationRequest,
    db: Session = Depends(get_db_dependency)
):
    """Start the AI generation process for a project."""
    project = db.query(Project).filter(Project.id == request.project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {request.project_id} not found"
        )
    
    if project.status == ProjectStatus.GENERATING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project is already generating"
        )
    
    # Update project status
    project.status = ProjectStatus.GENERATING
    db.commit()
    
    # Initialize agent executions
    agent_configs = [
        {"id": "chief", "name": "Chief Architect"},
        {"id": "ea", "name": "Enterprise Architect"},
        {"id": "sa", "name": "Solution Architect"},
        {"id": "ta", "name": "Technical Architect"},
        {"id": "pm", "name": "Project Manager"},
        {"id": "se", "name": "Security Engineer"}
    ]
    
    for agent in agent_configs:
        execution = AgentExecution(
            id=str(uuid.uuid4()),
            project_id=project.id,
            agent_id=agent["id"],
            agent_name=agent["name"],
            status=AgentStatus.IDLE,
            progress=0.0
        )
        db.add(execution)
    
    db.commit()
    
    # Start async workflow (Celery task)
    start_generation_workflow.delay(project.id, request.mode)
    
    return {
        "project_id": project.id,
        "status": "started",
        "message": "Generation workflow initiated"
    }

@router.get("/status/{project_id}", response_model=GenerationStatusResponse)
async def get_generation_status(
    project_id: str,
    db: Session = Depends(get_db_dependency)
):
    """Get the current status of a generation workflow."""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found"
        )
    
    # Get agent executions
    executions = db.query(AgentExecution).filter(
        AgentExecution.project_id == project_id
    ).all()
    
    agents = [
        {
            "id": e.agent_id,
            "name": e.agent_name,
            "status": e.status.value,
            "progress": e.progress,
            "message": e.message,
            "duration": e.duration
        }
        for e in executions
    ]
    
    return GenerationStatusResponse(
        project_id=project.id,
        status=project.status.value,
        progress=project.progress,
        agents=agents
    )
