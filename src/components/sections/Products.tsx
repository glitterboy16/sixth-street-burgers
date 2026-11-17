"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { products } from "@/data/site";
import { precio } from "@/data/carta";
import { homeHref, menuHref } from "@/i18n/config";
import { useLang } from "@/i18n/LangContext";
import { clamp, onScroll, prefersReducedMotion, stageProgress } from "@/lib/motion";
import Corner from "@/components/kit/Corner";
import ImageSlot from "@/components/kit/ImageSlot";

// Las hamburguesas reales de la carta en paneles a pantalla completa que pasan de lado con el scroll (en móvil
// van apiladas). Los colores se repiten de tres en tres: teal, queso, rojo.
const BTN = ["btn--paper", "btn--ink-cheese", "btn--ink-paper"];
const SPARK = ["var(--cheese)", "var(--red)", "var(--teal)"];

export default function Products() {
  const { lang, t } = useLang();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const photos = useRef<(HTMLDivElement | null)[]>([]);
  const N = products.length;

  useEffect(() => {
    const sec = section.current,
      st = stage.current,
      tr = track.current;
    if (!sec || !st || !tr) return;
    const pinned = window.matchMedia("(min-width: 640px)");
    const rm = prefersReducedMotion();

    const update = () => {
      if (!pinned.matches) return; // en móvil los paneles van apilados (CSS)
      const p = stageProgress(sec, st);
      tr.style.transform = `translateX(${(-p * (N - 1) * 100) / N}%)`;
      for (let k = 0; k < N; k++) {
        const d = clamp(p * (N - 1) - k, -1, 1);
        const ph = photos.current[k];
        if (ph) ph.style.transform = rm ? "" : `translateY(${-40 * d}px)`;
      }
    };
    return onScroll(update);
  }, [N]);

  return (
    <section ref={section} className="products" aria-label={t.products.aria} style={{ "--n": N } as CSSProperties}>
      <div ref={stage} className="products__stage">
        <div ref={track} className="products__track">
          {products.map((p, k) => {
            const tone = k % 3;
            return (
              <article key={p.id} className={`product product--${tone + 1}`} aria-labelledby={`prod-${p.id}`}>
                <Corner pos="br">
                  {String(k + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
                </Corner>
                <div className="product__inner">
                  <div className="product__copy">
                    <h3 id={`prod-${p.id}`} className="display">
                      {p.name[0]}
                      {p.name[1] && (
                        <>
                          <br />
                          {p.name[1]}
                        </>
                      )}
                    </h3>
                    <p className="product__desc">{t.products.desc[p.id]}</p>
                    <div className="product__buy">
                      <span className="price">{precio(p.price, lang)}</span>
                      <a href={homeHref(lang, "#visitanos")} className={`btn ${BTN[tone]}`}>
                        {t.products.order} <span className="arr" aria-hidden="true">↗</span>
                      </a>
                    </div>
                    <a href={menuHref(lang)} className="product__menu mono">
                      {t.products.menuLink} <span aria-hidden="true">→</span>
                    </a>
                  </div>
                  <div className="product__art">
                    <div className="product__square">
                      <div
                        ref={(el) => {
                          photos.current[k] = el;
                        }}
                        className="product__photo"
                      >
                        <ImageSlot id={p.id} alt={t.alts[p.id]} sizes="(max-width: 640px) 90vw, 76vmin" />
                      </div>
                      <div
                        className="sparkle"
                        style={{ top: "4%", right: "6%", width: 28, height: 28, background: SPARK[tone] }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
