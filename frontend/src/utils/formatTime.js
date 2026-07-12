/** 초를 MM:SS로 포맷 — 카드 타이머 표기용. */
export function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  const m = String(Math.floor(safe / 60)).padStart(2, "0");
  const s = String(safe % 60).padStart(2, "0");
  return `${m}:${s}`;
}
