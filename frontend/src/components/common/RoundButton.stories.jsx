/** RoundButton 변형(red·blue·metal) 확인용 스토리. */
import RoundButton from './RoundButton';

/** RoundButton 스토리 메타. */
export default {
  title: 'common/RoundButton',
  component: RoundButton,
};

/** 소각(red) 변형. */
export const Red = {
  args: { label: '소각', variant: 'red' },
};

/** 피드(blue) 변형. */
export const Blue = {
  args: { label: '피드', variant: 'blue' },
};

/** 중립(metal) 변형. */
export const Metal = {
  args: { label: '더 쓰기', variant: 'metal' },
};
