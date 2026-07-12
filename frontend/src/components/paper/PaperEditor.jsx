/** 소각할 속마음 입력 — 양피지 텍스트영역 + 글자수 카운터. */
import './PaperEditor.css';
export default function PaperEditor({ value, onChange, maxLength = 300 }) {
  return (
    <div className='paper-editor'>
      <textarea
        className='paper-editor__area'
        value={value}
        maxLength={maxLength}
        placeholder='태워 버리고 싶은 당신의 속마음을 말해보세요.'
        onChange={(e) => onChange(e.target.value)}
      />
      <span className='paper-editor__count'>
        {value.length}/{maxLength}
      </span>
    </div>
  );
}
