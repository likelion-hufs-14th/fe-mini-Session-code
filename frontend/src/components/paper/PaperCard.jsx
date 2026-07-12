/** 피드·상세 카드 — 표현 전용. feed는 반응/댓글, detail은 읽기만. */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Timer from '../common/Timer';
import BurnGauge from './BurnGauge';
import './PaperCard.css';

export default function PaperCard({
  post,
  onLike,
  onDislike,
  variant = 'feed',
  onClick,
}) {
  const navigate = useNavigate();
  const isFeed = variant === 'feed';
  // Timer·BurnGauge가 같은 값을 쓰도록 카드가 로컬 카운트다운을 소유한다.
  const [left, setLeft] = useState(post.remaining_seconds);
  useEffect(() => setLeft(post.remaining_seconds), [post.remaining_seconds]);
  useEffect(() => {
    const id = setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <article
      className='paper-card'
      onClick={isFeed ? onClick : undefined}
    >
      <header className='paper-card__head'>
        <span className='paper-card__nick'>{post.nickname}</span>
        <Timer seconds={left} />
      </header>
      <p className='paper-card__content'>{post.content}</p>
      {isFeed && (
        <footer className='paper-card__foot'>
          {/* 카드 클릭(이동)과 겹치지 않게 버튼에서 전파 차단 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike(post.id);
            }}
          >
            👍 {post.like_count}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDislike(post.id);
            }}
          >
            👎 {post.dislike_count}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/feed/${post.id}`);
            }}
          >
            💬 댓글
          </button>
        </footer>
      )}
      <BurnGauge seconds={left} />
    </article>
  );
}
