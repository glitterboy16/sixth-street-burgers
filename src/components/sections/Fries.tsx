import Corner from "@/components/kit/Corner";
import Line from "@/components/kit/Line";
import Arrow from "@/components/kit/Arrow";
import Checker from "@/components/kit/Checker";
import ImageSlot from "@/components/kit/ImageSlot";
import { dict, type Lang } from "@/i18n";

export default function Fries({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <section className="sec sec--checker fries">
      <Corner pos="tr">{t.fries.corner}</Corner>
      <div className="fries__grid">
        <div className="fries__art">
          <div className="fries__img">
            <ImageSlot id="patatas-cucurucho" alt={t.alts["patatas-cucurucho"]} sizes="(max-width: 640px) 80vw, 52vmin" />
            <div className="sparkle pop fries__sparkle-a" data-reveal="1" aria-hidden="true" />
            <div className="sparkle pop fries__sparkle-b" data-reveal="1" aria-hidden="true" />
          </div>
        </div>
        <div className="fries__copy">
          <h2 className="display">
            <Line>{t.fries.lines[0]}</Line>
            <Line delay="0.08s" className="accent-teal">
              {t.fries.lines[1]}
            </Line>
          </h2>
          <div className="fries__sub">
            <Arrow width={90} height={60} color="#0B0B0D" style={{ transform: "scaleX(-1) rotate(20deg)" }} />
            <p className="mono">{t.fries.sub}</p>
          </div>
        </div>
      </div>
      <Checker />
    </section>
  );
}
