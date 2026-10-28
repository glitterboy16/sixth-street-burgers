"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { FRAMES, type FrameSize } from "@/data/frames";
import { heroLabels, site } from "@/data/site";
import { onScroll, prefersReducedMotion, sm, stageProgress } from "@/lib/motion";
import WelcomeBadge from "@/components/kit/WelcomeBadge";
import Corner from "@/components/kit/Corner";
import TodayHours from "@/components/kit/TodayHours";

// La hamburguesa es un vídeo generado (cerrada → despiece) troceado en fotogramas WebP con alfa por
// scripts/frames.mjs. El scroll elige el fotograma (0 = cerrada, N-1 = abierta) y lo pinta en un canvas,
// sin fundidos entre vecinos (emborronan las capas en movimiento).
const MAX_SCALE = 1.7; // escala de la caja con la hamburguesa cerrada: ocupa casi todo el escenario
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const C = FRAMES.closed;
const CY = (C.top + C.bottom) / 2; // centro de la cerrada: origen del zoom
const SCALE = Math.min(MAX_SCALE, 95 / (C.bottom - C.top));
const LIFT = (50 - CY) / 100; // desplazamiento (fracción del alto de la caja) que centra la cerrada
const SHADOW_X = (C.x[0] + C.x[1]) / 2;
const SHADOW_W = (C.x[1] - C.x[0]) * 1.12;

// Centro de cada etiqueta en el fotograma abierto (% del alto): las bandas que midió el script. Si el matte
// no separa exactamente una banda por capa, se reparten entre la primera y la última.
const LABEL_Y: number[] = (() => {
  const b = FRAMES.openBands;
  const n = heroLabels.length;
  if (b.length === n) return b.map(([a, z]) => (a + z) / 2);
  const top = b.length ? (b[0][0] + b[0][1]) / 2 : 20;
  const bottom = b.length ? (b[b.length - 1][0] + b[b.length - 1][1]) / 2 : 85;
  return Array.from({ length: n }, (_, i) => top + ((bottom - top) * i) / (n - 1));
})();

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const titleA = useRef<HTMLHeadingElement>(null);
  const titleB = useRef<HTMLParagraphElement>(null);
  const cue = useRef<HTMLParagraphElement>(null);
  const labels = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const sec = section.current,
      st = stage.current,
      bx = box.current,
      cv = canvas.current;
    if (!sec || !st || !bx || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    // móvil (< 640 px) carga la versión ligera
    const size: FrameSize = window.innerWidth < 640 ? "m" : "d";
    const { width, height, count: n } = FRAMES.sizes[size];
    cv.width = width;
    cv.height = height;
    const frames: (HTMLImageElement | null)[] = Array(n).fill(null);
    let drawn = -1;
    let disposed = false;

    const rm = prefersReducedMotion();
    // p = progreso del scroll suavizado (0 arriba, 1 al final). Arriba la hamburguesa está cerrada, grande y
    // con sombra; a mitad de scroll se abre por capas con sus etiquetas; al final vuelve a cerrarse.
    let target = rm ? 1 : 0;
    let p = target;
    let raf = 0;
    let last = 0;

    // fotograma cargado más cercano a i (mientras se descargan)
    const near = (i: number) => {
      for (let d = 0; d < n; d++) {
        if (frames[i - d]) return i - d;
        if (frames[i + d]) return i + d;
      }
      return -1;
    };

    const draw = () => {
      // ff: 1 = abierta, 0 = cerrada. Campana: cerrada → abierta (meseta 0,44-0,56) → cerrada.
      const ff = sm(p, 0.04, 0.44) * (1 - sm(p, 0.56, 0.96));
      const cl = 1 - ff;
      const S = bx.offsetHeight;

      const i = near(Math.round(ff * (n - 1)));
      if (i >= 0 && i !== drawn) {
        drawn = i;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(frames[i]!, 0, 0, width, height);
      }

      // zoom y subida de la caja solo en el último tramo del cierre, cuando las capas ya casi se tocan
      const cz = sm(cl, 0.45, 1);
      // en móvil la caja arranca en el margen izquierdo: con menos zoom la cerrada no se sale de pantalla
      const scaleMax = window.innerWidth < 640 ? Math.min(SCALE, 1.3) : SCALE;
      const sc = 1 + (scaleMax - 1) * cz;
      const sh = LIFT * cz;
      bx.style.transform = `translateY(${sh * S}px) scale(${sc})`;

      if (shadow.current) shadow.current.style.opacity = String(1 - sm(ff, 0, 0.35));

      labels.current.forEach((el, k) => {
        if (!el) return;
        const a = sm(ff, 0.7 + k * 0.04, 0.82 + k * 0.04);
        const y = CY + (LABEL_Y[k] - CY) * sc + sh * 100;
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

    // Carga: la cerrada y la abierta primero, luego a saltos cada vez más finos. 6 descargas en paralelo.
    const order: number[] = [];
    const seen = new Set<number>();
    const push = (i: number) => {
      if (i >= 0 && i < n && !seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    };
    push(0);
    push(n - 1);
    for (const step of [8, 4, 2, 1]) for (let i = 0; i < n; i += step) push(i);

    let next = 0;
    const pump = () => {
      if (disposed || next >= order.length) return;
      const i = order[next++];
      const im = new window.Image();
      im.decoding = "async";
      im.src = BASE + FRAMES.path(i, size);
      im.decode().then(
        () => {
          if (!disposed) {
            frames[i] = im;
            drawn = -1;
            draw();
          }
          pump();
        },
        () => pump(),
      );
    };
    for (let k = 0; k < 6; k++) pump();

    const offScroll = rm ? (draw(), () => {}) : onScroll(update);
    return () => {
      disposed = true;
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
                  style={{ left: `${SHADOW_X}%`, top: `${C.bottom - 0.8}%`, width: `${SHADOW_W}%` }}
                />
                <canvas
                  ref={canvas}
                  className="hero__canvas"
                  role="img"
                  aria-label="La smash burger de Sixth Street abriéndose por capas y volviéndose a montar al hacer scroll"
                />
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
