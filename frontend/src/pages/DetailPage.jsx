/** 상세 — 카드 + 댓글 리스트/입력(읽기+댓글). */
import { useNavigate, useParams } from "react-router-dom";
import TopWarningBanner from "../components/layout/TopWarningBanner";
import PaperCard from "../components/paper/PaperCard";
import CommentList from "../components/comment/CommentList";
import CommentInput from "../components/comment/CommentInput";
import { SAMPLE_POSTS, SAMPLE_COMMENTS } from "../utils/sampleData";
import "./DetailPage.css";

export default function DetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  // 연동 전: 샘플에서 URL의 id로 글을 고른다(실습에선 getPost(id)로 교체).
  const post = SAMPLE_POSTS.find((p) => p.id === Number(id)) || SAMPLE_POSTS[0]; // TODO(실습): getPost(id)
  const comments = SAMPLE_COMMENTS;  // TODO(실습): getComments(id)
  const handleSubmit = (text) => { /* TODO: createComment(id, {nickname, content}) 후 목록 갱신 */ };
  return (
    <div className="detail">
      <TopWarningBanner />
      <button className="detail__back" onClick={() => navigate(-1)}>‹</button>
      <PaperCard post={post} variant="detail" />
      <CommentList comments={comments} />
      <CommentInput onSubmit={handleSubmit} />
    </div>
  );
}
