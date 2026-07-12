# 인시너 API 도메인 설계 (Incineration API Domain Design)

- **작성일:** 2026-07-12
- **상태:** 설계 확정 (구현 계획 작성 예정)
- **범위:** 스펙 1(인프라)이 세운 골격 위에 얹는 **실제 API 도메인**. 예시 리소스 `items`를 실제 리소스로 교체한다.
- **선행 문서:** [백엔드 인프라 설계](2026-07-12-backend-infra-design.md)

## 배경 & 목표

**인시너**는 익명·휘발성 감정 배설 서비스다. 로그인 없이 즉시 이용하며, 작성한 글은 24시간 뒤 "소각"되어 사라진다. 좋아요는 노출 시간을 늘리고 싫어요는 줄인다.

이 문서의 목표는 프론트 세션 실습에 쓸 **실제 API 도메인**(리소스·필드·엔드포인트·에러·타이머 규칙)을 확정하는 것이다. 인프라 스펙의 임시 `items` CRUD를 이 도메인으로 교체한다.

**교육 목표(스펙 1에서 계승):** 학생은 서버를 짜지 않는다. **완성된 프론트 UI에 API를 연동**하고 **Swagger 명세서를 읽는 법**을 배운다. 따라서 스웨거 문서화 밀도가 산출물의 핵심이다.

## 프론트/백엔드 책임 분리

이 서비스의 상당 부분은 프론트 연출이다. 백엔드는 아래만 책임진다.

**백엔드(이 스펙):**
- '공유(피드 행)'한 글 저장 및 24시간 타이머 관리.
- **남은 시간(`remaining_seconds`) 서버 계산** — 프론트의 흐려짐/바스러짐 이펙트가 이 값을 쓴다.
- 좋아요/싫어요 카운트 및 그에 따른 타이머 연장/단축.
- 댓글 저장 및 개수 집계.
- 피드 목록 / 상세 조회.

**프론트 전담(비목표):**
- 타는·바스러짐·소각 애니메이션, 실시간 렌더링.
- **즉시 소각** — 서버로 오지 않는다(프론트에서 생성→삭제로 끝).
- 캡처/우클릭/복사 차단.
- 게이지 렌더링(서버는 좋아요·싫어요 카운트만 제공, 그림은 프론트가 그린다).
- 랜덤 닉네임 생성(클라이언트가 세션마다 생성해 요청 바디에 담아 보낸다).

## 확정된 도메인 결정

| 항목 | 결정 |
|---|---|
| 리소스 | **글(`posts`)** / **댓글(`comments`)**. 반응은 글의 카운터. |
| 기본 노출 시간 | 생성 후 **24시간** |
| 좋아요 효과 | `expires_at += 10분` (누를 때마다) |
| 싫어요 효과 | `expires_at -= 10분` (누를 때마다) |
| 노출 시간 상한 | `expires_at ≤ created_at + 48시간` (휘발성 유지) |
| 노출 시간 하한 | 없음. 싫어요로 `expires_at ≤ now`가 되면 다음 조회 시 소각 |
| 댓글의 타이머 영향 | **없음**(순수 대화 기능) |
| 만료 글 처리 | **조회 시 실제 삭제(lazy delete)** — 별도 스케줄러 없음 |
| 닉네임 | **클라이언트가 생성·전송**. 서버는 저장만. 세션/인증 개념 없음 |
| 반응 중복 방지 | **없음**(인증 없으므로 순수 카운터, 누르면 +1) |
| 목록 페이지네이션 | **없음**. 만료 안 된 글 전부를 배열로 반환(최신순) |
| 남은 시간 표현 | 응답에 `remaining_seconds`(서버 계산) + `expires_at`(ISO) 동봉 |

## 데이터 모델

### `posts` 테이블

| 필드 | 타입 | 비고 |
|---|---|---|
| `id` | int PK | |
| `nickname` | str(≤20) | 클라이언트가 보냄 |
| `content` | str(≤300) | 최대 300자 |
| `created_at` | datetime(tz) | 서버 생성(`func.now()`) |
| `expires_at` | datetime(tz) | 서버: `created_at + 24h`, 반응으로 변동 |
| `like_count` | int, default 0 | |
| `dislike_count` | int, default 0 | |
| `comment_count` | int, default 0 | 댓글 생성 시 +1(조인 없이 읽도록 비정규화) |

### `comments` 테이블

| 필드 | 타입 | 비고 |
|---|---|---|
| `id` | int PK | |
| `post_id` | int, FK→`posts.id` | |
| `nickname` | str(≤20) | 클라이언트가 보냄 |
| `content` | str(≤300) | |
| `created_at` | datetime(tz) | 서버 생성 |

### 계산 필드(저장 안 함)

- `remaining_seconds` = `max(0, expires_at - now)` (초). 매 응답마다 서버가 즉석 계산한다. 카드의 🔥 `00H 00M` 표기는 프론트가 이 값으로 포맷한다.

## API 표면

`GET /health`는 스펙 1에서 유지된다. 아래는 도메인 엔드포인트다.

| 메서드 | 경로 | 목적 | 성공 응답 | 명세서 교육 포인트 |
|---|---|---|---|---|
| POST | `/posts` | 글 공유(피드 행) → 24h 타이머 시작 | `201` + `PostRead` | 요청 바디 스키마 |
| GET | `/posts` | 피드 목록(만료 제외, 최신순) | `200` + `list[PostRead]` | 응답 배열 스키마 |
| GET | `/posts/{id}` | 상세 | `200` + `PostRead` | 경로 파라미터 / 404 |
| POST | `/posts/{id}/like` | 좋아요 +1, 타이머 연장 | `200` + `PostRead` | 부수효과 있는 POST |
| POST | `/posts/{id}/dislike` | 싫어요 +1, 타이머 단축 | `200` + `PostRead` | 부수효과 있는 POST |
| GET | `/posts/{id}/comments` | 댓글 목록(최신순) | `200` + `list[CommentRead]` | 중첩(nested) 리소스 URL |
| POST | `/posts/{id}/comments` | 댓글 작성 | `201` + `CommentRead` | 중첩 리소스에 POST |

**응답 설계 근거:**
- `like`/`dislike`는 **갱신된 글 전체(`PostRead`)**를 돌려준다 — 새 카운트와 `remaining_seconds`를 프론트가 즉시 반영해야 하므로.
- 댓글 작성은 **생성된 댓글(`CommentRead`)**을 돌려준다(중첩 리소스 POST의 관례). 프론트는 `comment_count`를 +1 하거나 목록을 다시 부른다.

## 타이머 규칙 (핵심 로직)

- **생성:** `expires_at = created_at + 24h`.
- **좋아요 1개:** `expires_at += 10분`, 단 `min(expires_at, created_at + 48h)`로 상한 적용.
- **싫어요 1개:** `expires_at -= 10분`. 하한 없음.
- **소각:** 조회(목록·상세·반응·댓글) 시점에 `expires_at ≤ now`인 글을 **DB에서 실제 삭제**하고, 해당 글에 대한 상세/반응/댓글 요청은 `404`를 반환한다.
- **관련 댓글:** 글 삭제 시 그 글의 댓글도 함께 정리한다(FK cascade 또는 명시적 삭제).
- `remaining_seconds`는 저장하지 않고 응답 시마다 계산한다.

> 싫어요가 `expires_at`을 `now` 이하로 끌어내리면, 다음 조회 때 자연스럽게 소각된다. 별도 즉시-삭제 분기를 두지 않는다.

## Swagger 문서화 기준 (산출물의 핵심)

교육 목표상 **모든 엔드포인트·필드를 빠짐없이 문서화**한다. 세 겹을 모두 채운다.

1. **엔드포인트 메타** — `summary`(한 줄) + docstring `description`(동작·부수효과).
2. **필드 단위** — 모든 Pydantic 필드에 `description` + `examples`.
3. **응답/에러** — `response_model` + `responses`(상태코드별 설명).

`POST /posts`를 표준 양식 예시로 둔다(전 엔드포인트에 동일 패턴 적용).

**스키마 (`schemas.py`):**

```python
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
    """피드/상세에서 내려주는 글 표현 — 남은 시간은 서버가 매 응답마다 계산한다."""

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
    created_at: datetime = Field(..., description="작성 시각(UTC)")
    expires_at: datetime = Field(..., description="소각 예정 시각(UTC). 반응에 따라 변동.")
```

**라우터 (`routers/posts.py`):**

```python
@router.post(
    "",
    response_model=PostRead,
    status_code=status.HTTP_201_CREATED,
    summary="글 공유 (피드 행)",
    responses={
        201: {"description": "소각장에 등록된 글. 24시간 타이머가 시작된다."},
        422: {"description": "검증 실패 — 내용이 비었거나 300자를 초과함."},
    },
)
def create_post(payload: PostCreate, db: Session = Depends(get_db)):
    """공유 버튼을 누른 글을 소각장(피드)에 등록하고 24시간 타이머를 시작한다.

    - 즉시 소각한 글은 서버로 오지 않는다(프론트에서 처리).
    - 생성 직후 `remaining_seconds`는 86400(24h)이다.
    """
    ...
```

`CommentCreate`/`CommentRead`도 같은 밀도로 필드마다 `description`+`examples`를 채운다.

## 에러 처리

- 없는/이미 소각된 글: **404**(상세·반응·댓글 모두).
- 잘못된 바디(빈 내용, 300자 초과, 닉네임 누락 등): FastAPI 기본 **422**.
- 길이 제한은 Pydantic `min_length`/`max_length`로 강제 → Swagger에 그대로 노출.

## 레포 구조 변경

인프라 스펙의 `backend/app/` 구조를 유지하되, 예시 리소스를 교체한다.

```
backend/app/
├─ main.py            # 라우터 등록을 posts/comments로 교체
├─ config.py          # 변경 없음
├─ db.py              # 변경 없음
├─ models.py          # Item → Post, Comment
├─ schemas.py         # Item 스키마 → Post/Comment 요청·응답 스키마
└─ routers/
   └─ posts.py        # 예시 example.py 교체. 글 CRUD + 반응 + 댓글
                      #   (댓글은 posts.py 안 또는 comments.py로 분리, 구현 계획에서 확정)
```

## `items` 교체 범위 (인프라 스펙의 "교체 범위" 이행)

- `models.py`: `Item` → `Post`, `Comment`.
- `schemas.py`: Item 스키마 → Post/Comment 스키마.
- `routers/example.py` → `routers/posts.py`(+ 필요 시 `comments.py`).
- `main.py`: `example.router` 등록 → 새 라우터 등록.
- **DB 스키마 변경 절차:** 마이그레이션 도구가 없으므로, 배포 DB의 남는 `items` 테이블은 수동 drop. 새 `posts`/`comments` 테이블은 앱 시작 시 `Base.metadata.create_all`로 자동 생성된다.

## 비목표 (Non-goals)

- 인증/인가, 실제 세션 관리, 반응 중복 방지 — 없음(단일 사용자·교육용).
- 만료 글을 지우는 백그라운드 스케줄러 — 없음(조회 시 lazy delete).
- 페이지네이션·검색·정렬 옵션 — 없음(전체 배열 반환, 최신순 고정).
- 프론트 연출(애니메이션·이펙트·캡처 차단) — 백엔드 범위 밖.
- 로컬/자동화 테스트 스위트 — 없음(스펙 1대로 배포 후 검증).

## 성공 기준 — 배포 후 검증

스펙 1과 동일하게 **배포된 API(단일 Render PostgreSQL)**를 대상으로만 확인한다.

1. 배포된 `/docs`가 정상 로딩되고, `posts`/`comments` 엔드포인트가 모두 노출된다.
2. `POST /posts` → `201`, 응답 `remaining_seconds ≈ 86400`. 데이터가 PostgreSQL에 기록된다.
3. `GET /posts` → 방금 만든 글이 배열에 포함되고 최신순으로 온다.
4. `GET /posts/{id}` → 상세가 오고, 없는 id는 `404`.
5. `POST /posts/{id}/like` → `like_count` 증가 + `remaining_seconds` 증가(상한 48h 확인).
6. `POST /posts/{id}/dislike` → `dislike_count` 증가 + `remaining_seconds` 감소.
7. `POST /posts/{id}/comments` → `201`, 이후 글의 `comment_count`가 +1. 타이머는 불변.
8. `GET /posts/{id}/comments` → 작성한 댓글이 온다.
9. 잘못된 바디(빈 내용/300자 초과/닉네임 누락)는 `422`.
10. `/openapi.json`에 요청 바디·응답 스키마가 포함되고, Swagger에 **모든 필드의 설명·예시**가 노출된다.
11. 로컬 Vite 프론트(`http://localhost:5173`)에서 CORS 차단 없이 호출된다.
12. `expires_at`을 지난 글이 조회 시 실제로 삭제됨을 확인(과거 시각으로 만료된 글이 목록/상세에서 사라짐).
```
