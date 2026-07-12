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
