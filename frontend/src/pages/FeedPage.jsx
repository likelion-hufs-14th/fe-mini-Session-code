/** 피드 — 종이 카드 그리드. 좋아요/싫어요·상세 이동. */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopWarningBanner from "../components/layout/TopWarningBanner";
import PaperCard from "../components/paper/PaperCard";
import { getPosts, likePost, dislikePost } from "../apis/posts";
import "./FeedPage.css";

export default function FeedPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  // 마운트 시 서버에서 최신 목록을 가져와 채운다
  useEffect(() => { getPosts().then(setPosts); }, []);
  const handleLike = async (id) => {
    const updated = await likePost(id);
    setPosts((list) => list.map((p) => (p.id === id ? updated : p))); // 갱신된 글로 교체
  };
  const handleDislike = async (id) => {
    const updated = await dislikePost(id);
    setPosts((list) => list.map((p) => (p.id === id ? updated : p)));
  };
  return (
    <div className="feed">
      <TopWarningBanner />
      <div className="feed__grid">
        {posts.map((p) => (
          <PaperCard key={p.id} post={p} onLike={handleLike} onDislike={handleDislike}
                     onClick={() => navigate(`/feed/${p.id}`)} />
        ))}
      </div>
    </div>
  );
}
