/** 홈 종이 — GSAP Draggable로 끌어 불(fireRef 영역)에 넣으면 콜백. */
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import "./DraggablePaper.css";

gsap.registerPlugin(Draggable);

export default function DraggablePaper({ fireRef, onDropIntoFire }) {
  const paper = useRef(null);
  useGSAP(() => {
    const [instance] = Draggable.create(paper.current, {
      type: "x,y",
      onDragEnd() {
        // viewport 중심이 아니라 실제 불 영역과 겹치는지로 판정한다.
        if (Draggable.hitTest(paper.current, fireRef.current, "40%")) onDropIntoFire();
        else gsap.to(paper.current, { x: 0, y: 0, duration: 0.4 }); // 아니면 제자리로
      },
    });
    // StrictMode 이중 마운트·라우트 언마운트 시 인스턴스/잔존 tween 정리
    return () => { instance.kill(); gsap.killTweensOf(paper.current); };
  }, { scope: paper });
  return <div ref={paper} className="draggable-paper" />;
}
