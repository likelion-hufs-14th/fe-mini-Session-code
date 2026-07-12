/** 남은 초를 🔥 MM:SS로 표기(순수 표시 — 카운트다운은 부모가 준다). */
import { formatTime } from '../../utils/formatTime';
import './Timer.css';

export default function Timer({ seconds }) {
  return <span className='timer'>🔥 {formatTime(seconds)}</span>;
}
