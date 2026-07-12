# 인시너 프론트엔드 (LikeLion Mini 실습)

익명·휘발성 감정 소각 서비스 **인시너**의 프론트엔드. **UI는 완성돼 있고, 학생은 API 연동 레이어만 직접 채운다.**

## 실행

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173  (포트 고정)
npm run storybook    # 컴포넌트 시각 쇼케이스
```

> **포트 5173 고정 필수.** 백엔드 CORS가 `http://localhost:5173`만 허용한다. 포트가 겹쳐 5174 등으로 뜨면 API 호출이 CORS로 막힌다.

> **백엔드 워밍업.** 배포 백엔드(onrender 무료 티어)는 15분 무요청 시 잠든다. 실습 전 `https://fe-mini-session-code.onrender.com/health` 또는 `/docs`를 한 번 열어 깨운다.

## 브랜치 구조

- **`main`** — 완성 정답(API까지 연동돼 동작하는 앱). 막힐 때 참고.
- **`practice-start`** — 실습 시작점. UI는 완성, **API 연동 레이어만 비어 있음**. 여기서 자기 브랜치를 판다:
  ```bash
  git checkout -b 내이름 practice-start
  ```

## 학생이 채우는 곳 (딱 2겹)

1. **`src/apis/posts.js`** — 7개 함수(`getPosts` · `getPost` · `createPost` · `likePost` · `dislikePost` · `getComments` · `createComment`)를 `axios`로 채운다. axios 인스턴스(`src/apis/client.js`)와 baseURL은 이미 완성.
2. **페이지 데이터 이음새** — 3개 페이지의 `SAMPLE` 상수와 빈 핸들러(`// TODO`)를 실제 호출로 교체:
   - `src/pages/FeedPage.jsx` — `GET /posts` + 좋아요/싫어요
   - `src/pages/DetailPage.jsx` — `GET /posts/:id` + 댓글 조회/작성
   - `src/pages/PaperPage.jsx` — 소각 시 `POST /posts`

컴포넌트·CSS·애니메이션·라우팅은 완성본이라 건드리지 않는다.

## 참고

- API 명세(Swagger): `https://fe-mini-session-code.onrender.com/docs`
- `/`(NavPage)에서 연동 전에도 모든 화면을 둘러볼 수 있다(SAMPLE 데이터로 렌더).
