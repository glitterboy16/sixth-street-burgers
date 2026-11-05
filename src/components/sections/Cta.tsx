import { site } from "@/data/site";
import Corner from "@/components/kit/Corner";
import Line from "@/components/kit/Line";
import { dict, hoursLines, type Lang } from "@/i18n";

export default function Cta({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <section id="visitanos" className="sec cta">
      <Corner pos="tr">{t.cta.corner}</Corner>
      <h2 className="display">
        <Line>{t.cta.lines[0]}</Line>
        <Line delay="0.1s">{t.cta.lines[1]}</Line>
      </h2>
      <div className="cta__row">
        <div className="cta__info">
          <a href={site.mapsUrl} target="_blank" rel="noopener" className="btn btn--lg btn--ink-cheese" style={{ width: "max-content" }}>
            {t.cta.button} <span className="arr" aria-hidden="true">↗</span>
          </a>
          <address className="mono cta__details" style={{ fontStyle: "normal" }}>
            <span>{site.address.join(" · ")}</span>
            <span>{hoursLines(lang).join(" · ")}</span>
            <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>
          </address>
        </div>
        <a href="#top" className="cta__top" aria-label={t.common.backTop}>
          ↑
        </a>
      </div>
    </section>
  );
}
