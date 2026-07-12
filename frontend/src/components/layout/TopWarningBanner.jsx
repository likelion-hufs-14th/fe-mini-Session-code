/** 상단 경고 배너 — 휘발성 서비스 고지(고정 문구). */
import './TopWarningBanner.css';
export default function TopWarningBanner() {
  return (
    <div className='top-warning-banner'>
      본 서비스는 어떠한 데이터도 백업하지 않으며, 소각 즉시 서버에서 완전히
      영구 삭제됩니다.
    </div>
  );
}
