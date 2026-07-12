/** 소각 연출 — trigger 시 children을 가장자리부터(마스크 원을 중앙으로 축소) 태운다. */
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import "./BurnAway.css";

export default function BurnAway({ trigger, onComplete, children }) {
  const wrap = useRef(null);
  useGSAP(() => {
    if (!trigger) {
      gsap.set(wrap.current, { "--burn": "80%", opacity: 1 }); // 초기 상태 복구
      return;
    }
    // --burn(마스크 원 반경)을 줄이면 가장자리부터 사라진다. 난류 필터가 탄 가장자리를 만든다.
    gsap.timeline({ onComplete })
      .fromTo(wrap.current, { "--burn": "80%" }, { "--burn": "0%", duration: 1.6, ease: "power2.in" })
      .to(wrap.current, { opacity: 0, duration: 0.3 }, "-=0.2");
  }, { dependencies: [trigger], revertOnUpdate: true, scope: wrap });
  return (
    <div ref={wrap} className="burn-away">
      <svg width="0" height="0">
        <filter id="charEdge">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className="burn-away__content">{children}</div>
    </div>
  );
}
