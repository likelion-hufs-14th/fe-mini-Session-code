/** 남은 시간 게이지 — seconds/maxSeconds 비율의 주황 바. */
import './BurnGauge.css';
export default function BurnGauge({ seconds, maxSeconds = 300 }) {
  const ratio = Math.min(seconds / maxSeconds, 1);
  return (
    <div className='burn-gauge'>
      <div
        className='burn-gauge__fill'
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}
