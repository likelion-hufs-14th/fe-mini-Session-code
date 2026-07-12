/** 화로의 불구덩이 — 여러 겹 스타일라이즈드 불꽃을 GSAP으로 크게 이글이글 흔들고 불티를 올린다. */
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import "./Fire.css";

/** props 없음 — 화로 바닥에 고정 배치되는 큰 불꽃. */
export default function Fire() {
  const root = useRef(null);
  useGSAP(() => {
    // 불꽃 혀마다 위상을 어긋나게 흔들어 살아있는 불처럼 넘실대게 한다.
    gsap.utils.toArray(".fire__flame").forEach((el, i) => {
      gsap.to(el, {
        scaleY: 1.15, scaleX: 0.94, skewX: i % 2 ? 5 : -5,
        transformOrigin: "50% 100%",
        duration: 0.5 + i * 0.07, repeat: -1, yoyo: true, ease: "sine.inOut",
      });
    });
    // 잉걸불 바닥 은은한 맥동
    gsap.to(".fire__coals", {
      opacity: 0.7, scale: 1.05, transformOrigin: "50% 100%",
      duration: 0.9, repeat: -1, yoyo: true, ease: "sine.inOut",
    });
    // 불티가 위로 솟았다 사라짐(각기 다른 속도)
    gsap.utils.toArray(".fire__spark").forEach((el, i) => {
      gsap.fromTo(el,
        { y: 0, opacity: 1 },
        { y: -220, opacity: 0, duration: 1.4 + i * 0.35, repeat: -1, delay: i * 0.5, ease: "power1.out" });
    });
  }, { scope: root });

  return (
    <div ref={root} className="fire">
      <svg className="fire__svg" viewBox="0 0 400 340" preserveAspectRatio="xMidYMax meet">
        <defs>
          <radialGradient id="fireCoals" cx="50%" cy="95%" r="70%">
            <stop offset="0%" stopColor="#ffcf4d" />
            <stop offset="55%" stopColor="#e5340a" />
            <stop offset="100%" stopColor="#4a0d02" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="fireBack" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#e5230a" />
            <stop offset="60%" stopColor="#ff7a18" />
            <stop offset="100%" stopColor="#ffb52e" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="fireFront" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ff8a1e" />
            <stop offset="70%" stopColor="#ffd24a" />
            <stop offset="100%" stopColor="#fff4c0" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* 잉걸불 바닥 */}
        <ellipse className="fire__coals" cx="200" cy="322" rx="175" ry="42" fill="url(#fireCoals)" />

        {/* 뒤 큰 불꽃들 */}
        <path className="fire__flame" fill="url(#fireBack)" d="M200 322 C96 250 150 132 200 34 C250 132 304 250 200 322 Z" />
        <path className="fire__flame" fill="url(#fireBack)" opacity="0.92" d="M112 322 C66 262 92 190 128 108 C160 190 168 262 112 322 Z" />
        <path className="fire__flame" fill="url(#fireBack)" opacity="0.92" d="M288 322 C334 262 308 190 272 108 C240 190 232 262 288 322 Z" />

        {/* 앞 밝은 속불꽃 */}
        <path className="fire__flame" fill="url(#fireFront)" d="M200 322 C150 262 168 190 200 118 C232 190 250 262 200 322 Z" />
        <path className="fire__flame" fill="url(#fireFront)" opacity="0.9" d="M160 322 C138 276 150 232 172 186 C190 232 196 276 160 322 Z" />
        <path className="fire__flame" fill="url(#fireFront)" opacity="0.9" d="M240 322 C262 276 250 232 228 186 C210 232 204 276 240 322 Z" />

        {/* 불티 */}
        <circle className="fire__spark" cx="176" cy="250" r="4.5" fill="#ffd884" />
        <circle className="fire__spark" cx="224" cy="262" r="3.5" fill="#ffb52e" />
        <circle className="fire__spark" cx="205" cy="232" r="4" fill="#ffe9ad" />
        <circle className="fire__spark" cx="150" cy="270" r="3" fill="#ffcf4d" />
        <circle className="fire__spark" cx="255" cy="248" r="3" fill="#ffd884" />
      </svg>
    </div>
  );
}
