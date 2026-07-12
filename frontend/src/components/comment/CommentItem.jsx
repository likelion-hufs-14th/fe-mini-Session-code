/** 댓글 한 줄 — 닉네임 + 내용. */
import './CommentItem.css';

/** 댓글 한 줄 UI(읽기 전용). */
export default function CommentItem({ comment }) {
  return (
    <li className='comment-item'>
      <strong className='comment-item__nick'>{comment.nickname}</strong>
      <span className='comment-item__text'>{comment.content}</span>
    </li>
  );
}
