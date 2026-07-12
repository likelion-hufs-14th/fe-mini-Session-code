/** CommentList 스토리 — 댓글 목록 렌더링 확인용. */
import CommentList from "./CommentList";
import { SAMPLE_COMMENTS } from "../../utils/sampleData";

/** CommentList 스토리 메타. */
export default {
  title: "comment/CommentList",
  component: CommentList,
};

/** 댓글 목록 — SAMPLE_COMMENTS 사용. */
export const Default = {
  args: {
    comments: SAMPLE_COMMENTS,
  },
};
