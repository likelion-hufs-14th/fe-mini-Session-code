/** Timer 표시(정상 구간·임박 구간) 확인용 스토리. */
import Timer from './Timer';

/** Timer 스토리 메타. */
export default {
  title: 'common/Timer',
  component: Timer,
};

/** 남은 시간이 넉넉한 경우(04:45). */
export const Normal = {
  args: { seconds: 285 },
};

/** 소각 임박(00:05). */
export const Critical = {
  args: { seconds: 5 },
};
