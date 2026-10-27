import type { CSSProperties } from "react";

type Props = { className?: string; style?: CSSProperties; reveal?: boolean };

export default function Smiley({ className = "", style, reveal }: Props) {
  return (
    <div
      className={`smiley ${reveal ? "pop" : ""} ${className}`}
      style={style}
      data-reveal={reveal ? "1" : undefined}
      aria-hidden="true"
    >
      <i />
      <i />
      <b />
    </div>
  );
}
