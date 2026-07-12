/** BurnGauge 잔여 비율(여유·임박·소진) 확인용 스토리. */
import BurnGauge from "./BurnGauge";

/** BurnGauge 스토리 메타. */
export default {
  title: "paper/BurnGauge",
  component: BurnGauge,
};

/** 여유 있는 잔여(285/300). */
export const Plenty = {
  args: { seconds: 285 },
};

/** 소각 임박(40/300). */
export const Critical = {
  args: { seconds: 40 },
};

/** 완전 소진(0/300). */
export const Empty = {
  args: { seconds: 0 },
};
