import type { CSSProperties } from "react";
import { ingredients } from "@/data/site";
import Corner from "@/components/kit/Corner";
import Line from "@/components/kit/Line";
import Checker from "@/components/kit/Checker";
import ImageSlot from "@/components/kit/ImageSlot";

export default function Inside() {
  return (
    <section className="sec sec--checker sec--themed inside">
      <Corner pos="tl">05 — ¿Qué lleva?</Corner>
      <Corner pos="tr">Nada que esconder</Corner>
      <div className="inside__grid">
        <div className="inside__copy">
          <h2 className="display">
            <Line>¿QUÉ</Line>
            <Line delay="0.08s">LLEVA?</Line>
          </h2>
          <p className="mono">Sin atajos. Cada capa importa.</p>
        </div>
        <div className="inside__art">
          <div className="inside__img">
            <ImageSlot id="que-lleva-render-abierta" sizes="(max-width: 640px) 60vw, 30vw" />
            <div className="sparkle" aria-hidden="true" />
          </div>
          <ul className="inside__list">
            {ingredients.map(([name, detail], i) => (
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
