/** 댓글 입력 — Enter/전송 시 내용을 올려보내고 비운다(최대 300자, 타이머 암시 문구 없음). */
import { useState } from 'react';
import './CommentInput.css';
export default function CommentInput({
  onSubmit,
  placeholder = '의견을 남겨보세요.',
}) {
  const [text, setText] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (!text) return; // 빈 값은 보내지 않는다(유일한 최소 가드)
    onSubmit(text);
    setText('');
  };
  return (
    <form
      className='comment-input'
      onSubmit={submit}
    >
      <input
        value={text}
        maxLength={300}
        placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        type='submit'
        aria-label='댓글 등록'
      >
        ➤
      </button>
    </form>
  );
}
