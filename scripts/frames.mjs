// Preprocesa los fotogramas del hero (fondo rosa plano del vídeo) a WebP con alfa.
//
//   node scripts/frames.mjs [--video ../hd.mp4] [--src carpeta-de-jpg-o-png] [--n 0] [--nm 0]
//
// - La web no funde fotogramas vecinos (emborrona las capas en movimiento): se exportan TODOS los únicos
//   del vídeo en escritorio (--n 0 = todos) y en móvil la mitad (--nm 0 = ⌈n/2⌉) o todos (--nm all).
// - Fuente por defecto: ../hd.mp4 (1080×1440, 145 fotogramas), extraído a PNG sin pérdida con ffmpeg.
//   Con --src se usa una carpeta de JPG/PNG (p. ej. los ezgif del handoff, de peor calidad).
// - Quita los fotogramas duplicados consecutivos (ezgif repite uno de cada cinco).
// - El clip va de abierta (001) a cerrada (último): invierte el orden → frame_000 = cerrada.
// - Matte en scripts/key.mjs.
// - Escribe public/frames/d/frame_NNN.webp (escritorio, 1080×1440 nativo), public/frames/m/frame_NNN.webp
//   (móvil, 720×960), public/images/burger-cerrada.webp (1:1), public/images/burger-abierta.webp (3:4),
//   public/images/og.jpg y src/data/frames.ts.

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { keyFrame } from "./key.mjs";
import { keyDark } from "./key-dark.mjs";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > -1 ? process.argv[i + 1] : d;
};
const VIDEO = process.argv.includes("--src") ? null : path.resolve(arg("video", "../hd.mp4"));
let SRC;
if (VIDEO) {
  if (!fs.existsSync(VIDEO)) throw new Error(`no existe ${VIDEO} (pásalo con --video o usa --src)`);
  SRC = path.join(os.tmpdir(), "ssb-hero-frames-" + (arg("name", "") || "light")); // una carpeta por juego: los dos temas se pueden exportar a la vez
  fs.rmSync(SRC, { recursive: true, force: true });
  fs.mkdirSync(SRC, { recursive: true });
  console.log(`extrayendo ${VIDEO} → ${SRC}`);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", VIDEO, "-fps_mode", "passthrough", path.join(SRC, "f_%04d.png")], {
    stdio: "inherit",
  });
} else {
  SRC = path.resolve(arg("src"));
}
// --name dark: segundo juego de fotogramas (tema oscuro) en public/frames/dark y src/data/frames-dark.ts (FRAMES_DARK)
const NAME = arg("name", "");
// --key pink (fondo rosa, key.mjs) | dark (fondo casi negro, key-dark.mjs)
const KEY = arg("key", "pink");
const OUT = path.resolve(NAME ? `public/frames/${NAME}` : "public/frames");
const MANIFEST = path.resolve(NAME ? `src/data/frames-${NAME}.ts` : "src/data/frames.ts");
const EXPORT = NAME ? `FRAMES_${NAME.toUpperCase()}` : "FRAMES";
const PREFIX = NAME ? `/frames/${NAME}` : "/frames";
const IMG = path.resolve("public/images");
// Sello de cache: cambia en cada exportacion para que el navegador y la CDN no reutilicen fotogramas viejos con el mismo nombre
const STAMP = Date.now().toString(36);
const N_ARG = Number(arg("n", 0));
const NM_ARG = Number(arg("nm", 0));
// --reverse 0: el clip ya va de cerrada a abierta (vídeo generado con frame inicial y final)
const REVERSE = arg("reverse", "1") !== "0";
// --stills 0: no toca burger-cerrada.webp, burger-abierta.webp ni og.jpg
const STILLS = arg("stills", "1") !== "0";
// --only-manifest 1: no reescribe los webp (solo keyea el primero y el último) y regenera src/data/frames.ts
const ONLY_MANIFEST = arg("only-manifest", "0") === "1";
// --split N:P parte la banda N del fotograma abierto por la fila P (% del alto) para las etiquetas: las gotas de
// queso tocan la carne y el matte las ve como una sola banda.
const SPLITS = process.argv.map((v, i) => (v === "--split" ? process.argv[i + 1] : null)).filter(Boolean).map((s) => s.split(":").map(Number));
// h = escritorio (el vídeo 2K tal cual), d = móvil de alta densidad (uno de cada dos), m = móvil de baja densidad
const SIZES = {
  h: { w: 1440, h: 1920, quality: 80 },
  d: { w: 1080, h: 1440, quality: 80 },
  m: { w: 720, h: 960, quality: 80 },
};
// --sharpen sigma,m1,m2: máscara de enfoque suave antes de exportar (sharp.sharpen); vacío = sin enfoque
const SHARPEN = (arg("sharpen", "") || "").split(",").map(Number).filter((v) => !Number.isNaN(v));

const cl = (v, a, b) => (v < a ? a : v > b ? b : v);

if (!ONLY_MANIFEST) {
  // solo las subcarpetas de tamaños: public/frames contiene también public/frames/dark (el otro tema)
  for (const s of Object.keys(SIZES)) {
    fs.rmSync(path.join(OUT, s), { recursive: true, force: true });
    fs.mkdirSync(path.join(OUT, s), { recursive: true });
  }
}
fs.mkdirSync(IMG, { recursive: true });

// 1) lista única (sin duplicados consecutivos)
const files = fs
  .readdirSync(SRC)
  .filter((f) => /\.(jpe?g|png)$/i.test(f))
  .sort();
const uniq = [];
let prev = null;
for (const f of files) {
  const buf = await sharp(path.join(SRC, f)).resize(90, 120).raw().toBuffer();
  if (prev && buf.equals(prev)) continue;
  uniq.push(f);
  prev = buf;
}
console.log(`${files.length} fotogramas, ${uniq.length} únicos`);

// 2) invertir: índice 0 = cerrada
const ordered = REVERSE ? uniq.slice().reverse() : uniq.slice();
const N = N_ARG || ordered.length;
const NM = arg("nm", "0") === "all" ? N : NM_ARG || Math.ceil(N / 2);
const pick = Array.from({ length: N }, (_, i) => ordered[Math.round((i * (ordered.length - 1)) / (N - 1))]);
// índice de escritorio de cada fotograma de móvil (submuestreo uniforme)
const mobileOf = new Map(Array.from({ length: NM }, (_, j) => [Math.round((j * (N - 1)) / (NM - 1)), j]));

function alphaBBox({ data, w, h }, th = 40) {
  let minX = w,
    minY = h,
    maxX = 0,
    maxY = 0;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (data[(y * w + x) * 4 + 3] > th) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
  return { minX, minY, maxX, maxY };
}

// Bandas verticales de píxeles opacos (para colocar las etiquetas del hero).
function bands({ data, w, h }, th = 40) {
  const rows = [];
  for (let y = 0; y < h; y++) {
    let c = 0;
    for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > th) c++;
    rows.push(c);
  }
  const res = [];
  let start = -1;
  for (let y = 0; y <= h; y++) {
    const on = y < h && rows[y] > 20;
    if (on && start < 0) start = y;
    if (!on && start >= 0) {
      if (y - start > 8) res.push([Math.round((start / h) * 1000) / 10, Math.round((y / h) * 1000) / 10]);
      start = -1;
    }
  }
  return res;
}

// 3) matte + export
let closed = null,
  open = null;
const t0 = Date.now();
for (let i = 0; i < N; i++) {
  if (ONLY_MANIFEST && i !== 0 && i !== N - 1) continue;
  // holeLight 4: el brillo casi blanco del pan de arriba es un hueco cerrado apenas más claro que el fondo rosa; con el
  // valor por defecto (12) el matte lo tomaba por fondo y dejaba un agujero oscuro en la cerrada.
  // holeMin 600: los huecos pequeños (puntos de brillo) se rellenan siempre; los huecos reales entre capas son mucho mayores.
  const k =
    KEY === "dark"
      ? await keyDark(path.join(SRC, pick[i]), { lo: Number(arg("lo", 10)), hi: Number(arg("hi", 28)) })
      : await keyFrame(path.join(SRC, pick[i]), { shadowMax: Number(arg("shadow", 0)), holeLight: Number(arg("holeLight", 4)), holeMin: Number(arg("holeMin", 600)) });
  if (i === 0) closed = k;
  if (i === N - 1) open = k;
  let base = sharp(k.data, { raw: { width: k.w, height: k.h, channels: 4 } });
  if (SHARPEN.length === 3) base = base.sharpen({ sigma: SHARPEN[0], m1: SHARPEN[1], m2: SHARPEN[2] });
  const write = (s, idx) =>
    base
      .clone()
      .resize(SIZES[s].w, SIZES[s].h)
      .webp({ quality: SIZES[s].quality, alphaQuality: 90, effort: 5 })
      .toFile(path.join(OUT, s, `frame_${String(idx).padStart(3, "0")}.webp`));
  if (!ONLY_MANIFEST) {
    await write("h", i);
    await write("d", i);
    if (mobileOf.has(i)) await write("m", mobileOf.get(i));
  }
  process.stdout.write(`\r${i + 1}/${N} ${pick[i]}   `);
}
console.log(`\n${((Date.now() - t0) / 1000).toFixed(0)} s`);

// 4) stills
if (STILLS) {
const cb = alphaBBox(closed);
const side = Math.round(Math.max(cb.maxX - cb.minX, cb.maxY - cb.minY) * 1.12);
const cx = (cb.minX + cb.maxX) / 2,
  cy = (cb.minY + cb.maxY) / 2;
const left = Math.round(cl(cx - side / 2, 0, closed.w - side)),
  top = Math.round(cl(cy - side / 2, 0, closed.h - side));
const crop = { left, top, width: Math.min(side, closed.w), height: Math.min(side, closed.h) };
await sharp(closed.data, { raw: { width: closed.w, height: closed.h, channels: 4 } })
  .extract(crop)
  .resize(1000, 1000, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .webp({ quality: 88, alphaQuality: 90 })
  .toFile(path.join(IMG, "burger-cerrada.webp"));

await sharp(open.data, { raw: { width: open.w, height: open.h, channels: 4 } })
  .resize(SIZES.d.w, SIZES.d.h)
  .webp({ quality: 88, alphaQuality: 90 })
  .toFile(path.join(IMG, "burger-abierta.webp"));

// OG 1200×630: hamburguesa cerrada a la derecha sobre negro
const burger = await sharp(closed.data, { raw: { width: closed.w, height: closed.h, channels: 4 } })
  .extract(crop)
  .resize(600, 600, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#0B0A09" } })
  .composite([{ input: burger, left: 560, top: 15 }])
  .jpeg({ quality: 88 })
  .toFile(path.join(IMG, "og.jpg"));
}

// 5) manifiesto para el componente: tamaños, caja de la cerrada (fotograma 0) y bandas de la abierta (último)
const cb0 = alphaBBox(closed);
const openBands = bands(open);
for (const [n, p] of SPLITS) {
  const b = openBands[n - 1];
  if (!b || p <= b[0] || p >= b[1]) {
    console.log(`--split ${n}:${p}: no cae dentro de la banda ${n} (${b}); se ignora`);
    continue;
  }
  openBands.splice(n - 1, 1, [b[0], Math.round(p * 10) / 10], [Math.round(p * 10) / 10, b[1]]);
}
const closedBox = {
  top: Math.round((cb0.minY / closed.h) * 1000) / 10,
  bottom: Math.round((cb0.maxY / closed.h) * 1000) / 10,
  x: [Math.round((cb0.minX / closed.w) * 1000) / 10, Math.round((cb0.maxX / closed.w) * 1000) / 10],
};
// Borde derecho (y izquierdo) de píxeles opacos de cada banda del fotograma abierto, % del ancho: el punto de
// cada etiqueta se coloca a un margen fijo del borde de SU capa (el pan, la lechuga y el queso no miden igual).
const edges = openBands.map(([a, b]) => {
  const ya = Math.round((a / 100) * open.h), yb = Math.round((b / 100) * open.h);
  let minX = open.w, maxX = 0;
  for (let y = ya; y <= yb && y < open.h; y++)
    for (let x = 0; x < open.w; x++)
      if (open.data[(y * open.w + x) * 4 + 3] > 40) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
  return [Math.round((minX / open.w) * 1000) / 10, Math.round((maxX / open.w) * 1000) / 10];
});
const openLeft = edges.map((e) => e[0]), openRight = edges.map((e) => e[1]);
fs.writeFileSync(
  MANIFEST,
  `// Generado por scripts/frames.mjs — no editar a mano. Porcentajes respecto al fotograma 3:4.
export type FrameSize = "h" | "d" | "m";

export const ${EXPORT} = {
  sizes: {
    h: { width: ${SIZES.h.w}, height: ${SIZES.h.h}, count: ${N} },
    d: { width: ${SIZES.d.w}, height: ${SIZES.d.h}, count: ${N} },
    m: { width: ${SIZES.m.w}, height: ${SIZES.m.h}, count: ${NM} },
  },
  /** caja de píxeles opacos de la hamburguesa cerrada (fotograma 0), % del alto y del ancho */
  closed: ${JSON.stringify(closedBox)},
  /** bandas verticales de píxeles opacos del fotograma abierto (último), % del alto */
  openBands: ${JSON.stringify(openBands)} as [number, number][],
  /** bordes izquierdo y derecho de píxeles opacos de cada banda abierta, % del ancho (misma lista que openBands) */
  openLeft: ${JSON.stringify(openLeft)},
  openRight: ${JSON.stringify(openRight)},
  path: (i: number, size: FrameSize) => \`${PREFIX}/\${size}/frame_\${String(i).padStart(3, "0")}.webp?v=${STAMP}\`,
};
`,
);

for (const s of Object.keys(SIZES)) {
  const dir = path.join(OUT, s);
  const total = fs.readdirSync(dir).reduce((acc, f) => acc + fs.statSync(path.join(dir, f)).size, 0);
  console.log(`frames/${s}: ${s === "m" ? NM : N} × ${SIZES[s].w}×${SIZES[s].h} → ${(total / 1024 / 1024).toFixed(2)} MB`);
}
console.log("cerrada bbox %:", closedBox);
console.log("bandas cerrada:", bands(closed));
console.log("bandas abierta:", bands(open));
