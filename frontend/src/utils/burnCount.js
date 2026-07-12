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
