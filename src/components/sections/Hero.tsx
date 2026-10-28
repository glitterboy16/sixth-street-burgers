"use client";

import { useEffect, useRef } from "react";
import { FRAMES, type FrameSize } from "@/data/frames";
import { FRAMES_DARK } from "@/data/frames-dark";
import { heroLabels, site } from "@/data/site";
import { clamp, navH, onThemeChange, prefersReducedMotion, sm } from "@/lib/motion";
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
const FILL = 97; // % del alto de la caja que ocupa la hamburguesa cuando el zoom lo permite: nunca se sale de ella
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
    SHADOW_W: (C.x[1] - C.x[0]) * 1.7, // más ancha que la penumbra: el fondo no puede salirse de su caja y se cortaba a los lados
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
    // Todos los fotogramas también en móvil: con uno de cada dos la hamburguesa avanzaba a escalones (la imagen
    // cambiaba cada 2-3 refrescos mientras el zoom se movía en cada uno). La carga es progresiva (orden de
    // saltos 8 → 4 → 2 → 1), así que primero llegan los pares y la animación ya funciona mientras baja el resto.
    const stride = 1;
    const { width, height } = FRAMES.sizes[size]; // los dos juegos salen del mismo script: mismo tamaño
    cv.width = width;
    cv.height = height;
    ctx.imageSmoothingQuality = "high";

    // Un caché de fotogramas por tema; solo se descarga el del tema que se está viendo.
    type Cache = {
      set: FrameSet;
      frames: (HTMLImageElement | null)[];
      n: number;
      order: number[];
      next: number;
      started: boolean;
      bm: Map<number, ImageBitmap>; // fotogramas ya decodificados alrededor del actual (ventana deslizante)
      pend: Set<number>;
      center: number;
    };
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
      return { set, frames: Array(n).fill(null), n, order, next: 0, started: false, bm: new Map(), pend: new Set(), center: 0 };
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
    let S = bx.offsetHeight; // alto de la caja (px): se lee en fit(), nunca en cada fotograma
    let isMobile = mobile;
    let secTop = 0; // posición de la sección y recorrido del escenario: el progreso del scroll no toca el layout
    let range = 1;

    // Pintar un <img> en el canvas puede obligar a decodificarlo otra vez (el navegador descarta lo decodificado
    // cuando hay muchos): en móvil cada decodificación de 1080×1440 son 15-30 ms y el scroll va a tirones. Por
    // eso se mantiene una ventana deslizante de ImageBitmap alrededor del fotograma actual, decodificados en un
    // worker (fetch del archivo, que ya está en la caché HTTP, + createImageBitmap) para no tocar el hilo
    // principal; el bitmap llega transferido, sin copia.
    const WIN = size === "h" ? 4 : 6;
    const HOLD = WIN + 3;
    let worker: Worker | null = null;
    try {
      if (typeof Worker === "function" && typeof createImageBitmap === "function") {
        const src =
          "self.onmessage=async(e)=>{const{t,k,url,w,h}=e.data;try{const r=await fetch(url);const b=await r.blob();" +
          "const bm=await createImageBitmap(b,{resizeWidth:w,resizeHeight:h,resizeQuality:\"high\"});self.postMessage({t,k,bm},[bm])}catch(err){self.postMessage({t,k,error:String(err)})}};";
        worker = new Worker(URL.createObjectURL(new Blob([src], { type: "text/javascript" })));
        worker.onmessage = (e: MessageEvent<{ t: Theme; k: number; bm?: ImageBitmap }>) => {
          const { t, k, bm } = e.data;
          const c = caches[t];
          c.pend.delete(k);
          if (!bm) return;
          if (disposed || Math.abs(k - c.center) > HOLD) {
            bm.close();
            return;
          }
          c.bm.set(k, bm);
        };
        worker.onerror = () => {
          worker?.terminate();
          worker = null;
        };
      }
    } catch {
      worker = null;
    }
    const warm = (c: Cache, i: number) => {
      if (!worker) return;
      c.center = i;
      for (let d = 0; d <= WIN; d++) {
        for (const k of d ? [i - d, i + d] : [i]) {
          if (k < 0 || k >= c.n || c.bm.has(k) || c.pend.has(k)) continue;
          const im = c.frames[k];
          if (!im) continue;
          c.pend.add(k);
          worker.postMessage({ t: c === caches.dark ? "dark" : "light", k, url: im.src, w: cv.width, h: cv.height });
        }
      }
      for (const [k, b] of c.bm) {
        if (Math.abs(k - i) > HOLD) {
          b.close();
          c.bm.delete(k);
        }
      }
    };

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

    // El canvas no necesita más píxeles que los que se ven: el tamaño de la caja × densidad de pantalla × zoom
    // máximo de la cerrada (en un portátil 1× son 4 veces menos píxeles que el fotograma 2K por fotograma).
    const sizeCanvas = (boxW: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const cw = Math.min(width, Math.max(240, Math.ceil(boxW * dpr * Math.max(1, scaleMax))));
      if (cw !== cv.width) {
        cv.width = cw;
        cv.height = Math.round((cw * height) / width);
        ctx.imageSmoothingQuality = "high";
        drawn = -1;
        // los bitmaps ya decodificados son del tamaño anterior: se rehacen al nuevo
        for (const c of Object.values(caches)) {
          for (const b of c.bm.values()) b.close();
          c.bm.clear();
        }
      }
    };
    const fit = () => {
      fitBox();
      sizeCanvas(sq.offsetWidth);
    };
    const fitBox = () => {
      const vw = window.innerWidth;
      sizeMobileBox(vw);
      isMobile = vw < 640;
      S = bx.offsetHeight;
      const rcs = sec.getBoundingClientRect();
      secTop = rcs.top + window.scrollY;
      range = Math.max(1, rcs.height - st.offsetHeight);
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

    // Caja vertical [arriba, abajo] (% del alto) de la hamburguesa en un punto de la apertura, interpolada
    // entre los fotogramas medidos por scripts/frame-boxes.mjs (si faltan, entre la cerrada y la abierta).
    const extentAt = (ff: number): [number, number] => {
      const B = (cur.set as { boxes?: [number, number][] }).boxes;
      if (B && B.length > 1) {
        const f = ff * (B.length - 1);
        const i0 = Math.min(B.length - 1, Math.floor(f));
        const i1 = Math.min(B.length - 1, i0 + 1);
        const t = f - i0;
        return [B[i0][0] + (B[i1][0] - B[i0][0]) * t, B[i0][1] + (B[i1][1] - B[i0][1]) * t];
      }
      const ob = cur.set.openBands;
      const oTop = ob.length ? ob[0][0] : 5,
        oBottom = ob.length ? ob[ob.length - 1][1] : 94;
      return [g.C.top + (oTop - g.C.top) * ff, g.C.bottom + (oBottom - g.C.bottom) * ff];
    };

    const draw = () => {
      // ff: 1 = abierta, 0 = cerrada. Solo ida: se abre con el scroll y se queda abierta hasta el final
      // (p 0,84-1), sin volver a cerrarse: el usuario ve el despiece quieto y sigue bajando.
      const ff = sm(p, 0.04, 0.84);

      const i = near(Math.round(ff * (cur.n - 1)));
      if (i >= 0) {
        warm(cur, i);
        if (i !== drawn) {
          drawn = i;
          ctx.clearRect(0, 0, cv.width, cv.height);
          ctx.drawImage(cur.bm.get(i) ?? cur.frames[i]!, 0, 0, cv.width, cv.height);
        }
      }

      // Zoom: crece en el último tramo del cierre (cz) pero nunca más de lo que deja la altura real de la
      // hamburguesa en este punto (FILL % de la caja). Abierta = 1, cerrada = scaleMax, y en mitad de la
      // transición, cuando las capas ya están separadas pero aún no del todo, jamás se sale de su caja.
      const ext = extentAt(ff);
      const cz = sm(1 - ff, 0.45, 1);
      const sc = Math.max(1, Math.min(scaleMax, FILL / Math.max(1, ext[1] - ext[0]), 1 + (scaleMax - 1) * cz));
      const c = (ext[0] + ext[1]) / 2;
      const sh = (50 - (g.CY + (c - g.CY) * sc)) / 100; // fracción del alto de la caja
      bx.style.transform = `translateY(${sh * S}px) scale(${sc})`;
      const k = scaleMax > 1 ? (sc - 1) / (scaleMax - 1) : 0; // 0 abierta → 1 cerrada: centrado en móvil
      curTx = tx * k;
      sq.style.transform = curTx ? `translateX(${curTx}px)` : "";

      // la sombra de contacto desaparece al despegar las capas
      if (shadow.current) shadow.current.style.opacity = String(1 - sm(ff, 0, 0.35));

      labels.current.forEach((el, k) => {
        if (!el) return;
        const a = sm(ff, 0.7 + k * 0.04, 0.82 + k * 0.04);
        const y = (g.CY + (g.LABEL_Y[k] - g.CY) * sc + sh * 100) / 100; // fracción del alto de la caja
        el.style.opacity = String(a);
        // solo transform (nada de top: no fuerza layout). Entra desde fuera (derecha): el punto se acerca a su
        // capa hasta el margen y nunca lo cruza
        el.style.transform = `translate3d(${16 * (1 - a)}px, ${y * S}px, 0) translateY(-50%)`;
      });

      const h = sm(p, 0.56, 0.8);
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
      if (Math.abs(d) < 0.0002) {
        p = target;
        last = 0;
        draw();
        return;
      }
      // "scrub" suavizado tipo GSAP: la animación persigue al scroll con retardo y se desliza hasta pararse
      // (constante de tiempo 260 ms en móvil, 160 ms en escritorio) en vez de ir pegada a cada salto del dedo
      p += d * (1 - Math.exp(-dt / (isMobile ? 260 : 160)));
      draw();
      raf = requestAnimationFrame(tick);
    };
    // progreso del scroll sin tocar el layout: la posición de la sección se midió en fit()
    const progressNow = () => clamp((window.scrollY + navH() - secTop) / range, 0, 1);
    const update = () => {
      target = progressNow();
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
      const prev = cur;
      cur = caches[t];
      for (const b of prev.bm.values()) b.close(); // libera lo decodificado del tema que se deja de ver
      prev.bm.clear();
      g = GEO[t];
      drawn = -1;
      applyGeo();
      start(cur);
      fit();
      draw();
    });

    // scroll: solo el progreso (pasivo). resize: reajuste de la caja; en móvil la barra del navegador dispara
    // resize al ocultarse, así que si solo cambia el alto el reajuste espera a que pare.
    let lastW = window.innerWidth;
    let resizeT = 0;
    const refit = () => {
      fit();
      update();
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
    if (rm) {
      draw();
    } else {
      update();
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", onResize);
    }
    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(resizeT);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
      offTheme();
      worker?.terminate();
      for (const c of Object.values(caches)) for (const b of c.bm.values()) b.close();
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
