from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import FileSystem
from app.schemas.file_system import FileSystemItem, FileSystemCreate, FileSystemUpdate, FileSystemListResponse
from pydantic import BaseModel
from datetime import datetime
from app.services.knowledge_graph import schedule_knowledge_graph_update
from typing import Dict, Any

router = APIRouter()
class ContentUpdate(BaseModel):
    content: str

@router.get("/", response_model=list[FileSystemItem])
async def get_file_system(parent_id: int = None, db: Session = Depends(get_db)):
    """Get all files and folders optionally filtered by parent_id"""
    query = db.query(FileSystem)
    if parent_id is not None:
        query = query.filter(FileSystem.parent_id == parent_id)
    else:
        query = query.filter(FileSystem.parent_id == None)  # Root items
    
    items = query.all()
    
    # Create default note if nothing exists
    if not items and parent_id is None:
        default_note = FileSystem(
            name="Untitled Note",
            type="file",
            parent_id=None,
            content="Write your note here..."
        )
        db.add(default_note)
        db.commit()
        db.refresh(default_note)
        return [FileSystemItem(
            id=default_note.id,
            name=default_note.name,
            type=default_note.type,
            parent_id=default_note.parent_id,
            content=default_note.content
        )]
    
    return [
        FileSystemItem(
            id=item.id,
            name=item.name,
            type=item.type,
            parent_id=item.parent_id,
            content=item.content
        ) for item in items
    ]

@router.post("/", response_model=FileSystemItem)
async def create_file_system_item(item: FileSystemCreate, db: Session = Depends(get_db)):
    """Create a new file or folder"""
    db_item = FileSystem(
        name=item.name,
        type=item.type,
        parent_id=item.parent_id,
        content="" if item.type == "file" else None
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return FileSystemItem(
        id=db_item.id,
        name=db_item.name,
        type=db_item.type,
        parent_id=db_item.parent_id,
        content=db_item.content
    )

@router.put("/{item_id}/content", response_model=FileSystemItem)
async def update_file_content(
    item_id: int, 
    data: dict, 
    background_tasks: BackgroundTasks,  # Add this parameter
    db: Session = Depends(get_db)
):
    """Update file content and trigger knowledge graph update"""
    content = data.get("content")
    if content is None:
        raise HTTPException(status_code=400, detail="Content field is required")
        
    db_item = db.query(FileSystem).filter(FileSystem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="File not found")
    if db_item.type != "file":
        raise HTTPException(status_code=400, detail="Cannot set content for folders")
    
    # Update the content
    db_item.content = content
    db_item.updated_at = datetime.utcnow()
    
    # Commit changes
    db.commit()
    db.refresh(db_item)
    
    # Schedule knowledge graph update in the background
    schedule_knowledge_graph_update(background_tasks, db)
    
    # Return the updated item
    return FileSystemItem(
        id=db_item.id,
        name=db_item.name,
        type=db_item.type,
        parent_id=db_item.parent_id,
        content=db_item.content
    )

@router.get("/{item_id}", response_model=FileSystemItem)
async def get_file_by_id(item_id: int, db: Session = Depends(get_db)):
    """Get a specific file or folder by ID"""
    item = db.query(FileSystem).filter(FileSystem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return FileSystemItem(
        id=item.id,
        name=item.name,
        type=item.type,
        parent_id=item.parent_id,
        content=item.content
    )

@router.delete("/{item_id}", response_model=Dict[str, Any])
async def delete_file_system_item(
    item_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Delete a file or folder and trigger knowledge graph update"""
    # Find the item in the database
    db_item = db.query(FileSystem).filter(FileSystem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # If it's a folder, check if it has children and prevent deletion if it does
    if db_item.type == "folder":
        children = db.query(FileSystem).filter(FileSystem.parent_id == item_id).count()
        if children > 0:
            raise HTTPException(status_code=400, detail="Cannot delete folder with children")
    
    # Delete the item
    db.delete(db_item)
    db.commit()
    
    # Schedule knowledge graph update in the background to reflect the removal
    from app.services.knowledge_graph import schedule_knowledge_graph_update
    schedule_knowledge_graph_update(background_tasks, db)
    
    return {"success": True, "message": f"Item {item_id} deleted successfully"}