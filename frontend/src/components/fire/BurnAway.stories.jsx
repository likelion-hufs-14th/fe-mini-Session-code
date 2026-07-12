/** BurnAway 소각 애니메이션(GSAP 타임라인 + mask) 확인용 스토리 — trigger 토글로 가장자리부터 타는 연출을 재생한다. */
import { action } from 'storybook/actions';
import BurnAway from './BurnAway';

/** BurnAway 스토리 메타. */
export default {
  title: 'fire/BurnAway',
  component: BurnAway,
  argTypes: {
    trigger: { control: 'boolean' },
  },
};

// 소각 대상 목업 — 양피지 카드 느낌의 박스.
function ParchmentCard() {
  return (
    <div
      style={{
        width: 200,
        height: 120,
        padding: 16,
        border: '1px solid #b8a878',
        borderRadius: 8,
        background: 'var(--color-paper)',
        color: '#2a1e14',
      }}
    >
      태우고 싶은 이야기
    </div>
  );
}

/** trigger를 켜면 가장자리부터 타들어가며 완료 시 onComplete 액션이 발생한다. */
export const Default = {
  args: { trigger: false, onComplete: action('onComplete') },
  render: (args) => (
    <BurnAway {...args}>
      <ParchmentCard />
    </BurnAway>
  ),
};
