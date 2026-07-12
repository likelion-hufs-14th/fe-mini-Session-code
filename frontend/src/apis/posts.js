/** 글·반응·댓글 API 호출 모음. */
import { api } from './client';

/** 피드 목록 조회. */
export async function getPosts() {
  const res = await api.get('/posts');
  return res.data;
}

/** 글 상세 조회. */
export async function getPost(id) {
  const res = await api.get(`/posts/${id}`);
  return res.data;
}

/** 글 공유(소각). */
export async function createPost({ nickname, content }) {
  const res = await api.post('/posts', { nickname, content });
  return res.data;
}

/** 좋아요 +1. */
export async function likePost(id) {
  const res = await api.post(`/posts/${id}/like`);
  return res.data;
}

/** 싫어요 +1. */
export async function dislikePost(id) {
  const res = await api.post(`/posts/${id}/dislike`);
  return res.data;
}

/** 댓글 목록 조회. */
export async function getComments(id) {
  const res = await api.get(`/posts/${id}/comments`);
  return res.data;
}

/** 댓글 작성. */
export async function createComment(id, { nickname, content }) {
  const res = await api.post(`/posts/${id}/comments`, { nickname, content });
  return res.data;
}
