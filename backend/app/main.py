from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401  (Base.metadata에 테이블 등록)
from app.db import Base, engine
from app.routers import example


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="LikeLion Mini 실습용 API",
    description="프론트엔드 API 연동 실습용 예시 백엔드. Swagger에서 요청/응답 스키마를 확인하세요.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health", tags=["system"], summary="헬스체크")
def health():
    return {"status": "ok"}


app.include_router(example.router)
