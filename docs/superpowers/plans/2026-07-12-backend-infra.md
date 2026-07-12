# 백엔드 인프라 골격 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** FastAPI 예시 리소스(`items`)로 `배포 → Swagger → CORS → PostgreSQL 영속화` 파이프라인을 증명하는 백엔드 인프라 골격을 만들어 Render에 배포한다.

**Architecture:** `backend/app/` 아래 FastAPI 앱을 계층별 단일 책임 파일로 구성한다(config·db·models·schemas·router·main). SQLAlchemy 2.0 + psycopg v3로 Render PostgreSQL에 영속화하고, 앱 시작 시 `create_all`로 테이블을 만든다. 검증은 로컬이 아니라 배포된 API를 대상으로 수행한다.

**Tech Stack:** Python 3.12, FastAPI, Uvicorn, SQLAlchemy 2.0, psycopg[binary] v3, PostgreSQL(Render), Render Web Service(Python 네이티브 런타임).

**참조 스펙:** [docs/superpowers/specs/2026-07-12-backend-infra-design.md](../specs/2026-07-12-backend-infra-design.md)

## Global Constraints

모든 태스크의 요구사항은 아래를 암묵적으로 포함한다. 스펙에서 그대로 가져온 값이다.

- **Python 3.12** — `.python-version`으로 고정(`3.12.8`).
- **의존성 정확히 핀** — `requirements.txt`에 아래 버전 고정. Render 빌드에서 특정 핀을 못 받으면 가장 가까운 패치로만 올린다.
  - `fastapi==0.139.0`
  - `uvicorn[standard]==0.51.0`
  - `sqlalchemy==2.0.51`
  - `psycopg[binary]==3.3.4`
  - `pydantic==2.13.4`
- **DB는 Render PostgreSQL 하나뿐** — 별도 테스트 DB 없음.
- **로컬/자동화 테스트 스위트 없음** — 정합성은 **배포된 API를 대상으로만** 검증(Task 7).
- **CORS 고정** — `allow_origins=["http://localhost:5173"]`.
- **Docker 미사용** — Render Python 네이티브 런타임.
- **DB 접속정보 커밋 금지** — `DATABASE_URL` 환경변수로만 주입, `.env`는 `.gitignore`.
- **모노레포** — 백엔드는 `backend/`. Render **Root Directory = `backend`**, 명령은 `backend` 기준 실행.
- **ORM/드라이버** — SQLAlchemy 2.0 declarative + psycopg v3. Render가 주는 `postgres://` URL은 `postgresql+psycopg://`로 정규화.
- **테이블 생성** — 앱 시작(lifespan)에서 `Base.metadata.create_all`. 마이그레이션 도구 미사용.
- **브랜치** — `main` 유지.

## File Structure

| 파일 | 책임 |
|---|---|
| `backend/.python-version` | Python 버전 고정 |
| `backend/.gitignore` | `.env`, `__pycache__` 등 제외 |
| `backend/requirements.txt` | 의존성 핀 |
| `backend/README.md` | 실행/배포/환경변수 안내 |
| `backend/app/__init__.py` | 패키지 마커 |
| `backend/app/config.py` | `DATABASE_URL` 로드 + URL 스킴 정규화 |
| `backend/app/db.py` | SQLAlchemy engine·SessionLocal·Base·`get_db` |
| `backend/app/models.py` | `Item` DB 모델(테이블) |
| `backend/app/schemas.py` | Pydantic 요청/응답 스키마 |
| `backend/app/routers/__init__.py` | 패키지 마커 |
| `backend/app/routers/example.py` | `/items` CRUD 라우터 |
| `backend/app/main.py` | 앱 조립: CORS·lifespan·health·라우터 등록 |

**검증 방식 주의:** 스펙상 로컬 테스트가 없으므로 Task 1–5는 "파일 생성 → (선택) import 스모크 → 커밋"이다. 실제 동작 검증은 배포 후 Task 7에서 한다.

---

### Task 1: 백엔드 스캐폴드 (설정 파일 + 패키지 뼈대)

**Files:**
- Create: `backend/.python-version`
- Create: `backend/.gitignore`
- Create: `backend/requirements.txt`
- Create: `backend/README.md`
- Create: `backend/app/__init__.py`
- Create: `backend/app/routers/__init__.py`

**Interfaces:**
- Consumes: 없음
- Produces: `backend/` 레이아웃과 핀된 의존성. 이후 모든 태스크가 이 위에 파일을 추가한다.

- [ ] **Step 1: `backend/.python-version` 생성**

```
3.12.8
```

- [ ] **Step 2: `backend/.gitignore` 생성**

```
__pycache__/
*.pyc
.env
.venv/
venv/
```

- [ ] **Step 3: `backend/requirements.txt` 생성**

```
fastapi==0.139.0
uvicorn[standard]==0.51.0
sqlalchemy==2.0.51
psycopg[binary]==3.3.4
pydantic==2.13.4
```

- [ ] **Step 4: `backend/app/__init__.py` 와 `backend/app/routers/__init__.py` 생성 (둘 다 빈 파일)**

```
```

- [ ] **Step 5: `backend/README.md` 생성**

````markdown
# Backend (LikeLion Mini 실습용 API)

프론트엔드 API 연동 실습을 위한 예시 백엔드. FastAPI + Render PostgreSQL.

## 구조
- `app/config.py` — DATABASE_URL 로드/정규화
- `app/db.py` — SQLAlchemy 엔진·세션·Base
- `app/models.py` — DB 모델(테이블)
- `app/schemas.py` — 요청/응답 스키마
- `app/routers/example.py` — `/items` CRUD
- `app/main.py` — 앱 조립(CORS·health·테이블 생성)

## 환경변수
- `DATABASE_URL` (필수) — PostgreSQL 접속 URL. Render Web Service 환경변수로 주입. 커밋 금지.

## Render 배포 설정
- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health Check Path: `/health`
- Web Service와 PostgreSQL은 **같은 region**, 배포본은 **Internal Database URL** 사용.

## 무료 티어 주의
- 15분 무요청 시 sleep → 다음 요청에 ~1분 재기동. 세션 직전 `/health` 또는 `/docs`로 워밍업.
- 재시작해도 PostgreSQL 데이터는 유지됨.

## 검증
로컬 테스트는 없음. 배포 후 `/docs`·`/health`·CRUD·재시작 후 데이터 유지로 확인.
````

- [ ] **Step 6: 커밋**

```bash
git add backend/
git commit -m "chore(backend): scaffold FastAPI project layout and pinned deps

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: 설정 & DB 계층

**Files:**
- Create: `backend/app/config.py`
- Create: `backend/app/db.py`

**Interfaces:**
- Consumes: 없음(표준 라이브러리 + SQLAlchemy)
- Produces:
  - `app.config.get_database_url() -> str` — 정규화된 SQLAlchemy URL 반환, 미설정 시 `RuntimeError`.
  - `app.db.Base` — declarative base(모델이 상속).
  - `app.db.engine` — SQLAlchemy Engine.
  - `app.db.get_db()` — 요청당 `Session`을 yield하는 FastAPI 의존성.

- [ ] **Step 1: `backend/app/config.py` 생성**

```python
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
```

- [ ] **Step 2: `backend/app/db.py` 생성**

```python
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
```

- [ ] **Step 3: (선택) import 스모크 체크**

Run(백엔드 폴더에서, 더미 URL로 — 실제 접속 안 함):
```bash
cd backend && DATABASE_URL="postgresql://u:p@localhost:5432/db" python -c "import app.db; print('db import ok')"
```
Expected: `db import ok` (create_engine은 지연 연결이라 DB 없이도 import 성공)

- [ ] **Step 4: 커밋**

```bash
git add backend/app/config.py backend/app/db.py
git commit -m "feat(backend): add config and SQLAlchemy db layer

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: DB 모델 & Pydantic 스키마

**Files:**
- Create: `backend/app/models.py`
- Create: `backend/app/schemas.py`

**Interfaces:**
- Consumes: `app.db.Base`
- Produces:
  - `app.models.Item` — 컬럼: `id:int(pk)`, `title:str`, `description:str`, `created_at:datetime`.
  - `app.schemas.ItemCreate` — 필드: `title:str`, `description:str=""`.
  - `app.schemas.ItemUpdate` — 필드: `title:str`, `description:str=""`.
  - `app.schemas.ItemRead` — 필드: `id`, `title`, `description`, `created_at` (`from_attributes=True`).

- [ ] **Step 1: `backend/app/models.py` 생성**

```python
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Item(Base):
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(String(1000), default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
```

- [ ] **Step 2: `backend/app/schemas.py` 생성**

```python
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ItemCreate(BaseModel):
    title: str = Field(
        ..., min_length=1, max_length=200,
        description="아이템 제목", examples=["첫 번째 아이템"],
    )
    description: str = Field(
        "", max_length=1000,
        description="아이템 설명", examples=["설명 예시입니다."],
    )


class ItemUpdate(BaseModel):
    title: str = Field(
        ..., min_length=1, max_length=200,
        description="아이템 제목", examples=["수정된 제목"],
    )
    description: str = Field(
        "", max_length=1000,
        description="아이템 설명", examples=["수정된 설명"],
    )


class ItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="아이템 ID", examples=[1])
    title: str = Field(..., description="아이템 제목", examples=["첫 번째 아이템"])
    description: str = Field(..., description="아이템 설명", examples=["설명 예시입니다."])
    created_at: datetime = Field(..., description="생성 시각(UTC)")
```

- [ ] **Step 3: (선택) import 스모크 체크**

Run:
```bash
cd backend && DATABASE_URL="postgresql://u:p@localhost:5432/db" python -c "import app.models, app.schemas; print('models/schemas ok')"
```
Expected: `models/schemas ok`

- [ ] **Step 4: 커밋**

```bash
git add backend/app/models.py backend/app/schemas.py
git commit -m "feat(backend): add Item model and request/response schemas

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: `/items` CRUD 라우터

**Files:**
- Create: `backend/app/routers/example.py`

**Interfaces:**
- Consumes: `app.db.get_db`, `app.models.Item`, `app.schemas.{ItemCreate,ItemUpdate,ItemRead}`
- Produces: `app.routers.example.router` — `prefix="/items"`, `tags=["items"]`. 엔드포인트: `GET ""`, `GET "/{item_id}"`, `POST ""`(201), `PUT "/{item_id}"`, `DELETE "/{item_id}"`(204).

- [ ] **Step 1: `backend/app/routers/example.py` 생성**

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Item
from app.schemas import ItemCreate, ItemRead, ItemUpdate

router = APIRouter(prefix="/items", tags=["items"])


@router.get("", response_model=list[ItemRead], summary="아이템 목록 조회")
def list_items(db: Session = Depends(get_db)):
    return db.scalars(select(Item).order_by(Item.id)).all()


@router.get("/{item_id}", response_model=ItemRead, summary="아이템 상세 조회")
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.get(Item, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return item


@router.post("", response_model=ItemRead, status_code=status.HTTP_201_CREATED, summary="아이템 생성")
def create_item(payload: ItemCreate, db: Session = Depends(get_db)):
    item = Item(title=payload.title, description=payload.description)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=ItemRead, summary="아이템 수정")
def update_item(item_id: int, payload: ItemUpdate, db: Session = Depends(get_db)):
    item = db.get(Item, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    item.title = payload.title
    item.description = payload.description
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, summary="아이템 삭제")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.get(Item, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    db.delete(item)
    db.commit()
```

- [ ] **Step 2: (선택) import 스모크 체크**

Run:
```bash
cd backend && DATABASE_URL="postgresql://u:p@localhost:5432/db" python -c "from app.routers.example import router; print(len(router.routes), 'routes')"
```
Expected: `5 routes`

- [ ] **Step 3: 커밋**

```bash
git add backend/app/routers/example.py
git commit -m "feat(backend): add items CRUD router

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: 앱 조립 (`main.py`)

**Files:**
- Create: `backend/app/main.py`

**Interfaces:**
- Consumes: `app.db.{Base,engine}`, `app.models`(테이블 등록용), `app.routers.example.router`
- Produces: `app.main.app` — FastAPI 인스턴스. `GET /health`, `/docs`, `/openapi.json`, `/items/*` 노출. 시작 시 `create_all`로 테이블 생성. CORS는 `http://localhost:5173` 고정.

- [ ] **Step 1: `backend/app/main.py` 생성**

```python
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
```

- [ ] **Step 2: (선택) import 스모크 체크 — 앱 전체가 조립되는지**

Run:
```bash
cd backend && DATABASE_URL="postgresql://u:p@localhost:5432/db" python -c "from app.main import app; print([r.path for r in app.routes if getattr(r,'path','').startswith(('/health','/items'))])"
```
Expected: `['/health', '/items', '/items/{item_id}', '/items', '/items/{item_id}', '/items/{item_id}']` (순서는 다를 수 있음; `/health`와 `/items` 경로가 존재하면 OK)

- [ ] **Step 3: 커밋**

```bash
git add backend/app/main.py
git commit -m "feat(backend): assemble app with CORS, health, table creation

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Render 배포 (PostgreSQL + Web Service)

> ⚠️ 이 태스크는 코드를 **GitHub `origin/main`에 push**해야 하고(공개됨), Render 대시보드 수작업이 포함된다. push 전에 사용자에게 확인한다.

**Files:** 없음(대시보드 설정). 코드 변경 없음.

**Interfaces:**
- Consumes: Task 1–5 결과가 `origin/main`에 올라가 있어야 함.
- Produces: 배포된 서비스 URL `https://<service>.onrender.com` (다음 태스크의 `$URL`).

- [ ] **Step 1: `origin/main`으로 push** (사용자 확인 후)

```bash
git push -u origin main
```
Expected: main 브랜치가 원격에 올라감.

- [ ] **Step 2: Render PostgreSQL 생성**

Render 대시보드 → **New → PostgreSQL** → 이름 입력 → **Region 선택(기록해 둘 것)** → **Free** 플랜 → Create.
생성 후 **Internal Database URL**을 복사(값은 어디에도 커밋하지 않음).

- [ ] **Step 3: Render Web Service 생성**

**New → Web Service** → 저장소 `likelion-hufs-14th/fe-mini-Session-code` 연결 → 설정:
- **Root Directory:** `backend`
- **Runtime/Language:** Python 3
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path:** `/health`
- **Region:** Step 2의 PostgreSQL과 **동일 region**
- **Instance Type:** Free
- **Environment Variables:**
  - `DATABASE_URL` = Step 2에서 복사한 **Internal Database URL**
  - (선택) `PYTHON_VERSION` = `3.12.8` — Render가 `.python-version`을 자동 인식하지 못할 경우 대비

- [ ] **Step 4: 배포 완료 대기 & URL 확보**

로그에서 build 성공 + `Uvicorn running` + health check 통과 확인. 서비스 URL을 기록한다(`$URL`).
Expected: 서비스 상태 **Live**.

---

### Task 7: 배포본 검증 (성공 기준)

**Files:** 없음(배포된 API 대상 검증).

**Interfaces:**
- Consumes: Task 6의 `$URL`.
- Produces: 없음(인프라 검증 완료 판정).

> 아래에서 `URL` 변수를 실제 배포 URL로 바꿔 실행한다. 예: `URL=https://fe-mini-session-code.onrender.com`
> 첫 요청은 sleep 해제로 ~1분 걸릴 수 있다.

- [ ] **Step 1: 헬스체크 & 워밍업**

```bash
URL=https://<service>.onrender.com
curl -s "$URL/health"
```
Expected: `{"status":"ok"}`

- [ ] **Step 2: 생성(POST) — PostgreSQL 기록 확인**

```bash
curl -s -X POST "$URL/items" -H "Content-Type: application/json" \
  -d '{"title":"첫 번째 아이템","description":"설명"}'
```
Expected: `201`, `{"id":1,"title":"첫 번째 아이템","description":"설명","created_at":"..."}` (id 부여됨)

- [ ] **Step 3: 조회(GET 목록/상세)**

```bash
curl -s "$URL/items"
curl -s "$URL/items/1"
```
Expected: 목록에 방금 항목 포함, 상세는 해당 항목 반환.

- [ ] **Step 4: 수정(PUT) / 삭제(DELETE)의 DB 반영**

```bash
curl -s -X PUT "$URL/items/1" -H "Content-Type: application/json" \
  -d '{"title":"수정된 제목","description":"수정된 설명"}'
curl -s -X POST "$URL/items" -H "Content-Type: application/json" \
  -d '{"title":"삭제될 항목","description":""}'   # id=2 생성
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE "$URL/items/2"
curl -s -o /dev/null -w "%{http_code}\n" "$URL/items/2"
```
Expected: PUT 응답에 수정된 값, DELETE → `204`, 삭제 후 조회 → `404`.

- [ ] **Step 5: 에러 코드 (404 / 422)**

```bash
curl -s -o /dev/null -w "%{http_code}\n" "$URL/items/999999"
curl -s -o /dev/null -w "%{http_code}\n" -X POST "$URL/items" \
  -H "Content-Type: application/json" -d '{}'
```
Expected: `404`, 그리고 `422`(title 누락).

- [ ] **Step 6: OpenAPI 스키마 & Swagger 문서화 확인**

```bash
curl -s "$URL/openapi.json" | python3 -c "import sys,json;d=json.load(sys.stdin);print('items path:', '/items' in d['paths']);print('ItemCreate schema:', 'ItemCreate' in d['components']['schemas'])"
```
Expected: `items path: True`, `ItemCreate schema: True`.
브라우저로 `$URL/docs`를 열어 Swagger UI 로딩 + 필드 설명/예시 노출 + **Try it out** 동작 확인.

- [ ] **Step 7: CORS 프리플라이트 확인**

```bash
curl -s -i -X OPTIONS "$URL/items" \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" | grep -i "access-control-allow-origin"
```
Expected: `access-control-allow-origin: http://localhost:5173`
(프론트가 준비되면 `http://localhost:5173`의 Vite 앱에서 `fetch("$URL/items")`가 CORS 차단 없이 성공하는지도 확인.)

- [ ] **Step 8: 재시작 후 영속화 확인 (핵심)**

Render 대시보드에서 Web Service를 **Manual Deploy → Restart**(또는 재배포). 재기동 후:
```bash
curl -s "$URL/items/1"
```
Expected: Step 4에서 **수정된** id=1 항목이 그대로 반환 → 재시작 후에도 PostgreSQL 데이터 유지됨.

- [ ] **Step 9: 검증 완료 판정**

Step 1–8이 모두 기대대로면 인프라 골격 완료. 스펙의 "성공 기준 — 배포 후 검증" 1–9 항목 충족.
다음 단계는 별도 스펙(스펙 2)에서 실제 API 도메인을 정해 예시 리소스를 교체한다.

---

## Self-Review

**1. Spec coverage (스펙 → 태스크 매핑):**
- FastAPI/Uvicorn/Python3.12 핀 → Task 1, Global Constraints
- config(`os.getenv`+정규화)/db(engine·세션·`get_db`) → Task 2
- Item 모델/테이블 + Pydantic 스키마 → Task 3
- `/items` 전체 CRUD(검색·페이지네이션 제외) + 404/422 → Task 4
- CORS 고정 + `/health` + lifespan `create_all` + Swagger 메타데이터 → Task 5
- Render 두 리소스(PG+Web), 같은 region, Internal URL, `DATABASE_URL`, Root Directory `backend`, Build/Start/Health, `PYTHON_VERSION` 대비 → Task 6
- 성공 기준 1–9(배포 `/docs`, health, CRUD, PG 기록, 404/422, OpenAPI 스키마·예시, CORS, 재시작 후 유지) → Task 7
- 접속정보 커밋 금지/`.env` gitignore → Task 1(.gitignore), Task 2/6(환경변수)
- 무료 티어 sleep·워밍업 → README(Task 1), Task 7 주석

**2. Placeholder scan:** 모든 코드/명령이 실제 내용. 미해결 TBD 없음. (배포 URL·Internal URL만 실행 시 채우는 런타임 값이며 자리표시자가 아님.)

**3. Type consistency:** `get_database_url`, `Base`, `engine`, `get_db`, `Item`, `ItemCreate/ItemUpdate/ItemRead`, `router` 이름이 정의 태스크와 소비 태스크에서 일치. 라우터 경로/응답모델 일관.

**Note:** 스펙의 "로컬/자동 테스트 없음, 배포 후 검증" 결정에 따라 TDD 스텝 대신 배포 후 curl 검증으로 구성함(사용자 지시가 스킬 기본값에 우선).
