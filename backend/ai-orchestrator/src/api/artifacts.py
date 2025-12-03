from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..models.artifact import Artifact, ArtifactType
from ..utils.database import get_db_dependency
from pydantic import BaseModel
import os

router = APIRouter(prefix="/api/artifacts", tags=["artifacts"])

class ArtifactResponse(BaseModel):
    id: str
    project_id: str
    name: str
    type: str
    format: str
    size: int
    created_at: datetime
    created_by: str

    class Config:
        from_attributes = True

@router.get("/{project_id}", response_model=List[ArtifactResponse])
async def list_artifacts(
    project_id: str,
    db: Session = Depends(get_db_dependency)
):
    """List all artifacts for a project."""
    artifacts = db.query(Artifact).filter(
        Artifact.project_id == project_id
    ).all()
    
    return [
        ArtifactResponse(
            id=a.id,
            project_id=a.project_id,
            name=a.name,
            type=a.type.value,
            format=a.format.value,
            size=a.size,
            created_at=a.created_at,
            created_by=a.created_by
        )
        for a in artifacts
    ]

@router.get("/download/{artifact_id}")
async def download_artifact(
    artifact_id: str,
    db: Session = Depends(get_db_dependency)
):
    """Download a specific artifact."""
    artifact = db.query(Artifact).filter(Artifact.id == artifact_id).first()
    
    if not artifact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Artifact {artifact_id} not found"
        )
    
    if not os.path.exists(artifact.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artifact file not found on disk"
        )
    
    return FileResponse(
        artifact.file_path,
        filename=artifact.name,
        media_type="application/octet-stream"
    )
