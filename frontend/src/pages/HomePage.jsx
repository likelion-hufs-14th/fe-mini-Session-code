/** 홈 — 불 + 드래그 종이. 종이를 불에 넣으면 쓰기로 이동. */
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import TopWarningBanner from "../components/layout/TopWarningBanner";
import Fire from "../components/fire/Fire";
import DraggablePaper from "../components/paper/DraggablePaper";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  const fireRef = useRef(null); // 실제 불 영역 — 드롭 판정(hitTest)에 넘긴다
  return (
    <div className="home">
      <TopWarningBanner />
      <h1 className="home__title">INCINER<small>Burn what's in your mind</small></h1>
      <div ref={fireRef} className="home__fire"><Fire /></div>
      <DraggablePaper fireRef={fireRef} onDropIntoFire={() => navigate("/paper")} />
      <p className="home__cta">종이를 드래그해 불태우세요!</p>
    </div>
  );
}
