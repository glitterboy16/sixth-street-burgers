import Corner from "@/components/kit/Corner";
import Line from "@/components/kit/Line";
import Arrow from "@/components/kit/Arrow";
import WelcomeBadge from "@/components/kit/WelcomeBadge";

export default function Choose() {
  return (
    <section id="carta" className="sec choose">
      <Corner pos="tl">04 — Elige la tuya</Corner>
      <Corner pos="tr">Tres hamburguesas · Sin fallo</Corner>
      <div className="choose__row">
        <h2 className="display">
          <Line>ELIGE</Line>
          <Line delay="0.08s" className="accent-cheese">
            LA TUYA.
          </Line>
        </h2>
        <WelcomeBadge className="choose__badge" id="rombo-choose" reveal />
        <Arrow big width={200} height={112} color="#F6F1E7" className="choose__arrow" reveal />
      </div>
      <Corner pos="bl">Sigue bajando ↓</Corner>
    </section>
  );
}
