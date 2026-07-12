# 인시너 프론트엔드 실습 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 완성 UI + 애니메이션이 동작하는 React 프론트를 만들고, API 연동 레이어만 비운 실습 시작점(practice-start)을 파생한다.

**Architecture:** 표현 컴포넌트(완성)와 페이지 컨테이너(데이터 이음새 TODO)를 분리한다. 커스텀 훅 없이 페이지에서 `useState+useEffect+axios`로 직접 데이터를 다룬다. **practice-start 상태(UI 완성 + `SAMPLE` 상수 + `apis/posts.js` 스텁)를 먼저 완성해 브랜치를 딴 뒤**, main에서 스텁을 채워 정답으로 만든다.

**Tech Stack:** React + JavaScript(순수) + Vite · react-router-dom · axios · GSAP + @gsap/react · Storybook · 순수 CSS.

## Global Constraints

이 절의 값은 모든 태스크에 암묵적으로 적용된다. 스펙에서 그대로 옮긴다.

- **언어/도구:** JavaScript(TS 금지) · Vite · React. 폴더는 `frontend/`(최신 Vite 기본형), 소스는 `frontend/src/`.
- **학생 타이핑 스택:** `react-router-dom`, `axios`, `useState`/`useEffect`만. **상태 라이브러리·react-query·데이터 페칭 라이브러리·커스텀 훅 없음.**
- **애니메이션(완성본 전용):** GSAP 단일 엔진 + `@gsap/react`(`useGSAP`) + SVG 필터/마스크. **이미지 에셋 없음** — CSS/SVG로 근사.
- **CSS:** 컴포넌트별 순수 `.css` 파일. 전역 테마는 `src/index.css`.
- **baseURL(인라인):** `https://fe-mini-session-code.onrender.com` — 환경변수 안 씀.
- **CORS:** 백엔드는 `http://localhost:5173`만 허용. dev 서버는 **반드시 포트 5173**.
- **초보자 원칙:** 방어코드 없음 — `try/catch`·널 체크·로딩/에러 UI 없음. 해피패스만.
- **타이머:** `🔥 MM:SS`(분:초). `BurnGauge` 비율 = `min(seconds/maxSeconds, 1)`, `maxSeconds=300`.
- **라우트:** `/`(NavPage) · `/home` · `/paper` · `/feed` · `/feed/:id`.
- **버튼 의미:** 쓰기 화면 `소각`=`POST /posts` + 타는 애니 → 재 화면. `피드`=`/feed` 이동만.
- **댓글 문구:** 타이머 암시 없는 문구(예: "의견을 남겨보세요.").
- **주석 컨벤션:** 파일 헤더·모든 export 위에 한 줄 JSDoc `/** */`. 단일 default export 파일은 그 한 줄이 파일 헤더 겸 export 문서를 동시에 충족한다(중복 금지). 본문 비자명 로직에만 한 줄 `//` WHY. 본문 한국어, 식별자 영어. `@param`/`@returns` 태그 금지.
- **팔레트:** 차콜 `#141210` · 엠버 오렌지 `#E8802B` · 양피지 `#E8DCC0` · 건메탈/스틸블루 버튼.
- **브랜치:** `main`=정답. `practice-start`=`apis/posts.js`·페이지 데이터 이음새만 스텁+TODO+SAMPLE.

## 검증 규약 (테스트 대체)

이 프로젝트엔 자동화 테스트가 없다. 각 태스크는 아래로 검증한다.

- **Storybook 검증:** `npm run storybook` → 해당 스토리를 열어 목업 대비 시각 확인.
- **브라우저 검증:** `npm run dev`(포트 5173) → 라우트로 이동해 동작 확인. API가 걸린 검증은 백엔드를 먼저 워밍업(`/health`).
- **Codex 리뷰 체크포인트:** 굵은 이음새(컴포넌트·애니메이션·완성 UI·정답 연동)마다 Codex MCP로 리뷰받고, 지적사항을 반영한 뒤 다음 페이즈로 넘어간다.

**코드 포함 수준:** 로직·이음새·애니메이션 파일은 완성 코드를 싣는다. 표현 컴포넌트는 정확한 props·구조·className·동작을 싣되, 픽셀 CSS는 목업 대비 시각 반복으로 다듬는다(팔레트·레이아웃 시작점 제공).

---

## Phase 0 — 스캐폴드

### Task 1: Vite 프로젝트 · 의존성 · 라우팅 골격 · 전역 테마

**Files:**
- Create: `frontend/` (Vite react 템플릿 일체: `index.html`, `package.json`, `vite.config.js`, `src/main.jsx`)
- Create: `frontend/src/App.jsx`
- Create: `frontend/src/index.css`
- Modify: `frontend/vite.config.js` (dev 포트 5173 고정)

**Interfaces:**
- Produces: `App` 라우터(모든 라우트를 placeholder로 등록) · 전역 CSS 변수(`--color-*`).

- [ ] **Step 1: Vite 프로젝트 생성**

Run(레포 루트에서):
```bash
npm create vite@latest frontend -- --template react
cd frontend && npm install
```
Expected: `frontend/` 생성, `npm install` 성공.

- [ ] **Step 2: 런타임 의존성 설치**

Run(`frontend/`에서):
```bash
npm install react-router-dom axios gsap @gsap/react
```

- [ ] **Step 3: dev 포트 5173 고정**

`frontend/vite.config.js`:
```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// CORS가 5173만 허용하므로 포트를 고정한다.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
});
```

- [ ] **Step 4: 전역 테마 작성**

`frontend/src/index.css`(템플릿 내용 대체):
```css
/** 전역 테마 토큰·리셋 — 인시너 소각장 팔레트. */
:root {
  --color-bg: #141210;
  --color-bg-warm: #2a1e14;
  --color-ember: #e8802b;
  --color-paper: #e8dcc0;
  --color-text: #f3ede0;
  --color-metal: #3a3a3d;
  --color-red: #c0392b;
  --color-blue: #6b8cae;
  font-family: system-ui, "Apple SD Gothic Neo", sans-serif;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--color-bg); color: var(--color-text); }
```

- [ ] **Step 5: 라우팅 골격 작성**

`frontend/src/App.jsx`:
```jsx
/** 앱 라우팅 — 모든 페이지를 등록한다. */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavPage from "./pages/NavPage";
import HomePage from "./pages/HomePage";
import PaperPage from "./pages/PaperPage";
import FeedPage from "./pages/FeedPage";
import DetailPage from "./pages/DetailPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NavPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/paper" element={<PaperPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/feed/:id" element={<DetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

`frontend/src/main.jsx`(진입점 — `index.css` import 확인):
```jsx
/** 진입점 — App을 #root에 마운트한다. */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode><App /></StrictMode>
);
```

- [ ] **Step 6: 각 페이지 최소 placeholder 생성**

`frontend/src/pages/{NavPage,HomePage,PaperPage,FeedPage,DetailPage}.jsx` 각각 임시:
```jsx
/** (임시) 이후 태스크에서 구현. */
export default function NavPage() { return <div>NavPage</div>; }
```
(이름만 바꿔 5개 생성)

- [ ] **Step 7: 브라우저 검증**

Run: `npm run dev`
Expected: `http://localhost:5173/`에서 "NavPage", `/home`에서 "HomePage" 등 표시. 콘솔 에러 없음.

- [ ] **Step 8: Commit**

```bash
git add frontend
git commit -m "chore(frontend): Vite 스캐폴드 + 라우팅 골격 + 전역 테마"
```

---

## Phase 1 — 유틸 & 샘플 데이터

### Task 2: utils (nickname · formatTime · sampleData · burnCount)

**Files:**
- Create: `frontend/src/utils/nickname.js`
- Create: `frontend/src/utils/formatTime.js`
- Create: `frontend/src/utils/sampleData.js`
- Create: `frontend/src/utils/burnCount.js`

**Interfaces:**
- Produces:
  - `getNickname(): string` — 세션당 랜덤 익명 닉네임(localStorage 메모).
  - `formatTime(seconds: number): string` — `"MM:SS"`.
  - `SAMPLE_POSTS: Post[]`, `SAMPLE_POST: Post`, `SAMPLE_COMMENTS: Comment[]`.
  - `getTodayBurnCount(): number`, `incrementBurnCount(): number`.
- Post 형태: `{ id, nickname, content, like_count, dislike_count, comment_count, remaining_seconds, created_at, expires_at }`
- Comment 형태: `{ id, post_id, nickname, content, created_at }`

- [ ] **Step 1: nickname.js**

```js
/** 세션당 랜덤 익명 닉네임 — 서버가 아니라 클라이언트가 부여한다. */
const ADJECTIVES = ["익명의", "지나가던", "말없는", "타버린", "축축한"];
const ANIMALS = ["두더지", "너구리", "고양이", "부엉이", "여우"];

/** 저장된 닉네임을 반환하고, 없으면 새로 만들어 세션에 고정한다. */
export function getNickname() {
  const saved = sessionStorage.getItem("nickname");
  if (saved) return saved;
  const name =
    ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)] +
    ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  sessionStorage.setItem("nickname", name); // 세션(탭)당 고정
  return name;
}
```

- [ ] **Step 2: formatTime.js**

```js
/** 초를 MM:SS로 포맷 — 카드 타이머 표기용. */
export function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  const m = String(Math.floor(safe / 60)).padStart(2, "0");
  const s = String(safe % 60).padStart(2, "0");
  return `${m}:${s}`;
}
```

- [ ] **Step 3: burnCount.js**

```js
/** "오늘 N명 소각" 로컬 카운터 — 해당 엔드포인트가 없어 localStorage로 흉내낸다. */
const key = () => `burnCount:${new Date().toISOString().slice(0, 10)}`; // 날짜별로 "오늘"을 분리

export function getTodayBurnCount() {
  return Number(localStorage.getItem(key()) || 0);
}
/** 소각 1건 반영 후 누적값 반환. */
export function incrementBurnCount() {
  const next = getTodayBurnCount() + 1;
  localStorage.setItem(key(), String(next));
  return next;
}
```

- [ ] **Step 4: sampleData.js**

```js
/** 연동 전 페이지·Storybook을 채우는 샘플 데이터 — PostRead/CommentRead 형태와 동일. */
export const SAMPLE_POSTS = [
  { id: 1, nickname: "익명의두더지", content: "아 집가고 싶다..", like_count: 3, dislike_count: 1, comment_count: 2, remaining_seconds: 285, created_at: "2026-07-12T10:00:00Z", expires_at: "2026-07-12T10:05:00Z" },
  { id: 2, nickname: "지나가던너구리", content: "오늘 발표 망함", like_count: 0, dislike_count: 0, comment_count: 0, remaining_seconds: 120, created_at: "2026-07-12T10:01:00Z", expires_at: "2026-07-12T10:03:00Z" },
  { id: 3, nickname: "말없는여우", content: "퇴근 5분 전이 제일 길다", like_count: 7, dislike_count: 0, comment_count: 5, remaining_seconds: 40, created_at: "2026-07-12T10:02:00Z", expires_at: "2026-07-12T10:02:40Z" },
];

/** 상세 페이지용 단건 샘플. */
export const SAMPLE_POST = SAMPLE_POSTS[0];

/** 상세 페이지 댓글 샘플. */
export const SAMPLE_COMMENTS = [
  { id: 1, post_id: 1, nickname: "지나가던행인", content: "저도 진짜 집에 가고 싶어요ㅠㅠ", created_at: "2026-07-12T10:03:00Z" },
  { id: 2, post_id: 1, nickname: "말없는고양이", content: "화이팅입니다", created_at: "2026-07-12T10:04:00Z" },
];
```

- [ ] **Step 5: 검증**

Run: `node -e "import('./frontend/src/utils/formatTime.js').then(m=>console.log(m.formatTime(285)))"` (또는 임시 import로 확인)
Expected: `04:45`.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/utils
git commit -m "feat(frontend): utils(nickname·formatTime·sampleData·burnCount) 추가"
```

---

## Phase 2 — 표현 컴포넌트 + Storybook

### Task 3: Storybook 초기화 + common(RoundButton · Timer)

**Files:**
- Create: `.storybook/` (init)
- Create: `frontend/src/components/common/RoundButton.jsx` + `.css` + `RoundButton.stories.jsx`
- Create: `frontend/src/components/common/Timer.jsx` + `.css` + `Timer.stories.jsx`

**Interfaces:**
- Produces:
  - `RoundButton({ label, onClick, variant })` — `variant: 'red'|'blue'|'metal'`.
  - `Timer({ seconds })` — 내부에서 1초마다 감소, `🔥 MM:SS` 렌더.

- [ ] **Step 1: Storybook 설치**

Run(`frontend/`에서): `npx storybook@latest init --builder vite --yes`
Expected: `.storybook/` 생성, `npm run storybook` 스크립트 추가. 기본 예시 스토리는 삭제.

- [ ] **Step 2: RoundButton 구현**

`RoundButton.jsx`:
```jsx
/** 금속 원형 버튼 — 소각(red)·피드(blue)·중립(metal) 변형. */
import "./RoundButton.css";

export default function RoundButton({ label, onClick, variant = "metal" }) {
  return (
    <button className={`round-button round-button--${variant}`} onClick={onClick}>
      {label}
    </button>
  );
}
```
`RoundButton.css`(시작점 — 원형·금속 링·변형색. 목업 대비 다듬기):
```css
.round-button { width: 120px; height: 120px; border-radius: 50%; border: 6px solid #555; font-size: 20px; font-weight: 700; color: #fff; cursor: pointer; box-shadow: inset 0 0 12px rgba(0,0,0,.5), 0 4px 8px rgba(0,0,0,.4); }
.round-button--red { background: radial-gradient(circle at 50% 40%, #e05a4a, var(--color-red)); }
.round-button--blue { background: radial-gradient(circle at 50% 40%, #86a6c6, var(--color-blue)); }
.round-button--metal { background: radial-gradient(circle at 50% 40%, #5a5a5d, var(--color-metal)); }
```

- [ ] **Step 3: Timer 구현(로컬 카운트다운)**

`Timer.jsx`:
```jsx
/** 남은 초를 🔥 MM:SS로 표기(순수 표시 — 카운트다운은 부모가 준다). */
import { formatTime } from "../../utils/formatTime";
import "./Timer.css";

export default function Timer({ seconds }) {
  return <span className="timer">🔥 {formatTime(seconds)}</span>;
}
```
`Timer.css`:
```css
.timer { color: var(--color-ember); border: 1px solid var(--color-ember); border-radius: 6px; padding: 2px 8px; font-size: 13px; }
```

- [ ] **Step 4: 스토리 작성**

`RoundButton.stories.jsx`: `red`/`blue`/`metal` 3개 스토리(label "소각"/"피드"/"더 쓰기").
`Timer.stories.jsx`: `seconds={285}`, `seconds={5}` 스토리.

- [ ] **Step 5: Storybook 검증**

Run: `npm run storybook`
Expected: RoundButton 3변형이 원형 금속으로, Timer가 `🔥 04:45`로 표시(카운트다운 구동은 PaperCard에서 확인).

- [ ] **Step 6: Commit**

```bash
git add frontend/.storybook frontend/src/components/common frontend/package.json
git commit -m "feat(frontend): Storybook + common(RoundButton·Timer)"
```

### Task 4: paper(BurnGauge · PaperEditor · PaperCard)

**Files:**
- Create: `frontend/src/components/paper/BurnGauge.jsx` + `.css` + stories
- Create: `frontend/src/components/paper/PaperEditor.jsx` + `.css` + stories
- Create: `frontend/src/components/paper/PaperCard.jsx` + `.css` + stories

**Interfaces:**
- Consumes: `Timer`, `formatTime`, `SAMPLE_POSTS`.
- Produces:
  - `BurnGauge({ seconds, maxSeconds = 300 })` — 주황 게이지바.
  - `PaperEditor({ value, onChange, maxLength = 300 })` — 양피지 텍스트영역 + `N/300`.
  - `PaperCard({ post, onLike, onDislike, variant = "feed", onClick })` — feed: 반응+댓글링크+클릭이동, detail: 반응 없음.

- [ ] **Step 1: BurnGauge 구현**

```jsx
/** 남은 시간 게이지 — seconds/maxSeconds 비율의 주황 바. */
import "./BurnGauge.css";
export default function BurnGauge({ seconds, maxSeconds = 300 }) {
  const ratio = Math.min(seconds / maxSeconds, 1);
  return (
    <div className="burn-gauge">
      <div className="burn-gauge__fill" style={{ width: `${ratio * 100}%` }} />
    </div>
  );
}
```
`BurnGauge.css`: 높이 8px, 배경 어두운 갈색, `__fill`은 `linear-gradient(90deg,#3a1e10,var(--color-ember))`.

- [ ] **Step 2: PaperEditor 구현**

```jsx
/** 소각할 속마음 입력 — 양피지 텍스트영역 + 글자수 카운터. */
import "./PaperEditor.css";
export default function PaperEditor({ value, onChange, maxLength = 300 }) {
  return (
    <div className="paper-editor">
      <textarea
        className="paper-editor__area"
        value={value}
        maxLength={maxLength}
        placeholder="태워 버리고 싶은 당신의 속마음을 말해보세요."
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="paper-editor__count">{value.length}/{maxLength}</span>
    </div>
  );
}
```
`PaperEditor.css`: 양피지 배경(`var(--color-paper)`), 어두운 글씨, 우하단 카운터. 목업 대비 종이 질감은 CSS 그라디언트/보더로 근사.

- [ ] **Step 3: PaperCard 구현**

```jsx
/** 피드·상세 카드 — 표현 전용. feed는 반응/댓글, detail은 읽기만. */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Timer from "../common/Timer";
import BurnGauge from "./BurnGauge";
import "./PaperCard.css";

export default function PaperCard({ post, onLike, onDislike, variant = "feed", onClick }) {
  const navigate = useNavigate();
  const isFeed = variant === "feed";
  // Timer·BurnGauge가 같은 값을 쓰도록 카드가 로컬 카운트다운을 소유한다.
  const [left, setLeft] = useState(post.remaining_seconds);
  useEffect(() => setLeft(post.remaining_seconds), [post.remaining_seconds]);
  useEffect(() => {
    const id = setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <article className="paper-card" onClick={isFeed ? onClick : undefined}>
      <header className="paper-card__head">
        <span className="paper-card__nick">{post.nickname}</span>
        <Timer seconds={left} />
      </header>
      <p className="paper-card__content">{post.content}</p>
      {isFeed && (
        <footer className="paper-card__foot">
          {/* 카드 클릭(이동)과 겹치지 않게 버튼에서 전파 차단 */}
          <button onClick={(e) => { e.stopPropagation(); onLike(post.id); }}>👍 {post.like_count}</button>
          <button onClick={(e) => { e.stopPropagation(); onDislike(post.id); }}>👎 {post.dislike_count}</button>
          <button onClick={(e) => { e.stopPropagation(); navigate(`/feed/${post.id}`); }}>💬 댓글</button>
        </footer>
      )}
      <BurnGauge seconds={left} />
    </article>
  );
}
```
`PaperCard.css`: 양피지 배경·모서리, `__head` 좌우 배치, 하단 게이지. feed 카드는 `cursor:pointer`.

- [ ] **Step 4: 스토리 작성**

- `BurnGauge`: `seconds` 285/40/0.
- `PaperEditor`: 제어 스토리(빈 값 / 일부 입력).
- `PaperCard`: `feed`(SAMPLE_POSTS[0], onLike/onDislike=action) / `detail`(반응 없음). Storybook에서 `useNavigate`가 필요하므로 스토리에 `MemoryRouter` 데코레이터를 추가한다.

- [ ] **Step 5: Storybook 검증**

Run: `npm run storybook`
Expected: 카드가 목업(닉네임·🔥타이머·내용·👍👎·댓글·게이지)과 일치. detail 변형엔 반응 버튼 없음.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/paper
git commit -m "feat(frontend): paper(BurnGauge·PaperEditor·PaperCard)"
```

### Task 5: comment(CommentList · CommentItem · CommentInput)

**Files:**
- Create: `frontend/src/components/comment/CommentItem.jsx` + `.css`
- Create: `frontend/src/components/comment/CommentList.jsx` + `.css`
- Create: `frontend/src/components/comment/CommentInput.jsx` + `.css`
- Create: 각 `*.stories.jsx`

**Interfaces:**
- Consumes: `SAMPLE_COMMENTS`.
- Produces:
  - `CommentItem({ comment })`, `CommentList({ comments })`, `CommentInput({ onSubmit, placeholder })`.

- [ ] **Step 1: CommentItem**

```jsx
/** 댓글 한 줄 — 닉네임 + 내용. */
import "./CommentItem.css";
export default function CommentItem({ comment }) {
  return (
    <li className="comment-item">
      <strong className="comment-item__nick">{comment.nickname}</strong>
      <span className="comment-item__text">{comment.content}</span>
    </li>
  );
}
```

- [ ] **Step 2: CommentList**

```jsx
/** 댓글 목록 — 스크롤 영역. */
import CommentItem from "./CommentItem";
import "./CommentList.css";
export default function CommentList({ comments }) {
  return (
    <ul className="comment-list">
      {comments.map((c) => <CommentItem key={c.id} comment={c} />)}
    </ul>
  );
}
```

- [ ] **Step 3: CommentInput**

```jsx
/** 댓글 입력 — 제출 시 내용을 올려보내고 비운다(타이머 암시 문구 없음). */
import { useState } from "react";
import "./CommentInput.css";
export default function CommentInput({ onSubmit, placeholder = "의견을 남겨보세요." }) {
  const [text, setText] = useState("");
  const submit = () => {
    if (!text) return; // 빈 값은 보내지 않는다(유일한 최소 가드)
    onSubmit(text);
    setText("");
  };
  return (
    <div className="comment-input">
      <input value={text} placeholder={placeholder} onChange={(e) => setText(e.target.value)} />
      <button onClick={submit}>➤</button>
    </div>
  );
}
```

- [ ] **Step 4: 스토리 작성**

`CommentList`: `comments={SAMPLE_COMMENTS}`. `CommentInput`: `onSubmit=action`.

- [ ] **Step 5: Storybook 검증**

Expected: 댓글 리스트가 목업(닉네임 + 내용 행)과 일치, 입력창 + 전송 버튼 표시.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/comment
git commit -m "feat(frontend): comment(CommentList·CommentItem·CommentInput)"
```

### Task 6: layout(TopWarningBanner · Header · FloatingAvatars)

**Files:**
- Create: `frontend/src/components/layout/TopWarningBanner.jsx` + `.css`
- Create: `frontend/src/components/layout/Header.jsx` + `.css`
- Create: `frontend/src/components/layout/FloatingAvatars.jsx` + `.css`
- Create: 각 `*.stories.jsx`

**Interfaces:**
- Produces: `TopWarningBanner()`, `Header()`, `FloatingAvatars()` — 전부 props 없음(장식/고정).

- [ ] **Step 1: TopWarningBanner**

```jsx
/** 상단 경고 배너 — 휘발성 서비스 고지(고정 문구). */
import "./TopWarningBanner.css";
export default function TopWarningBanner() {
  return (
    <div className="top-warning-banner">
      본 서비스는 어떠한 데이터도 백업하지 않으며, 소각 즉시 서버에서 완전히 영구 삭제됩니다.
    </div>
  );
}
```

- [ ] **Step 2: Header**

```jsx
/** 상단 헤더 — 로고 + 햄버거(장식, 동작 없음). */
import "./Header.css";
export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header__logo">🔥</div>
      <button className="app-header__menu" aria-label="menu">☰</button>
    </header>
  );
}
```

- [ ] **Step 3: FloatingAvatars**

```jsx
/** 떠다니는 익명 아바타 — 순수 장식(다른 유저 분위기). */
import "./FloatingAvatars.css";
export default function FloatingAvatars() {
  // 고정 좌표 몇 개로 분위기만 낸다.
  const spots = [{ top: "30%", left: "70%" }, { top: "75%", left: "20%" }, { top: "60%", left: "85%" }];
  return (
    <div className="floating-avatars">
      {spots.map((s, i) => <div key={i} className="floating-avatars__dot" style={s}>🙂</div>)}
    </div>
  );
}
```

- [ ] **Step 4: 스토리 + 검증 + Commit**

각 스토리 작성 → `npm run storybook`으로 확인 →
```bash
git add frontend/src/components/layout
git commit -m "feat(frontend): layout(TopWarningBanner·Header·FloatingAvatars)"
```

### ✅ Codex 체크포인트 A — 표현 컴포넌트

- [ ] **Step: Codex 리뷰**

전체 `frontend/src/components/**`와 `utils/**`를 Codex MCP로 리뷰. 관점: (1) 초보자가 읽을 코드로 과하지 않은가, (2) props 경계가 API 연동에 필요한 것만 노출하는가, (3) 주석 컨벤션 준수, (4) 방어코드 과잉 여부. 지적사항 반영 후 커밋.

---

## Phase 3 — 애니메이션 컴포넌트

### Task 7: Fire (홈 이글이글)

**Files:**
- Create: `frontend/src/components/fire/Fire.jsx` + `.css` + `Fire.stories.jsx`

**Interfaces:**
- Produces: `Fire()` — props 없음. SVG `feTurbulence`로 불꽃 질감, GSAP로 흔들림 루프.

- [ ] **Step 1: Fire 구현**

```jsx
/** 홈 중앙 불 — SVG 난류 필터로 불꽃 질감, GSAP로 이글이글 흔든다. */
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import "./Fire.css";

export default function Fire() {
  const turb = useRef(null);
  useGSAP(() => {
    // baseFrequency를 미세 변동시켜 불꽃이 넘실대게 한다.
    gsap.to(turb.current, {
      attr: { baseFrequency: "0.02 0.06" },
      duration: 1.2, repeat: -1, yoyo: true, ease: "sine.inOut",
    });
  });
  return (
    <div className="fire">
      <svg className="fire__svg" viewBox="0 0 300 300">
        <filter id="flame">
          <feTurbulence ref={turb} type="fractalNoise" baseFrequency="0.02 0.04" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="30" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <ellipse cx="150" cy="200" rx="90" ry="120" fill="url(#flameGrad)" filter="url(#flame)" />
        <radialGradient id="flameGrad" cx="50%" cy="80%">
          <stop offset="0%" stopColor="#ffe08a" />
          <stop offset="45%" stopColor="var(--color-ember)" />
          <stop offset="100%" stopColor="#7a1f00" stopOpacity="0" />
        </radialGradient>
      </svg>
    </div>
  );
}
```
`Fire.css`: 컨테이너 크기·중앙 정렬·`mix-blend-mode: screen`으로 배경과 어우러지게.

- [ ] **Step 2: 스토리 + 검증**

`Fire.stories.jsx` 작성 → `npm run storybook` → 불꽃이 넘실대는지 확인.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/fire/Fire.jsx frontend/src/components/fire/Fire.css frontend/src/components/fire/Fire.stories.jsx
git commit -m "feat(frontend): Fire(SVG 난류 + GSAP 이글이글)"
```

### Task 8: DraggablePaper (홈 드래그)

**Files:**
- Create: `frontend/src/components/paper/DraggablePaper.jsx` + `.css` + stories

**Interfaces:**
- Produces: `DraggablePaper({ onDropIntoFire })` — 종이를 불 히트존까지 끌면 `onDropIntoFire()` 호출.

- [ ] **Step 1: DraggablePaper 구현**

```jsx
/** 홈 종이 — GSAP Draggable로 끌어 불(fireRef 영역)에 넣으면 콜백. */
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import "./DraggablePaper.css";

gsap.registerPlugin(Draggable);

export default function DraggablePaper({ fireRef, onDropIntoFire }) {
  const paper = useRef(null);
  useGSAP(() => {
    const [instance] = Draggable.create(paper.current, {
      type: "x,y",
      onDragEnd() {
        // viewport 중심이 아니라 실제 불 영역과 겹치는지로 판정한다.
        if (Draggable.hitTest(paper.current, fireRef.current, "40%")) onDropIntoFire();
        else gsap.to(paper.current, { x: 0, y: 0, duration: 0.4 }); // 아니면 제자리로
      },
    });
    // StrictMode 이중 마운트·라우트 언마운트 시 인스턴스/잔존 tween 정리
    return () => { instance.kill(); gsap.killTweensOf(paper.current); };
  }, { scope: paper });
  return <div ref={paper} className="draggable-paper" />;
}
```
`DraggablePaper.css`: 양피지 사각형, `cursor: grab`.

- [ ] **Step 2: 스토리 + 검증**

스토리에서 `onDropIntoFire=action`. 드래그해 중앙 근처에서 놓으면 action 로그, 아니면 제자리 복귀.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/paper/DraggablePaper.jsx frontend/src/components/paper/DraggablePaper.css frontend/src/components/paper/DraggablePaper.stories.jsx
git commit -m "feat(frontend): DraggablePaper(GSAP Draggable)"
```

### Task 9: BurnAway (바깥부터 타들어감)

**Files:**
- Create: `frontend/src/components/fire/BurnAway.jsx` + `.css` + stories

**Interfaces:**
- Produces: `BurnAway({ trigger, onComplete, children })` — `trigger`가 true가 되면 children을 가장자리부터 태우고 완료 시 `onComplete()`.

- [ ] **Step 1: BurnAway 구현**

```jsx
/** 소각 연출 — trigger 시 children을 가장자리부터(마스크 원을 중앙으로 축소) 태운다. */
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import "./BurnAway.css";

export default function BurnAway({ trigger, onComplete, children }) {
  const wrap = useRef(null);
  useGSAP(() => {
    if (!trigger) {
      gsap.set(wrap.current, { "--burn": "80%", opacity: 1 }); // 초기 상태 복구
      return;
    }
    // --burn(마스크 원 반경)을 줄이면 가장자리부터 사라진다. 난류 필터가 탄 가장자리를 만든다.
    gsap.timeline({ onComplete })
      .fromTo(wrap.current, { "--burn": "80%" }, { "--burn": "0%", duration: 1.6, ease: "power2.in" })
      .to(wrap.current, { opacity: 0, duration: 0.3 }, "-=0.2");
  }, { dependencies: [trigger], revertOnUpdate: true, scope: wrap });
  return (
    <div ref={wrap} className="burn-away">
      <svg width="0" height="0">
        <filter id="charEdge">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className="burn-away__content">{children}</div>
    </div>
  );
}
```
`BurnAway.css`:
```css
.burn-away { --burn: 80%; filter: drop-shadow(0 0 8px var(--color-ember)); } /* 잉걸불 글로우는 마스크 밖 부모에 둔다 */
/* 원형 마스크를 중앙으로 줄여 가장자리부터 사라지게 + 난류 필터로 탄 가장자리 */
.burn-away__content {
  filter: url(#charEdge);
  -webkit-mask: radial-gradient(circle at center, #000 0, #000 var(--burn), transparent calc(var(--burn) + 6%));
  mask: radial-gradient(circle at center, #000 0, #000 var(--burn), transparent calc(var(--burn) + 6%));
}
```
(재 입자는 여력 시 추가.)

- [ ] **Step 2: 스토리 + 검증**

스토리에 `trigger` 토글 컨트롤 + children(양피지 카드). 토글 시 가장자리부터 타들어가고 `onComplete` 액션 발생.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/fire/BurnAway.jsx frontend/src/components/fire/BurnAway.css frontend/src/components/fire/BurnAway.stories.jsx
git commit -m "feat(frontend): BurnAway(GSAP 타임라인 + SVG 노이즈 마스크)"
```

### ✅ Codex 체크포인트 B — 애니메이션

- [ ] **Step: Codex 리뷰**

`components/fire/**`, `DraggablePaper`를 Codex로 리뷰. 관점: (1) `useGSAP` cleanup 정확성, (2) `trigger` 의존성 재실행, (3) 히트존/타임라인 값이 합리적인가, (4) props 경계(콜백만 노출). 반영 후 커밋.

---

## Phase 4 — 페이지(SAMPLE로 완성) · client 완성 · posts 스텁 → practice-start

이 페이즈 종료 시점이 **practice-start 상태**다. 모든 UI가 SAMPLE로 동작하고, `apis/client.js`는 완성, `apis/posts.js`는 스텁, 페이지 데이터 자리엔 `// TODO`가 있다.

### Task 10: apis 골격 (client 완성 · posts 스텁)

**Files:**
- Create: `frontend/src/apis/client.js` (완성)
- Create: `frontend/src/apis/posts.js` (스텁)

**Interfaces:**
- Produces: `api`(axios 인스턴스), 그리고 스텁 함수 7개 시그니처(`getPosts` 등).

- [ ] **Step 1: client.js (완성)**

```js
/** 배포 백엔드에 붙는 axios 인스턴스 — baseURL 인라인(환경변수 안 씀). */
import axios from "axios";
export const api = axios.create({
  baseURL: "https://fe-mini-session-code.onrender.com",
});
```

- [ ] **Step 2: posts.js (스텁 — 학생이 채울 자리)**

```js
/** 글·반응·댓글 API 호출 모음 — 실습에서 학생이 채운다. */
import { api } from "./client";

/** 피드 목록 조회. */
export async function getPosts() {
  // TODO: GET /posts 로 만료 안 된 글 배열을 받아 반환하세요.
}

/** 글 상세 조회. */
export async function getPost(id) {
  // TODO: GET /posts/{id}
}

/** 글 공유(소각) — 닉네임+내용으로 생성. */
export async function createPost({ nickname, content }) {
  // TODO: POST /posts
}

/** 좋아요 +1. */
export async function likePost(id) {
  // TODO: POST /posts/{id}/like
}

/** 싫어요 +1. */
export async function dislikePost(id) {
  // TODO: POST /posts/{id}/dislike
}

/** 댓글 목록 조회. */
export async function getComments(id) {
  // TODO: GET /posts/{id}/comments
}

/** 댓글 작성. */
export async function createComment(id, { nickname, content }) {
  // TODO: POST /posts/{id}/comments
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/apis
git commit -m "feat(frontend): apis(client 완성 + posts 스텁)"
```

### Task 11: NavPage · HomePage · 라우팅 전환

**Files:**
- Modify: `frontend/src/pages/NavPage.jsx`
- Modify: `frontend/src/pages/HomePage.jsx`
- Create: `frontend/src/components/layout/FireWipe.jsx` + `.css` (화면 전환 오버레이)
- Modify: `frontend/src/App.jsx` (전환 오버레이 장착)

**Interfaces:**
- Consumes: `Fire`, `DraggablePaper`, `TopWarningBanner`, `Header`.
- Produces: 완성된 `/`·`/home`, `FireWipe` 전환.

- [ ] **Step 1: NavPage (개발용 네비)**

```jsx
/** 개발용 네비게이션 — API 연동 전 모든 UI 페이지로 이동. */
import { Link } from "react-router-dom";
export default function NavPage() {
  const routes = [["/home", "홈"], ["/paper", "쓰기/소각"], ["/feed", "피드"], ["/feed/1", "상세(샘플)"]];
  return (
    <nav style={{ padding: 32, display: "grid", gap: 12 }}>
      <h1>인시너 — UI 네비게이션</h1>
      {routes.map(([to, label]) => <Link key={to} to={to} style={{ color: "var(--color-ember)" }}>{label}</Link>)}
    </nav>
  );
}
```

- [ ] **Step 2: HomePage**

```jsx
/** 홈 — 불 + 드래그 종이. 종이를 불에 넣으면 쓰기로 이동. */
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import TopWarningBanner from "../components/layout/TopWarningBanner";
import Fire from "../components/fire/Fire";
import DraggablePaper from "../components/paper/DraggablePaper";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  const fireRef = useRef(null); // 실제 불 영역 — 드롭 판정(hitTest)에 넘긴다
  return (
    <div className="home">
      <TopWarningBanner />
      <h1 className="home__title">INCINER<small>Burn what's in your mind</small></h1>
      <div ref={fireRef} className="home__fire"><Fire /></div>
      <DraggablePaper fireRef={fireRef} onDropIntoFire={() => navigate("/paper")} />
      <p className="home__cta">종이를 드래그해 불태우세요!</p>
    </div>
  );
}
```
`HomePage.css`: 소각로 문 프레임을 CSS 보더/그라디언트로 근사, 불·종이·타이틀 배치.

- [ ] **Step 3: FireWipe 전환**

```jsx
/** 라우트 전환 시 불빛이 쓸고 지나가는 오버레이. */
import { useRef } from "react";
import { useLocation } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import "./FireWipe.css";

export default function FireWipe() {
  const el = useRef(null);
  const { pathname } = useLocation();
  useGSAP(() => {
    // 경로가 바뀔 때마다 오버레이를 좌→우로 쓸어 넘긴다.
    gsap.fromTo(el.current, { xPercent: -100 }, { xPercent: 100, duration: 0.6, ease: "power2.inOut" });
  }, { dependencies: [pathname], revertOnUpdate: true });
  return <div ref={el} className="fire-wipe" />;
}
```
`App.jsx`의 `<BrowserRouter>` 안, `<Routes>` 옆에 `<FireWipe />` 추가.
`FireWipe.css`: `position: fixed; inset: 0; z-index: 9999; overflow: hidden; pointer-events: none; will-change: transform; background: linear-gradient(90deg, transparent, var(--color-ember), transparent);`

- [ ] **Step 4: 브라우저 검증**

`/`에서 각 링크 이동 시 불빛 전환, `/home`에서 종이 드래그→중앙에서 놓으면 `/paper` 이동.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/NavPage.jsx frontend/src/pages/HomePage.jsx frontend/src/pages/HomePage.css frontend/src/components/layout/FireWipe.jsx frontend/src/components/layout/FireWipe.css frontend/src/App.jsx
git commit -m "feat(frontend): NavPage·HomePage·FireWipe 전환"
```

### Task 12: PaperPage (쓰기→타는중→재 상태머신, SAMPLE)

**Files:**
- Modify: `frontend/src/pages/PaperPage.jsx` + Create `PaperPage.css`

**Interfaces:**
- Consumes: `PaperEditor`, `RoundButton`, `BurnAway`, `PaperCard`, `getTodayBurnCount`/`incrementBurnCount`.
- Produces: 3-phase 화면. **소각 이음새는 아직 SAMPLE**(실제 `createPost` 없음, TODO).

- [ ] **Step 1: PaperPage 구현(SAMPLE 단계)**

```jsx
/** 쓰기·소각·재 상태머신 — 소각 시 글을 태우고 '재' 화면을 보인다. */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopWarningBanner from "../components/layout/TopWarningBanner";
import Header from "../components/layout/Header";
import PaperEditor from "../components/paper/PaperEditor";
import RoundButton from "../components/common/RoundButton";
import BurnAway from "../components/fire/BurnAway";
import { incrementBurnCount, getTodayBurnCount } from "../utils/burnCount";
import "./PaperPage.css";

export default function PaperPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("writing"); // writing | burning | ashed
  const [content, setContent] = useState("");
  const [burnedCount, setBurnedCount] = useState(0);

  const incinerate = () => {
    // TODO(실습): 여기서 createPost({ nickname: getNickname(), content }) 로 공유한다.
    setPhase("burning");
  };
  const onBurnt = () => {
    setBurnedCount(incrementBurnCount());
    setPhase("ashed");
  };

  if (phase === "ashed") {
    return (
      <div className="paper-page paper-page--ashed">
        <TopWarningBanner /><Header />
        <h1 className="ashed__title">당신의 이야기는<br />재가 되어 사라졌습니다</h1>
        <p className="ashed__count">오늘 {burnedCount || getTodayBurnCount()}명이 소각했습니다</p>
        <div className="ashed__buttons">
          <RoundButton label="더 쓰기" variant="metal" onClick={() => { setContent(""); setPhase("writing"); }} />
          <RoundButton label="피드 보기" variant="metal" onClick={() => navigate("/feed")} />
        </div>
      </div>
    );
  }

  return (
    <div className="paper-page">
      <TopWarningBanner /><Header />
      <h2 className="paper-page__prompt">태워 버리고 싶은 당신의 속마음을 말해보세요.</h2>
      <BurnAway trigger={phase === "burning"} onComplete={onBurnt}>
        <PaperEditor value={content} onChange={setContent} />
      </BurnAway>
      <div className="paper-page__buttons">
        <RoundButton label="소각" variant="red" onClick={incinerate} />
        <RoundButton label="피드" variant="blue" onClick={() => navigate("/feed")} />
      </div>
    </div>
  );
}
```
`PaperPage.css`: 따뜻한 갈색 배경(`--color-bg-warm`), 종이 중앙, 버튼 하단 배치, ashed 타이틀 엠버.

- [ ] **Step 2: 브라우저 검증**

`/paper`에서 글 입력 → `소각` → 종이가 타들어가고 → "재가 되어 사라졌습니다"(오늘 N명↑). `더 쓰기`/`피드 보기` 동작. `피드` 버튼 → `/feed`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/PaperPage.jsx frontend/src/pages/PaperPage.css
git commit -m "feat(frontend): PaperPage 상태머신(SAMPLE, 소각 이음새 TODO)"
```

### Task 13: FeedPage · DetailPage (SAMPLE)

**Files:**
- Modify: `frontend/src/pages/FeedPage.jsx` + Create `FeedPage.css`
- Modify: `frontend/src/pages/DetailPage.jsx` + Create `DetailPage.css`

**Interfaces:**
- Consumes: `PaperCard`, `CommentList`, `CommentInput`, `TopWarningBanner`, `Header`, `SAMPLE_POSTS`, `SAMPLE_POST`, `SAMPLE_COMMENTS`.
- Produces: SAMPLE로 채워진 피드/상세. 데이터·핸들러 자리엔 `// TODO`.

- [ ] **Step 1: FeedPage 구현(SAMPLE 단계)**

```jsx
/** 피드 — 종이 카드 그리드. 좋아요/싫어요·상세 이동. */
import { useNavigate } from "react-router-dom";
import TopWarningBanner from "../components/layout/TopWarningBanner";
import PaperCard from "../components/paper/PaperCard";
import { SAMPLE_POSTS } from "../utils/sampleData";
import "./FeedPage.css";

export default function FeedPage() {
  const navigate = useNavigate();
  const posts = SAMPLE_POSTS; // TODO(실습): useState + useEffect(getPosts) 로 교체
  const handleLike = (id) => { /* TODO: likePost(id) 후 목록 갱신 */ };
  const handleDislike = (id) => { /* TODO: dislikePost(id) 후 목록 갱신 */ };
  return (
    <div className="feed">
      <TopWarningBanner />
      <div className="feed__grid">
        {posts.map((p) => (
          <PaperCard key={p.id} post={p} onLike={handleLike} onDislike={handleDislike}
                     onClick={() => navigate(`/feed/${p.id}`)} />
        ))}
      </div>
    </div>
  );
}
```
`FeedPage.css`: 3열 그리드, 카드 간격, 어두운 배경.

- [ ] **Step 2: DetailPage 구현(SAMPLE 단계)**

```jsx
/** 상세 — 카드 + 댓글 리스트/입력(읽기+댓글). */
import { useNavigate } from "react-router-dom";
import TopWarningBanner from "../components/layout/TopWarningBanner";
import Header from "../components/layout/Header";
import PaperCard from "../components/paper/PaperCard";
import CommentList from "../components/comment/CommentList";
import CommentInput from "../components/comment/CommentInput";
import { SAMPLE_POST, SAMPLE_COMMENTS } from "../utils/sampleData";
import "./DetailPage.css";

export default function DetailPage() {
  const navigate = useNavigate();
  const post = SAMPLE_POST;          // TODO(실습): useParams + getPost(id)
  const comments = SAMPLE_COMMENTS;  // TODO(실습): getComments(id)
  const handleSubmit = (text) => { /* TODO: createComment(id, {nickname, content}) 후 목록 갱신 */ };
  return (
    <div className="detail">
      <TopWarningBanner /><Header />
      <button className="detail__back" onClick={() => navigate(-1)}>‹</button>
      <PaperCard post={post} variant="detail" />
      <CommentList comments={comments} />
      <CommentInput onSubmit={handleSubmit} />
    </div>
  );
}
```
`DetailPage.css`: 카드 중앙, 하단 댓글 영역, 뒤로가기 버튼.

- [ ] **Step 3: 브라우저 검증**

`/feed`가 SAMPLE 카드 3장으로 채워지고 클릭 시 `/feed/1` 상세로 이동, 상세에 카드+댓글+입력창 표시.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/FeedPage.jsx frontend/src/pages/FeedPage.css frontend/src/pages/DetailPage.jsx frontend/src/pages/DetailPage.css
git commit -m "feat(frontend): FeedPage·DetailPage(SAMPLE, 데이터 이음새 TODO)"
```

### ✅ Codex 체크포인트 C — 완성 UI(practice-start 상태)

- [ ] **Step: Codex 리뷰**

`pages/**` + 전체 UI를 Codex로 리뷰. 관점: (1) `SAMPLE`/`// TODO` 자리가 학생에게 명확한 이음새인가, (2) 페이지가 SAMPLE만으로 완전히 둘러보기 가능한가, (3) 남은 오프하는 import/변수 없음. 반영 후 커밋.

### Task 14: 실습 README + practice-start 브랜치 파생

**Files:**
- Create: `frontend/README.md` (분기 **전**에 작성 — practice-start에도 포함돼야 하므로)

- [ ] **Step 1: 실습 안내 README 작성**

`frontend/README.md` 포함: 실행법(`npm install`, `npm run dev` 포트 5173, `npm run storybook`), CORS 5173 주의·백엔드 워밍업(`/health`), 브랜치 구조(main=정답, practice-start=시작점), **학생이 채울 파일 목록(`apis/posts.js` + 3개 페이지 이음새: PaperPage·FeedPage·DetailPage)**, Swagger(`/docs`) 참고 링크.

- [ ] **Step 2: README 커밋 (분기 전)**

```bash
git add frontend/README.md
git commit -m "docs(frontend): 실습 안내 README"
```

- [ ] **Step 3: 현재 상태를 practice-start로 브랜치**

Run(레포 루트):
```bash
git branch practice-start
```
Expected: 현재 커밋(완성 UI + SAMPLE + posts 스텁 + 페이지 TODO + README)이 practice-start의 시작점이 된다. 이후 main만 정답으로 진행한다.

- [ ] **Step 4: 확인**

Run: `git log --oneline -1 practice-start`
Expected: README 커밋(체크포인트 C 직후)을 가리킨다.

---

## Phase 5 — 정답 연동 (main만 진행)

여기서 스텁을 채워 main을 정답으로 만든다. **practice-start는 건드리지 않는다.**

### Task 15: apis/posts.js 구현 (정답)

**Files:**
- Modify: `frontend/src/apis/posts.js`

**Interfaces:**
- Produces: 실제 호출로 채워진 7개 함수(전부 `res.data` 반환).

- [ ] **Step 1: posts.js 채우기**

```js
/** 글·반응·댓글 API 호출 모음. */
import { api } from "./client";

/** 피드 목록 조회. */
export async function getPosts() {
  const res = await api.get("/posts");
  return res.data;
}
/** 글 상세 조회. */
export async function getPost(id) {
  const res = await api.get(`/posts/${id}`);
  return res.data;
}
/** 글 공유(소각). */
export async function createPost({ nickname, content }) {
  const res = await api.post("/posts", { nickname, content });
  return res.data;
}
/** 좋아요 +1. */
export async function likePost(id) {
  const res = await api.post(`/posts/${id}/like`);
  return res.data;
}
/** 싫어요 +1. */
export async function dislikePost(id) {
  const res = await api.post(`/posts/${id}/dislike`);
  return res.data;
}
/** 댓글 목록 조회. */
export async function getComments(id) {
  const res = await api.get(`/posts/${id}/comments`);
  return res.data;
}
/** 댓글 작성. */
export async function createComment(id, { nickname, content }) {
  const res = await api.post(`/posts/${id}/comments`, { nickname, content });
  return res.data;
}
```

- [ ] **Step 2: 검증(브라우저 콘솔 또는 임시 호출)**

백엔드 워밍업(`/health`) 후 `/feed`가 실제 데이터로 뜨는지는 Task 17에서 확인. 여기선 컴파일·import만 확인.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/apis/posts.js
git commit -m "feat(frontend): posts.js API 호출 구현(정답)"
```

### Task 16: PaperPage 소각 연동 (정답)

**Files:**
- Modify: `frontend/src/pages/PaperPage.jsx`

**Interfaces:**
- Consumes: `createPost`, `getNickname`.

- [ ] **Step 1: 소각 이음새 채우기**

`PaperPage.jsx` 상단 import 추가:
```jsx
import { createPost } from "../apis/posts";
import { getNickname } from "../utils/nickname";
```
`incinerate`를 교체:
```jsx
const incinerate = async () => {
  // 공유(소각) — 글을 피드에 저장한 뒤 타는 애니메이션으로 넘어간다.
  await createPost({ nickname: getNickname(), content });
  setPhase("burning");
};
```

- [ ] **Step 2: 브라우저 검증**

백엔드 워밍업 후 `/paper`에서 작성→소각→애니→재 화면. 이후 `/feed`에서 방금 글이 최신으로 보이면 통과.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/PaperPage.jsx
git commit -m "feat(frontend): PaperPage 소각→createPost 연동(정답)"
```

### Task 17: FeedPage 연동 (정답)

**Files:**
- Modify: `frontend/src/pages/FeedPage.jsx`

**Interfaces:**
- Consumes: `getPosts`, `likePost`, `dislikePost`.

- [ ] **Step 1: 데이터 이음새 채우기**

`FeedPage.jsx`의 SAMPLE/TODO 블록을 교체:
```jsx
import { useState, useEffect } from "react";
import { getPosts, likePost, dislikePost } from "../apis/posts";
// ...
const [posts, setPosts] = useState([]);
useEffect(() => { getPosts().then(setPosts); }, []);
const handleLike = async (id) => {
  const updated = await likePost(id);
  setPosts((list) => list.map((p) => (p.id === id ? updated : p))); // 갱신된 글로 교체
};
const handleDislike = async (id) => {
  const updated = await dislikePost(id);
  setPosts((list) => list.map((p) => (p.id === id ? updated : p)));
};
```
(SAMPLE import 제거.)

- [ ] **Step 2: 브라우저 검증**

`/feed`가 실제 목록으로 채워지고, 👍/👎가 카운트·게이지에 즉시 반영.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/FeedPage.jsx
git commit -m "feat(frontend): FeedPage 목록·반응 연동(정답)"
```

### Task 18: DetailPage 연동 (정답)

**Files:**
- Modify: `frontend/src/pages/DetailPage.jsx`

**Interfaces:**
- Consumes: `useParams`, `getPost`, `getComments`, `createComment`, `getNickname`.

- [ ] **Step 1: 데이터 이음새 채우기**

`DetailPage.jsx`의 SAMPLE/TODO 블록 교체:
```jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPost, getComments, createComment } from "../apis/posts";
import { getNickname } from "../utils/nickname";
// ...
const { id } = useParams();
const [post, setPost] = useState(null);
const [comments, setComments] = useState([]);
useEffect(() => {
  getPost(id).then(setPost);
  getComments(id).then(setComments);
}, [id]);
const handleSubmit = async (text) => {
  const created = await createComment(id, { nickname: getNickname(), content: text });
  setComments((list) => [created, ...list]); // 최신순 앞에 추가
};
if (!post) return null; // 첫 로딩 프레임(방어코드 아님, 렌더 전 null 가드)
```

- [ ] **Step 2: 브라우저 검증**

`/feed`에서 카드 클릭→상세가 실제 글/댓글로 로딩, 댓글 작성 시 즉시 리스트 상단에 추가.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/DetailPage.jsx
git commit -m "feat(frontend): DetailPage 상세·댓글 연동(정답)"
```

### ✅ Codex 체크포인트 D — 정답 연동(수업 코드)

- [ ] **Step: Codex 리뷰**

Phase 5의 diff(apis/posts.js + 3개 페이지 이음새: PaperPage·FeedPage·DetailPage)를 Codex로 리뷰. 관점: (1) **학생이 라이브로 따라 칠 코드로 명료한가**, (2) 반응/댓글 상태 갱신이 자연스러운가, (3) `getNickname` 출처가 드러나는가, (4) 방어코드 과잉 없이 해피패스인가. 반영 후 커밋.

## Self-Review (계획 작성자 체크리스트)

- **스펙 커버리지:** 라우트 5개(Task 11~13) · 컴포넌트 인벤토리 전체(Task 3~9) · apis client/posts 분리(Task 10,15) · 페이지 이음새(Task 12,13→16,17,18) · 애니 4종(Task 7,8,9,11) · Storybook(Task 3~9) · 브랜치 파생(Task 14) · 조정 결정(소각=POST Task16 · MM:SS Task2/3 · 댓글 문구 Task5 · 상세 반응 없음 Task4/13) · 운영 노트(README Task14) — 모두 태스크 존재. ✅
- **Placeholder:** 코드 내 `// TODO`는 **의도된 실습 스텁**(계획 공백이 아님). 계획 서술엔 미완 표현 없음. ✅
- **타입 일관성:** `getPosts/getPost/createPost/likePost/dislikePost/getComments/createComment` 시그니처가 apis(Task10 스텁·Task15 구현)와 페이지 소비부(Task16~18)에서 일치. Post/Comment 필드가 sampleData(Task2)·PaperCard(Task4)·PostRead/CommentRead와 일치. ✅

## Execution Handoff

이 계획은 **Codex 체크포인트(A~D)** 를 페이즈 이음새마다 두어, 로컬 테스트가 없는 이 프로젝트의 검증을 대체한다.
