import Corner from "@/components/kit/Corner";
import Line from "@/components/kit/Line";
import Arrow from "@/components/kit/Arrow";

export default function BigType() {
  return (
    <section className="sec bigtype">
      <Corner pos="tl">06 — Hecha de verdad</Corner>
      <Corner pos="tr">Cocina abierta</Corner>
      <h2 className="display">
        <Line>HECHA</Line>
        <Line delay="0.1s">DE VERDAD.</Line>
      </h2>
      <div className="bigtype__sub">
        <Arrow width={96} height={64} color="#FF2E3B" style={{ transform: "scaleX(-1)" }} />
        <p className="mono">Carne fresca cada día. Pan de obrador. Patatas aparte.</p>
      </div>
    </section>
  );
}
