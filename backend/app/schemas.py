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
