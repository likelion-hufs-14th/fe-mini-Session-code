/** 홈 중앙 불 — SVG 난류 필터로 불꽃 질감, GSAP로 이글이글 흔든다. */
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import "./Fire.css";

/** props 없음 — 홈 화면에 고정 배치되는 앰비언트 불꽃. */
export default function Fire() {
  const turb = useRef(null);
  useGSAP(() => {
    // baseFrequency를 미세 변동시켜 불꽃이 넘실대게 한다.
    gsap.to(turb.current, {
      attr: { baseFrequency: "0.02 0.06" },
      duration: 1.2, repeat: -1, yoyo: true, ease: "sine.inOut",
    });
  });
  return (
    <div className="fire">
      <svg className="fire__svg" viewBox="0 0 300 300">
        <filter id="flame">
          <feTurbulence ref={turb} type="fractalNoise" baseFrequency="0.02 0.04" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="30" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <ellipse cx="150" cy="200" rx="90" ry="120" fill="url(#flameGrad)" filter="url(#flame)" />
        <radialGradient id="flameGrad" cx="50%" cy="80%">
          <stop offset="0%" stopColor="#ffe08a" />
          <stop offset="45%" stopColor="var(--color-ember)" />
          <stop offset="100%" stopColor="#7a1f00" stopOpacity="0" />
        </radialGradient>
      </svg>
    </div>
  );
}
