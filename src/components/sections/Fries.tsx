import Corner from "@/components/kit/Corner";
import Line from "@/components/kit/Line";
import Arrow from "@/components/kit/Arrow";
import Checker from "@/components/kit/Checker";
import ImageSlot from "@/components/kit/ImageSlot";

export default function Fries() {
  return (
    <section className="sec sec--checker fries">
      <Corner pos="tl">07 — Patatas</Corner>
      <Corner pos="tr">La compañía ideal</Corner>
      <div className="fries__grid">
        <div className="fries__art">
          <div className="fries__img">
            <ImageSlot id="patatas-cucurucho" sizes="(max-width: 640px) 80vw, 52vmin" />
            <div className="sparkle pop fries__sparkle-a" data-reveal="1" aria-hidden="true" />
            <div className="sparkle pop fries__sparkle-b" data-reveal="1" aria-hidden="true" />
          </div>
        </div>
        <div className="fries__copy">
          <h2 className="display">
            <Line>PIDE TAMBIÉN</Line>
            <Line delay="0.08s" className="accent-teal">
              LAS PATATAS.
            </Line>
          </h2>
          <div className="fries__sub">
            <Arrow width={90} height={60} color="#0B0B0D" style={{ transform: "scaleX(-1) rotate(20deg)" }} />
            <p className="mono">Corte grueso, dos veces fritas. Salsa Sixth para mojar.</p>
          </div>
        </div>
      </div>
      <Checker />
    </section>
  );
}
