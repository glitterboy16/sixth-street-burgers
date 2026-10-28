import Corner from "@/components/kit/Corner";
import Line from "@/components/kit/Line";
import WelcomeBadge from "@/components/kit/WelcomeBadge";
import ImageSlot from "@/components/kit/ImageSlot";

export default function Manifesto() {
  return (
    <section className="sec manifesto">
      <Corner pos="tl">11 — Manifiesto</Corner>
      <Corner pos="tr">Muerde fuerte. Vive más.</Corner>
      <div className="manifesto__grid">
        <div className="manifesto__card">
          <h3 className="display">
            <Line>MENOS CHARLA,</Line>
            <Line delay="0.08s">MÁS SABOR.</Line>
          </h3>
          <div className="manifesto__square">
            <div className="starburst manifesto__burst" aria-hidden="true" />
            <div className="manifesto__photo">
              <ImageSlot id="manifiesto-burger" shape="circle" sizes="320px" />
            </div>
          </div>
          <div className="sparkle" aria-hidden="true" />
        </div>
        <div className="manifesto__copy">
          <h2 className="display">
            <Line>MUERDE FUERTE.</Line>
            <Line delay="0.08s">VIVE MÁS.</Line>
          </h2>
          <div className="manifesto__row">
            <p className="mono">Abrimos cada día. Terraza y salón. Para llevar.</p>
            <WelcomeBadge className="manifesto__badge" id="rombo-manifesto" />
          </div>
        </div>
      </div>
    </section>
  );
}
