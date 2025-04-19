from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.file_system import FolderCreate, FolderResponse
from app.db.models import Folder

router = APIRouter()

@router.post("/folders/", response_model=FolderResponse)
def create_folder(folder: FolderCreate, db: Session = Depends(get_db)):
    db_folder = Folder(name=folder.name)
    db.add(db_folder)
    db.commit()
    db.refresh(db_folder)
    return db_folder

@router.get("/folders/{folder_id}", response_model=FolderResponse)
def get_folder(folder_id: int, db: Session = Depends(get_db)):
    folder = db.query(Folder).filter(Folder.id == folder_id).first()
    if folder is None:
        raise HTTPException(status_code=404, detail="Folder not found")
    return folder

@router.get("/folders/", response_model=List[FolderResponse])
def list_folders(db: Session = Depends(get_db)):
    return db.query(Folder).all()