from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import filesystem, folders, knowledge_graph

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(filesystem.router, prefix="/api/filesystem", tags=["filesystem"])
app.include_router(folders.router, prefix="/api/folders", tags=["folders"])
app.include_router(
    knowledge_graph.router,
    prefix="/api/knowledge-graph",
    tags=["knowledge_graph"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the Neptune Backend API"}