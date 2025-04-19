from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.models import FileSystem
from app.schemas.file_system import FolderCreate, FolderResponse

router = APIRouter()

@router.post("/", response_model=FolderResponse)
def create_folder(folder: FolderCreate, db: Session = Depends(get_db)):
    # Implementation for creating a folder
    db_folder = FileSystem(
        name=folder.name,
        type="folder",
        parent_id=folder.parent_id
    )
    db.add(db_folder)
    db.commit()
    db.refresh(db_folder)
    
    return {
        "id": db_folder.id,
        "name": db_folder.name,
        "parent_id": db_folder.parent_id
    }

@router.get("/folders/{folder_id}", response_model=FolderResponse)
def get_folder(folder_id: int, db: Session = Depends(get_db)):
    folder = db.query(FileSystem).filter(FileSystem.id == folder_id).first()
    if folder is None:
        raise HTTPException(status_code=404, detail="Folder not found")
    return folder

@router.get("/", response_model=list[FolderResponse])
def list_folders(db: Session = Depends(get_db)):
    return db.query(FileSystem).all()