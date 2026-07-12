/** "오늘 N명 소각" 로컬 카운터 — 해당 엔드포인트가 없어 localStorage로 흉내낸다. */
// 로컬 날짜(연-월-일)로 키를 만든다 — UTC면 KST 09시에 "오늘"이 바뀜.
const key = () => {
  const d = new Date();
  return `burnCount:${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

/** 오늘 소각 누적 수를 반환한다. */
export function getTodayBurnCount() {
  return Number(localStorage.getItem(key()) || 0);
}
/** 소각 1건 반영 후 누적값 반환. */
export function incrementBurnCount() {
  const next = getTodayBurnCount() + 1;
  localStorage.setItem(key(), String(next));
  return next;
}
