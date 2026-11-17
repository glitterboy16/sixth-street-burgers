"use client";

import { useEffect, useRef } from "react";
import { FRAMES_FOTO as F, type FotoSize } from "@/data/frames-foto";
import { site } from "@/data/site";
import { useLang } from "@/i18n/LangContext";
import { markReady } from "@/lib/boot";
import { clamp, navH, prefersReducedMotion, sm } from "@/lib/motion";
import Corner from "@/components/kit/Corner";
import TodayHours from "@/components/kit/TodayHours";

// La portada es la Smash Burger real del local, en su mesa del bar: un vídeo generado a partir de la foto
// (cerrada → abierta por capas, con los hilos de queso) troceado en fotogramas WebP opacos por
// scripts/frames-foto.mjs. El scroll elige el fotograma y lo pinta en un canvas; la foto se funde con el fondo
// de la página por los bordes (máscara CSS), así que el mismo juego sirve para el tema claro y el oscuro.
//
// Zoom: la cerrada empieza un poco más cerca (ZOOM sobre su centro) y la cámara se aleja mientras se abre. Se
// hace recortando el fotograma dentro del canvas, nunca escalando la caja: la foto no se sale de su sitio.
const ZOOM = 1.08;
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const [CL, CT, CR, CB] = F.closed;
const FX = (CL + CR) / 200; // foco del zoom: centro de la cerrada (fracción del fotograma)
const FY = (CT + CB) / 200;

export default function Hero() {
  const { t } = useLang();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const square = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const titleA = useRef<HTMLHeadingElement>(null);
  const titleB = useRef<HTMLParagraphElement>(null);
  const actions = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLParagraphElement>(null);
  const labels = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const sec = section.current,
      st = stage.current,
      sq = square.current,
      cv = canvas.current;
    if (!sec || !st || !sq || !cv) return;
    const ctx = cv.getContext("2d", { alpha: false });
    if (!ctx) return;

    // escritorio: 1440×1920; móvil de alta densidad: 1080×1440; móvil de baja: 720×960
    const mobile = window.innerWidth < 640;
    const size: FotoSize = !mobile ? "h" : window.devicePixelRatio < 2 ? "m" : "d";
    const { width: FW, height: FH, count: N } = F.sizes[size];
    ctx.imageSmoothingQuality = "high";

    // orden de carga: la cerrada y la abierta primero, luego a saltos cada vez más finos (la animación funciona
    // desde el principio con los fotogramas que haya y gana fluidez mientras baja el resto)
    const order: number[] = [];
    const seen = new Set<number>();
    const push = (i: number) => {
      if (i >= 0 && i < N && !seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    };
    push(0);
    push(N - 1);
    for (const step of [16, 8, 4, 2, 1]) for (let i = 0; i < N; i += step) push(i);
    const frames: (HTMLImageElement | null)[] = Array(N).fill(null);
    let next = 0;
    let drawn = -1;
    let disposed = false;
    let frameReady = false;

    // Pintar un <img> puede obligar al navegador a decodificarlo otra vez: ventana deslizante de ImageBitmap
    // alrededor del fotograma actual, decodificados en un worker al tamaño del canvas.
    const WIN = size === "h" ? 4 : 6;
    const HOLD = WIN + 3;
    const bms = new Map<number, ImageBitmap>();
    const pend = new Set<number>();
    let center = 0;
    let worker: Worker | null = null;
    try {
      if (typeof Worker === "function" && typeof createImageBitmap === "function") {
        const src =
          "self.onmessage=async(e)=>{const{k,url,w,h}=e.data;try{const r=await fetch(url);const b=await r.blob();" +
          "const bm=await createImageBitmap(b,{resizeWidth:w,resizeHeight:h,resizeQuality:\"high\"});self.postMessage({k,bm},[bm])}catch(err){self.postMessage({k,error:String(err)})}};";
        worker = new Worker(URL.createObjectURL(new Blob([src], { type: "text/javascript" })));
        worker.onmessage = (e: MessageEvent<{ k: number; bm?: ImageBitmap }>) => {
          const { k, bm } = e.data;
          pend.delete(k);
          if (!bm) return;
          if (disposed || Math.abs(k - center) > HOLD) {
            bm.close();
            return;
          }
          bms.set(k, bm);
        };
        worker.onerror = () => {
          worker?.terminate();
          worker = null;
        };
      }
    } catch {
      worker = null;
    }
    // los bitmaps se decodifican al tamaño del canvas multiplicado por el zoom máximo (el recorte no pierde nitidez)
    const bmW = () => Math.min(FW, Math.round(cv.width * ZOOM));
    const bmH = () => Math.round((bmW() * FH) / FW);
    const warm = (i: number) => {
      if (!worker) return;
      center = i;
      for (let d = 0; d <= WIN; d++) {
        for (const k of d ? [i - d, i + d] : [i]) {
          if (k < 0 || k >= N || bms.has(k) || pend.has(k) || !frames[k]) continue;
          pend.add(k);
          worker.postMessage({ k, url: frames[k]!.src, w: bmW(), h: bmH() });
        }
      }
      for (const [k, b] of bms) {
        if (Math.abs(k - i) > HOLD) {
          b.close();
          bms.delete(k);
        }
      }
    };
    const near = (i: number) => {
      for (let d = 0; d < N; d++) {
        if (frames[i - d]) return i - d;
        if (frames[i + d]) return i + d;
      }
      return -1;
    };

    const rm = prefersReducedMotion();
    let target = rm ? 1 : 0;
    let p = target;
    let raf = 0;
    let last = 0;
    let isMobile = mobile;
    let secTop = 0;
    let range = 1;
    let S = 1; // alto de la caja en px
    let Wbox = 1;
    let labelLeft: number[] = []; // px desde el borde izquierdo de la caja, ya ajustado para no salirse de la pantalla

    // Móvil: la caja es el hueco que deja el texto en el escenario (la foto nunca pisa los botones), sin pasar
    // del ancho de la pantalla ni de 460 px.
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
      const btns = actions.current ? actions.current.offsetHeight + gap : 0;
      const avail = st.clientHeight - cp.offsetHeight - btns - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - gap;
      const byWidth = (vw - 24) * (4 / 3);
      const h = Math.round(Math.max(220, Math.min(avail, byWidth, 460)));
      if (h !== boxH) {
        boxH = h;
        grid.style.setProperty("--box", `${h}px`);
      }
    };

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const cw = Math.min(FW, Math.max(240, Math.ceil(sq.offsetWidth * dpr)));
      if (cw !== cv.width) {
        cv.width = cw;
        cv.height = Math.round((cw * FH) / FW);
        ctx.imageSmoothingQuality = "high";
        drawn = -1;
        for (const b of bms.values()) b.close();
        bms.clear();
      }
    };

    // Etiquetas: a --callout-gap del borde derecho de su capa; si en esa posición se salen de la pantalla,
    // se meten hacia dentro (llevan fondo propio, se leen igual sobre la foto).
    const placeLabels = () => {
      const r = sq.getBoundingClientRect();
      const gapPx = parseFloat(getComputedStyle(sq).getPropertyValue("--callout-gap")) || 12;
      const maxRight = window.innerWidth - 8;
      labelLeft = F.labels.map((l, k) => {
        const el = labels.current[k];
        const w = el ? el.offsetWidth : 140;
        const want = (l.right / 100) * Wbox + gapPx;
        return Math.min(want, maxRight - r.left - w);
      });
    };

    const fit = () => {
      const vw = window.innerWidth;
      sizeMobileBox(vw);
      isMobile = vw < 640;
      S = sq.offsetHeight;
      Wbox = sq.offsetWidth;
      const rcs = sec.getBoundingClientRect();
      secTop = rcs.top + window.scrollY;
      range = Math.max(1, rcs.height - st.offsetHeight);
      sizeCanvas();
      placeLabels();
    };

    const draw = () => {
      // ff: 0 = cerrada, 1 = abierta. Se abre con el scroll y se queda abierta hasta el final (p 0,84-1).
      const ff = sm(p, 0.04, 0.84);
      const z = 1 + (ZOOM - 1) * (1 - sm(ff, 0, 0.6));
      const want = Math.round(ff * (N - 1));
      const i = near(want);
      // hasta que se levanta la cortina no se pinta un fotograma lejano (la abierta puede llegar antes)
      if (i >= 0 && (frameReady || Math.abs(i - want) <= 2)) {
        warm(i);
        const src: CanvasImageSource = bms.get(i) ?? frames[i]!;
        const sw0 = bms.has(i) ? bms.get(i)!.width : FW;
        const sh0 = bms.has(i) ? bms.get(i)!.height : FH;
        // recorte para el zoom alrededor del foco (FX, FY): el foco se queda en su sitio
        const sw = sw0 / z,
          sh = sh0 / z;
        const sx = FX * sw0 * (1 - 1 / z),
          sy = FY * sh0 * (1 - 1 / z);
        const key = i * 1000 + Math.round(z * 500);
        if (key !== drawn) {
          drawn = key;
          ctx.drawImage(src, sx, sy, sw, sh, 0, 0, cv.width, cv.height);
        }
        if (!frameReady) {
          frameReady = true;
          markReady("frame");
        }
      }

      labels.current.forEach((el, k) => {
        if (!el) return;
        const a = sm(ff, 0.72 + k * 0.04, 0.84 + k * 0.04);
        const l = F.labels[k];
        const y = ((l.y / 100 - FY) * z + FY) * S; // con el zoom casi en 1 cuando aparecen
        el.style.opacity = String(a);
        el.style.transform = `translate3d(${(labelLeft[k] ?? 0) + 16 * (1 - a)}px, ${y}px, 0) translateY(-50%)`;
      });

      const h = sm(p, 0.56, 0.8);
      if (titleA.current) titleA.current.style.transform = `translateY(${-110 * h}%)`;
      if (titleB.current) titleB.current.style.transform = `translateY(${110 * (1 - h)}%)`;
      if (cue.current) cue.current.style.opacity = String(1 - sm(p, 0, 0.08));
    };

    // "scrub" suavizado tipo GSAP: la animación persigue al scroll con retardo (260 ms en móvil, 160 ms en
    // escritorio) en vez de ir pegada a cada salto de la rueda o del dedo
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
      p += d * (1 - Math.exp(-dt / (isMobile ? 260 : 160)));
      draw();
      raf = requestAnimationFrame(tick);
    };
    const progressNow = () => clamp((window.scrollY + navH() - secTop) / range, 0, 1);
    const update = () => {
      target = progressNow();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const pump = () => {
      if (disposed || next >= order.length) return;
      const i = order[next++];
      const im = new window.Image();
      im.decoding = "async";
      im.src = BASE + F.path(i, size);
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

    document.fonts?.ready.then(() => {
      if (!disposed) {
        fit();
        draw();
      }
    });

    let lastW = window.innerWidth;
    let resizeT = 0;
    const refit = () => {
      fit();
      update();
      drawn = -1;
      draw();
    };
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
    target = rm ? 1 : progressNow();
    p = target;
    if (rm) {
      draw();
    } else {
      update();
      window.addEventListener("scroll", update, { passive: true });
    }
    window.addEventListener("resize", onResize);
    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(resizeT);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
      worker?.terminate();
      for (const b of bms.values()) b.close();
    };
  }, []);

  return (
    <section id="top" ref={section} className="hero" aria-label={t.hero.aria}>
      <div ref={stage} className="hero__stage">
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

          <div className="hero__scene hero__in" style={{ "--i": 1 } as React.CSSProperties}>
            <div ref={square} className="hero__square">
              <div className="hero__photo">
                <canvas ref={canvas} className="hero__canvas" role="img" aria-label={t.hero.canvasAria} />
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
          </div>

          {/* fila propia: en escritorio bajo el párrafo; en móvil y tablet, bajo la foto */}
          <div ref={actions} className="hero__actions hero__in" style={{ "--i": 2 } as React.CSSProperties}>
            <a href="#carta" className="btn btn--primary">
              {t.hero.ctaMenu}
            </a>
            <a href="#local" className="btn btn--outline">
              {t.hero.ctaMap}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
