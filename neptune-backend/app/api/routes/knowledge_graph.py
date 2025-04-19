from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict

from app.db.database import get_db
from app.services.knowledge_graph import generate_knowledge_graph, get_cached_graph_data

router = APIRouter()

@router.get("/", response_model=Dict)
async def get_knowledge_graph(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Get the knowledge graph data for visualization.
    This endpoint returns cached data if available and triggers a refresh in the background.
    """
    # Get current cached data
    graph_data = get_cached_graph_data()
    
    # Schedule update for next time
    background_tasks.add_task(generate_knowledge_graph, db)
    
    return graph_data

@router.post("/refresh", response_model=Dict)
async def refresh_knowledge_graph(db: Session = Depends(get_db)):
    """
    Force refresh the knowledge graph and wait for the results
    """
    return await generate_knowledge_graph(db)