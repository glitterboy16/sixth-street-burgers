import type { CSSProperties } from "react";

type Props = { text: string; reverse?: boolean; speed: string; className?: string; spanClassName?: string };

/** Marquesina infinita: el contenido va duplicado y se desplaza un 50 %. */
export default function Marquee({ text, reverse, speed, className = "", spanClassName }: Props) {
  return (
    <div className={`marquee-wrap ${className}`}>
      <div className={`marquee ${reverse ? "marquee--r" : ""}`} style={{ "--speed": speed } as CSSProperties}>
        <span className={spanClassName}>{text}</span>
        <span className={spanClassName} aria-hidden="true">
          {text}
        </span>
      </div>
    </div>
  );
}
