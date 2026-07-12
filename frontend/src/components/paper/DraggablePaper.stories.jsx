/** DraggablePaper 드래그(GSAP Draggable) 확인용 스토리 — hitTest 대상인 불 영역을 목으로 렌더한다. */
import { useRef } from 'react';
import { action } from 'storybook/actions';
import DraggablePaper from './DraggablePaper';

/** DraggablePaper 스토리 메타. */
export default {
  title: 'paper/DraggablePaper',
  component: DraggablePaper,
};

// hitTest가 참조할 fireRef 대상이 없으면 널 참조로 깨지므로, 불 영역 목 박스를 만들어 ref로 넘긴다.
function Playground(args) {
  const fireRef = useRef(null);
  return (
    <div style={{ position: 'relative', width: 320, height: 240 }}>
      <div
        ref={fireRef}
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'var(--color-ember)',
        }}
      />
      <DraggablePaper
        {...args}
        fireRef={fireRef}
      />
    </div>
  );
}

/** 종이를 불 영역(우하단 원)까지 끌어 놓으면 onDropIntoFire, 아니면 제자리로 복귀. */
export const Default = {
  args: { onDropIntoFire: action('onDropIntoFire') },
  render: (args) => <Playground {...args} />,
};
