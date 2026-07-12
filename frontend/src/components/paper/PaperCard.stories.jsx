/** PaperCard 변형(feed·detail) 확인용 스토리 — useNavigate 때문에 MemoryRouter로 감싼다. */
import { MemoryRouter } from "react-router-dom";
import { action } from "storybook/actions";
import PaperCard from "./PaperCard";
import { SAMPLE_POSTS } from "../../utils/sampleData";

/** PaperCard 스토리 메타. */
export default {
  title: "paper/PaperCard",
  component: PaperCard,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
};

/** 피드 카드 — 반응·댓글 버튼·클릭 이동 포함. */
export const Feed = {
  args: {
    post: SAMPLE_POSTS[0],
    variant: "feed",
    onLike: action("onLike"),
    onDislike: action("onDislike"),
    onClick: action("onClick"),
  },
};

/** 상세 카드 — 반응 버튼 없이 읽기 전용. */
export const Detail = {
  args: {
    post: SAMPLE_POSTS[0],
    variant: "detail",
  },
};
