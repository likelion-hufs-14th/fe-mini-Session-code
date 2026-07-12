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
