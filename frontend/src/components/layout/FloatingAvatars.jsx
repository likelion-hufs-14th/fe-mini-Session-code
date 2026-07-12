/** 떠다니는 익명 아바타 — 순수 장식(다른 유저 분위기). */
import "./FloatingAvatars.css";
export default function FloatingAvatars() {
  // 고정 좌표 몇 개로 분위기만 낸다.
  const spots = [{ top: "30%", left: "70%" }, { top: "75%", left: "20%" }, { top: "60%", left: "85%" }];
  return (
    <div className="floating-avatars">
      {spots.map((s, i) => <div key={i} className="floating-avatars__dot" style={s}>🙂</div>)}
    </div>
  );
}
