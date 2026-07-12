/** 라우트 전환 시 불빛이 쓸고 지나가는 오버레이. */
import { useRef } from "react";
import { useLocation } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import "./FireWipe.css";

export default function FireWipe() {
  const el = useRef(null);
  const { pathname } = useLocation();
  useGSAP(() => {
    // 경로가 바뀔 때마다 오버레이를 좌→우로 쓸어 넘긴다.
    gsap.fromTo(el.current, { xPercent: -100 }, { xPercent: 100, duration: 0.6, ease: "power2.inOut" });
  }, { dependencies: [pathname], revertOnUpdate: true });
  return <div ref={el} className="fire-wipe" />;
}
