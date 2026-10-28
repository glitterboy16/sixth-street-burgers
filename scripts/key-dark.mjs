// Matte para los fotogramas del hero generados sobre fondo casi negro (tema oscuro).
//
// Sobre negro no hace falta el matte por croma de key.mjs: el alfa es la distancia al fondo (el canal que más
// se separe por encima de un modelo bilineal del fondo estimado en las esquinas), con rampa entre lo y hi;
// una apertura 3×3 quita las motas del códec y un promedio 3×3 suaviza el borde. El color se deja tal cual:
// la contaminación del fondo es negra.
//
// Las zonas de la hamburguesa tan oscuras como el fondo (grietas de la carne, sombras entre capas) saldrían
// transparentes; como la web pone luz y sombra DETRÁS de la hamburguesa, eso se vería a través de ella. Por
// eso solo queda transparente lo que está conectado con el borde del fotograma (el fondo de verdad): los
// huecos encerrados se rellenan opacos con su color casi negro.

import sharp from "sharp";

const cl = (v, a, b) => (v < a ? a : v > b ? b : v);

export const DEFAULTS = {
  lo: 10, // diferencia (0-255) a partir de la que empieza el objeto
  hi: 28, // ... y a partir de la que es opaco del todo
  minArea: 120, // componentes sueltos (motas del códec) con menos píxeles se descartan
  fill: true, // rellenar los huecos que no tocan el fondo exterior
  maxHole: 6000, // ... solo si tienen menos de tantos píxeles (a 1440×1920: grietas, no el aire entre capas)
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
  // Motas: en vez de una apertura (que se come los hilos de queso finos), fuera los componentes sueltos de
  // menos de minArea píxeles; los hilos, pegados a la hamburguesa, forman parte del componente grande.
  {
    const on = new Uint8Array(N);
    for (let i = 0; i < N; i++) on[i] = a0[i] >= 0.5 ? 1 : 0;
    const seenC = new Uint8Array(N);
    const st = [];
    const comp = [];
    for (let i = 0; i < N; i++) {
      if (!on[i] || seenC[i]) continue;
      comp.length = 0;
      seenC[i] = 1;
      st.push(i);
      while (st.length) {
        const j = st.pop();
        comp.push(j);
        const x = j % w,
          y = (j - x) / w;
        for (const k of [x > 0 ? j - 1 : -1, x < w - 1 ? j + 1 : -1, y > 0 ? j - w : -1, y < h - 1 ? j + w : -1])
          if (k >= 0 && on[k] && !seenC[k]) {
            seenC[k] = 1;
            st.push(k);
          }
      }
      if (comp.length < opt.minArea) for (const j of comp) a0[j] = 0;
    }
  }
  const al = pass(a0, "mean");

  // relleno: el fondo exterior es lo que se alcanza desde el borde del fotograma por píxeles casi
  // transparentes; todo lo demás (huecos encerrados) pasa a opaco. Los 2 px junto al exterior conservan su
  // alfa para no perder la pluma del borde.
  if (opt.fill) {
    const outside = new Uint8Array(N);
    const stack = [];
    const seed = (i) => {
      if (!outside[i] && al[i] < 0.5) {
        outside[i] = 1;
        stack.push(i);
      }
    };
    for (let x = 0; x < w; x++) {
      seed(x);
      seed((h - 1) * w + x);
    }
    for (let y = 0; y < h; y++) {
      seed(y * w);
      seed(y * w + w - 1);
    }
    while (stack.length) {
      const i = stack.pop();
      const x = i % w,
        y = (i - x) / w;
      if (x > 0) seed(i - 1);
      if (x < w - 1) seed(i + 1);
      if (y > 0) seed(i - w);
      if (y < h - 1) seed(i + w);
    }
    // 2 px de margen alrededor del exterior
    const nearOut = new Uint8Array(N);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (!outside[i]) continue;
        for (let dy = -2; dy <= 2; dy++) {
          const yy = y + dy;
          if (yy < 0 || yy >= h) continue;
          for (let dx = -2; dx <= 2; dx++) {
            const xx = x + dx;
            if (xx >= 0 && xx < w) nearOut[yy * w + xx] = 1;
          }
        }
      }
    // interior: lo semitransparente pasa a opaco; los huecos (alfa < 0,5) se rellenan solo si son pequeños
    // (grietas de la carne). Los grandes son huecos de verdad —el aire entre las gotas de queso y la carne—
    // y se dejan ver.
    const seen = new Uint8Array(N);
    const comp = [];
    for (let i = 0; i < N; i++) {
      if (nearOut[i]) continue;
      if (al[i] >= 0.5) {
        al[i] = 1;
        continue;
      }
      if (seen[i]) continue;
      comp.length = 0;
      seen[i] = 1;
      stack.push(i);
      while (stack.length) {
        const j = stack.pop();
        comp.push(j);
        const x = j % w,
          y = (j - x) / w;
        for (const k of [x > 0 ? j - 1 : -1, x < w - 1 ? j + 1 : -1, y > 0 ? j - w : -1, y < h - 1 ? j + w : -1]) {
          if (k >= 0 && !seen[k] && !nearOut[k] && al[k] < 0.5) {
            seen[k] = 1;
            stack.push(k);
          }
        }
      }
      if (comp.length < opt.maxHole) for (const j of comp) al[j] = 1;
    }
  }

  const out = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) {
    out[i * 4] = data[i * 3];
    out[i * 4 + 1] = data[i * 3 + 1];
    out[i * 4 + 2] = data[i * 3 + 2];
    out[i * 4 + 3] = Math.round(al[i] * 255);
  }
  return { data: out, w, h };
}
