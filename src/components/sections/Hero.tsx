"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { FRAMES, type FrameSize } from "@/data/frames";
import { FRAMES_DARK } from "@/data/frames-dark";
import { heroLabels, site } from "@/data/site";
import { onScroll, onThemeChange, prefersReducedMotion, sm, stageProgress } from "@/lib/motion";
import Corner from "@/components/kit/Corner";
import TodayHours from "@/components/kit/TodayHours";

// La hamburguesa es un vídeo generado (cerrada → despiece) troceado en fotogramas WebP con alfa por
// scripts/frames.mjs. El scroll elige el fotograma (0 = cerrada, N-1 = abierta) y lo pinta en un canvas,
// sin fundidos entre vecinos (emborronan las capas en movimiento).
//
// Hay DOS juegos de fotogramas: el vídeo se generó sobre fondo rosa (tema claro) y, con los mismos frames
// inicial y final pasados a negro, sobre fondo casi negro (tema oscuro). Así el borde del matte lleva siempre
// el color del fondo que toca y no se nota de dónde salió. Misma coreografía en los dos.
const MAX_SCALE = 1.7; // escritorio: la cerrada ocupa casi todo el escenario
const MAX_SCALE_MOBILE = 1.9; // móvil: plano completo, casi todo el ancho de la pantalla
const MOBILE_EDGE = 8; // px que la cerrada deja a cada lado de la pantalla en móvil
const TEXT_GAP = 24; // px de aire entre el texto y la hamburguesa cerrada en escritorio: nunca se pisan
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type Theme = "dark" | "light";
type FrameSet = typeof FRAMES;
const SETS: Record<Theme, FrameSet> = { dark: FRAMES_DARK, light: FRAMES };
const themeNow = (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

// Centro de cada etiqueta en el fotograma abierto (% del alto): las bandas que midió el script. Si el matte
// no separa exactamente una banda por capa, se reparten entre la primera y la última.
function labelCenters(b: [number, number][]) {
  const n = heroLabels.length;
  if (b.length === n) return b.map(([a, z]) => (a + z) / 2);
  const top = b.length ? (b[0][0] + b[0][1]) / 2 : 20;
  const bottom = b.length ? (b[b.length - 1][0] + b[b.length - 1][1]) / 2 : 85;
  return Array.from({ length: n }, (_, i) => top + ((bottom - top) * i) / (n - 1));
}

// Borde derecho de cada capa abierta (% del ancho): el punto de cada etiqueta va a --callout-gap de SU capa,
// así todas guardan el mismo margen y ninguna pisa la hamburguesa (el pan, la lechuga y el queso no miden igual).
function labelEdges(set: FrameSet) {
  const n = heroLabels.length;
  const r = (set as { openRight?: number[] }).openRight;
  return r && r.length === n ? r : Array(n).fill(88);
}

// Geometría de un juego: caja de la cerrada (zoom, subida, sombra) y etiquetas de la abierta.
function geometry(set: FrameSet) {
  const C = set.closed;
  const CY = (C.top + C.bottom) / 2; // centro de la cerrada: origen del zoom
  return {
    C,
    CY,
    SCALE: Math.min(MAX_SCALE, 95 / (C.bottom - C.top)),
    LIFT: (50 - CY) / 100, // desplazamiento (fracción del alto de la caja) que centra la cerrada
    SHADOW_X: (C.x[0] + C.x[1]) / 2,
    SHADOW_W: (C.x[1] - C.x[0]) * 1.12,
    LABEL_Y: labelCenters(set.openBands),
    LABEL_X: labelEdges(set),
  };
}
const GEO: Record<Theme, ReturnType<typeof geometry>> = { dark: geometry(FRAMES_DARK), light: geometry(FRAMES) };
const G0 = GEO.dark; // tema por defecto: lo que lleva el HTML inicial

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const square = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const titleA = useRef<HTMLHeadingElement>(null);
  const titleB = useRef<HTMLParagraphElement>(null);
  const lead = useRef<HTMLParagraphElement>(null);
  const actions = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLParagraphElement>(null);
  const labels = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const sec = section.current,
      st = stage.current,
      bx = box.current,
      sq = square.current,
      cv = canvas.current;
    if (!sec || !st || !bx || !sq || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    // Escritorio: el vídeo 2K tal cual (h). Móvil: la cerrada ocupa casi toda la pantalla, así que usa los
    // fotogramas grandes (d, uno de cada dos: la mitad de descarga); la versión ligera (m) solo en pantallas
    // de baja densidad.
    const mobile = window.innerWidth < 640;
    const size: FrameSize = !mobile ? "h" : window.devicePixelRatio < 2 ? "m" : "d";
    const stride = size === "d" ? 2 : 1;
    const { width, height } = FRAMES.sizes[size]; // los dos juegos salen del mismo script: mismo tamaño
    cv.width = width;
    cv.height = height;

    // Un caché de fotogramas por tema; solo se descarga el del tema que se está viendo.
    type Cache = { set: FrameSet; frames: (HTMLImageElement | null)[]; n: number; order: number[]; next: number; started: boolean };
    const mkCache = (set: FrameSet): Cache => {
      const total = set.sizes[size].count;
      const n = Math.ceil(total / stride);
      // orden de carga: la cerrada y la abierta primero, luego a saltos cada vez más finos
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
      return { set, frames: Array(n).fill(null), n, order, next: 0, started: false };
    };
    const caches: Record<Theme, Cache> = { dark: mkCache(SETS.dark), light: mkCache(SETS.light) };
    const fileOf = (c: Cache, i: number) => c.set.path(i === c.n - 1 ? c.set.sizes[size].count - 1 : i * stride, size);

    let theme = themeNow();
    let cur = caches[theme];
    let g = GEO[theme];
    let drawn = -1;
    let disposed = false;

    const rm = prefersReducedMotion();
    // p = progreso del scroll suavizado (0 arriba, 1 al final). Arriba la hamburguesa está cerrada, grande y
    // con sombra; a mitad de scroll se abre por capas con sus etiquetas; al final vuelve a cerrarse.
    let target = rm ? 1 : 0;
    let p = target;
    let raf = 0;
    let last = 0;
    let scaleMax = g.SCALE;
    let tx = 0; // móvil: desplazamiento que centra la cerrada en la pantalla (la caja va pegada a la izquierda)
    let curTx = 0;

    const applyGeo = () => {
      bx.style.transformOrigin = `50% ${g.CY}%`;
      const sh = shadow.current;
      if (sh) {
        sh.style.left = `${g.SHADOW_X}%`;
        sh.style.top = `${g.C.bottom - 0.8}%`;
        sh.style.width = `${g.SHADOW_W}%`;
      }
      labels.current.forEach((el, k) => {
        if (el) el.style.left = `calc(${g.LABEL_X[k]}% + var(--callout-gap, 14px))`;
      });
    };

    // fotograma cargado más cercano a i (mientras se descargan)
    const near = (i: number) => {
      for (let d = 0; d < cur.n; d++) {
        if (cur.frames[i - d]) return i - d;
        if (cur.frames[i + d]) return i + d;
      }
      return -1;
    };

    // Borde derecho real del texto (no de sus cajas, que ocupan toda la columna).
    const textRight = () => {
      let r = -Infinity;
      const range = document.createRange();
      for (const el of [titleA.current, titleB.current, lead.current]) {
        if (!el) continue;
        range.selectNodeContents(el);
        r = Math.max(r, range.getBoundingClientRect().right);
      }
      const btn = actions.current?.lastElementChild;
      if (btn) r = Math.max(r, btn.getBoundingClientRect().right);
      return r;
    };

    // Zoom máximo de la cerrada y centrado. Escritorio (texto al lado): el que deja la hamburguesa a
    // TEXT_GAP del texto; el borde izquierdo de la cerrada está al C.x[0] % del fotograma y la caja escala
    // desde su centro horizontal. Móvil (texto encima): plano completo, casi todo el ancho de la pantalla,
    // centrada; abierta vuelve a su sitio para que quepan las etiquetas a la derecha.
    // Móvil: el alto de la caja es el espacio que deja el texto en el escenario (la hamburguesa nunca pisa
    // los botones), sin pasar del ancho que permite la pantalla con las etiquetas al lado ni de 400 px.
    const grid = sec.querySelector<HTMLElement>(".hero__grid");
    let boxH = 0;
    const sizeMobileBox = (vw: number) => {
      const cp = copy.current;
      if (!grid || !cp) return;
      if (vw >= 640) {
        if (boxH) {
          grid.style.removeProperty("--box");
          boxH = 0;
        }
        return;
      }
      const cs = getComputedStyle(grid);
      const gap = parseFloat(cs.rowGap) || 16;
      const btns = actions.current ? actions.current.offsetHeight + gap : 0; // los botones van debajo de la caja
      const avail = st.clientHeight - cp.offsetHeight - btns - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - gap;
      // ancho: la capa más ancha + margen + la etiqueta más larga tienen que caber en la pantalla
      const maxRight = Math.max(...g.LABEL_X) / 100;
      const labelW = Math.max(0, ...labels.current.map((el) => (el ? el.offsetWidth : 0))) || 150;
      const gapPx = parseFloat(getComputedStyle(sq).getPropertyValue("--callout-gap")) || 10;
      const byWidth = ((vw - 32 - labelW - gapPx) / maxRight) * (4 / 3);
      const h = Math.round(Math.max(180, Math.min(avail, byWidth, 400)));
      if (h !== boxH) {
        boxH = h;
        grid.style.setProperty("--box", `${h}px`);
      }
    };

    const fit = () => {
      const vw = window.innerWidth;
      sizeMobileBox(vw);
      const sr = sq.getBoundingClientRect();
      const left0 = sr.left - curTx;
      const C = g.C;
      if (vw < 640) {
        const bw = sr.width * ((C.x[1] - C.x[0]) / 100); // ancho de la cerrada sin zoom
        scaleMax = Math.max(1, Math.min(MAX_SCALE_MOBILE, (vw - 2 * MOBILE_EDGE) / bw));
        const cx = left0 + sr.width * ((C.x[0] + C.x[1]) / 200);
        tx = vw / 2 - cx;
        return;
      }
      tx = 0;
      if (vw < 900) {
        scaleMax = g.SCALE; // tablet: texto encima, la caja ya cabe
        return;
      }
      const tr = textRight();
      if (!Number.isFinite(tr) || tr <= left0 - TEXT_GAP) {
        scaleMax = g.SCALE;
        return;
      }
      const x0 = C.x[0] / 100;
      const limit = (tr + TEXT_GAP - left0) / sr.width; // borde que no puede cruzar, en fracción de la caja
      scaleMax = Math.max(1, Math.min(g.SCALE, (0.5 - limit) / (0.5 - x0)));
    };

    const draw = () => {
      // ff: 1 = abierta, 0 = cerrada. Campana: cerrada → abierta (meseta 0,44-0,56) → cerrada.
      const ff = sm(p, 0.04, 0.44) * (1 - sm(p, 0.56, 0.96));
      const cl = 1 - ff;
      const S = bx.offsetHeight;

      const i = near(Math.round(ff * (cur.n - 1)));
      if (i >= 0 && i !== drawn) {
        drawn = i;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(cur.frames[i]!, 0, 0, width, height);
      }

      // zoom, subida y centrado solo en el último tramo del cierre, cuando las capas ya casi se tocan
      const cz = sm(cl, 0.45, 1);
      const sc = 1 + (scaleMax - 1) * cz;
      const sh = g.LIFT * cz;
      bx.style.transform = `translateY(${sh * S}px) scale(${sc})`;
      curTx = tx * cz;
      sq.style.transform = curTx ? `translateX(${curTx}px)` : "";

      // la sombra de contacto desaparece al despegar las capas
      if (shadow.current) shadow.current.style.opacity = String(1 - sm(ff, 0, 0.35));

      labels.current.forEach((el, k) => {
        if (!el) return;
        const a = sm(ff, 0.7 + k * 0.04, 0.82 + k * 0.04);
        const y = g.CY + (g.LABEL_Y[k] - g.CY) * sc + sh * 100;
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
      fit();
      target = stageProgress(sec, st);
      if (!raf) raf = requestAnimationFrame(tick);
    };

    // 6 descargas en paralelo por juego
    const pump = (c: Cache) => {
      if (disposed || c.next >= c.order.length) return;
      const i = c.order[c.next++];
      const im = new window.Image();
      im.decoding = "async";
      im.src = BASE + fileOf(c, i);
      im.decode().then(
        () => {
          if (!disposed) {
            c.frames[i] = im;
            if (c === cur) {
              drawn = -1;
              draw();
            }
          }
          pump(c);
        },
        () => pump(c),
      );
    };
    const start = (c: Cache) => {
      if (c.started) return;
      c.started = true;
      for (let k = 0; k < 6; k++) pump(c);
    };

    applyGeo();
    start(cur);

    // las fuentes cambian el ancho del texto: reajusta el zoom cuando terminan de cargar
    document.fonts?.ready.then(() => {
      if (!disposed) {
        fit();
        draw();
      }
    });

    // cambio de tema: otro juego de fotogramas (se descarga entonces) y su geometría
    const offTheme = onThemeChange(() => {
      const t = themeNow();
      if (t === theme) return;
      theme = t;
      cur = caches[t];
      g = GEO[t];
      drawn = -1;
      applyGeo();
      start(cur);
      fit();
      draw();
    });

    const offScroll = rm ? (fit(), draw(), () => {}) : onScroll(update);
    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      offScroll();
      offTheme();
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
          <div ref={copy} className="hero__copy">
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
            <p ref={lead} className="lead hero__in" style={{ "--i": 1 } as React.CSSProperties}>
              Smash burgers a la plancha. Un diner americano de noche, en Lanzarote.
            </p>
          </div>

          <div className="hero__scene hero__in" style={{ "--i": 1 } as React.CSSProperties}>
            <div ref={square} className="hero__square">
              <div ref={box} className="hero__box" style={{ transformOrigin: `50% ${G0.CY}%` }}>
                <div
                  ref={shadow}
                  className="hero__shadow"
                  aria-hidden="true"
                  style={{ left: `${G0.SHADOW_X}%`, top: `${G0.C.bottom - 0.8}%`, width: `${G0.SHADOW_W}%` }}
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
            </div>
          </div>

          {/* Los botones van fuera de la columna de texto: en escritorio quedan debajo del párrafo, igual que
              antes; en móvil y tablet pasan DEBAJO de la hamburguesa, al pie del escenario, para que la
              hamburguesa tenga todo el hueco y nunca los pise. */}
          <div ref={actions} className="hero__actions hero__in" style={{ "--i": 2 } as React.CSSProperties}>
            <a href="#carta" className="btn btn--primary">
              Ver la carta
            </a>
            <a href="#local" className="btn btn--outline">
              Cómo llegar
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
