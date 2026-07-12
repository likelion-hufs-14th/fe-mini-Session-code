# 인시너 프론트엔드 설계 (Frontend Practice Design)

- **작성일:** 2026-07-12
- **상태:** 설계 확정 (구현 계획 작성 예정)
- **범위:** 완성 UI 코드베이스 + API 연동 실습 골격. 백엔드([API 도메인](2026-07-12-incineration-api-design.md))에 붙는 React 프론트.
- **선행 문서:** [인시너 API 도메인 설계](2026-07-12-incineration-api-design.md)

## 배경 & 목표

**인시너**는 익명·휘발성 감정 소각 서비스다. 이 문서는 강의 세션용 **프론트엔드 산출물**을 확정한다.

이건 "단순 코드 구현"이 아니라 **교육 산출물**이다. 두 역할이 있다.

1. **완성본(main)** — UI·애니메이션·라우팅이 전부 동작하는 참고 정답.
2. **실습 시작점(practice-start)** — UI는 완성이되 **API 연동 레이어가 비어 있는** 상태. 강사는 강의 중 이 빈 곳을 라이브로 채우고(main으로 수렴), 학생은 자기 브랜치에서 따라 친다.

**교육 목표:** 학생은 서버도, 컴포넌트도, CSS도 짜지 않는다. **정적 UI를 살아있는 앱으로 만드는 API 연동**(axios 호출 + `useState`/`useEffect` 데이터 흐름)만 배운다. 따라서 산출물의 핵심은 **연동 이음새가 좁고·선명하고·초보자가 이해할 수준**이라는 데 있다.

## 교육 이음새 (이 설계의 핵심)

코드를 세 겹으로 나누되, **학생이 건드리는 건 2겹뿐**이다.

| 겹 | 내용 | 상태 | 학생이? |
|---|---|---|---|
| **컴포넌트** (표현) | props 받아 그리기 + 애니메이션 내부 | ✅ 완성 | ❌ 안 건드림 (Storybook으로 봄) |
| **페이지** (컨테이너) | 레이아웃·라우팅 골격 완성. 데이터는 로컬 `SAMPLE` 상수(`// TODO`) | 🟡 골격 완성 + 이음새 TODO | 🟡 SAMPLE 자리에 `useState+useEffect+axios` 채우고 핸들러 연결 |
| **apis/** | `client.js`=axios 인스턴스(완성) · `posts.js`=호출 함수(스텁) | 🟡 인스턴스만 완성 | ✅ 호출 함수를 백지에서 구현 |

**커스텀 훅은 만들지 않는다.** 각 fetch가 정확히 한 페이지에서만 쓰이므로(한 번 쓰는 로직) 추상화가 오히려 헷갈림을 늘린다. 데이터 로직을 페이지에 직접 두면 `useState + useEffect + axios` 흐름이 한 곳에서 다 보인다.

`SAMPLE` 상수 덕분에 **연동 전에도 모든 페이지가 채워져 보인다** — `/` 네비 페이지로 완성 UI를 실제 데이터가 든 모습으로 둘러볼 수 있다.

```jsx
// 연동 전 — 완성본이 이 상태로 제공 (페이지가 채워져 보임)
const posts = SAMPLE_POSTS; // TODO: GET /posts 로 교체

// 학생이 채운 뒤 — 데이터 흐름이 페이지 안에서 전부 보임
const [posts, setPosts] = useState([]);
useEffect(() => { getPosts().then(setPosts); }, []);
```

## 기술 스택 & 제약

- **런타임/도구:** React + JavaScript(순수, TS 없음) + Vite.
- **학생이 배운 것:** `react-router-dom`, `axios`. 데이터는 `useState`/`useEffect`만. **상태 라이브러리·react-query 없음.**
- **애니메이션(완성본 전용, 학생 미타이핑):** **GSAP 단일 엔진** + **SVG 필터/마스크**. React에선 `@gsap/react`의 `useGSAP`. 이미지 에셋 없이 CSS/SVG로 근사.
- **CSS:** 컴포넌트별 순수 `.css` 파일(학생이 배운 idiom). 전역 테마는 `src/index.css`.
- **Storybook:** 컴포넌트 시각 쇼케이스(강사측). 학생은 스토리를 작성하지 않는다.
- **초보자 원칙:** 방어코드 없음(`try/catch`·널 체크·로딩/에러 UI 없음). 해피패스만.

## 라우트 & 플로우

```
/           NavPage    개발용 — 모든 페이지로 점프
/home       HomePage   불 + 종이. 종이를 불로 드래그 ──▶ /paper
/paper      PaperPage  [쓰기] ─소각(POST)─▶ [타는중] ──▶ [재] ─더쓰기─▶[쓰기]
                       └ 피드 버튼 ──▶ /feed              └ 피드보기─▶ /feed
/feed       FeedPage   종이 카드 그리드. 👍/👎, 카드 클릭 ──▶ /feed/:id
/feed/:id   DetailPage 카드 + 댓글 리스트/입력
```

"종이 라우트"의 3화면(쓰기→타는중→재)은 **한 라우트(`/paper`) 안의 상태 머신**(`'writing' | 'burning' | 'ashed'`)이다. 번 애니메이션이 한 트리 안에 있어야 깔끔하다.

`/`(NavPage)는 실사용 홈이 아니라 **개발/실습용 네비게이션**이다. 실사용 진입은 `/home`.

## 화면 → 엔드포인트 매핑

| 액션 | 엔드포인트 | 위치 |
|---|---|---|
| 소각(=공유) | `POST /posts` → 타는 애니 → 재 화면 | `/paper` 소각 버튼 |
| 피드 목록 | `GET /posts` | `/feed` |
| 상세 | `GET /posts/{id}` | `/feed/:id` |
| 좋아요/싫어요 | `POST /posts/{id}/like\|dislike` | `/feed` 카드 |
| 댓글 목록/작성 | `GET\|POST /posts/{id}/comments` | `/feed/:id` |

## 폴더 구조 (frontend/, 최신 Vite 기본형)

```
frontend/
├─ .storybook/                # Storybook 설정
├─ public/                    # noise.svg 등 (에셋 없이 CSS/SVG)
├─ index.html
├─ package.json
├─ vite.config.js
└─ src/
   ├─ main.jsx                # 진입점 (BrowserRouter)
   ├─ App.jsx                 # react-router-dom 라우팅
   ├─ index.css               # 전역 테마(색·폰트·리셋)
   ├─ pages/                  # 🟡 데이터 이음새 TODO
   │  ├─ NavPage.jsx
   │  ├─ HomePage.jsx
   │  ├─ PaperPage.jsx
   │  ├─ FeedPage.jsx
   │  └─ DetailPage.jsx
   ├─ components/             # ✅ 완성
   │  ├─ layout/   TopWarningBanner · Header · FloatingAvatars
   │  ├─ fire/     Fire · BurnAway
   │  ├─ paper/    DraggablePaper · PaperEditor · PaperCard · BurnGauge
   │  ├─ common/   RoundButton · Timer
   │  └─ comment/  CommentList · CommentItem · CommentInput
   ├─ apis/
   │  ├─ client.js            # ✅ axios 인스턴스 + 인라인 baseURL
   │  └─ posts.js             # ⬜ 호출 함수 스텁
   └─ utils/                  # ✅ 완성
      ├─ nickname.js
      ├─ formatTime.js
      └─ sampleData.js
```

`src/hooks/`는 두지 않는다(커스텀 훅 없음).

## 컴포넌트 인벤토리 (props = API 이음새)

전부 **완성 제공**. props는 연동에 필요한 것만 노출한다. 학생은 이 props에 데이터·핸들러만 꽂는다.

| 컴포넌트 | 핵심 props | 비고 |
|---|---|---|
| `PaperCard` | `post`, `onLike`, `onDislike`, `variant:'feed'\|'detail'` | 내부에 Timer·BurnGauge·반응버튼. **상세 variant는 반응버튼 없음**(읽기+댓글) |
| `Timer` | `seconds` | 로컬로 초 감소, `🔥 MM:SS` |
| `BurnGauge` | `seconds`, `maxSeconds=300` | 주황 게이지바. 비율 = `min(seconds/maxSeconds, 1)` |
| `PaperEditor` | `value`, `onChange`, `maxLength=300` | `0/300` 카운터 |
| `RoundButton` | `label`, `onClick`, `variant:'red'\|'blue'\|'metal'` | 금속 원형 버튼 |
| `CommentList` / `CommentItem` | `comments` / `comment` | 스크롤 리스트 |
| `CommentInput` | `onSubmit`, `placeholder` | 타이머 암시 없는 문구 |
| `Fire` | — | 홈 이글이글 (SVG `feTurbulence` + GSAP 플리커) |
| `DraggablePaper` | `onDropIntoFire` | 홈 드래그 (GSAP Draggable) |
| `BurnAway` | `trigger`, `onComplete`, children | 가장자리부터 타들어감 (GSAP + SVG 노이즈 마스크) |

## 페이지별 데이터 이음새 (학생이 채우는 곳)

각 페이지는 레이아웃·라우팅이 완성돼 있고, 데이터 자리에 `SAMPLE` 상수 + `// TODO`가 놓여 있다.

- **NavPage (`/`)** — 모든 라우트로 가는 링크(샘플 상세 id 포함). API 없음. 완성.
- **HomePage (`/home`)** — `Fire` + `DraggablePaper`. `onDropIntoFire` → `navigate('/paper')`. API 없음. 완성.
- **PaperPage (`/paper`)** — 상태 머신. `쓰기`에서 `PaperEditor` + 소각(red)/피드(blue).
  - **이음새:** 소각 클릭 → `await createPost({ nickname: getNickname(), content })` → `setPhase('burning')`. `BurnAway` 완료 → `setPhase('ashed')`. 피드 버튼 → `navigate('/feed')`.
- **FeedPage (`/feed`)** — 카드 그리드.
  - **이음새:** `SAMPLE_POSTS` → `useState`+`useEffect(getPosts)`. `onLike`/`onDislike` 핸들러가 `likePost`/`dislikePost` 호출 후 목록 갱신.
- **DetailPage (`/feed/:id`)** — 카드 + 댓글.
  - **이음새:** `useParams`의 id로 `getPost`·`getComments`. `CommentInput.onSubmit` → `createComment(id, { nickname: getNickname(), content })` 후 목록 갱신.

## apis/ (해피패스, 방어코드 없음)

**`client.js` (완성 제공):**

```js
/** 배포 백엔드에 붙는 axios 인스턴스 — baseURL 인라인(환경변수 안 씀). */
import axios from "axios";

export const api = axios.create({
  baseURL: "https://fe-mini-session-code.onrender.com",
});
```

**`posts.js` (학생 스텁 → 구현):** 아래 7개 함수. 전부 `api`로 호출하고 `res.data` 반환.

| 함수 | 호출 |
|---|---|
| `getPosts()` | `GET /posts` |
| `getPost(id)` | `GET /posts/{id}` |
| `createPost({nickname, content})` | `POST /posts` |
| `likePost(id)` | `POST /posts/{id}/like` |
| `dislikePost(id)` | `POST /posts/{id}/dislike` |
| `getComments(id)` | `GET /posts/{id}/comments` |
| `createComment(id, {nickname, content})` | `POST /posts/{id}/comments` |

예시(완성 정답 형태):

```js
/** 피드 목록 조회 — 만료 안 된 글 배열. */
export async function getPosts() {
  const res = await api.get("/posts");
  return res.data;
}
```

## 애니메이션 (GSAP 단일 + SVG, 에셋 없이)

| 효과 | 구현 |
|---|---|
| 홈 불 이글이글 | SVG `feTurbulence` 필터 + 주황 그라디언트 레이어, GSAP 플리커 루프 |
| 종이 드래그→불 | GSAP `Draggable`, 불 히트존 진입 시 `onDropIntoFire` |
| 바깥부터 타들어감 | GSAP 타임라인이 SVG **노이즈 마스크 임계값**(가장자리→중앙) + 잉걸불 글로우 + 재 입자 지휘, 완료 시 `onComplete` |
| 화면 전환 | GSAP "불 와이프" 오버레이(테마 일치, 과하지 않게) |

GSAP은 2024년 이후 `Draggable` 포함 전 플러그인이 무료다.

## 스타일 · 유틸 · 닉네임

- **팔레트(목업 기준):** 차콜 `#141210`, 엠버 오렌지 `#E8802B`, 양피지 `#E8DCC0`, 건메탈/스틸블루 버튼.
- **utils(완성 제공):**
  - `nickname.js` — 세션당 랜덤 익명 닉네임 생성, `sessionStorage` 메모(`getNickname()`).
  - `formatTime.js` — 초 → `MM:SS`.
  - `sampleData.js` — 둘러보기용 `SAMPLE_POSTS`·`SAMPLE_POST`·`SAMPLE_COMMENTS`.
- **"오늘 N명 소각":** 해당 카운트 엔드포인트 없음 → `localStorage` 로컬 카운터(장식).
- **떠다니는 파란 아바타:** 장식(다른 익명 유저 분위기), API 없음.

## 이미지 ↔ 백엔드 조정 결정

목업과 백엔드가 어긋난 지점을 아래로 확정했다.

| 항목 | 결정 |
|---|---|
| 소각 버튼 | `POST /posts`(공유) + 타는 애니메이션 → 재 화면. **프론트 전용 "즉시 소각" 경로는 안 씀**(백엔드 그 분기 미호출, 수정 불필요) |
| 피드 버튼(쓰기 화면) | 저장 없이 `/feed`로 이동만 |
| 댓글↔타이머 | 댓글은 타이머 영향 없음(백엔드 유지). **입력창 문구를 타이머 암시 없는 것으로 교체** |
| 타이머 표기 | `🔥 MM:SS`(분:초) — 수명 5~10분이라 초 단위 카운트다운이 보이게 |
| 상세 반응 | 상세 카드엔 좋아요/싫어요 없음(피드에서만), 상세=읽기+댓글 |

## Storybook 범위

표현 컴포넌트만: `PaperCard`(feed/detail·남은시간 다양), `Timer`, `BurnGauge`, `RoundButton`(변형), 댓글 3종, `PaperEditor`, `Fire`, `BurnAway`(play 컨트롤). **페이지는 제외.**

## 브랜치 & 실습 워크플로우

- **main** — 완성 정답(동작하는 앱). 먼저 여기에 전부 구현.
- **practice-start** — main에서 `apis/posts.js`·페이지 데이터 이음새만 스텁+TODO+SAMPLE로 되돌린 브랜치. `apis/client.js`·컴포넌트·CSS·유틸·애니메이션은 완성 그대로.
- **학생:** `git checkout -b <이름> practice-start` → 채움, 막히면 main 참고.
- **강사:** practice-start에서 시작해 라이브로 채워 main에 수렴.

## 운영 노트

- **CORS:** 백엔드는 `http://localhost:5173`만 허용. 학생은 **Vite 기본 포트 5173**으로 띄워야 한다(포트 겹치면 CORS 차단).
- **onrender 무료 티어:** 15분 무요청 시 sleep → 첫 요청 ~1분. 세션 직전 `/health`·`/docs`로 워밍업.

## 비목표 (Non-goals)

- TypeScript·CSS 프레임워크·상태 라이브러리·react-query·데이터 페칭 라이브러리 — 없음.
- 캡처/우클릭/복사 차단 — **구현 안 함**.
- 로딩/에러 UI, `try/catch`, 방어코드 — 없음(해피패스).
- 커스텀 훅 — 없음(페이지에 직접).
- 프론트 배포 — 없음.
- 자동화 테스트 스위트 — 없음(검증=Storybook·브라우저 수동).

## 성공 기준 — 검증

로컬 테스트가 없으므로 **완성본(main)을 브라우저로 직접** 확인한다.

1. `npm run dev`(포트 5173) 후 `/`에서 모든 페이지로 이동 가능, SAMPLE 데이터로 채워져 보인다.
2. `/home`에서 종이를 불로 드래그하면 `/paper`로 전환된다.
3. `/paper`에서 글 작성 → 소각 → 타는 애니메이션 → "재가 되어 사라졌습니다" 화면. 이때 `POST /posts`가 실제로 호출돼 피드에 나타난다.
4. `/feed`가 `GET /posts`로 실제 목록을 채운다(최신순). 좋아요/싫어요가 카운트·게이지에 반영된다.
5. 카드 클릭 → `/feed/:id` 상세가 `GET /posts/{id}`로 로딩되고, 댓글이 `GET/POST /posts/{id}/comments`로 조회·작성된다.
6. 타이머가 `MM:SS`로 감소하고, 만료된 글은 목록 재조회 시 사라진다.
7. Storybook에서 모든 표현 컴포넌트가 다양한 props로 렌더된다.
8. `practice-start` 브랜치는 `apis/posts.js`·페이지 이음새만 비어 있고, 나머지(컴포넌트·CSS·애니메이션·`/` 네비의 SAMPLE 렌더)는 그대로 동작한다.
