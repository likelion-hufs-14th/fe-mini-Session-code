# Backend (LikeLion Mini 실습용 API)

프론트엔드 API 연동 실습을 위한 예시 백엔드. FastAPI + Render PostgreSQL.

## 구조
- `app/config.py` — DATABASE_URL 로드/정규화
- `app/db.py` — SQLAlchemy 엔진·세션·Base
- `app/models.py` — DB 모델(테이블)
- `app/schemas.py` — 요청/응답 스키마
- `app/routers/posts.py` — `/posts` 글·좋아요/싫어요·댓글 엔드포인트
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
로컬 테스트는 없음. 배포 후 `/docs`·`/health`·글/댓글 CRUD·좋아요(연장)/싫어요(단축)·재시작 후 데이터 유지로 확인.