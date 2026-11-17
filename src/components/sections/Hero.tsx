"use client";

import { useEffect, useRef } from "react";
import ANCHO from "@/data/hero-ancho.json";
import ALTO from "@/data/hero-alto.json";
import { site } from "@/data/site";
import { useLang } from "@/i18n/LangContext";
import { markReady } from "@/lib/boot";
import { clamp, navH, prefersReducedMotion, sm } from "@/lib/motion";
import { AMPLIACION_MAX, Z_ABIERTA, Z_CERRADA, Z_MOVIL } from "./hero-zoom";
import Corner from "@/components/kit/Corner";
import TodayHours from "@/components/kit/TodayHours";

// La portada es la Smash Burger real del local en su mesa del bar, a pantalla completa: un vídeo generado a partir
// de la foto (cerrada → abierta por capas, con los hilos de queso) troceado en fotogramas WebP por
// scripts/frames-hero.mjs. El scroll elige el fotograma y lo pinta en un canvas que cubre todo el escenario.
//
// Hay dos encuadres del mismo vídeo: "ancho" (16:9, escritorio y tablet apaisada) y "alto" (9:16, móvil y tablet
// de pie). Se elige por la proporción de la pantalla y se pinta tipo "cover": el fotograma llena siempre el
// escenario hasta los bordes y se recorta lo que sobra, pero nunca la hamburguesa (zona segura). El fondo es el
// mismo en el primer y el último fotograma: la mesa y el bar no se mueven, solo suben las capas.
type Set = typeof ANCHO;
const SETS: Record<"ancho" | "alto", Set> = { ancho: ANCHO, alto: ALTO as Set };
// Tamaños de fotograma: "m" y "h" para el scroll (el que pida la pantalla) y "x" (4K, solo en apaisado) para cuando la
// hamburguesa está parada: entonces se pinta el fotograma 4K de ese momento, con todo el detalle, sin cargar los 223
// en 4K ni gastar la memoria que ocuparían.
type SizeKey = "x" | "h" | "m";
type Dim = { width: number; height: number; count: number };
const sizeOf = (set: Set, size: SizeKey): Dim | undefined => (set.sizes as Partial<Record<SizeKey, Dim>>)[size];
const HQ_KEEP = 4; // fotogramas 4K que se guardan a la vez (los últimos usados)
// Opcional: prolongación fija del bar a la izquierda del vídeo apaisado, para vídeos que traen la hamburguesa centrada
// (en ordenador va a la derecha, con el texto encima del bar). Solo si el manifiesto trae "plate" (frames-hero.mjs
// --plate); el vídeo actual ya tiene el bar a la izquierda y no la usa.
type Plate = { ext: number; fade: number };
const plateOf = (set: Set): Plate | undefined => (set as { plate?: Plate }).plate;
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const pathOf = (set: Set, size: SizeKey, i: number) => `${BASE}/frames/${set.set}/${size}/frame_${String(i).padStart(3, "0")}.webp?v=${set.stamp}`;

export default function Hero() {
  const { t } = useLang();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const titleA = useRef<HTMLHeadingElement>(null);
  const titleB = useRef<HTMLParagraphElement>(null);
  const cue = useRef<HTMLParagraphElement>(null);
  const lead = useRef<HTMLParagraphElement>(null);
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
    let frameReady = false;

    // ── juego de fotogramas según la forma de la pantalla ───────────────────────────────────────────────
    type Pack = {
      set: Set;
      size: SizeKey;
      FW: number;
      FH: number;
      N: number;
      frames: (HTMLImageElement | null)[];
      order: number[];
      next: number;
      inflight: number;
      EXT: number; // px de prolongación a la izquierda (0 si no hay)
      F: number; // px de fundido de la prolongación sobre el vídeo
      plate: HTMLImageElement | null;
      hq: SizeKey | null; // tamaño 4K para los momentos de reposo (null si la pantalla no lo necesita)
      hqImgs: Map<number, HTMLImageElement>;
      hqLoading: Map<number, boolean>; // true = cargando, false = falló (no se vuelve a pedir)
    };
    let pack: Pack | null = null;
    const choose = (): { set: Set; size: SizeKey; hq: SizeKey | null } => {
      // misma regla que el CSS (@media (max-aspect-ratio: 1/1)): proporción de la ventana, no del escenario
      const set = window.innerWidth > window.innerHeight ? SETS.ancho : SETS.alto;
      // tamaño: el grande si el pequeño se vería ampliado con el zoom de partida (misma cuenta que la precarga de Home)
      const W = st.clientWidth,
        H = st.clientHeight;
      const z = set === SETS.ancho && W >= 900 ? Z_CERRADA : Z_MOVIL;
      const ext = 1 + (plateOf(set)?.ext ?? 0);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const need = (d: Dim) => Math.max(W / (d.width * ext), H / d.height) * z * dpr; // cuánto se ampliaría
      const size: SizeKey = need(set.sizes.m) > AMPLIACION_MAX ? "h" : "m";
      // 4K en reposo si el fotograma del scroll se vería ampliado en esta pantalla
      const hq: SizeKey | null = sizeOf(set, "x") && need(sizeOf(set, size)!) > 1 ? "x" : null;
      return { set, size, hq };
    };
    const makePack = (set: Set, size: SizeKey, hq: SizeKey | null): Pack => {
      const { width, height, count } = sizeOf(set, size)!;
      const order: number[] = [];
      const seen = new Set<number>();
      const push = (i: number) => {
        if (i >= 0 && i < count && !seen.has(i)) {
          seen.add(i);
          order.push(i);
        }
      };
      push(0);
      push(count - 1);
      for (const step of [16, 8, 4, 2, 1]) for (let i = 0; i < count; i += step) push(i);
      const pl = plateOf(set);
      const pk: Pack = {
        set, size, FW: width, FH: height, N: count, frames: Array(count).fill(null), order, next: 0, inflight: 0,
        EXT: pl ? pl.ext * width : 0, F: pl ? pl.fade * width : 0, plate: null,
        hq, hqImgs: new Map(), hqLoading: new Map(),
      };
      if (pl) {
        const im = new window.Image();
        im.decoding = "async";
        im.src = `${BASE}/frames/${set.set}/plate-${size}.webp?v=${set.stamp}`;
        im.decode().then(
          () => {
            if (disposed || pk !== pack) return;
            pk.plate = im;
            drawn = -1;
            draw();
          },
          () => {},
        );
      }
      return pk;
    };
    // fotograma 4K de un momento de reposo: se carga, se guarda (los HQ_KEEP últimos) y se vuelve a pintar
    const loadHQ = (pk: Pack, i: number) => {
      if (!pk.hq || pk.hqImgs.has(i) || pk.hqLoading.has(i)) return;
      pk.hqLoading.set(i, true);
      const im = new window.Image();
      im.decoding = "async";
      im.src = pathOf(pk.set, pk.hq, i);
      im.decode().then(
        () => {
          pk.hqLoading.delete(i);
          if (disposed || pk !== pack) return;
          pk.hqImgs.set(i, im);
          while (pk.hqImgs.size > HQ_KEEP) pk.hqImgs.delete(pk.hqImgs.keys().next().value!);
          drawn = -1;
          draw();
          // al cargar la portada (fotograma 0), deja listo también el final, donde se queda la hamburguesa abierta
          if (i === 0) loadHQ(pk, pk.N - 1);
        },
        () => pk.hqLoading.set(i, false),
      );
    };
    const pump = (pk: Pack) => {
      while (!disposed && pk === pack && pk.inflight < 6 && pk.next < pk.order.length) {
        const i = pk.order[pk.next++];
        pk.inflight++;
        const im = new window.Image();
        im.decoding = "async";
        im.src = pathOf(pk.set, pk.size, i);
        im.decode().then(
          () => {
            pk.inflight--;
            if (disposed || pk !== pack) return;
            pk.frames[i] = im;
            drawn = -1;
            draw();
            pump(pk);
          },
          () => {
            pk.inflight--;
            pump(pk);
          },
        );
      }
    };

    // ── geometría ─────────────────────────────────────────────────────────────────────────────────────
    let CW = 1,
      CH = 1; // tamaño del escenario en px CSS
    let secTop = 0,
      range = 1;
    let isMobile = window.innerWidth < 640;
    const fit = () => {
      const want = choose();
      if (!pack || pack.set !== want.set || pack.size !== want.size || pack.hq !== want.hq) {
        pack = makePack(want.set, want.size, want.hq);
        pump(pack);
      }
      CW = st.clientWidth;
      CH = st.clientHeight;
      isMobile = window.innerWidth < 640;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(CW * dpr),
        h = Math.round(CH * dpr);
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
        ctx.imageSmoothingQuality = "high";
      }
      const r = sec.getBoundingClientRect();
      secTop = r.top + window.scrollY;
      range = Math.max(1, r.height - st.offsetHeight);
      drawn = -1;
    };

    // Ventana de recorte "cover" con la hamburguesa en zona segura. Devuelve, en px del fotograma, la esquina y el
    // tamaño del trozo visible. La hamburguesa (unión de cerrada y abierta) se coloca hacia la derecha en apaisado
    // (el texto va a la izquierda) y centrada en vertical; si la pantalla es más estrecha que la zona segura, manda
    // que se vea entera antes que la posición.
    const view = (ff: number) => {
      const pk = pack!;
      const { FW, FH, EXT } = pk;
      const VW = FW + EXT; // ancho disponible: prolongación + vídeo
      const landscape = pk.set.set === "ancho";
      const sCover = Math.max(CW / VW, CH / FH);
      const o = pk.set.open,
        c = pk.set.closed;
      const L = (Math.min(o[0], c[0]) / 100) * FW + EXT,
        R = (Math.max(o[2], c[2]) / 100) * FW + EXT;
      const B = (Math.max(o[3], c[3]) / 100) * FH;
      // altura que ocupa ahora la hamburguesa. En apaisado (ordenador), la medida en cada fotograma ("tops"), para que
      // el pan nunca se meta bajo la barra de arriba. En vertical (móvil), la curva suave de cerrada a abierta, igual
      // que en la versión que gustó (sixth-street-burgers-aogvln6wv): el zoom va fluido, sin tirones
      const tops = (pk.set as { tops?: number[] }).tops;
      let Tp: number;
      if (landscape && tops && tops.length === pk.N) {
        const fi = ff * (pk.N - 1),
          i0 = Math.floor(fi),
          i1 = Math.min(pk.N - 1, i0 + 1);
        Tp = tops[i0] + (tops[i1] - tops[i0]) * (fi - i0);
      } else {
        Tp = c[1] + (o[1] - c[1]) * sm(ff, 0, 0.45);
      }
      const T = (Tp / 100) * FH;
      const MT = landscape ? 0.05 : 0.04,
        MB = 0.1; // márgenes arriba y abajo, en fracción del alto de la pantalla
      let z = landscape && CW >= 900 ? Z_CERRADA + (Z_ABIERTA - Z_CERRADA) * sm(ff, 0.05, 0.95) : 1 + (Z_MOVIL - 1) * (1 - sm(ff, 0, 0.6));
      const zFit = (CH * (1 - MT - MB)) / ((B - T) * sCover); // zoom máximo con el que la hamburguesa cabe entera
      z = Math.max(1, Math.min(z, zFit));
      const s = sCover * z;
      const vw = CW / s,
        vh = CH / s;
      const tx = landscape && CW >= 900 ? 0.68 : 0.5; // dónde cae el centro de la hamburguesa en la pantalla
      let sx = (L + R) / 2 - tx * vw;
      // la hamburguesa entera si cabe: sx entre "se ve el borde derecho" y "se ve el borde izquierdo"
      const sxMin = R + 8 / s - vw,
        sxMax = L - 8 / s;
      sx = clamp(sx, Math.min(sxMin, sxMax), Math.max(sxMin, sxMax));
      sx = clamp(sx, 0, VW - vw);
      let sy = (T + B) / 2 - 0.5 * vh + ((MB - MT) / 2) * vh;
      sy = clamp(sy, Math.min(B + MB * vh - vh, T - MT * vh), Math.max(B + MB * vh - vh, T - MT * vh));
      sy = clamp(sy, 0, FH - vh);
      return { dst: false, ox: 0, oy: 0, sx, sy, vw, vh, s, z };
    };

    let drawn = -1;
    let settled = true; // sin scroll en curso: la hamburguesa está quieta en un fotograma
    let hqTimer = 0,
      hqPending = -1;
    let target = rm ? 1 : 0;
    let p = target;
    let raf = 0;
    let last = 0;

    const near = (pk: Pack, i: number) => {
      for (let d = 0; d < pk.N; d++) {
        if (pk.frames[i - d]) return i - d;
        if (pk.frames[i + d]) return i + d;
      }
      return -1;
    };

    const draw = () => {
      const pk = pack;
      if (!pk) return;
      const ff = sm(p, 0.04, 0.84); // 0 cerrada, 1 abierta; se queda abierta hasta el final
      const want = Math.round(ff * (pk.N - 1));
      const v = view(ff);
      // en reposo, el fotograma 4K si ya está; si no, se pide (tras 120 ms quieto, para no pedirlo mientras se scrollea)
      const hqImg = settled && pk.hq ? pk.hqImgs.get(want) : undefined;
      if (hqImg) {
        pk.hqImgs.delete(want);
        pk.hqImgs.set(want, hqImg); // el último usado va al final (no se borra)
      } else if (settled && pk.hq && hqPending !== want && !pk.hqLoading.has(want)) {
        hqPending = want;
        clearTimeout(hqTimer);
        hqTimer = window.setTimeout(() => {
          hqPending = -1;
          if (settled && pack === pk) loadHQ(pk, want);
        }, 120);
      }
      const i = hqImg ? want : near(pk, want);
      if (i >= 0 && (frameReady || Math.abs(i - want) <= 2)) {
        const img = hqImg ?? pk.frames[i]!;
        const r = img.naturalWidth / pk.FW; // 1 con los fotogramas del scroll, 1,5 con los 4K
        const key =
          i * 10000 + Math.round(v.sx) + Math.round(v.sy) * 7 + Math.round(v.z * 1000) * 13 + Math.round(v.ox) * 31 + Math.round(v.oy) * 37 + (pk.plate ? 0.5 : 0) + (hqImg ? 0.25 : 0);
        if (key !== drawn) {
          drawn = key;
          if (v.dst) {
            // vertical: el fotograma entero colocado en (ox, oy) a escala s; si baja, el hueco de arriba es el fondo
            // oscuro del bar con un fundido para que no se vea el borde
            const k = cv.width / CW;
            ctx.fillStyle = "#0b0a09";
            ctx.fillRect(0, 0, cv.width, cv.height);
            ctx.drawImage(img, v.ox * k, v.oy * k, pk.FW * v.s * k, pk.FH * v.s * k);
            if (v.oy > 0.5) {
              const g = ctx.createLinearGradient(0, v.oy * k, 0, (v.oy + 90) * k);
              g.addColorStop(0, "rgba(11,10,9,1)");
              g.addColorStop(1, "rgba(11,10,9,0)");
              ctx.fillStyle = g;
              ctx.fillRect(0, v.oy * k, cv.width, 90 * k);
            }
          } else if (!pk.EXT) {
            ctx.drawImage(img, v.sx * r, v.sy * r, v.vw * r, v.vh * r, 0, 0, cv.width, cv.height);
          } else {
            // vídeo desplazado a la derecha y la prolongación del bar encima, fundida por su borde derecho
            const k = cv.width / v.vw;
            const dy = -v.sy * k;
            ctx.fillStyle = "#0b0a09";
            ctx.fillRect(0, 0, cv.width, cv.height);
            ctx.drawImage(img, (pk.EXT - v.sx) * k, dy, pk.FW * k, pk.FH * k);
            if (pk.plate) ctx.drawImage(pk.plate, -v.sx * k, dy, (pk.EXT + pk.F) * k, pk.FH * k);
          }
        }
        if (!frameReady) {
          frameReady = true;
          markReady("frame");
        }
      }

      // etiquetas: punto a la derecha de su capa (en px de pantalla), texto dentro de la pantalla
      // en vertical (móvil) no hay etiquetas: se quedaban encima de la hamburguesa; se ve sola con «HECHA AL MOMENTO»
      const gap = isMobile ? 6 : 14;
      const portrait = pk.set.set === "alto";
      labels.current.forEach((el, k) => {
        if (!el) return;
        if (portrait) {
          el.style.opacity = "0";
          return;
        }
        const l = pk.set.labels[k];
        const a = sm(ff, 0.72 + k * 0.04, 0.84 + k * 0.04);
        const x = ((l.right / 100) * pk.FW + pk.EXT - v.sx) * v.s + gap;
        const y = ((l.y / 100) * pk.FH - v.sy) * v.s;
        const w = el.offsetWidth;
        const xx = Math.min(x, CW - w - 10);
        el.style.opacity = String(a);
        el.style.transform = `translate3d(${xx + 16 * (1 - a)}px, ${y}px, 0) translateY(-50%)`;
      });

      const h = sm(p, 0.6, 0.7);
      if (titleA.current) titleA.current.style.transform = `translateY(${-110 * h}%)`;
      if (titleB.current) titleB.current.style.transform = `translateY(${110 * (1 - h)}%)`;
      if (cue.current) cue.current.style.opacity = String(1 - sm(p, 0, 0.08));
      // en vertical el titular se queda (y cambia de «MUERDE FUERTE» a «HECHA AL MOMENTO»); solo el texto de debajo se
      // aparta cuando las capas suben. Con !important porque la animación de entrada (fill both) manda sobre el estilo
      if (lead.current) {
        const lf = portrait ? sm(ff, 0.03, 0.16) : 0;
        if (lf > 0) lead.current.style.setProperty("opacity", String(1 - lf), "important");
        else lead.current.style.removeProperty("opacity");
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
        settled = true;
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
      if (Math.abs(target - p) >= 0.0002) settled = false;
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
      clearTimeout(hqTimer);
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
            <p ref={lead} className="lead hero__in" style={{ "--i": 1 } as React.CSSProperties}>
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
