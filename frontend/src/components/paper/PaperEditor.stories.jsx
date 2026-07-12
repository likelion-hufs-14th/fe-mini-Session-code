/** PaperEditor 상태별(빈 값·일부 입력) 확인용 스토리. */
import { useState } from 'react';
import PaperEditor from './PaperEditor';

/** PaperEditor 스토리 메타. */
export default {
  title: 'paper/PaperEditor',
  component: PaperEditor,
};

// 제어 컴포넌트라 캔버스에서 실제 타이핑이 되도록 로컬 상태로 감싼다.
function ControlledEditor(args) {
  const [value, setValue] = useState(args.value);
  return (
    <PaperEditor
      {...args}
      value={value}
      onChange={setValue}
    />
  );
}

/** 빈 값 상태. */
export const Empty = {
  args: { value: '' },
  render: (args) => <ControlledEditor {...args} />,
};

/** 일부 입력된 상태. */
export const Filled = {
  args: { value: '오늘 있었던 일을 태워버리고 싶다...' },
  render: (args) => <ControlledEditor {...args} />,
};
