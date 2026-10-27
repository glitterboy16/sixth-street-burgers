import type { CSSProperties } from "react";

type Props = { className?: string; style?: CSSProperties; reveal?: boolean };

/** Rombo de bombillas del letrero de la calle. */
export default function WelcomeBadge({ className = "", style, reveal }: Props) {
  return (
    <div
      className={`badge ${reveal ? "pop" : ""} ${className}`}
      style={style}
      data-reveal={reveal ? "1" : undefined}
      aria-hidden="true"
    >
      <div className="badge__rhombus" />
      <div className="badge__text">
        <span className="badge__welcome">WELCOME</span>
        <span className="badge__name">
          SIXTH STREET
          <br />
          BURGERCLUB
        </span>
      </div>
    </div>
  );
}
