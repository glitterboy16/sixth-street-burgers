import type { CSSProperties } from "react";

type Props = { className?: string; style?: CSSProperties; reveal?: boolean; id?: string };

// Rombo "WELCOME to Fabulous SIXTH STREET BURGER CLUB" del cartel físico del local, sin la estrella.
// Dos versiones elegidas por Angel (2026-10-28) a partir de la hoja de bocetos (/rombo/):
//   · tema oscuro: boceto 04 "solo neón": el rombo es un tubo amarillo con bombillas y el texto en tubos,
//     con las fichas de WELCOME más opacas y la letra más legible;
//   · tema claro: boceto 06 "sello de tinta": una sola tinta con el borde algo roto, como un tampón.
// Se renderizan las dos y el CSS muestra la del tema activo (.badge__neon / .badge__stamp).
// Geometría común (viewBox 640×440): más ancho que alto, como el cartel.
const CX = 320,
  CY = 220,
  A = 306,
  B = 206;
const pt = (k: number, w: "top" | "right" | "bottom" | "left") =>
  ({ top: [CX, CY - B * k], right: [CX + A * k, CY], bottom: [CX, CY + B * k], left: [CX - A * k, CY] })[w];
const diamond = (k: number) =>
  `M${pt(k, "top")} L${pt(k, "right")} L${pt(k, "bottom")} L${pt(k, "left")} Z`;
const bulbs = (k: number, perEdge: number) => {
  const c = [pt(k, "top"), pt(k, "right"), pt(k, "bottom"), pt(k, "left")];
  const out: [number, number][] = [];
  for (let e = 0; e < 4; e++) {
    const [x0, y0] = c[e],
      [x1, y1] = c[(e + 1) % 4];
    for (let i = 0; i < perEdge; i++) {
      const t = (i + 0.5) / perEdge;
      out.push([+(x0 + (x1 - x0) * t).toFixed(1), +(y0 + (y1 - y0) * t).toFixed(1)]);
    }
  }
  return out;
};
const BULBS = bulbs(0.9, 13);
const CHIPS = "WELCOME".split("").map((L, i) => ({ L, x: CX + (i - 3) * 44, y: 120 }));

function Neon({ id }: { id: string }) {
  const f = `url(#${id}-blur)`;
  return (
    <svg className="badge__svg badge__neon" viewBox="0 0 640 440" aria-hidden="true">
      <defs>
        <filter id={`${id}-blur`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      {/* tubo del rombo: halo, tubo, núcleo */}
      <path d={diamond(0.97)} fill="none" stroke="#ffb000" strokeWidth="12" strokeLinejoin="round" filter={f} opacity="0.7" />
      <path d={diamond(0.97)} fill="none" stroke="#ffc224" strokeWidth="4" strokeLinejoin="round" />
      <path d={diamond(0.97)} fill="none" stroke="#fff4c2" strokeWidth="1.4" strokeLinejoin="round" />
      {/* bombillas */}
      {BULBS.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="9" fill="#ffb800" opacity="0.55" filter={f} />
          <circle cx={x} cy={y} r="3.8" fill="#fff1b8" />
        </g>
      ))}
      {/* fichas de WELCOME: fondo casi opaco para que el neón del rombo no se las coma, letra clara con halo */}
      {CHIPS.map(({ L, x, y }) => (
        <g key={L + x}>
          <circle cx={x} cy={y} r="19" fill="#ff2e3b" opacity="0.5" filter={f} />
          <circle cx={x} cy={y} r="18" fill="rgba(26, 11, 13, 0.82)" stroke="#ff2e3b" strokeWidth="2.4" />
          <text x={x} y={y + 7} textAnchor="middle" className="t-welcome" fontSize="19" fill="#ff6b74" filter={f} opacity="0.8">
            {L}
          </text>
          <text x={x} y={y + 7} textAnchor="middle" className="t-welcome" fontSize="19" fill="#fff3ea">
            {L}
          </text>
        </g>
      ))}
      {/* to Fabulous: tubo azul que falla como el BURGER CLUB del navbar. Debajo el tubo apagado (siempre se ve);
          encima su luz (halo + núcleo), que es lo único que parpadea (.badge__fab-lit). */}
      <text x={CX} y="178" textAnchor="middle" className="t-script badge__tube" fontSize="44" fill="#1d4a54" stroke="#2c6a78" strokeWidth="1.2" paintOrder="stroke" strokeLinejoin="round">
        to Fabulous
      </text>
      <g className="badge__fab-lit">
        <text x={CX} y="178" textAnchor="middle" className="t-script" fontSize="44" fill="#19c3e6" stroke="#19c3e6" strokeWidth="5" filter={f} opacity="0.8">
          to Fabulous
        </text>
        <text x={CX} y="178" textAnchor="middle" className="t-script" fontSize="44" fill="#dffbff" stroke="#3fd7f2" strokeWidth="1.2" paintOrder="stroke" strokeLinejoin="round">
          to Fabulous
        </text>
      </g>
      {/* SIXTH STREET */}
      <text x={CX} y="262" textAnchor="middle" className="t-block" fontSize="84" letterSpacing="2" fill="#ffb000" stroke="#ffb000" strokeWidth="8" filter={f} opacity="0.8">
        SIXTH STREET
      </text>
      <text x={CX} y="262" textAnchor="middle" className="t-block" fontSize="84" letterSpacing="2" fill="#ffe38a" stroke="#ffc224" strokeWidth="2.2" paintOrder="stroke" strokeLinejoin="round">
        SIXTH STREET
      </text>
      {/* BURGER CLUB */}
      <text x={CX} y="322" textAnchor="middle" className="t-block" fontSize="38" letterSpacing="6" fill="#ff2e3b" stroke="#ff2e3b" strokeWidth="5" filter={f} opacity="0.8">
        BURGER CLUB
      </text>
      <text x={CX} y="322" textAnchor="middle" className="t-block" fontSize="38" letterSpacing="6" fill="#ffd3d6" stroke="#ff2e3b" strokeWidth="1.4" paintOrder="stroke" strokeLinejoin="round">
        BURGER CLUB
      </text>
    </svg>
  );
}

function Stamp({ id }: { id: string }) {
  // una sola tinta (--stamp-ink) con el borde algo roto
  return (
    <svg className="badge__svg badge__stamp" viewBox="0 0 640 440" aria-hidden="true">
      <defs>
        <filter id={`${id}-rough`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter={`url(#${id}-rough)`}>
        <path className="s-stroke" d={diamond(1)} fill="none" strokeWidth="7" strokeLinejoin="round" />
        {BULBS.map(([x, y], i) => (
          <circle key={i} className="s-fill" cx={x} cy={y} r="4" />
        ))}
        {CHIPS.map(({ L, x, y }) => (
          <g key={L + x}>
            <circle className="s-stroke" cx={x} cy={y} r="18" fill="none" strokeWidth="2.5" />
            <text className="s-fill t-welcome" x={x} y={y + 7} textAnchor="middle" fontSize="19">
              {L}
            </text>
          </g>
        ))}
        <text className="s-fill t-script" x={CX} y="178" textAnchor="middle" fontSize="44">
          to Fabulous
        </text>
        <text className="s-stroke t-block" x={CX} y="262" textAnchor="middle" fontSize="84" letterSpacing="2" fill="none" strokeWidth="3" strokeLinejoin="round">
          SIXTH STREET
        </text>
        <text className="s-fill t-block" x={CX} y="322" textAnchor="middle" fontSize="38" letterSpacing="6">
          BURGER CLUB
        </text>
      </g>
    </svg>
  );
}

/** Rombo del cartel: neón en el tema oscuro, sello de tinta en el claro. */
export default function WelcomeBadge({ className = "", style, reveal, id = "rombo" }: Props) {
  return (
    <div
      className={`badge ${reveal ? "pop" : ""} ${className}`}
      style={style}
      data-reveal={reveal ? "1" : undefined}
      aria-hidden="true"
    >
      <Neon id={id} />
      <Stamp id={id} />
    </div>
  );
}
