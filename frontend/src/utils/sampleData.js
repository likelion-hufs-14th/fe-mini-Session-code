/** 연동 전 페이지·Storybook을 채우는 샘플 데이터 — PostRead/CommentRead 형태와 동일. */
export const SAMPLE_POSTS = [
  { id: 1, nickname: "익명의두더지", content: "아 집가고 싶다..", like_count: 3, dislike_count: 1, comment_count: 2, remaining_seconds: 285, created_at: "2026-07-12T10:00:00Z", expires_at: "2026-07-12T10:05:00Z" },
  { id: 2, nickname: "지나가던너구리", content: "오늘 발표 망함", like_count: 0, dislike_count: 0, comment_count: 0, remaining_seconds: 120, created_at: "2026-07-12T10:01:00Z", expires_at: "2026-07-12T10:03:00Z" },
  { id: 3, nickname: "말없는여우", content: "퇴근 5분 전이 제일 길다", like_count: 7, dislike_count: 0, comment_count: 5, remaining_seconds: 40, created_at: "2026-07-12T10:02:00Z", expires_at: "2026-07-12T10:02:40Z" },
];

/** 상세 페이지용 단건 샘플. */
export const SAMPLE_POST = SAMPLE_POSTS[0];

/** 상세 페이지 댓글 샘플. */
export const SAMPLE_COMMENTS = [
  { id: 1, post_id: 1, nickname: "지나가던행인", content: "저도 진짜 집에 가고 싶어요ㅠㅠ", created_at: "2026-07-12T10:03:00Z" },
  { id: 2, post_id: 1, nickname: "말없는고양이", content: "화이팅입니다", created_at: "2026-07-12T10:04:00Z" },
];
