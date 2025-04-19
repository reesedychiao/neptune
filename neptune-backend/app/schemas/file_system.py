from pydantic import BaseModel
from typing import List, Optional

class FileSystemItem(BaseModel):
    id: int
    name: str
    type: str  # Type can be 'file' or 'folder'
    parent_id: Optional[int] = None  # ID of the parent folder, if applicable
    content: Optional[str] = None  # Only for files, not folders

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