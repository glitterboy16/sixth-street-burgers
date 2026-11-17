// Exporta un juego de fotogramas del hero a pantalla completa (la Smash Burger real en el bar, fondo incluido).
//
//   node scripts/frames-hero.mjs --set ancho --video ../renders/smash-fondo/video2/final-ancho.mp4 --meta ../renders/smash-fondo/video2/meta-ancho.json
//   node scripts/frames-hero.mjs --set alto  --video ../renders/smash-fondo/video2/final-alto.mp4  --meta ../renders/smash-fondo/video2/meta-alto.json
//
// - "ancho" = 16:9 (escritorio y tablet apaisada), "alto" = 9:16 (móvil y tablet de pie). La web elige por la
//   proporción de la pantalla y pinta el fotograma tipo "cover" con la hamburguesa en zona segura.
// - El vídeo va de cerrada (primer fotograma) a abierta (último). Fondo idéntico en los dos extremos: la mesa no se mueve.
// - meta.json (medido con BiRefNet sobre el primer y el último fotograma, en % del fotograma):
//     { "closed": [l, t, r, b], "open": [l, t, r, b], "labels": [{ "y": 20, "right": 70 }, ... 5] }
// - Escribe public/frames/<set>/{h,m}/frame_NNN.webp y src/data/hero-<set>.json.
// - --video también puede ser una secuencia de PNG ("carpeta/f_%04d.png"), p. ej. la del papel fijado
//   (renders/hero5/papel/fijar_papel.py); si el meta trae "tops" (alto de la torre por fotograma, en %), pasa al
//   manifiesto y la web encuadra con la altura real de la hamburguesa en cada momento.
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > -1 ? process.argv[i + 1] : d;
};
const SET = arg("set");
if (SET !== "ancho" && SET !== "alto") throw new Error("--set ancho | alto");
const VIDEO = path.resolve(arg("video"));
const META = JSON.parse(fs.readFileSync(path.resolve(arg("meta")), "utf8"));
const OUT = path.resolve(`public/frames/${SET}`);
const MANIFEST = path.resolve(`src/data/hero-${SET}.json`);
const STAMP = Date.now().toString(36);
// h: pantallas grandes o de alta densidad; m: el resto (la web elige según los píxeles reales del canvas)
// proporción nativa del vídeo de MiniMax H3 2K (2544×1456)
// ancho h = resolución nativa del vídeo (2544x1456): en pantallas grandes el canvas pedía más de 1920 px y estiraba
const SIZES = SET === "ancho" ? { h: [2544, 1456, 74], m: [1280, 733, 74] } : { h: [1099, 1920, 76], m: [733, 1280, 74] };
// --vf: filtro de ffmpeg al extraer (p. ej. "eq=gamma=1.12" para igualar el brillo de la foto de partida)
const VF = arg("vf", "");
// --plate DIR (solo "ancho"): prolongación del bar a la izquierda hecha con renders/smash-fondo/herramientas/
// placa_izquierda.py (DIR/placa.png con alfa + DIR/placa.json { ext, fade } en fracción del ancho del vídeo).
// Escribe public/frames/ancho/plate-{h,m}.webp y añade "plate" al manifiesto.
const PLATE = arg("plate", "");

const tmp = path.join(os.tmpdir(), `ssb-frames-${SET}`);
fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(tmp, { recursive: true });
console.log("extrayendo", VIDEO);
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", VIDEO, ...(VF ? ["-vf", VF] : []), "-fps_mode", "passthrough", path.join(tmp, "f_%04d.png")], { stdio: "inherit" });
const files = fs.readdirSync(tmp).filter((f) => f.endsWith(".png")).sort();
console.log(files.length, "fotogramas");

for (const s of Object.keys(SIZES)) {
  fs.rmSync(path.join(OUT, s), { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, s), { recursive: true });
}
let done = 0;
await Promise.all(
  Array.from({ length: 6 }, async (_, w) => {
    for (let i = w; i < files.length; i += 6) {
      const src = path.join(tmp, files[i]);
      for (const [s, [W, H, q]] of Object.entries(SIZES)) {
        await sharp(src)
          .resize(W, H, { fit: "cover", kernel: "lanczos3" })
          .webp({ quality: q, effort: 5, smartSubsample: true })
          .toFile(path.join(OUT, s, `frame_${String(i).padStart(3, "0")}.webp`));
      }
      if (++done % 40 === 0) console.log(" ", done, "/", files.length);
    }
  }),
);

const sizes = {};
for (const [s, [W, H]] of Object.entries(SIZES)) sizes[s] = { width: W, height: H, count: files.length };
let plate;
if (PLATE) {
  plate = JSON.parse(fs.readFileSync(path.join(PLATE, "placa.json"), "utf8"));
  for (const [s, [W, H, q]] of Object.entries(SIZES)) {
    await sharp(path.join(PLATE, "placa.png"))
      .resize(Math.round((plate.ext + plate.fade) * W), H, { fit: "fill", kernel: "lanczos3" })
      .webp({ quality: q + 4, alphaQuality: 90, effort: 5, smartSubsample: true })
      .toFile(path.join(OUT, `plate-${s}.webp`));
  }
}
fs.writeFileSync(MANIFEST, JSON.stringify({ set: SET, stamp: STAMP, sizes, closed: META.closed, open: META.open, labels: META.labels, ...(META.tops ? { tops: META.tops } : {}), ...(plate ? { plate } : {}) }, null, 1) + "\n");
for (const s of Object.keys(SIZES)) {
  const dir = path.join(OUT, s);
  const total = fs.readdirSync(dir).reduce((a, f) => a + fs.statSync(path.join(dir, f)).size, 0);
  console.log(SET, s, (total / 1024 / 1024).toFixed(1), "MB");
}
fs.rmSync(tmp, { recursive: true, force: true });
