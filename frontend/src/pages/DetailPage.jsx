/** 상세 — 카드 + 댓글 리스트/입력(읽기+댓글). */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopWarningBanner from '../components/layout/TopWarningBanner';
import PaperCard from '../components/paper/PaperCard';
import CommentList from '../components/comment/CommentList';
import CommentInput from '../components/comment/CommentInput';
import { getPost, getComments, createComment } from '../apis/posts';
import { getNickname } from '../utils/nickname';
import './DetailPage.css';

export default function DetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  // 마운트 시(또는 id 변경 시) 서버에서 글과 댓글을 가져와 채운다
  useEffect(() => {
    getPost(id).then(setPost);
    getComments(id).then(setComments);
  }, [id]);
  const handleSubmit = async (text) => {
    const created = await createComment(id, {
      nickname: getNickname(),
      content: text,
    });
    setComments((list) => [created, ...list]); // 최신순 — 새 댓글을 앞에 추가
  };
  if (!post) return null; // 첫 로딩 프레임(방어코드 아님, 렌더 전 null 가드)
  return (
    <div className='detail'>
      <TopWarningBanner />
      <button
        className='detail__back'
        onClick={() => navigate(-1)}
      >
        ‹
      </button>
      <PaperCard
        post={post}
        variant='detail'
      />
      <CommentList comments={comments} />
      <CommentInput onSubmit={handleSubmit} />
    </div>
  );
}
