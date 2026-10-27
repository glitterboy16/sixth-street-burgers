import type { CSSProperties } from "react";

type Props = { children: React.ReactNode; delay?: string; className?: string };

/** Línea de titular que entra desde abajo (translateY 110 % → 0) dentro de un contenedor recortado. */
export default function Line({ children, delay, className = "" }: Props) {
  return (
    <span className="line">
      <span data-reveal="1" className={className} style={delay ? ({ "--delay": delay } as CSSProperties) : undefined}>
        {children}
      </span>
    </span>
  );
}
