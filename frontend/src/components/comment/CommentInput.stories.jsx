/** CommentInput 스토리 — 입력 폼 동작 확인용. */
import { action } from "storybook/actions";
import CommentInput from "./CommentInput";

/** CommentInput 스토리 메타. */
export default {
  title: "comment/CommentInput",
  component: CommentInput,
};

/** 기본 입력 폼 — onSubmit 액션 후킹. */
export const Default = {
  args: {
    onSubmit: action("submit"),
  },
};
