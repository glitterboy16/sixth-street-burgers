import { site } from "@/data/site";
import Corner from "@/components/kit/Corner";
import Line from "@/components/kit/Line";

export default function Cta() {
  return (
    <section id="visitanos" className="sec cta">
      <Corner pos="tl">13 — Visítanos</Corner>
      <Corner pos="tr">Ya lo sabías</Corner>
      <h2 className="display">
        <Line>¿TIENES</Line>
        <Line delay="0.1s">HAMBRE?</Line>
      </h2>
      <div className="cta__row">
        <div className="cta__info">
          <a
            href={site.mapsUrl}
            target="_blank"
            rel="noopener"
            className="btn btn--lg btn--ink-cheese"
            style={{ width: "max-content" }}
          >
            Pide ya <span className="arr" aria-hidden="true">↗</span>
          </a>
          <address className="mono cta__details" style={{ fontStyle: "normal" }}>
            <span>{site.address.join(" · ")}</span>
            <span>{site.hours.join(" · ")}</span>
            <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>
          </address>
        </div>
        <a href="#top" className="cta__top" aria-label="Volver arriba">
          ↑
        </a>
      </div>
    </section>
  );
}
