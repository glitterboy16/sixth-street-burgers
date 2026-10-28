import Corner from "@/components/kit/Corner";
import Line from "@/components/kit/Line";
import Arrow from "@/components/kit/Arrow";
import WelcomeBadge from "@/components/kit/WelcomeBadge";

/** 04 — El rombo del cartel a pantalla completa, con el eslogan de bienvenida y una flecha que lo señala. */
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
        <Arrow big width={170} height={96} color="currentColor" className="choose__arrow choose__arrow--big" reveal />
      </div>
      <Corner pos="bl">Sigue bajando ↓</Corner>
    </section>
  );
}
