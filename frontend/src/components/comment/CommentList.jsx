/** 댓글 목록 — 스크롤 영역. */
import CommentItem from "./CommentItem";
import "./CommentList.css";

/** 댓글 목록을 스크롤 가능한 영역으로 렌더링. */
export default function CommentList({ comments }) {
  return (
    <ul className="comment-list">
      {comments.map((c) => <CommentItem key={c.id} comment={c} />)}
    </ul>
  );
}
