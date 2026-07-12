/** 피드 — 종이 카드 그리드. 좋아요/싫어요·상세 이동. */
import { useNavigate } from 'react-router-dom';
import TopWarningBanner from '../components/layout/TopWarningBanner';
import PaperCard from '../components/paper/PaperCard';
import { SAMPLE_POSTS } from '../utils/sampleData';
import './FeedPage.css';

export default function FeedPage() {
  const navigate = useNavigate();
  const posts = SAMPLE_POSTS; // TODO(실습): useState + useEffect(getPosts) 로 교체
  const handleLike = (id) => {
    /* TODO: likePost(id) 후 목록 갱신 */
  };
  const handleDislike = (id) => {
    /* TODO: dislikePost(id) 후 목록 갱신 */
  };
  return (
    <div className='feed'>
      <TopWarningBanner />
      <div className='feed__grid'>
        {posts.map((p) => (
          <PaperCard
            key={p.id}
            post={p}
            onLike={handleLike}
            onDislike={handleDislike}
            onClick={() => navigate(`/feed/${p.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
