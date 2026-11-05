import type { CSSProperties } from "react";
import Corner from "@/components/kit/Corner";
import Line from "@/components/kit/Line";
import Checker from "@/components/kit/Checker";
import ImageSlot from "@/components/kit/ImageSlot";
import { dict, type Lang } from "@/i18n";

export default function Inside({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <section className="sec sec--checker sec--themed inside">
      <Corner pos="tr">{t.inside.corner}</Corner>
      <div className="inside__grid">
        <div className="inside__copy">
          <h2 className="display">
            <Line>{t.inside.lines[0]}</Line>
            <Line delay="0.08s">{t.inside.lines[1]}</Line>
          </h2>
          <p className="mono">{t.inside.sub}</p>
        </div>
        <div className="inside__art">
          <div className="inside__img">
            <ImageSlot
              id="que-lleva-render-abierta"
              alt={t.alts["que-lleva-render-abierta"]}
              sizes="(max-width: 640px) 60vw, 30vw"
              className="inside__still inside__still--light"
            />
            <ImageSlot
              id="que-lleva-render-abierta-oscuro"
              alt={t.alts["que-lleva-render-abierta-oscuro"]}
              sizes="(max-width: 640px) 60vw, 30vw"
              className="inside__still inside__still--dark"
            />
            <div className="sparkle" aria-hidden="true" />
          </div>
          <ul className="inside__list">
            {t.inside.ingredients.map(([name, detail], i) => (
              <li
                key={name}
                className="callout inside__item"
                data-reveal="1"
                style={{ "--delay": `${i * 0.08}s` } as CSSProperties}
              >
                <span className="callout__line" />
                <span className="callout__dot" />
                <span className="callout__text">
                  <strong>{name}</strong>
                  <em>{detail}</em>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Checker />
    </section>
  );
}
