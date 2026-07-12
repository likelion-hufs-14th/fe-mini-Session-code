# 백엔드 인프라 설계 (Backend Infrastructure Design)

- **작성일:** 2026-07-12 (확정 요구사항 반영해 개정)
- **상태:** 승인됨 (구현 계획 작성 예정)
- **범위:** 인프라 골격만. 실제 API 도메인은 별도 스펙(스펙 2)에서 다룬다.

## 배경 & 목표

동아리(멋사) 프론트엔드 세션의 **API 연동 실습**을 위해, 강사가 미리 만들어 배포해 두는 실습용 백엔드 API가 필요하다.

- 학생들은 서버를 직접 짜지 않는다. **이미 완성된 프론트 UI에 API를 연동하는 법**과 **API 명세서(Swagger)를 읽는 법**을 배운다.
- 따라서 백엔드는 "잘 문서화되어 배포된, 소비하기 좋은 API"여야 한다.

이 문서의 목표는 **도메인과 무관한 인프라 골격**을 세우는 것이다. 예시 리소스 하나로 `배포 → Swagger 노출 → CORS 통과 → PostgreSQL 영속화` 파이프라인 전체를 증명한다. 실제 도메인이 정해지면 예시 리소스 관련 코드를 교체한다.

## 확정된 사용 조건

- API를 사용하는 사람은 **한 명뿐**이다.
- 여러 학생이 동시에 요청하는 환경이 아니다.
- 프론트엔드는 `http://localhost:5173`에서만 실행한다.
- 사용자가 새로운 데이터를 POST한 뒤, 서버가 **재시작되거나 sleep된 뒤에도 그 데이터가 유지**되어야 한다.
- 프로젝트 사용 기간은 **30일 이내**다.
- 백엔드와 DB는 **모두 Render**에서 관리한다.
- **Docker는 사용하지 않는다.**

## 제약 (요구사항)

1. **Swagger UI가 배포되어 접근 가능해야 한다.** 코드에서 자동 생성되어 실제 스키마와 어긋나지 않아야 한다.
2. **무료 호스팅**이며, 단기 실습 기간(≤30일) 동안 동작해야 한다.
3. 분리된 프론트엔드(Vite + React, `http://localhost:5173`)에서 호출 가능하도록 **CORS**를 허용한다.
4. 이 레포 안에 **백엔드 폴더**(`backend/`)로 존재한다(모노레포, 백엔드 먼저).
5. POST한 데이터는 서버 재시작/sleep 이후에도 유지되어야 한다 → **PostgreSQL 영속화 필수.**

## 비목표 (Non-goals)

- 실제 API 도메인/리소스/필드 정의 — **스펙 2**에서 별도로 진행한다.
- **다중 사용자 동시성 대응** — 사용자가 한 명이므로 현재 비목표.
- 인증/인가, Docker화, CI/CD, DB 마이그레이션 도구(Alembic 등) — 현재 범위 밖.
- 서버 코드 작성법 교육용 자료 — 학생에게 백엔드는 블랙박스다.

## 결정 사항 요약

| 항목 | 결정 |
|---|---|
| 프레임워크 | **FastAPI** (Python 3.12, `.python-version`으로 고정) |
| 서버 | Uvicorn |
| 호스팅 | **Render Web Service** (Python 네이티브 런타임, Docker 미사용) |
| 데이터 | **Render 무료 PostgreSQL** (영속화) |
| ORM | **SQLAlchemy 2.0** (declarative) |
| DB 드라이버 | **psycopg (v3)** — `psycopg[binary]` |
| DB 세션 | 요청당 FastAPI 의존성(`get_db`, yield/close) |
| 테이블 생성 | 앱 시작 시 `Base.metadata.create_all` (마이그레이션 도구 미사용) |
| 문서 | FastAPI 자동 생성 Swagger UI (`/docs`) |
| CORS | `allow_origins=["http://localhost:5173"]` 고정 |
| 구조 | 모노레포 `backend/` + (추후) `frontend/` |

## 구현 전 확정할 결정 (사용자 검토 항목)

단순한 프로젝트이므로 불필요한 Repository 인터페이스나 추상화는 두지 않는다. 다만 아래는 구현 계획 전에 확정한다.

1. **ORM:** SQLAlchemy 2.0 declarative 모델. (SQLModel 대신, "DB 모델"과 "Pydantic 스키마"의 책임을 분리해 명세서 스키마를 명확히 관리.)
2. **드라이버 & 접속 URL:** `psycopg` v3. Render가 주는 URL은 `postgres://` 형식이므로 `config.py`에서 `postgresql+psycopg://`로 스킴을 정규화한다.
3. **세션 생명주기:** 요청당 세션. FastAPI 의존성 `get_db()`가 세션을 열고 응답 후 닫는다. 전역 공유 세션은 쓰지 않는다.
4. **테이블 생성:** 앱 시작(lifespan)에서 `Base.metadata.create_all(bind=engine)`. 최초 배포 시 테이블이 자동 생성된다. 별도 마이그레이션 도구는 쓰지 않는다. 스키마 변경이 필요하면(도메인 교체 등) 해당 테이블을 drop 후 재생성하는 절차로 대응한다.
5. **설정 방식:** 환경변수가 `DATABASE_URL` 하나(+테스트용) 수준이라 `pydantic-settings`는 과하다고 판단. `config.py`에서 `os.getenv`로 읽고 URL 정규화만 수행하는 최소 구성으로 간다.
6. **테스트 DB (검토 필요):** 자동 검증이 "PostgreSQL에 기록됨"을 요구하므로 pytest는 **실제 PostgreSQL 테스트 DB**(`TEST_DATABASE_URL`, 로컬 또는 별도 무료 인스턴스)를 대상으로 돈다. 로컬 Postgres 준비가 어렵다면 이 항목은 배포본 대상 수동 검증으로 대체할지 검토한다. → **리뷰에서 확정.**

## 레포 구조

```
likelion-mini/
├─ backend/                # 이번 범위
│  ├─ app/
│  │  ├─ main.py           # FastAPI 앱 생성, CORS 고정, 라우터 등록, 시작 시 테이블 생성(lifespan)
│  │  ├─ config.py         # DATABASE_URL 로드 + URL 스킴 정규화 (os.getenv 기반, 최소 구성)
│  │  ├─ db.py             # SQLAlchemy engine, SessionLocal, Base, get_db 의존성
│  │  ├─ models.py         # SQLAlchemy DB 모델 (PostgreSQL 테이블에 대응)
│  │  ├─ schemas.py        # Pydantic 요청/응답 모델 (Swagger 스키마의 핵심)
│  │  └─ routers/
│  │     └─ example.py     # 예시 리소스 CRUD (도메인 확정 시 교체)
│  ├─ tests/
│  │  └─ test_example.py
│  ├─ .python-version      # 3.12.x 고정
│  ├─ requirements.txt     # 주요 의존성 버전 고정
│  └─ README.md            # 로컬 실행 / 배포 / 환경변수 안내
└─ frontend/               # 추후 (Vite + React)
```

- 로컬 `.env`(External Database URL 등)는 **커밋하지 않는다**(`.gitignore`에 `.env`, `__pycache__` 포함).

## 컴포넌트별 책임

- **main.py** — 앱 조립 진입점. FastAPI 인스턴스 생성, 앱 메타데이터(title/description/version), CORS 미들웨어(고정 origin), 라우터 등록, lifespan에서 테이블 생성. 비즈니스 로직 없음.
- **config.py** — `DATABASE_URL`을 환경변수에서 읽고 SQLAlchemy용 URL로 정규화한다. 최소 구성(`os.getenv`).
- **db.py** — SQLAlchemy `engine`, `SessionLocal`, `Base` 정의와 요청당 세션을 주는 `get_db()` 의존성. DB 연결/세션 생명주기를 이 파일이 책임진다.
- **models.py** — SQLAlchemy 선언형 DB 모델. PostgreSQL 테이블 구조에 대응한다.
- **schemas.py** — Pydantic 요청/응답 모델. Swagger에 노출되므로 필드 설명과 예시 값을 채운다. DB 모델과 별개.
- **routers/example.py** — 예시 리소스의 CRUD 엔드포인트. `db`, `models`, `schemas`에 의존한다. 도메인 확정 시 교체 대상.

## 데이터 저장 — Render PostgreSQL

**구성 (두 개의 리소스, 하나의 서비스가 아님):**

- **Render Web Service** — FastAPI 앱을 구동.
- **Render PostgreSQL** — 영속 데이터 저장.
- 두 리소스는 **같은 Render region**에 배치한다.
- 이 둘은 하나로 묶인 단일 서비스가 아니라, **같은 Render 플랫폼에서 관리하는 두 개의 별도 리소스**다.

**접속:**

- 배포된 FastAPI는 PostgreSQL의 **Internal Database URL**을 사용한다(같은 region 내부 통신).
- 연결 문자열은 **`DATABASE_URL` 환경변수**로 관리한다. DB 접속 정보는 코드나 저장소에 커밋하지 않는다.
- 로컬에서 백엔드를 실행할 경우 로컬 `.env`에 **External Database URL**을 넣는다. 이 파일은 커밋하지 않는다.

**무료 PostgreSQL 제약 (명시적으로 수용):**

- 저장 공간 **1GB**
- 생성 후 **30일 만료**
- **자동 백업 미지원**
- 만료 이후 계속 쓰려면 **유료 전환** 필요

→ 이 프로젝트는 30일 이내 단기 실습이므로 위 제약을 그대로 수용한다.

## API 표면 (예시 리소스)

도메인 확정 전까지 임시 리소스(`items`)로 CRUD를 구현해 파이프라인을 증명한다. **검색·페이지네이션은 넣지 않는다**(인프라 검증에 불필요하고 폐기될 임시 코드이므로). 다만 아래 전체 CRUD는 성공 기준(수정·삭제의 DB 반영 검증)이 요구하므로 유지한다.

| 메서드 | 경로 | 목적 | 명세서 교육 포인트 |
|---|---|---|---|
| GET | `/health` | 헬스체크(배포/워밍업) | — |
| GET | `/items` | 목록 | 응답 배열 스키마 |
| GET | `/items/{id}` | 상세 | 경로 파라미터 / 404 |
| POST | `/items` | 생성 | 요청 바디 스키마 읽는 법 |
| PUT | `/items/{id}` | 수정 | 요청 바디 + 경로 |
| DELETE | `/items/{id}` | 삭제 | 응답 코드(204/404) |

- 없는 리소스에는 `404`, 잘못된 바디에는 FastAPI 기본 `422`를 반환한다.

## Swagger / OpenAPI

- `/docs` — Swagger UI (자동 생성, 배포됨). **교육의 핵심 산출물.**
- `/redoc` — ReDoc (보조).
- `/openapi.json` — 원본 OpenAPI 스펙. 요청 바디·응답 스키마가 포함되어야 한다.
- 앱·엔드포인트 메타데이터(`summary`, 필드 `description`, 예시 값)를 채워 **학생이 명세서만 보고 연동 가능한 수준**으로 문서화한다.

## CORS

- `CORSMiddleware`에 **`allow_origins=["http://localhost:5173"]`로 고정**한다.
- 환경변수(`CORS_ORIGINS`), 콤마 파싱, 배포 프론트 origin, 불필요한 유연성은 두지 않는다.
- 메서드는 실습에 필요한 GET/POST/PUT/DELETE/OPTIONS 허용.

## 설정 / 환경변수

| 변수 | 위치 | 설명 |
|---|---|---|
| `DATABASE_URL` | Render Web Service 환경변수 | PostgreSQL Internal Database URL. 코드/저장소에 커밋 금지 |
| `DATABASE_URL` | 로컬 `.env` (커밋 안 함) | 로컬 실행 시 External Database URL |
| `TEST_DATABASE_URL` | 테스트 실행 환경 (커밋 안 함) | pytest용 별도 PostgreSQL. (테스트 DB 방식은 리뷰에서 확정) |
| `PORT` | 호스트 제공 | Render가 주입, Uvicorn이 사용 |

## 배포 — Render (모노레포, Docker 미사용)

백엔드는 모노레포의 `backend/` 폴더에 있으므로 Render 설정을 다음으로 명시한다.

- **Root Directory:** `backend`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path:** `/health`
- Build/Start 명령은 **Render Root Directory인 `backend`를 기준**으로 실행된다.
- Render의 **Python 네이티브 런타임**을 사용한다. Docker/Dockerfile/Compose는 쓰지 않는다. (다른 호스팅으로 이전이 필요해질 때만 검토하는 후속 선택지.)

**무료 Web Service 티어의 실제 동작:**

- **15분 동안 요청이 없으면 Web Service가 sleep**될 수 있다.
- 다음 요청에서 다시 기동되며 **약 1분**이 걸릴 수 있다.
- **세션 시작 직전에 `/health` 또는 `/docs`로 워밍업**한다.
- 실습 도중 **15분 이상 요청이 없었다면 다시 워밍업**할 수 있다.
- 무료 인스턴스는 **운영 안정성을 보장하는 환경이 아니다.**
- **Web Service가 재시작/기동돼도 PostgreSQL 데이터는 유지된다.**
- 대역폭: 신규 Hobby 플랜 기준 **월 5GB**.

## 버전 재현성

- **Python 버전을 `.python-version`(3.12.x)으로 고정**한다. 선언에 그치지 않고 실제 버전을 핀.
- 주요 의존성 버전을 `requirements.txt`에 **정확히 고정**해 배포마다 결과가 달라지지 않게 한다: FastAPI, Uvicorn, Pydantic, **psycopg(PostgreSQL 드라이버)**, **SQLAlchemy(ORM)**, pytest, (TestClient용) httpx. 정확한 버전은 구현 시 확정해 핀한다.

## 성공 기준 (검증 가능)

**자동 (pytest):**

1. `GET /health` → `200`.
2. 생성 API로 저장한 데이터가 **PostgreSQL에 기록**된다.
3. 생성한 데이터를 다시 **조회**할 수 있다.
4. **수정·삭제가 DB에 반영**된다.
5. 없는 리소스는 `404`.
6. 잘못된 요청 바디는 `422`.
7. `/openapi.json`에 **요청 바디와 응답 스키마가 포함**된다.
8. Swagger에 **필드 설명과 예시**가 노출된다.
9. `http://localhost:5173`의 **CORS 요청이 허용**된다(프리플라이트 + 실제 응답).

**수동 (배포 후):**

10. 배포된 `/docs`가 정상 로딩된다.
11. Swagger의 **Try it out**으로 CRUD 요청이 가능하다.
12. 로컬 Vite 프론트(`http://localhost:5173`)에서 API 호출이 가능하다.
13. **FastAPI Web Service를 재시작한 뒤에도 작성한 데이터가 유지**된다.

## 임시 리소스 교체 범위 (스펙 2 진입 시)

실제 API 도메인이 확정되면 `routers/example.py`만 바뀌는 것이 아니다. 다음도 변경 대상이다.

- Pydantic 스키마 (`schemas.py`)
- DB 모델과 테이블 (`models.py`)
- CRUD 로직 (라우터)
- 테스트 (`tests/`)
- OpenAPI 검증
- 필요 시 **DB 스키마 변경 절차**(마이그레이션 도구가 없으므로 해당 테이블 drop 후 재생성)

## 후속 (스펙 2)

인프라가 배포되어 실제 동작(특히 재시작 후 데이터 유지)을 확인한 직후, 별도 브레인스토밍으로 **실제 API 도메인**(리소스·필드·엔드포인트)을 확정하고 위 "교체 범위"에 따라 예시 리소스를 실제 리소스로 교체한다.
