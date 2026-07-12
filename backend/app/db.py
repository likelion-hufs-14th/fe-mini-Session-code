from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_database_url

engine = create_engine(get_database_url(), pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    """요청당 세션을 열고 응답 후 닫는다."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
