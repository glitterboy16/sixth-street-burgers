import Corner from "@/components/kit/Corner";
import Line from "@/components/kit/Line";
import ImageSlot from "@/components/kit/ImageSlot";

export default function Grab() {
  return (
    <section className="sec grab">
      <Corner pos="tl">11 — Coge la tuya</Corner>
      <Corner pos="tr">Para llevar · Para quedarse</Corner>
      <div className="grab__row">
        <h2 className="display">
          <Line>COGE</Line>
          <Line delay="0.08s">LA TUYA.</Line>
        </h2>
        <div className="grab__art">
          <div className="grab__square" data-reveal="1">
            <div className="starburst grab__burst" aria-hidden="true" />
            <div className="grab__photo">
              <ImageSlot id="coge-la-tuya-burger" shape="circle" sizes="(max-width: 640px) 80vw, 52vmin" />
            </div>
            <div className="sparkle grab__sparkle" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
