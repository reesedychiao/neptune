from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.security import verify_token

def get_current_user(token: str = Depends(verify_token), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.token == token).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    return user