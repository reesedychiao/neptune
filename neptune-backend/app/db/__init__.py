# File: /neptune-backend/neptune-backend/app/db/__init__.py

from .database import engine, SessionLocal
from .models import Base

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()