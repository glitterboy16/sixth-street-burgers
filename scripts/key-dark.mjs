// Matte para los fotogramas del hero generados sobre fondo casi negro (tema oscuro).
//
// Sobre negro no hace falta el matte por croma de key.mjs: el fondo de la web es casi negro, así que todo lo
// que sea tan oscuro como el fondo puede quedarse transparente sin que se note (se ve el fondo de la página,
// del mismo color). El alfa es la distancia al fondo (el canal que más se separe por encima de un modelo
// bilineal del fondo estimado en las esquinas), con rampa entre lo y hi; una apertura 3×3 quita las motas del
// códec y un promedio 3×3 suaviza el borde. El color se deja tal cual: la contaminación del fondo es negra.

import sharp from "sharp";

const cl = (v, a, b) => (v < a ? a : v > b ? b : v);

export const DEFAULTS = {
  lo: 10, // diferencia (0-255) a partir de la que empieza el objeto
  hi: 28, // ... y a partir de la que es opaco del todo
};

export async function keyDark(file, o = {}) {
  const opt = { ...DEFAULTS, ...o };
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width,
    h = info.height,
    N = w * h;

  // fondo bilineal a partir de las 4 esquinas
  const patch = (x0, y0) => {
    const acc = [0, 0, 0];
    for (let y = y0; y < y0 + 6; y++)
      for (let x = x0; x < x0 + 6; x++) for (let c = 0; c < 3; c++) acc[c] += data[(y * w + x) * 3 + c] / 36;
    return acc;
  };
  const TL = patch(6, 6),
    TR = patch(w - 12, 6),
    BL = patch(6, h - 12),
    BR = patch(w - 12, h - 12);

  const a0 = new Float32Array(N);
  for (let y = 0; y < h; y++) {
    const v = y / (h - 1);
    for (let x = 0; x < w; x++) {
      const u = x / (w - 1);
      const i = y * w + x;
      let d = 0;
      for (let c = 0; c < 3; c++) {
        const bg = (TL[c] * (1 - u) + TR[c] * u) * (1 - v) + (BL[c] * (1 - u) + BR[c] * u) * v;
        const diff = data[i * 3 + c] - bg;
        if (diff > d) d = diff;
      }
      a0[i] = cl((d - opt.lo) / (opt.hi - opt.lo), 0, 1);
    }
  }

  // apertura (mínimo y luego máximo 3×3): fuera las motas aisladas; después un promedio 3×3 para el borde
  const pass = (src, fn) => {
    const dst = new Float32Array(N);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        let acc = fn === "min" ? 1 : 0,
          n = 0;
        for (let dy = -1; dy <= 1; dy++) {
          const yy = y + dy;
          if (yy < 0 || yy >= h) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx;
            if (xx < 0 || xx >= w) continue;
            const s = src[yy * w + xx];
            if (fn === "min") acc = s < acc ? s : acc;
            else if (fn === "max") acc = s > acc ? s : acc;
            else acc += s;
            n++;
          }
        }
        dst[y * w + x] = fn === "mean" ? acc / n : acc;
      }
    return dst;
  };
  const al = pass(pass(pass(a0, "min"), "max"), "mean");

  const out = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) {
    out[i * 4] = data[i * 3];
    out[i * 4 + 1] = data[i * 3 + 1];
    out[i * 4 + 2] = data[i * 3 + 2];
    out[i * 4 + 3] = Math.round(al[i] * 255);
  }
  return { data: out, w, h };
}
