# File: /neptune-backend/neptune-backend/app/api/routes/__init__.py

from fastapi import APIRouter

router = APIRouter()

from .filesystem import router as filesystem_router
from .folders import router as folders_router

router.include_router(filesystem_router, prefix="/filesystem", tags=["filesystem"])
router.include_router(folders_router, prefix="/folders", tags=["folders"])