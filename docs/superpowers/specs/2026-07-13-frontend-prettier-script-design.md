# Frontend Prettier 스크립트 설계

- **작성일:** 2026-07-13
- **상태:** 설계 확정
- **범위:** `frontend/package.json`의 npm 스크립트

## 목표

Frontend 전체 파일에 Prettier를 강제로 적용하는 단일 명령을 제공한다.

## 설계

`frontend/package.json`의 `scripts`에 아래 항목을 추가한다.

```json
"format": "prettier --write . --ignore-path ../.prettierignore"
```

- `npm run format`을 실행하면 `frontend/`를 기준으로 Prettier가 파일을 직접 수정한다.
- 기존 루트 `prettier.config.js`를 탐색해 사용하고, 루트 `.prettierignore`는 경로를 명시한다.
- 검사 전용 스크립트와 파일 범위 제한은 추가하지 않는다.

## 검증

`frontend/`에서 `npm run format`을 실행해 명령이 정상 종료하는지 확인한다. 이후 변경 파일 목록을 확인해 예상하지 않은 파일 수정이 없는지 검토한다.
