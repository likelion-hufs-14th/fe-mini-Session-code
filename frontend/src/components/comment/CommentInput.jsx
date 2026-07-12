/** 댓글 입력 — 제출 시 내용을 올려보내고 비운다(타이머 암시 문구 없음). */
import { useState } from "react";
import "./CommentInput.css";

/** 댓글 입력 폼 — 텍스트 입력 + 전송 버튼. */
export default function CommentInput({ onSubmit, placeholder = "의견을 남겨보세요." }) {
  const [text, setText] = useState("");
  const submit = () => {
    if (!text) return; // 빈 값은 보내지 않는다(유일한 최소 가드)
    onSubmit(text);
    setText("");
  };
  return (
    <div className="comment-input">
      <input value={text} placeholder={placeholder} onChange={(e) => setText(e.target.value)} />
      <button onClick={submit}>➤</button>
    </div>
  );
}
