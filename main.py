import secrets, uvicorn
from datetime import datetime, timezone
from typing import Optional
from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, String, Text, DateTime, Boolean, event
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker, Session
import os
from pathlib import Path

Path("database").mkdir(parents=True, exist_ok=True)
engine = create_engine("sqlite:///./database/nekobin.db", connect_args={"check_same_thread": False})

# Database
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_con, con_record):
    cursor = dbapi_con.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA synchronous=NORMAL")
    cursor.close()

SessionLocal = sessionmaker(bind=engine)
class Base(DeclarativeBase): pass

class Paste(Base):
    __tablename__ = "pastes"
    id: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    content: Mapped[str] = mapped_column(Text)
    is_burn: Mapped[bool] = mapped_column(Boolean, default=False)
    password_hash: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# Backend
@app.post("/p/")
async def create_paste(content: str = Body(...), is_burn: bool = False, pw: str = None, db: Session = Depends(get_db)):
    pid = secrets.token_urlsafe(6)
    db.add(Paste(id=pid, content=content, is_burn=is_burn, password_hash=pw))
    db.commit()
    return {"id": pid}

@app.get("/p/{pid}")
async def get_paste(pid: str, password: str = None, db: Session = Depends(get_db)):
    p = db.query(Paste).filter(Paste.id == pid).first()
    if not p: raise HTTPException(404)
    if p.password_hash and p.password_hash != password: raise HTTPException(401, "Wrong password")
    
    content = p.content
    if p.is_burn:
        db.delete(p); db.commit()
    return content

# Frontend
app.mount("/", StaticFiles(directory="web/dist", html=True), name="dist")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)