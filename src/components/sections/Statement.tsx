import Corner from "@/components/kit/Corner";
import Line from "@/components/kit/Line";
import Arrow from "@/components/kit/Arrow";
import Checker from "@/components/kit/Checker";
import ImageSlot from "@/components/kit/ImageSlot";
import { dict, type Lang } from "@/i18n";

export default function Statement({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const [a, b, c] = t.statement.lines;
  return (
    <section className="sec sec--checker statement">
      <Corner pos="tr">{t.statement.corner}</Corner>
      <div className="statement__grid">
        <div className="statement__copy">
          <h2 className="display">
            <Line>{a}</Line>
            <Line delay="0.08s">{b}</Line>
            <Line delay="0.16s" className="accent-red">
              {c}
            </Line>
          </h2>
          <div className="statement__sub">
            <p className="mono">{t.statement.sub}</p>
            <Arrow width={110} height={74} color="#0F6E6A" className="arrow--wiggle" />
          </div>
        </div>
        <div className="statement__art">
          <div className="statement__square">
            <div className="statement__photo">
              <ImageSlot id="statement-mano-burger" alt={t.alts["statement-mano-burger"]} sizes="(max-width: 640px) 80vw, 60vmin" />
            </div>
            <div className="sparkle pop statement__sparkle" data-reveal="1" aria-hidden="true" />
          </div>
        </div>
      </div>
      <Checker />
    </section>
  );
}
