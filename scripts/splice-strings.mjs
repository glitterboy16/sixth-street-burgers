// Empalma en el vídeo fuente del hero un tramo generado aparte en el que los hilos de queso se rompen poco a
// poco. En los clips de MiniMax los hilos aguantan enteros hasta el fotograma A, en A+1 se funden a medias y
// en B ya no están: una rotura en un solo fotograma, que al hacer scroll se ve "de golpe".
//
//   node scripts/splice-strings.mjs --src ../hero-despiece-v2.mp4 --trans ../transicion-queso-claro.mp4 \
//        --out ../hero-despiece-v2b.mp4 [--a 70] [--b 72] [--k 7] [--drop 112,114,116,118,120,122]
//
// 1. Extrae a tamaño reducido los fotogramas del tramo generado y los A y B del vídeo fuente.
// 2. Mide en cada fotograma del tramo cuánto queda de hilos: diferencia media con B dentro de las filas donde A
//    y B difieren (la franja de los hilos), normalizada por la diferencia A-B → s(t) de 1 (hilos) a 0 (sin hilos).
// 3. Elige k fotogramas: para cada objetivo (k valores repartidos entre 1 y 0) el primer fotograma, en orden,
//    cuya s queda por debajo.
// 4. Monta el vídeo nuevo: fuente 0..A + los k elegidos + fuente B..final, quitando `drop` fotogramas de la cola
//    estática para que el total siga siendo el mismo (así frames.mjs muestrea igual que antes).

import sharp from "sharp";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > -1 ? process.argv[i + 1] : d;
};
const SRC = path.resolve(arg("src"));
const TRANS = path.resolve(arg("trans"));
const OUT = path.resolve(arg("out"));
const A = +arg("a", 70);
const B = +arg("b", 72);
const K = +arg("k", 7);
const DROP = arg("drop", "")
  .split(",")
  .filter(Boolean)
  .map(Number);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "splice-"));
const ff = (args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: ["ignore", "inherit", "inherit"] });
const probe = (file) =>
  +execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", file]).toString().trim();

const W = 360;
ff(["-i", TRANS, "-vf", `scale=${W}:-1`, path.join(tmp, "t_%04d.png")]);
ff(["-i", SRC, "-vf", `select='eq(n,${A})+eq(n,${B})',scale=${W}:-1`, "-fps_mode", "passthrough", path.join(tmp, "s_%04d.png")]);
const nT = fs.readdirSync(tmp).filter((f) => f.startsWith("t_")).length;
const nSrc = probe(SRC);
console.log(`fuente ${nSrc} fotogramas, tramo ${nT} fotogramas`);

const raw = async (f) => {
  const { data, info } = await sharp(f).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height };
};
const fa = await raw(path.join(tmp, "s_0001.png"));
const fb = await raw(path.join(tmp, "s_0002.png"));
const { w, h } = fa;
// franja de los hilos: filas donde A y B difieren claramente
const rowDiff = new Float32Array(h);
for (let y = 0; y < h; y++) {
  let acc = 0;
  for (let x = 0; x < w; x++) for (let c = 0; c < 3; c++) acc += Math.abs(fa.d[(y * w + x) * 3 + c] - fb.d[(y * w + x) * 3 + c]);
  rowDiff[y] = acc / (w * 3);
}
const peak = Math.max(...rowDiff);
const rows = [];
for (let y = 0; y < h; y++) if (rowDiff[y] > peak * 0.15) rows.push(y);
const y0 = Math.max(0, rows[0] - 4),
  y1 = Math.min(h - 1, rows[rows.length - 1] + 4);
console.log(`franja de hilos: filas ${y0}-${y1} de ${h} (${((y0 / h) * 100).toFixed(1)}-${((y1 / h) * 100).toFixed(1)} %)`);

const diffTo = (f, g, full = false) => {
  const ya = full ? 0 : y0,
    yb = full ? h - 1 : y1;
  let acc = 0;
  for (let y = ya; y <= yb; y++) for (let x = 0; x < w; x++) for (let c = 0; c < 3; c++) acc += Math.abs(f.d[(y * w + x) * 3 + c] - g.d[(y * w + x) * 3 + c]);
  return acc / ((yb - ya + 1) * w * 3);
};
const ab = diffTo(fa, fb);
const s = [];
const T = [];
for (let i = 1; i <= nT; i++) {
  const t = await raw(path.join(tmp, `t_${String(i).padStart(4, "0")}.png`));
  T.push(t);
  s.push(diffTo(t, fb) / ab);
}
console.log("s(t) =", s.map((v) => v.toFixed(2)).join(" "));
// cuánto se parecen el primer y el último fotograma del tramo a A y B (toda la imagen): continuidad del empalme
console.log(
  `continuidad (diff media 0-255, imagen entera): tramo[0] vs A = ${diffTo(T[0], fa, true).toFixed(2)}, tramo[fin] vs B = ${diffTo(T[nT - 1], fb, true).toFixed(2)}, A vs B = ${diffTo(fa, fb, true).toFixed(2)}`
);

// k objetivos repartidos entre la s del primer fotograma y la mínima del tramo (lo que de verdad llega a
// romperse): el primer fotograma cuya s baja de cada objetivo, siempre después del anterior elegido
const sMax = s[0],
  sMin = Math.min(...s),
  iMin = s.indexOf(sMin);
const targets = Array.from({ length: K }, (_, j) => sMax - ((j + 1) / K) * (sMax - sMin)); // el último es el mínimo
const chosen = [];
let from = 1;
for (const tg of targets) {
  let idx = -1;
  for (let i = from; i <= iMin; i++)
    if (s[i] <= tg) {
      idx = i;
      break;
    }
  if (idx < 0) idx = Math.min(iMin, from);
  if (idx >= nT - 1 || (chosen.length && idx <= chosen[chosen.length - 1])) break;
  chosen.push(idx);
  from = idx + 1;
}
console.log(`s: inicio ${sMax.toFixed(2)}, mínimo ${sMin.toFixed(2)} en el fotograma ${iMin}`);
console.log("elegidos (índice en el tramo → s):", chosen.map((i) => `${i}→${s[i].toFixed(2)}`).join(", "));
if (!chosen.length) throw new Error("ningún fotograma elegido");

// montaje: [fuente 0..A] + [tramo elegidos] + [fuente B..fin sin drop]
const selT = chosen.map((i) => `eq(n\\,${i})`).join("+");
const dropExpr = DROP.length ? "*" + DROP.map((n) => `not(eq(n\\,${n}))`).join("*") : "";
const fc =
  `[0:v]select='lte(n\\,${A})',setpts=N/FRAME_RATE/TB[head];` +
  `[1:v]select='${selT}',scale=1440:1920:flags=lanczos,setpts=N/FRAME_RATE/TB[mid];` +
  `[0:v]select='gte(n\\,${B})${dropExpr}',setpts=N/FRAME_RATE/TB[tail];` +
  `[head][mid][tail]concat=n=3:v=1:a=0,setpts=N/FRAME_RATE/TB[v]`;
ff(["-i", SRC, "-i", TRANS, "-filter_complex", fc, "-map", "[v]", "-r", "24", "-c:v", "libx264", "-preset", "slow", "-crf", "8", "-pix_fmt", "yuv420p", OUT]);
const nOut = probe(OUT);
console.log(`→ ${OUT}: ${nOut} fotogramas (fuente ${nSrc}, +${chosen.length} tramo, -${B - A - 1} entre A y B, -${DROP.length} cola)`);
fs.rmSync(tmp, { recursive: true, force: true });
