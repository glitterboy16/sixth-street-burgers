import Corner from "@/components/kit/Corner";
import Line from "@/components/kit/Line";
import Arrow from "@/components/kit/Arrow";
import WelcomeBadge from "@/components/kit/WelcomeBadge";

/** 04 — El rombo del cartel a pantalla completa, con el eslogan de bienvenida y flechas alrededor. */
export default function Choose() {
  return (
    <section id="carta" className="sec choose">
      <Corner pos="tl">04 — La carta</Corner>
      <Corner pos="tr">Tres hamburguesas · Sin fallo</Corner>
      <div className="choose__stage">
        <h2 className="display choose__title">
          <Line>BIENVENIDO</Line>
          <Line delay="0.08s" className="accent-cheese">
            AL CLUB.
          </Line>
        </h2>
        <WelcomeBadge className="choose__badge" id="rombo-choose" reveal />
        <Arrow big width={220} height={124} color="currentColor" className="choose__arrow choose__arrow--big" reveal />
        <Arrow width={120} height={80} color="var(--deco)" className="choose__arrow choose__arrow--a" reveal />
        <Arrow width={96} height={64} color="var(--deco)" className="choose__arrow choose__arrow--b" reveal />
        <span className="choose__dots choose__dots--a" data-reveal="1" aria-hidden="true" />
        <span className="choose__dots choose__dots--b" data-reveal="1" aria-hidden="true" />
      </div>
      <Corner pos="bl">Sigue bajando ↓</Corner>
    </section>
  );
}
