# File: /neptune-backend/neptune-backend/app/api/routes/__init__.py

from fastapi import APIRouter

router = APIRouter()

from .filesystem import router as filesystem_router
from .folders import router as folders_router
from .knowledge_graph import router as knowledge_graph_router

router.include_router(filesystem_router, prefix="/filesystem", tags=["filesystem"])
router.include_router(folders_router, prefix="/folders", tags=["folders"])
router.include_router(knowledge_graph_router, prefix="/knowledge_graph", tags=["knowledge_graph"])