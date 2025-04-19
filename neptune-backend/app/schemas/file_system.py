from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class FileSystemItem(BaseModel):
    id: int
    name: str
    type: str  # Type can be 'file' or 'folder'
    parent_id: Optional[int] = None  # ID of the parent folder, if applicable
    content: Optional[str] = None  # Only for files, not folders
    class Config:
        from_attributes = True

class FileSystemCreate(BaseModel):
    name: str
    type: str  # Type can be 'file' or 'folder'
    parent_id: Optional[int] = None  # ID of the parent folder, if applicable

class FileSystemUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None  # Type can be 'file' or 'folder'
    parent_id: Optional[int] = None  # ID of the parent folder, if applicable

class FileSystemResponse(BaseModel):
    item: FileSystemItem

class FileSystemListResponse(BaseModel):
    items: List[FileSystemItem]

# Add the missing folder-specific schemas
class FolderCreate(BaseModel):
    name: str
    parent_id: Optional[int] = None

class FolderResponse(BaseModel):
    id: int
    name: str
    parent_id: Optional[int] = None