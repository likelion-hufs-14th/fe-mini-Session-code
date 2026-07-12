/** 개발용 네비게이션 — API 연동 전 모든 UI 페이지로 이동. */
import { Link } from 'react-router-dom';
export default function NavPage() {
  const routes = [
    ['/home', '홈'],
    ['/paper', '쓰기/소각'],
    ['/feed', '피드'],
    ['/feed/1', '상세(샘플)'],
  ];
  return (
    <nav style={{ padding: 32, display: 'grid', gap: 12 }}>
      <h1>인시너 — UI 네비게이션</h1>
      {routes.map(([to, label]) => (
        <Link
          key={to}
          to={to}
          style={{ color: 'var(--color-ember)' }}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
