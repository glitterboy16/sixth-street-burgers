"use client";

import { useEffect, useRef } from "react";
import CAPAS from "@/data/hero-capas.json";
import { site } from "@/data/site";
import { useLang } from "@/i18n/LangContext";
import { markReady } from "@/lib/boot";
import { clamp, navH, prefersReducedMotion, sm } from "@/lib/motion";
import { Z_ABIERTA, Z_CERRADA, Z_MOVIL } from "./hero-zoom";
import Corner from "@/components/kit/Corner";
import TodayHours from "@/components/kit/TodayHours";

// La portada es la Smash Burger del local en su mesa del bar, a pantalla completa, abriéndose por capas con el scroll.
// No es un vídeo: es UNA foto 4K del despiece recortada en capas (renders/capas/recortar_capas.py y exportar_web.py):
// un fondo fijo (bar, papel, pan de abajo y bacon) y cuatro capas que se mueven (carnes con cheddar, loncha de
// queso, cebolla y pan de arriba). Cada capa es siempre la misma imagen nítida: nada cambia de forma ni pierde
// resolución, y todo pesa menos de 1 MB. Entre la loncha y la carne, hilos de queso que se estiran y se rompen.
//
// Hay dos fondos: "ancho" (escritorio y tablet apaisada) y "alto" (móvil y tablet de pie), elegidos por la
// proporción de la pantalla y pintados tipo "cover". Las capas son las mismas para los dos: cada fondo dice cómo
// pasar de px de la escena de capas a px de su imagen (xf = [escala, x, y]).
type LayerId = "carne" | "queso" | "cebolla" | "pan";
type SceneId = "ancho" | "alto";
const ORDER: LayerId[] = ["carne", "queso", "cebolla", "pan"]; // de atrás adelante
const LH = CAPAS.layerScene[1];
const pct = (v: number) => (v / 100) * LH;
// Desplazamiento vertical de cada capa respecto a su sitio en la foto del despiece, en % del alto de la escena de
// capas (+ = abajo). Cerrada: las capas apiladas sobre el bacon. Abierta: separadas con aire entre ellas.
const CLOSED: Record<LayerId, number> = { carne: 0, queso: 6.5, cebolla: 9.7, pan: 14.7 };
// En apaisado la torre abierta tiene que caber en el poco alto de una pantalla ancha (también panorámica): se separa
// menos, pero la carne se queda sobre el bacon para que entre la loncha y la carne haya hueco para los hilos.
const OPEN: Record<SceneId, Record<LayerId, number>> = {
  alto: { carne: -2, queso: -6.5, cebolla: -7.5, pan: -8.5 },
  ancho: { carne: 0, queso: -3.5, cebolla: -4.5, pan: -5 },
};
// Cuándo sube cada capa a lo largo de la apertura (0-1): primero el pan y la cebolla, el queso y la carne detrás.
const TIMING: Record<LayerId, [number, number]> = { pan: [0, 0.72], cebolla: [0.05, 0.8], queso: [0.11, 0.88], carne: [0.18, 0.96] };
// Etiquetas, en el orden de i18n (pan, cebolla, carne, bacon, salsa): ancla en px de la escena de capas y capa que la mueve
const LABELS: { anchor: keyof typeof CAPAS.anchors; layer?: LayerId }[] = [
  { anchor: "pan", layer: "pan" },
  { anchor: "cebolla", layer: "cebolla" },
  { anchor: "carne", layer: "carne" },
  { anchor: "bacon" },
  { anchor: "salsa" },
];
// Hilos de queso entre la loncha y la carne (renders/capas/hilos/): cada hilo cuelga de la loncha y se apoya en la
// carne, así que se estira cuando se separan; después se rompe, cada uno en su momento (no todos a la vez), y se
// recoge hacia la loncha. SNAP = apertura (0-1) a la que se rompe cada hilo, en el orden de izquierda a derecha.
const HILOS = CAPAS.hilos;
const SNAP = [0.8, 0.72, 0.88, 0.76, 0.93, 0.84];
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const url = (p: string) => `${BASE}${p}?v=${CAPAS.stamp}`;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const im = new window.Image();
    im.decoding = "async";
    im.src = src;
    im.decode().then(() => resolve(im), reject);
  });

export default function Hero() {
  const { t } = useLang();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const titleA = useRef<HTMLHeadingElement>(null);
  const titleB = useRef<HTMLParagraphElement>(null);
  const cue = useRef<HTMLParagraphElement>(null);
  const labels = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const sec = section.current,
      st = stage.current,
      cv = canvas.current;
    if (!sec || !st || !cv) return;
    const ctx = cv.getContext("2d", { alpha: false });
    if (!ctx) return;

    const rm = prefersReducedMotion();
    let disposed = false;
    let ready = false;

    // ── imágenes: las capas (compartidas) y el fondo de la escena según la forma de la pantalla ────────────
    const layerImg: Partial<Record<LayerId, HTMLImageElement>> = {};
    const baseImg: Partial<Record<SceneId, HTMLImageElement>> = {};
    let scene: SceneId = window.innerWidth > window.innerHeight ? "ancho" : "alto";
    const loadScene = (id: SceneId) => {
      if (baseImg[id]) return;
      loadImage(url(CAPAS.scenes[id].base)).then(
        (im) => {
          if (disposed) return;
          baseImg[id] = im;
          draw();
        },
        () => {},
      );
    };
    for (const id of ORDER) {
      loadImage(url(`/hero/capas/${id}.webp`)).then(
        (im) => {
          if (disposed) return;
          layerImg[id] = im;
          draw();
        },
        () => {},
      );
    }
    const hiloImg: (HTMLImageElement | null)[] = HILOS.list.map(() => null);
    HILOS.list.forEach((h, i) => {
      loadImage(url(h.src)).then(
        (im) => {
          if (disposed) return;
          hiloImg[i] = im;
          draw();
        },
        () => {},
      );
    });

    // ── geometría ─────────────────────────────────────────────────────────────────────────────────────
    let CW = 1,
      CH = 1; // tamaño del escenario en px CSS
    let secTop = 0,
      range = 1;
    let isMobile = window.innerWidth < 640;
    const fit = () => {
      // misma regla que el CSS (@media (max-aspect-ratio: 1/1)): proporción de la ventana, no del escenario
      scene = window.innerWidth > window.innerHeight ? "ancho" : "alto";
      loadScene(scene);
      CW = st.clientWidth;
      CH = st.clientHeight;
      isMobile = window.innerWidth < 640;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(CW * dpr),
        h = Math.round(CH * dpr);
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      const r = sec.getBoundingClientRect();
      secTop = r.top + window.scrollY;
      range = Math.max(1, r.height - st.offsetHeight);
    };

    // desplazamiento de una capa (px de la escena de capas) con la apertura ff (0 cerrada, 1 abierta)
    const offset = (id: LayerId, ff: number) => {
      const [a, b] = TIMING[id];
      const e = sm(ff, a, b);
      return pct(CLOSED[id] + (OPEN[scene][id] - CLOSED[id]) * e);
    };

    // Ventana de recorte "cover" con la hamburguesa entera dentro (márgenes arriba y abajo) y hacia la derecha en
    // apaisado. La altura de la torre se calcula EXACTA en cada momento a partir de la posición de las capas.
    const view = (ff: number) => {
      const sc = CAPAS.scenes[scene];
      const [FW, FH] = sc.size;
      const [xs, tx, ty] = sc.xf;
      const landscape = scene === "ancho";
      const sCover = Math.max(CW / FW, CH / FH);
      let L = Infinity,
        R = -Infinity,
        T = Infinity;
      for (const id of ORDER) {
        const [bx, by, bw] = CAPAS.layers[id].box;
        L = Math.min(L, bx * xs + tx);
        R = Math.max(R, (bx + bw) * xs + tx);
        T = Math.min(T, (by + offset(id, ff)) * xs + ty);
      }
      const B = CAPAS.bottom * xs + ty;
      const MT = landscape ? 0.05 : 0.04,
        MB = landscape ? 0.06 : 0.1; // márgenes arriba y abajo, en fracción del alto de la pantalla
      let z = landscape && CW >= 900 ? Z_CERRADA + (Z_ABIERTA - Z_CERRADA) * sm(ff, 0.05, 0.95) : 1 + (Z_MOVIL - 1) * (1 - sm(ff, 0, 0.6));
      const zFit = (CH * (1 - MT - MB)) / ((B - T) * sCover); // zoom máximo con el que la hamburguesa cabe entera
      z = Math.max(1, Math.min(z, zFit));
      const s = sCover * z;
      const vw = CW / s,
        vh = CH / s;
      const cx = landscape && CW >= 900 ? 0.68 : 0.5; // dónde cae el centro de la hamburguesa en la pantalla
      let sx = (L + R) / 2 - cx * vw;
      const sxMin = R + 8 / s - vw,
        sxMax = L - 8 / s;
      sx = clamp(sx, Math.min(sxMin, sxMax), Math.max(sxMin, sxMax));
      sx = clamp(sx, 0, FW - vw);
      let sy = (T + B) / 2 - 0.5 * vh + ((MB - MT) / 2) * vh;
      sy = clamp(sy, Math.min(B + MB * vh - vh, T - MT * vh), Math.max(B + MB * vh - vh, T - MT * vh));
      sy = clamp(sy, 0, FH - vh);
      return { sx, sy, vw, vh, s, xs, tx, ty };
    };

    let target = rm ? 1 : 0;
    let p = target;
    let raf = 0;
    let last = 0;

    const draw = () => {
      const base = baseImg[scene];
      if (!base || ORDER.some((id) => !layerImg[id])) return; // se pinta todo junto, nunca a medias
      const ff = sm(p, 0.04, 0.84); // 0 cerrada, 1 abierta; se queda abierta hasta el final
      const v = view(ff);
      const k = cv.width / v.vw; // px del canvas por px del fondo
      ctx.drawImage(base, v.sx, v.sy, v.vw, v.vh, 0, 0, cv.width, cv.height);
      const drawLayer = (id: LayerId) => {
        const [bx, by, bw, bh] = CAPAS.layers[id].box;
        const x = bx * v.xs + v.tx,
          y = (by + offset(id, ff)) * v.xs + v.ty;
        ctx.drawImage(layerImg[id]!, (x - v.sx) * k, (y - v.sy) * k, bw * v.xs * k, bh * v.xs * k);
      };
      drawLayer("carne");
      // hilos: entre la carne (detrás) y la loncha (delante, tapa su arranque)
      const dq = offset("queso", ff) - HILOS.ref.queso,
        dc = offset("carne", ff) - HILOS.ref.carne;
      HILOS.list.forEach((h, i) => {
        const im = hiloImg[i];
        if (!im) return;
        const [hx, hy, hw, hh] = h.box;
        const top = hy + dq,
          len = hy + hh + dc - top; // de la loncha a la carne, en px de la escena de capas
        const r = len / hh;
        const snap = sm(ff, SNAP[i % SNAP.length], SNAP[i % SNAP.length] + 0.06);
        const a = sm(r, 0.06, 0.22) * (1 - snap);
        if (a <= 0.01 || len <= 1) return;
        const drawn = len * (1 - 0.6 * snap); // al romperse se recoge hacia la loncha
        ctx.globalAlpha = a;
        ctx.drawImage(im, (hx * v.xs + v.tx - v.sx) * k, (top * v.xs + v.ty - v.sy) * k, hw * v.xs * k, drawn * v.xs * k);
        ctx.globalAlpha = 1;
      });
      drawLayer("queso");
      drawLayer("cebolla");
      drawLayer("pan");
      if (!ready) {
        ready = true;
        markReady("frame");
      }

      // etiquetas: punto a la derecha de su pieza (en px de pantalla), texto dentro de la pantalla
      const gap = isMobile ? 6 : 14;
      labels.current.forEach((el, i) => {
        if (!el) return;
        const l = LABELS[i];
        const [axL, ayL] = CAPAS.anchors[l.anchor];
        const dy = l.layer ? offset(l.layer, ff) : 0;
        const a = sm(ff, 0.72 + i * 0.04, 0.84 + i * 0.04);
        const x = (axL * v.xs + v.tx - v.sx) * v.s + gap;
        const y = ((ayL + dy) * v.xs + v.ty - v.sy) * v.s;
        const w = el.offsetWidth;
        const xx = Math.min(x, CW - w - 10);
        el.style.opacity = String(a);
        el.style.transform = `translate3d(${xx + 16 * (1 - a)}px, ${y}px, 0) translateY(-50%)`;
      });

      const h = sm(p, 0.6, 0.7);
      if (titleA.current) titleA.current.style.transform = `translateY(${-110 * h}%)`;
      if (titleB.current) titleB.current.style.transform = `translateY(${110 * (1 - h)}%)`;
      if (cue.current) cue.current.style.opacity = String(1 - sm(p, 0, 0.08));
      // en vertical el texto va encima de la hamburguesa: se aparta cuando las capas suben
      if (copy.current) {
        const fade = scene === "alto" ? sm(ff, 0.12, 0.42) : 0;
        copy.current.style.opacity = String(1 - fade);
        copy.current.style.transform = fade ? `translateY(${-24 * fade}px)` : "";
      }
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      const d = target - p;
      if (Math.abs(d) < 0.0002) {
        p = target;
        last = 0;
        draw();
        return;
      }
      // "scrub" suavizado: la animación persigue al scroll con retardo (260 ms móvil, 160 ms escritorio)
      p += d * (1 - Math.exp(-dt / (isMobile ? 260 : 160)));
      draw();
      raf = requestAnimationFrame(tick);
    };
    const progressNow = () => clamp((window.scrollY + navH() - secTop) / range, 0, 1);
    const update = () => {
      target = progressNow();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    let lastW = window.innerWidth;
    let resizeT = 0;
    const refit = () => {
      fit();
      update();
      draw();
    };
    // la barra del navegador móvil cambia el alto al hacer scroll: si solo cambia el alto, se espera a que pare
    const onResize = () => {
      if (window.innerWidth !== lastW) {
        lastW = window.innerWidth;
        refit();
        return;
      }
      clearTimeout(resizeT);
      resizeT = window.setTimeout(refit, 250);
    };

    fit();
    document.fonts?.ready.then(() => {
      if (!disposed) refit();
    });
    target = rm ? 1 : progressNow();
    p = target;
    draw();
    if (!rm) window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(resizeT);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section id="top" ref={section} className="hero" aria-label={t.hero.aria}>
      <div ref={stage} className="hero__stage">
        <canvas ref={canvas} className="hero__canvas" role="img" aria-label={t.hero.canvasAria} />
        <div className="hero__veil" aria-hidden="true" />
        <Corner pos="tr">{site.coords}</Corner>
        <Corner pos="bl">
          <TodayHours />
        </Corner>
        <p ref={cue} className="corner corner--br hero__cue">
          {t.common.scroll} <span aria-hidden="true">↓</span>
        </p>

        <div className="hero__grid">
          <div ref={copy} className="hero__copy">
            <div className="hero__titles hero__in" style={{ "--i": 0 } as React.CSSProperties}>
              <h1 ref={titleA} className="display">
                {t.hero.titleA[0]}
                <br />
                {t.hero.titleA[1]}
              </h1>
              <p ref={titleB} className="display hero__title-b" aria-hidden="true">
                {t.hero.titleB[0]}
                <br />
                {t.hero.titleB[1]}
              </p>
            </div>
            <p className="lead hero__in" style={{ "--i": 1 } as React.CSSProperties}>
              {t.hero.lead}
            </p>
          </div>
          <div className="hero__actions hero__in" style={{ "--i": 2 } as React.CSSProperties}>
            <a href="#carta" className="btn btn--primary">
              {t.hero.ctaMenu}
            </a>
            <a href="#local" className="btn btn--outline">
              {t.hero.ctaMap}
            </a>
          </div>
        </div>

        {t.hero.labels.map((label, i) => (
          <div
            key={label}
            ref={(el) => {
              labels.current[i] = el;
            }}
            className="callout hero__label"
            aria-hidden="true"
          >
            <span className="callout__dot" />
            <span className="callout__line" />
            <span className="callout__text">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
