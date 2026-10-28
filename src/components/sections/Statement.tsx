import Corner from "@/components/kit/Corner";
import Line from "@/components/kit/Line";
import Arrow from "@/components/kit/Arrow";
import Checker from "@/components/kit/Checker";
import ImageSlot from "@/components/kit/ImageSlot";

export default function Statement() {
  return (
    <section className="sec sec--checker statement">
      <Corner pos="tl">03 — Statement</Corner>
      <Corner pos="tr">Sixth Street Burgers</Corner>
      <div className="statement__grid">
        <div className="statement__copy">
          <h2 className="display">
            <Line>NADA DE</Line>
            <Line delay="0.08s">HAMBURGUESA</Line>
            <Line delay="0.16s" className="accent-red">
              SIN GRACIA.
            </Line>
          </h2>
          <div className="statement__sub">
            <p className="mono">Solo bordes crujientes, queso fundido y salsa sin tacañear.</p>
            <Arrow width={110} height={74} color="#0F6E6A" className="arrow--wiggle" />
          </div>
        </div>
        <div className="statement__art">
          <div className="statement__square">
            <div className="starburst pop statement__burst" data-reveal="1" aria-hidden="true" />
            <div className="statement__photo">
              <ImageSlot id="statement-mano-burger" sizes="(max-width: 640px) 80vw, 60vmin" />
            </div>
            <div className="sparkle pop statement__sparkle" data-reveal="1" aria-hidden="true" />
          </div>
        </div>
      </div>
      <Checker />
    </section>
  );
}
