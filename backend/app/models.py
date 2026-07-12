"""SQLAlchemy DB 모델 — posts(소각 로그)·comments(댓글). PostgreSQL 테이블에 대응."""

import math
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Post(Base):
    """소각 로그 한 건 — 노출 타이머·반응 카운트, 남은 시간은 계산 프로퍼티로 노출."""

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
