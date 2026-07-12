/** 금속 원형 버튼 — 소각(red)·피드(blue)·중립(metal) 변형. */
import "./RoundButton.css";

export default function RoundButton({ label, onClick, variant = "metal" }) {
  return (
    <button className={`round-button round-button--${variant}`} onClick={onClick}>
      {label}
    </button>
  );
}
