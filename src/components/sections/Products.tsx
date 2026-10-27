"use client";

import { useEffect, useRef } from "react";
import { products } from "@/data/site";
import { clamp, onScroll, prefersReducedMotion, stageProgress } from "@/lib/motion";
import Corner from "@/components/kit/Corner";
import ImageSlot from "@/components/kit/ImageSlot";

const BTN = ["btn--paper", "btn--ink-cheese", "btn--ink-paper"];

export default function Products() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bursts = useRef<(HTMLDivElement | null)[]>([]);
  const photos = useRef<(HTMLDivElement | null)[]>([]);

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
      tr.style.transform = `translateX(${(-p * 200) / 3}%)`;
      for (let k = 0; k < 3; k++) {
        const d = clamp(p * 2 - k, -1, 1);
        const b = bursts.current[k],
          ph = photos.current[k];
        if (b) b.style.transform = rm ? "" : `rotate(${-6 + d * 12}deg)`;
        if (ph) ph.style.transform = rm ? "" : `translateY(${-40 * d}px)`;
      }
    };
    return onScroll(update);
  }, []);

  return (
    <section ref={section} className="products" aria-label="La carta">
      <div ref={stage} className="products__stage">
        <div ref={track} className="products__track">
          {products.map((p, k) => {
            const num = `0${k + 1}`;
            const art = (
              <div className="product__art">
                <div className="product__square">
                  <div
                    ref={(el) => {
                      bursts.current[k] = el;
                    }}
                    className="starburst product__burst"
                    aria-hidden="true"
                  />
                  <div
                    ref={(el) => {
                      photos.current[k] = el;
                    }}
                    className="product__photo"
                  >
                    <ImageSlot id={p.slot} shape="circle" sizes="(max-width: 640px) 80vw, 46vmin" />
                  </div>
                  {k === 0 && (
                    <>
                      <div className="sparkle" style={{ top: "-2%", right: "4%", width: 28, height: 28, background: "var(--cheese)" }} aria-hidden="true" />
                      <div className="sparkle" style={{ bottom: "6%", left: "-3%", width: 18, height: 18, background: "var(--red)" }} aria-hidden="true" />
                    </>
                  )}
                  {k === 1 && (
                    <>
                      <div className="sparkle" style={{ top: 0, left: "2%", width: 28, height: 28, background: "var(--cheese)" }} aria-hidden="true" />
                      <div className="bolt" style={{ top: "8%", right: "-6%", width: 30, height: 46, background: "var(--ink)" }} aria-hidden="true" />
                    </>
                  )}
                  {k === 2 && (
                    <div className="sparkle" style={{ bottom: "2%", right: 0, width: 28, height: 28, background: "var(--teal)" }} aria-hidden="true" />
                  )}
                </div>
              </div>
            );
            const copy = (
              <div className="product__copy">
                <h3 id={`prod-${p.id}`} className="display">
                  {p.name[0]}
                  <br />
                  {p.name[1]}
                </h3>
                <p className="product__desc">{p.desc}</p>
                <div className="product__buy">
                  <span className="price">{p.price}</span>
                  <a href="#visitanos" className={`btn ${BTN[k]}`}>
                    Pedir <span className="arr" aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
            );
            return (
              <article key={p.id} className={`product product--${k + 1}`} aria-labelledby={`prod-${p.id}`}>
                <Corner pos="tl">La carta · {num}</Corner>
                <Corner pos="br">{num} / 03</Corner>
                <div className="product__inner">
                  {k === 2 ? (
                    <>
                      {art}
                      {copy}
                    </>
                  ) : (
                    <>
                      {copy}
                      {art}
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
