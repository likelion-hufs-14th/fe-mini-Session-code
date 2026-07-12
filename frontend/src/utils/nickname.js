/** 세션당 랜덤 익명 닉네임 — 서버가 아니라 클라이언트가 부여한다. */
const ADJECTIVES = ['익명의', '지나가던', '말없는', '타버린', '축축한'];
const ANIMALS = ['두더지', '너구리', '고양이', '부엉이', '여우'];

/** 저장된 닉네임을 반환하고, 없으면 새로 만들어 세션에 고정한다. */
export function getNickname() {
  const saved = sessionStorage.getItem('nickname');
  if (saved) return saved;
  const name =
    ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)] +
    ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  sessionStorage.setItem('nickname', name); // 세션(탭)당 고정
  return name;
}
