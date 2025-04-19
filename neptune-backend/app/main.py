from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import filesystem, folders

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(filesystem.router, prefix="/api/filesystem", tags=["filesystem"])
app.include_router(folders.router, prefix="/api/folders", tags=["folders"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Neptune Backend API"}