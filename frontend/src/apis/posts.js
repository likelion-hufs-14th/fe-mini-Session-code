/** 글·반응·댓글 API 호출 모음 — 실습에서 학생이 채운다. */
import { api } from "./client";

/** 피드 목록 조회. */
export async function getPosts() {
  // TODO: GET /posts 로 만료 안 된 글 배열을 받아 반환하세요.
}

/** 글 상세 조회. */
export async function getPost(id) {
  // TODO: GET /posts/{id}
}

/** 글 공유(소각) — 닉네임+내용으로 생성. */
export async function createPost({ nickname, content }) {
  // TODO: POST /posts
}

/** 좋아요 +1. */
export async function likePost(id) {
  // TODO: POST /posts/{id}/like
}

/** 싫어요 +1. */
export async function dislikePost(id) {
  // TODO: POST /posts/{id}/dislike
}

/** 댓글 목록 조회. */
export async function getComments(id) {
  // TODO: GET /posts/{id}/comments
}

/** 댓글 작성. */
export async function createComment(id, { nickname, content }) {
  // TODO: POST /posts/{id}/comments
}
