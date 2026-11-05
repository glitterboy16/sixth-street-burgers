import Corner from "@/components/kit/Corner";
import Line from "@/components/kit/Line";
import ImageSlot from "@/components/kit/ImageSlot";
import { dict, type Lang } from "@/i18n";

export default function Grab({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <section className="sec grab">
      <Corner pos="tr">{t.grab.corner}</Corner>
      <div className="grab__row">
        <h2 className="display">
          <Line>{t.grab.lines[0]}</Line>
          <Line delay="0.08s">{t.grab.lines[1]}</Line>
        </h2>
        <div className="grab__art">
          <div className="grab__square" data-reveal="1">
            <div className="grab__photo">
              <ImageSlot id="coge-la-tuya-burger" alt={t.alts["coge-la-tuya-burger"]} shape="circle" sizes="(max-width: 640px) 80vw, 52vmin" />
            </div>
            <div className="sparkle grab__sparkle" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
