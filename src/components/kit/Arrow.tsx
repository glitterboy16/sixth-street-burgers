import type { CSSProperties } from "react";

type Props = {
  big?: boolean;
  width: number;
  height: number;
  color: string;
  className?: string;
  style?: CSSProperties;
  reveal?: boolean;
};

/** Flecha dibujada a mano. `big` añade las rayitas de velocidad. */
export default function Arrow({ big, width, height, color, className = "", style, reveal }: Props) {
  return (
    <svg
      viewBox={big ? "0 0 160 90" : "0 0 120 80"}
      width={width}
      height={height}
      fill="none"
      stroke={color}
      strokeWidth={big ? 4 : 3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`arrow ${className}`}
      style={style}
      data-reveal={reveal ? "1" : undefined}
      aria-hidden="true"
    >
      {big ? (
        <>
          <path d="M8 46 C 40 70, 90 70, 148 44" />
          <path d="M126 36 L 148 44 L 140 64" />
          <path d="M60 14 L 66 26 M80 10 L 80 24 M100 14 L 94 26" />
        </>
      ) : (
        <>
          <path d="M6 58 C 30 8, 70 8, 108 44" />
          <path d="M92 46 L 108 44 L 104 28" />
        </>
      )}
    </svg>
  );
}
