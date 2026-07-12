# 인시너 API 도메인 구현 계획 (Incineration API Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 인프라 스펙의 예시 리소스 `items`를 실제 도메인(글 `posts` + 댓글 `comments` + 좋아요/싫어요 타이머)으로 교체한다.

**Architecture:** 기존 `backend/app/` 구조(FastAPI + SQLAlchemy 2.0 + Pydantic v2)를 그대로 따른다. DB 모델(`models.py`) / 요청·응답 스키마(`schemas.py`) / 라우터(`routers/posts.py`)로 책임을 나눈다. 남은 시간과 만료 소각(lazy delete)은 라우터의 소형 헬퍼와 모델의 계산 프로퍼티로 처리한다.

**Tech Stack:** FastAPI 0.139.0, SQLAlchemy 2.0.51, Pydantic 2.13.4, psycopg[binary] 3.3.4, Uvicorn — 모두 `requirements.txt`에 고정됨(이번 계획에서 의존성 추가 없음). Python 3.12.

## 검증 정책 (프로젝트 제약 — 스킬의 기본 TDD를 대체)

인프라 스펙이 **로컬/자동 테스트 스위트와 별도 테스트 DB를 금지**하고, `config.py`는 `DATABASE_URL` 없이는 import조차 막는다. 따라서:

- **각 코드 태스크**의 검증 = `python -m py_compile <파일>`로 **문법만** 즉시 점검(실행·DB·의존성 불필요) 후 커밋.
- **실제 동작 검증**(DB 영속화·타이머·lazy delete·CORS·Swagger) = **마지막 Task 7의 배포 후 검증**에서 스펙의 성공 기준 12개로 수행.
- (선택) 로컬에 의존성이 깔려 있다면, 더미 URL로 Swagger 스키마만 로컬 확인 가능(연결 안 함): `DATABASE_URL=postgresql://x@x/x python -c "from app.main import app; import json; print(json.dumps(app.openapi())[:200])"`. 필수는 아님.

## Global Constraints

스펙에서 그대로 가져온 프로젝트 전역 규칙. **모든 태스크의 요구사항에 암묵적으로 포함된다.**

- **길이 제한:** `nickname` ≤ 20자, 글/댓글 `content` ≤ 300자, 모두 `min_length=1`(빈 값 금지).
- **타이머:** 기본 노출 `created_at + 24h`. 좋아요 1개 `+10분`, 싫어요 1개 `-10분`. 상한 `created_at + 48h`. **하한 없음**.
- **댓글은 타이머에 영향 없음.**
- **만료 처리:** 조회(목록·상세·반응·댓글) 시 `expires_at <= now`인 글을 DB에서 실제 삭제(lazy delete). 별도 스케줄러 없음.
- **닉네임:** 클라이언트가 요청 바디로 보냄. 서버에 세션/인증/닉발급 없음.
- **반응 중복 방지 없음** — 누르면 무조건 +1.
- **페이지네이션 없음** — 목록은 만료 제외 후 전부 반환, **최신순(`created_at desc`)**. 댓글도 최신순.
- **시각은 tz-aware UTC**로 저장/비교(`DateTime(timezone=True)`, `datetime.now(timezone.utc)`).
- **CORS:** `allow_origins=["http://localhost:5173"]` 고정(기존 `main.py` 유지, 변경 금지).
- **주석 컨벤션:** 파일 헤더 1줄 `/** */`(파이썬은 `"""..."""`) + 모든 export 1줄 설명. 주석 한국어, 식별자 영어. 자명한 줄엔 주석 금지.
- **의존성 추가·마이그레이션 도구 없음.** 새 테이블은 앱 시작 시 `Base.metadata.create_all`로 자동 생성.

## 파일 구조 (생성/수정 대상)

```
backend/app/
├─ main.py            # 수정: example 라우터 → posts 라우터 등록
├─ config.py          # 변경 없음
├─ db.py              # 변경 없음
├─ models.py          # 전면 교체: Item → Post, Comment
├─ schemas.py         # 전면 교체: Item 스키마 → Post/Comment 스키마
└─ routers/
   ├─ example.py      # 삭제
   └─ posts.py        # 신규: 헬퍼 + 글/반응/댓글 엔드포인트 (단일 파일)
backend/README.md     # 수정: 리소스 설명 갱신
```

댓글은 글에 종속(중첩 URL)되고 헬퍼(`_get_active_post`)를 공유하므로 **`posts.py` 한 파일**에 둔다(별도 `comments.py` 미분리 — 단순성 우선).

---

## Task 1: DB 모델 교체 (Post, Comment)

**Files:**
- Modify(전면 교체): `backend/app/models.py`

**Interfaces:**
- Consumes: `app.db.Base`.
- Produces:
  - `Post` ORM 클래스 — 컬럼 `id:int`, `nickname:str`, `content:str`, `created_at:datetime`, `expires_at:datetime`, `like_count:int`, `dislike_count:int`, `comment_count:int`, 관계 `comments`, 계산 프로퍼티 `remaining_seconds -> int`.
  - `Comment` ORM 클래스 — 컬럼 `id:int`, `post_id:int`(FK→posts.id, ON DELETE CASCADE), `nickname:str`, `content:str`, `created_at:datetime`, 관계 `post`.

- [ ] **Step 1: `models.py`를 아래 내용으로 전면 교체**

```python
"""SQLAlchemy DB 모델 — posts(소각 로그)·comments(댓글). PostgreSQL 테이블에 대응."""

import math
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Post(Base):
    """소각 로그 한 건 — 24h 타이머·반응 카운트, 남은 시간은 계산 프로퍼티로 노출."""

    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    nickname: Mapped[str] = mapped_column(String(20))
    content: Mapped[str] = mapped_column(String(300))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    like_count: Mapped[int] = mapped_column(Integer, default=0)
    dislike_count: Mapped[int] = mapped_column(Integer, default=0)
    comment_count: Mapped[int] = mapped_column(Integer, default=0)

    comments: Mapped[list["Comment"]] = relationship(
        back_populates="post", cascade="all, delete-orphan", passive_deletes=True
    )

    @property
    def remaining_seconds(self) -> int:
        """소각까지 남은 초 — 응답 시마다 계산하며 만료 시 0(양수 잔여는 올림해 0⟺소각 정합)."""
        delta = (self.expires_at - datetime.now(timezone.utc)).total_seconds()
        return max(0, math.ceil(delta))


class Comment(Base):
    """글에 달린 익명 댓글 — 타이머에는 영향을 주지 않는다."""

    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(primary_key=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"))
    nickname: Mapped[str] = mapped_column(String(20))
    content: Mapped[str] = mapped_column(String(300))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    post: Mapped["Post"] = relationship(back_populates="comments")
```

> `ondelete="CASCADE"` + `passive_deletes=True` 조합으로, 벌크 삭제(`delete(Post)`)든 단건 `db.delete(post)`든 댓글이 DB 레벨에서 함께 삭제된다.

- [ ] **Step 2: 문법 점검(DB 불필요)**

Run: `python -m py_compile backend/app/models.py`
Expected: 출력 없음(exit 0). 문법 오류 없음.

- [ ] **Step 3: 커밋**

```bash
git add backend/app/models.py
git commit -m "feat(backend): replace Item model with Post, Comment"
```

---

## Task 2: Pydantic 스키마 교체 (Post/Comment 요청·응답)

**Files:**
- Modify(전면 교체): `backend/app/schemas.py`

**Interfaces:**
- Consumes: (없음 — 순수 Pydantic)
- Produces:
  - `PostCreate` — `nickname:str`, `content:str`.
  - `PostRead` — `id, nickname, content, like_count, dislike_count, comment_count, remaining_seconds, created_at, expires_at` (모두 필수, `from_attributes=True`).
  - `CommentCreate` — `nickname:str`, `content:str`.
  - `CommentRead` — `id, post_id, nickname, content, created_at` (`from_attributes=True`).

- [ ] **Step 1: `schemas.py`를 아래 내용으로 전면 교체**

```python
"""Pydantic 요청/응답 모델 — Swagger 스키마의 핵심. 모든 필드에 설명·예시를 채운다."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PostCreate(BaseModel):
    """글 공유 요청 바디 — 클라이언트가 닉네임과 내용을 담아 보낸다."""

    nickname: str = Field(
        ..., min_length=1, max_length=20,
        description="세션마다 클라이언트가 부여한 랜덤 익명 닉네임",
        examples=["익명의두더지"],
    )
    content: str = Field(
        ..., min_length=1, max_length=300,
        description="소각할 감정 로그. 최대 300자.",
        examples=["아 집가고 싶다.."],
    )


class PostRead(BaseModel):
    """피드/상세 응답 — remaining_seconds는 서버가 매 응답마다 계산한다."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="글 ID", examples=[42])
    nickname: str = Field(..., description="작성자 익명 닉네임", examples=["익명의두더지"])
    content: str = Field(..., description="글 내용", examples=["아 집가고 싶다.."])
    like_count: int = Field(..., description="좋아요 수 (누를 때마다 노출 시간 연장)", examples=[3])
    dislike_count: int = Field(..., description="싫어요 수 (누를 때마다 노출 시간 단축)", examples=[1])
    comment_count: int = Field(..., description="댓글 수 (타이머에는 영향 없음)", examples=[5])
    remaining_seconds: int = Field(
        ..., description="소각까지 남은 초. 0이면 다음 조회 시 영구 삭제된다.",
        examples=[74520],
    )
    created_at: datetime = Field(..., description="작성 시각(UTC)", examples=["2026-07-12T10:00:00Z"])
    expires_at: datetime = Field(
        ..., description="소각 예정 시각(UTC). 반응에 따라 변동.",
        examples=["2026-07-13T10:00:00Z"],
    )


class CommentCreate(BaseModel):
    """댓글 작성 요청 바디."""

    nickname: str = Field(
        ..., min_length=1, max_length=20,
        description="세션마다 클라이언트가 부여한 랜덤 익명 닉네임",
        examples=["지나가던행인"],
    )
    content: str = Field(
        ..., min_length=1, max_length=300,
        description="댓글 내용. 최대 300자.",
        examples=["저도 진짜 집에 가고 싶어요ㅠㅠ"],
    )


class CommentRead(BaseModel):
    """댓글 응답."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="댓글 ID", examples=[7])
    post_id: int = Field(..., description="소속 글 ID", examples=[42])
    nickname: str = Field(..., description="작성자 익명 닉네임", examples=["지나가던행인"])
    content: str = Field(..., description="댓글 내용", examples=["저도 진짜 집에 가고 싶어요ㅠㅠ"])
    created_at: datetime = Field(..., description="작성 시각(UTC)", examples=["2026-07-12T10:05:00Z"])
```

- [ ] **Step 2: 문법 점검**

Run: `python -m py_compile backend/app/schemas.py`
Expected: 출력 없음(exit 0).

- [ ] **Step 3: 커밋**

```bash
git add backend/app/schemas.py
git commit -m "feat(backend): replace Item schemas with Post, Comment schemas"
```

---

## Task 3: posts 라우터 골격 + 글 생성/조회

**Files:**
- Create: `backend/app/routers/posts.py`

**Interfaces:**
- Consumes: `app.db.get_db`, `app.models.Post`/`Comment`, `app.schemas.PostCreate`/`PostRead`/`CommentCreate`/`CommentRead`.
- Produces:
  - `router` (APIRouter, prefix `/posts`, tag `posts`).
  - 헬퍼 `_now() -> datetime`, `_purge_expired(db) -> None`, `_get_active_post(db, post_id) -> Post`(만료/부재 시 404).
  - 상수 `BASE_LIFE`(24h), `REACTION_STEP`(10분), `MAX_LIFE`(48h).
  - 엔드포인트 `GET /posts`, `GET /posts/{id}`, `POST /posts`.
  - (Task 4·5가 이 파일의 `router`와 헬퍼에 엔드포인트를 덧붙인다.)

- [ ] **Step 1: `backend/app/routers/posts.py` 생성** (import는 Task 4·5에서 쓸 것까지 모두 선언)

```python
"""글(posts)·반응·댓글 엔드포인트 — 타이머 계산과 만료 글 lazy delete를 담당한다."""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Comment, Post
from app.schemas import CommentCreate, CommentRead, PostCreate, PostRead

router = APIRouter(prefix="/posts", tags=["posts"])

BASE_LIFE = timedelta(hours=24)         # 생성 시 기본 노출 시간
REACTION_STEP = timedelta(minutes=10)   # 좋아요/싫어요 1개당 가감폭
MAX_LIFE = timedelta(hours=48)          # 생성 시각 기준 노출 상한


def _now() -> datetime:
    """tz-aware 현재 시각(UTC) — timestamptz 컬럼과 비교하려면 aware여야 한다."""
    return datetime.now(timezone.utc)


def _purge_expired(db: Session) -> None:
    """만료된 글을 실제 삭제(lazy delete). 댓글은 FK ON DELETE CASCADE로 함께 제거된다."""
    db.execute(delete(Post).where(Post.expires_at <= _now()))
    db.commit()


def _get_active_post(db: Session, post_id: int) -> Post:
    """없거나 이미 만료된 글이면 404. 만료된 경우 이 시점에 소각한다."""
    post = db.get(Post, post_id)
    if post is not None and post.expires_at <= _now():
        db.delete(post)
        db.commit()
        post = None
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return post


@router.get(
    "", response_model=list[PostRead], summary="피드 목록 조회",
    responses={200: {"description": "만료되지 않은 글 목록(최신순)."}},
)
def list_posts(db: Session = Depends(get_db)):
    """만료되지 않은 글을 최신순으로 모두 반환한다(페이지네이션 없음)."""
    _purge_expired(db)
    return db.scalars(select(Post).order_by(Post.created_at.desc())).all()


@router.get(
    "/{post_id}", response_model=PostRead, summary="글 상세 조회",
    responses={
        200: {"description": "글 상세."},
        404: {"description": "없거나 이미 소각된 글."},
    },
)
def get_post(post_id: int, db: Session = Depends(get_db)):
    """글 하나를 반환한다. 만료된 글은 조회 시 소각되고 404를 반환한다."""
    return _get_active_post(db, post_id)


@router.post(
    "", response_model=PostRead, status_code=status.HTTP_201_CREATED,
    summary="글 공유 (피드 행)",
    responses={
        201: {"description": "소각장에 등록된 글. 24시간 타이머가 시작된다."},
        422: {"description": "검증 실패 — 내용이 비었거나 300자를 초과함."},
    },
)
def create_post(payload: PostCreate, db: Session = Depends(get_db)):
    """공유한 글을 소각장(피드)에 등록하고 24시간 타이머를 시작한다.

    - 즉시 소각한 글은 서버로 오지 않는다(프론트에서 처리).
    - 생성 직후 remaining_seconds는 86400(24h)이다.
    """
    now = _now()
    post = Post(
        nickname=payload.nickname,
        content=payload.content,
        created_at=now,
        expires_at=now + BASE_LIFE,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post
```

> `CommentCreate`/`CommentRead`/`Comment` import는 Task 5에서 사용되므로 지금은 미사용 상태다(문법·실행에 무해). 순서 무관하게 읽는 실행자를 위해 미리 선언한다.

- [ ] **Step 2: 문법 점검**

Run: `python -m py_compile backend/app/routers/posts.py`
Expected: 출력 없음(exit 0).

- [ ] **Step 3: 커밋**

```bash
git add backend/app/routers/posts.py
git commit -m "feat(backend): add posts router with create/list/detail + lazy delete"
```

---

## Task 4: 반응 엔드포인트 (좋아요/싫어요 + 타이머)

**Files:**
- Modify: `backend/app/routers/posts.py` (파일 끝에 두 엔드포인트 추가)

**Interfaces:**
- Consumes: Task 3의 `router`, `_get_active_post`, `REACTION_STEP`, `MAX_LIFE`.
- Produces: `POST /posts/{id}/like`, `POST /posts/{id}/dislike` — 둘 다 갱신된 `PostRead` 반환.

- [ ] **Step 1: `posts.py` 맨 끝에 아래 두 엔드포인트를 추가**

```python
@router.post(
    "/{post_id}/like", response_model=PostRead, summary="좋아요",
    responses={
        200: {"description": "갱신된 글(좋아요 +1, 노출 시간 연장)."},
        404: {"description": "없거나 이미 소각된 글."},
    },
)
def like_post(post_id: int, db: Session = Depends(get_db)):
    """좋아요 +1. 노출 시각을 10분 연장하되 생성 후 48시간을 넘지 못한다."""
    post = _get_active_post(db, post_id)
    post.like_count += 1
    post.expires_at = min(post.expires_at + REACTION_STEP, post.created_at + MAX_LIFE)
    db.commit()
    db.refresh(post)
    return post


@router.post(
    "/{post_id}/dislike", response_model=PostRead, summary="싫어요",
    responses={
        200: {"description": "갱신된 글(싫어요 +1, 노출 시간 단축)."},
        404: {"description": "없거나 이미 소각된 글."},
    },
)
def dislike_post(post_id: int, db: Session = Depends(get_db)):
    """싫어요 +1. 노출 시각을 10분 단축한다(하한 없음; now 이하가 되면 다음 조회 시 소각)."""
    post = _get_active_post(db, post_id)
    post.dislike_count += 1
    post.expires_at = post.expires_at - REACTION_STEP
    db.commit()
    db.refresh(post)
    return post
```

- [ ] **Step 2: 문법 점검**

Run: `python -m py_compile backend/app/routers/posts.py`
Expected: 출력 없음(exit 0).

- [ ] **Step 3: 커밋**

```bash
git add backend/app/routers/posts.py
git commit -m "feat(backend): add like/dislike endpoints with timer extend/shorten"
```

---

## Task 5: 댓글 엔드포인트 (목록/작성)

**Files:**
- Modify: `backend/app/routers/posts.py` (파일 끝에 두 엔드포인트 추가)

**Interfaces:**
- Consumes: Task 3의 `router`, `_get_active_post`, `_now`, `Comment`, `CommentCreate`, `CommentRead`.
- Produces: `GET /posts/{id}/comments`(list[CommentRead], 최신순), `POST /posts/{id}/comments`(201 + CommentRead, 글의 `comment_count` +1).

- [ ] **Step 1: `posts.py` 맨 끝에 아래 두 엔드포인트를 추가**

```python
@router.get(
    "/{post_id}/comments", response_model=list[CommentRead], summary="댓글 목록 조회",
    responses={
        200: {"description": "댓글 목록(최신순)."},
        404: {"description": "없거나 이미 소각된 글."},
    },
)
def list_comments(post_id: int, db: Session = Depends(get_db)):
    """글의 댓글을 최신순으로 반환한다."""
    _get_active_post(db, post_id)
    return db.scalars(
        select(Comment).where(Comment.post_id == post_id).order_by(Comment.created_at.desc())
    ).all()


@router.post(
    "/{post_id}/comments", response_model=CommentRead, status_code=status.HTTP_201_CREATED,
    summary="댓글 작성",
    responses={
        201: {"description": "작성된 댓글. 글의 comment_count가 +1 된다."},
        404: {"description": "없거나 이미 소각된 글."},
        422: {"description": "검증 실패 — 내용이 비었거나 300자를 초과함."},
    },
)
def create_comment(post_id: int, payload: CommentCreate, db: Session = Depends(get_db)):
    """댓글을 작성한다. 타이머에는 영향을 주지 않는다."""
    post = _get_active_post(db, post_id)
    comment = Comment(
        post_id=post_id,
        nickname=payload.nickname,
        content=payload.content,
        created_at=_now(),
    )
    post.comment_count += 1
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment
```

- [ ] **Step 2: 문법 점검**

Run: `python -m py_compile backend/app/routers/posts.py`
Expected: 출력 없음(exit 0).

- [ ] **Step 3: 커밋**

```bash
git add backend/app/routers/posts.py
git commit -m "feat(backend): add comment list/create endpoints (no timer effect)"
```

---

## Task 6: 앱 배선 + 예시 리소스 제거 + README 갱신

**Files:**
- Modify: `backend/app/main.py` (라우터 import/등록 2줄)
- Delete: `backend/app/routers/example.py`
- Modify: `backend/README.md` (리소스 설명 2줄)

**Interfaces:**
- Consumes: Task 3~5의 `app.routers.posts.router`.
- Produces: `posts` 라우터가 등록된 FastAPI 앱. `example`/`items` 흔적 제거.

- [ ] **Step 1: `main.py`의 라우터 import 교체** — 8번째 줄

`from app.routers import example` 를 다음으로 바꾼다:

```python
from app.routers import posts
```

- [ ] **Step 2: `main.py`의 라우터 등록 교체** — 마지막 줄

`app.include_router(example.router)` 를 다음으로 바꾼다:

```python
app.include_router(posts.router)
```

> `from app import models  # noqa` 줄과 CORS·health·lifespan은 **그대로 둔다**(Base.metadata에 새 테이블이 등록되려면 models import가 필요).

- [ ] **Step 3: 예시 라우터 파일 삭제**

```bash
git rm backend/app/routers/example.py
```

- [ ] **Step 4: `README.md`의 리소스 설명 갱신** — `app/routers/example.py` 줄과 `검증` 줄

`- app/routers/example.py — /items CRUD` 를 다음으로 바꾼다:

```markdown
- `app/routers/posts.py` — `/posts` 글·좋아요/싫어요·댓글 엔드포인트
```

그리고 맨 아래 `## 검증` 문단의 `... CRUD ...` 문장을 다음으로 바꾼다:

```markdown
로컬 테스트는 없음. 배포 후 `/docs`·`/health`·글/댓글 CRUD·좋아요(연장)/싫어요(단축)·재시작 후 데이터 유지로 확인.
```

- [ ] **Step 5: 문법 점검**

Run: `python -m py_compile backend/app/main.py`
Expected: 출력 없음(exit 0). `example.py`가 삭제됐고 어디서도 참조되지 않음.

- [ ] **Step 6: 커밋**

```bash
git add backend/app/main.py backend/README.md
git commit -m "feat(backend): wire posts router, drop example resource, update README"
```

---

## Task 7: 배포 후 검증 (스펙 성공 기준)

**Files:** (코드 변경 없음 — 배포 + 수동 검증)

로컬 검증이 없으므로, **여기서 배포본을 대상으로 스펙의 성공 기준을 전부 확인**한다. 아래 `$BASE`를 배포 URL로 치환한다(예: `https://likelion-mini.onrender.com`). 무료 티어는 sleep될 수 있으니 먼저 `/docs`로 워밍업한다.

- [ ] **Step 1: 배포 & 스키마 확인**
  - Render Web Service가 새 커밋으로 재배포됐는지 확인.
  - `$BASE/docs` 로딩 → `posts` 태그의 7개 엔드포인트가 모두 보임(성공 기준 1).
  - `curl $BASE/health` → `{"status":"ok"}` (기준 2).

- [ ] **Step 2: 글 생성·조회 (기준 2,3,4)**

```bash
curl -s -X POST $BASE/posts -H 'Content-Type: application/json' \
  -d '{"nickname":"익명의두더지","content":"아 집가고 싶다.."}'
# → 201, remaining_seconds ≈ 86400, like/dislike/comment_count = 0, id 확인 (이하 $ID)
curl -s $BASE/posts            # → 방금 글이 배열 맨 앞(최신순)
curl -s $BASE/posts/$ID        # → 상세
curl -s -o /dev/null -w '%{http_code}\n' $BASE/posts/999999   # → 404
```

- [ ] **Step 3: 반응 타이머 + 48h 상한 (기준 5,6)**

```bash
curl -s -X POST $BASE/posts/$ID/like     # → like_count=1, remaining_seconds 증가
curl -s -X POST $BASE/posts/$ID/dislike  # → dislike_count=1, remaining_seconds 감소

# 상한(48h=172800초) 확인: 새 글에 좋아요를 대량으로 눌러 캡되는지
CAP=$(curl -s -X POST $BASE/posts -H 'Content-Type: application/json' \
  -d '{"nickname":"캡테스트","content":"cap"}' | python -c "import sys,json;print(json.load(sys.stdin)['id'])")
for i in $(seq 1 200); do curl -s -o /dev/null -X POST $BASE/posts/$CAP/like; done
curl -s $BASE/posts/$CAP   # → remaining_seconds가 ≈172800에서 멈춤(206400 아님 = 캡 동작)
```

- [ ] **Step 4: 댓글 (기준 7,8)**

```bash
curl -s -X POST $BASE/posts/$ID/comments -H 'Content-Type: application/json' \
  -d '{"nickname":"지나가던행인","content":"저도 진짜 집에 가고 싶어요ㅠㅠ"}'
# → 201 (CommentRead)
curl -s $BASE/posts/$ID          # → comment_count 1 (타이머 불변)
curl -s $BASE/posts/$ID/comments # → 방금 댓글이 최신순으로
```

- [ ] **Step 5: 검증 실패(422) · 반응/댓글 404 · Swagger 스키마 (기준 9,10)**

```bash
# 422 — 빈 내용 / 300자 초과 / 닉네임 누락
curl -s -o /dev/null -w '%{http_code}\n' -X POST $BASE/posts \
  -H 'Content-Type: application/json' -d '{"nickname":"익명","content":""}'                 # → 422
curl -s -o /dev/null -w '%{http_code}\n' -X POST $BASE/posts \
  -H 'Content-Type: application/json' \
  -d "{\"nickname\":\"익명\",\"content\":\"$(python -c 'print("가"*301)')\"}"                 # → 422
curl -s -o /dev/null -w '%{http_code}\n' -X POST $BASE/posts \
  -H 'Content-Type: application/json' -d '{"content":"닉네임없음"}'                            # → 422

# 404 — 없는 글에 반응/댓글
curl -s -o /dev/null -w '%{http_code}\n' -X POST $BASE/posts/999999/like                     # → 404
curl -s -o /dev/null -w '%{http_code}\n' -X POST $BASE/posts/999999/comments \
  -H 'Content-Type: application/json' -d '{"nickname":"x","content":"y"}'                     # → 404
```
  - `$BASE/openapi.json`에 요청 바디·응답 스키마 포함, Swagger에 모든 필드 설명·예시 노출 확인.

- [ ] **Step 6: lazy delete + 물리 삭제/cascade (기준 12)** — 24h를 기다리지 않고 싫어요로 만료를 강제

```bash
# 새 글($ID2)에 댓글 1개를 단 뒤, 24h/10분=144회 초과 싫어요로 expires_at을 now 아래로 끌어내린다
ID2=$(curl -s -X POST $BASE/posts -H 'Content-Type: application/json' \
  -d '{"nickname":"곧소각","content":"burn"}' | python -c "import sys,json;print(json.load(sys.stdin)['id'])")
curl -s -o /dev/null -X POST $BASE/posts/$ID2/comments \
  -H 'Content-Type: application/json' -d '{"nickname":"목격자","content":"곧 사라질 글"}'
for i in $(seq 1 150); do curl -s -o /dev/null -X POST $BASE/posts/$ID2/dislike; done

curl -s -o /dev/null -w '%{http_code}\n' $BASE/posts/$ID2   # → 404 (조회 시 소각됨)
# 목록에서 사라졌는지 — 공백 유무에 안전한 JSON 파싱으로 확인(grep 금지)
curl -s $BASE/posts | python -c "import sys,json; ids=[p['id'] for p in json.load(sys.stdin)]; print('목록에서 사라짐' if $ID2 not in ids else '아직 있음!')"
# (선택) 물리 삭제 + 댓글 cascade를 DB에서 직접 확인 — Render PSQL 콘솔에서:
#   SELECT count(*) FROM posts    WHERE id=$ID2;       -- 0
#   SELECT count(*) FROM comments WHERE post_id=$ID2;  -- 0 (ON DELETE CASCADE)
```

- [ ] **Step 7: CORS & 영속성 (기준 11,9(재시작))**
  - 로컬 Vite 프론트(`http://localhost:5173`)에서 `fetch($BASE/posts)`가 CORS 차단 없이 성공(기준 11).
  - Render 대시보드에서 Web Service **Manual Restart** 후 `curl $BASE/posts/$ID` → Step 2에서 만든 글이 유지됨(기준 9의 영속화 최종 확인).

- [ ] **Step 8: 기존 `items` 테이블 정리 (스펙의 교체 절차)**

새 `posts`/`comments`는 `create_all`로 자동 생성된다. 인프라 검증용 임시 `items` 테이블을 스펙의 교체 절차대로 제거한다. Render PSQL 콘솔에서:

```sql
DROP TABLE IF EXISTS items;
```

---

## Self-Review (작성자 점검 결과)

- **스펙 커버리지:** 데이터 모델(T1,2), 7개 엔드포인트(T3 글, T4 반응, T5 댓글), 타이머 규칙(T4), lazy delete(T3 헬퍼), Swagger 문서화 기준(T2 스키마 + T3~5 라우터 데코레이터), `items` 교체(T6), 성공 기준 12개(T7) — 모두 대응됨.
- **플레이스홀더:** 없음. 모든 코드 스텝에 실제 코드 포함.
- **타입 일관성:** `_get_active_post`/`_now`/`_purge_expired`, 상수 `BASE_LIFE`/`REACTION_STEP`/`MAX_LIFE`, 스키마명(`PostCreate`/`PostRead`/`CommentCreate`/`CommentRead`)이 태스크 간 동일하게 사용됨. `Post.remaining_seconds` 프로퍼티 ↔ `PostRead.remaining_seconds` 필드(from_attributes) 연결 확인.
```
