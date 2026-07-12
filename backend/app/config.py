import os


def get_database_url() -> str:
    """환경변수 DATABASE_URL을 읽어 SQLAlchemy+psycopg v3용 URL로 정규화한다.

    Render는 postgres:// 형식을 주지만 SQLAlchemy는 postgresql+psycopg:// 를 원한다.
    """
    url = os.getenv("DATABASE_URL")
    if not url:
        raise RuntimeError("DATABASE_URL environment variable is not set")
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url
