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
