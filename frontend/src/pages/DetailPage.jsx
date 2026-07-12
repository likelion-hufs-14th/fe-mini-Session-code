/** 상세 — 카드 + 댓글 리스트/입력(읽기+댓글). */
import { useNavigate } from "react-router-dom";
import TopWarningBanner from "../components/layout/TopWarningBanner";
import Header from "../components/layout/Header";
import PaperCard from "../components/paper/PaperCard";
import CommentList from "../components/comment/CommentList";
import CommentInput from "../components/comment/CommentInput";
import { SAMPLE_POST, SAMPLE_COMMENTS } from "../utils/sampleData";
import "./DetailPage.css";

export default function DetailPage() {
  const navigate = useNavigate();
  const post = SAMPLE_POST;          // TODO(실습): useParams + getPost(id)
  const comments = SAMPLE_COMMENTS;  // TODO(실습): getComments(id)
  const handleSubmit = (text) => { /* TODO: createComment(id, {nickname, content}) 후 목록 갱신 */ };
  return (
    <div className="detail">
      <TopWarningBanner /><Header />
      <button className="detail__back" onClick={() => navigate(-1)}>‹</button>
      <PaperCard post={post} variant="detail" />
      <CommentList comments={comments} />
      <CommentInput onSubmit={handleSubmit} />
    </div>
  );
}
