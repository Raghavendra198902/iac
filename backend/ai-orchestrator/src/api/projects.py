from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime

from ..models.project import Project, ProjectStatus, GenerationMode
from ..utils.database import get_db_dependency
from pydantic import BaseModel

router = APIRouter(prefix="/api/projects", tags=["projects"])

# Pydantic schemas
class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    mode: str  # "oneclick" or "advanced"
    input_data: dict

class ProjectResponse(BaseModel):
    id: str
    name: str
    description: str | None
    mode: str
    status: str
    progress: dict
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None
    error_message: str | None

    class Config:
        from_attributes = True

@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db_dependency)
):
    """Create a new AI architecture project."""
    project_id = str(uuid.uuid4())
    
    db_project = Project(
        id=project_id,
        name=project.name,
        description=project.description,
        user_id="default-user",  # TODO: Get from auth context
        mode=GenerationMode(project.mode),
        status=ProjectStatus.DRAFT,
        input_data=project.input_data,
        progress={}
    )
    
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    return ProjectResponse(
        id=db_project.id,
        name=db_project.name,
        description=db_project.description,
        mode=db_project.mode.value,
        status=db_project.status.value,
        progress=db_project.progress,
        created_at=db_project.created_at,
        updated_at=db_project.updated_at,
        completed_at=db_project.completed_at,
        error_message=db_project.error_message
    )

@router.get("/", response_model=List[ProjectResponse])
async def list_projects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db_dependency)
):
    """List all projects for the current user."""
    projects = db.query(Project).offset(skip).limit(limit).all()
    
    return [
        ProjectResponse(
            id=p.id,
            name=p.name,
            description=p.description,
            mode=p.mode.value,
            status=p.status.value,
            progress=p.progress,
            created_at=p.created_at,
            updated_at=p.updated_at,
            completed_at=p.completed_at,
            error_message=p.error_message
        )
        for p in projects
    ]

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    db: Session = Depends(get_db_dependency)
):
    """Get a specific project by ID."""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found"
        )
    
    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        mode=project.mode.value,
        status=project.status.value,
        progress=project.progress,
        created_at=project.created_at,
        updated_at=project.updated_at,
        completed_at=project.completed_at,
        error_message=project.error_message
    )

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    db: Session = Depends(get_db_dependency)
):
    """Delete a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found"
        )
    
    db.delete(project)
    db.commit()
