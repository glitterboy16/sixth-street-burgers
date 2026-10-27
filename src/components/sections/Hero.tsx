"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { HERO } from "@/data/hero";
import { heroLabels, site } from "@/data/site";
import { onScroll, prefersReducedMotion, sm, stageProgress } from "@/lib/motion";
import WelcomeBadge from "@/components/kit/WelcomeBadge";
import Corner from "@/components/kit/Corner";
import TodayHours from "@/components/kit/TodayHours";

// La hamburguesa son cinco capas recortadas del render del despiece (scripts/hero-layers.mjs). Abierta,
// cada capa está donde la pintó el render; cerrada, cada capa baja hasta apoyar sobre la inferior.
// SEAT[i] = fracción del alto de la capa i+1 que la capa i tapa al apoyarse (misma lista que el script).
const SEAT = [0.6, 0.6, 0.55, 0.42];
// Escala máxima de la caja con la hamburguesa cerrada: ocupa casi todo el escenario.
const MAX_SCALE = 1.7;

const L = HERO.layers;
const N = L.length;

// Bordes superiores de las bandas apiladas (cerrada), % del alto del fotograma. El pan de abajo no se mueve.
const TOPS: number[] = Array(N).fill(0);
TOPS[N - 1] = L[N - 1].band[0];
for (let i = N - 2; i >= 0; i--) {
  const hb = L[i + 1].band[1] - L[i + 1].band[0];
  const bottom = TOPS[i + 1] + (SEAT[i] ?? 0.5) * hb;
  TOPS[i] = bottom - (L[i].band[1] - L[i].band[0]);
}
const CLOSED_TOP = TOPS[0];
const CLOSED_BOTTOM = TOPS[N - 1] + (L[N - 1].band[1] - L[N - 1].band[0]);
const CY = (CLOSED_TOP + CLOSED_BOTTOM) / 2; // centro de la cerrada: origen del zoom
const SCALE = Math.min(MAX_SCALE, 95 / (CLOSED_BOTTOM - CLOSED_TOP));
const LIFT = (50 - CY) / 100; // desplazamiento (fracción del alto de la caja) que centra la cerrada
const SHADOW_X = (L[N - 1].x[0] + L[N - 1].x[1]) / 2;
const SHADOW_W = (L[N - 1].x[1] - L[N - 1].x[0]) * 1.12;

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const titleA = useRef<HTMLHeadingElement>(null);
  const titleB = useRef<HTMLParagraphElement>(null);
  const cue = useRef<HTMLParagraphElement>(null);
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const labels = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const sec = section.current,
      st = stage.current,
      bx = box.current;
    if (!sec || !st || !bx) return;

    const rm = prefersReducedMotion();
    // p = progreso del scroll suavizado (0 arriba, 1 al final). Arriba la hamburguesa está cerrada, grande y
    // con sombra; a mitad de scroll se abre por capas con sus etiquetas; al final vuelve a cerrarse.
    let target = rm ? 1 : 0;
    let p = target;
    let raf = 0;
    let last = 0;

    const draw = () => {
      // ff: 1 = abierta, 0 = cerrada. Campana: cerrada → abierta (meseta 0,44-0,56) → cerrada.
      const ff = sm(p, 0.04, 0.44) * (1 - sm(p, 0.56, 0.96));
      const cl = 1 - ff;
      const S = bx.offsetHeight;

      // capas: de su sitio abierto a su sitio apilado
      layers.current.forEach((el, i) => {
        if (!el) return;
        const dy = ((TOPS[i] - L[i].band[0]) / 100) * S * cl;
        el.style.transform = `translateY(${dy}px)`;
      });

      // zoom y subida de la caja solo en el último tramo del cierre, cuando las capas ya casi se tocan
      const cz = sm(cl, 0.45, 1);
      // en móvil la caja arranca en el margen izquierdo: con menos zoom la cerrada no se sale de pantalla
      const scaleMax = window.innerWidth < 640 ? Math.min(SCALE, 1.3) : SCALE;
      const sc = 1 + (scaleMax - 1) * cz;
      const sh = LIFT * cz;
      bx.style.transform = `translateY(${sh * S}px) scale(${sc})`;

      if (shadow.current) shadow.current.style.opacity = String(1 - sm(ff, 0, 0.35));

      labels.current.forEach((el, i) => {
        if (!el || !L[i]) return;
        const a = sm(ff, 0.7 + i * 0.04, 0.82 + i * 0.04);
        const c = (L[i].band[0] + L[i].band[1]) / 2;
        const y = CY + (c - CY) * sc + sh * 100;
        el.style.top = `${y}%`;
        el.style.opacity = String(a);
        el.style.transform = `translate(${-16 * (1 - a)}px, -50%)`;
      });

      const h = sm(p, 0.3, 0.42);
      if (titleA.current) titleA.current.style.transform = `translateY(${-110 * h}%)`;
      if (titleB.current) titleB.current.style.transform = `translateY(${110 * (1 - h)}%)`;
      if (cue.current) cue.current.style.opacity = String(1 - sm(p, 0, 0.08));
    };

    // La rueda del ratón llega a saltos de ~100 px: el progreso sigue al scroll con una pequeña inercia
    // (constante de tiempo 70 ms) para que la secuencia no vaya a tirones.
    const tick = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      const d = target - p;
      if (Math.abs(d) < 0.0004) {
        p = target;
        last = 0;
        draw();
        return;
      }
      p += d * (1 - Math.exp(-dt / 70));
      draw();
      raf = requestAnimationFrame(tick);
    };
    const update = () => {
      target = stageProgress(sec, st);
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const offScroll = rm ? (draw(), () => {}) : onScroll(update);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      offScroll();
    };
  }, []);

  return (
    <section id="top" ref={section} className="hero" aria-label="Portada">
      <div ref={stage} className="hero__stage">
        <Corner pos="tl">01 — Hero</Corner>
        <Corner pos="tr">{site.coords}</Corner>
        <Corner pos="bl">
          <TodayHours />
        </Corner>
        <p ref={cue} className="corner corner--br hero__cue">
          Scroll <span aria-hidden="true">↓</span>
        </p>

        <div className="hero__grid">
          <div className="hero__copy">
            <div className="hero__titles hero__in" style={{ "--i": 0 } as React.CSSProperties}>
              <h1 ref={titleA} className="display">
                MUERDE
                <br />
                FUERTE.
              </h1>
              <p ref={titleB} className="display hero__title-b" aria-hidden="true">
                HECHA
                <br />
                AL MOMENTO.
              </p>
            </div>
            <p className="lead hero__in" style={{ "--i": 1 } as React.CSSProperties}>
              Smash burgers a la plancha. Un diner americano de noche, en Lanzarote.
            </p>
            <div className="hero__actions hero__in" style={{ "--i": 2 } as React.CSSProperties}>
              <a href="#carta" className="btn btn--primary">
                Ver la carta
              </a>
              <a href="#local" className="btn btn--outline">
                Cómo llegar
              </a>
            </div>
          </div>

          <div className="hero__scene hero__in" style={{ "--i": 1 } as React.CSSProperties}>
            <div className="hero__square">
              <div ref={box} className="hero__box" style={{ transformOrigin: `50% ${CY}%` }}>
                <div
                  ref={shadow}
                  className="hero__shadow"
                  aria-hidden="true"
                  style={{ left: `${SHADOW_X}%`, top: `${CLOSED_BOTTOM - 0.8}%`, width: `${SHADOW_W}%` }}
                />
                <div
                  className="hero__stack"
                  role="img"
                  aria-label="La smash burger de Sixth Street abriéndose por capas y volviéndose a montar al hacer scroll"
                >
                  {L.map((l, i) => (
                    <div
                      key={l.file}
                      ref={(el) => {
                        layers.current[i] = el;
                      }}
                      className="hero__layer"
                      style={{ top: `${l.top}%`, zIndex: N - i }}
                    >
                      <Image
                        src={HERO.path(l.file)}
                        alt=""
                        width={l.width}
                        height={l.height}
                        sizes="(max-width: 639px) 80vw, 46vw"
                        priority
                      />
                    </div>
                  ))}
                </div>
              </div>

              {heroLabels.map((t, i) => (
                <div
                  key={t}
                  ref={(el) => {
                    labels.current[i] = el;
                  }}
                  className="callout hero__label"
                  aria-hidden="true"
                >
                  <span className="callout__dot" />
                  <span className="callout__line" />
                  <span className="callout__text">{t}</span>
                </div>
              ))}

              <div className="pop hero__sticker-smash" data-reveal="1" aria-hidden="true">
                <Image
                  src="/images/sello-smash.webp"
                  alt=""
                  width={600}
                  height={629}
                  sizes="(max-width: 639px) 120px, 260px"
                />
              </div>
              <WelcomeBadge className="hero__sticker-badge" reveal />
              <div className="sparkle pop hero__sparkle" data-reveal="1" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
