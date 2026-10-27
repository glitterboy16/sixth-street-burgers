// Matte de los fotogramas del hero: fondo rosa plano → RGBA limpio.
//
// 1. Modelo de fondo bilineal a partir de las 4 esquinas (el fondo tiene un degradado suave).
// 2. Máscara de objeto por croma (nunca por brillo, para no coger las vetas translúcidas entre capas),
//    con relleno de huecos (brillos especulares del pan, interior de la cebolla).
// 3. Borde: alfa por proyección P = a·F + (1-a)·B, donde F es el color del núcleo más cercano, y color
//    descontaminado (sin el rosa). Brillos más claros que el fondo cuentan como objeto sólo en el borde.
// 4. Sombra proyectada (más oscuro sin cambio de tono) como negro semitransparente, lejos del objeto.
// 5. Se eliminan los componentes pequeños (motas).

import sharp from "sharp";

const cl = (v, a, b) => (v < a ? a : v > b ? b : v);

export const DEFAULTS = {
  chroma: 0.02, // umbral de croma para el núcleo
  chromaDark: 0.032, // umbral en píxeles oscuros (dl < -darkFrom): la sombra densa trae bloques de croma del códec
  darkFrom: 60,
  holeMin: 60, // huecos encerrados de al menos tantos px se evalúan: ¿dejan ver el fondo?
  holeChroma: 0.014, // ... sí, si su croma medio es el del fondo
  holeDark: 40, // ... y no son mucho más oscuros (sombra suave) ...
  holeLight: 12, // ... ni más claros (brillo, interior blanco de la cebolla) que el fondo
  close: 3, // px de cierre morfológico antes de rellenar huecos
  band: 5, // px de borde exterior con alfa suave
  inner: 2, // px de borde interior re-evaluados
  lumEdge: 12, // brillo (dl) a partir del cual un píxel claro del borde cuenta como objeto
  shadowStart: 10, // dl a partir del cual empieza la sombra (en negativo)
  shadowRange: 60,
  shadowMax: 0, // 0 = sin sombra horneada (la pinta la web con CSS); 0.5 para conservar la del vídeo
  shadowFade: 0.16, // fracción del ancho/alto en la que la sombra se desvanece hacia el borde
  alphaTrim: 0.06, // recorta el alfa residual (< 6 %) del borde y satura el > 94 %: sin halo fino
  edgeChroma: 0.03, // si el núcleo vecino tiene al menos este croma, el alfa del borde se limita por croma
  chromaFloor: 0.008, // ruido de croma del fondo (y de su sombra): por debajo, el borde no cuenta como objeto
  guideR: 3, // radio del filtro guiado por luminancia (0 = desactivado)
  guideEps: 0.004, // regularización del filtro guiado (luminancia 0..1): menor = sigue más los bordes
  minArea: 120, // componentes con menos píxeles se descartan
};

export async function keyFrame(file, o = {}) {
  const opt = { ...DEFAULTS, ...o };
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width,
    h = info.height,
    N = w * h;

  // --- 1. fondo bilineal
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
  const bgAt = (x, y) => {
    const u = x / (w - 1),
      v = y / (h - 1);
    return [0, 1, 2].map((c) => (TL[c] * (1 - u) + TR[c] * u) * (1 - v) + (BL[c] * (1 - u) + BR[c] * u) * v);
  };

  // --- 2. croma / brillo relativos al fondo local
  const dc = new Float32Array(N),
    dl = new Float32Array(N);
  const bgR = new Float32Array(N),
    bgG = new Float32Array(N),
    bgB = new Float32Array(N);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x,
        k = i * 3;
      const [br, bg, bb] = bgAt(x, y);
      bgR[i] = br;
      bgG[i] = bg;
      bgB[i] = bb;
      const bs = br + bg + bb,
        r = data[k],
        g = data[k + 1],
        b = data[k + 2],
        s = r + g + b || 1;
      dc[i] = Math.hypot(r / s - br / bs, g / s - bg / bs);
      dl[i] = s / 3 - bs / 3;
    }
  }

  // núcleo por croma + huecos rellenos (flood fill desde el borde sobre el "no objeto").
  // Antes de rellenar se cierra la máscara (dilatar + erosionar `close` px) para que los huecos con
  // pequeñas aberturas (interior blanco de los aros de cebolla) cuenten como encerrados.
  // Umbral más exigente en los píxeles oscuros: la sombra densa pegada al objeto trae bloques de croma
  // del códec (dc 0,02-0,03 con dl -115..-70) que no son objeto. Los píxeles del objeto con tan poco
  // croma son interiores (se rellenan como huecos) o de borde (los resuelve la banda por proyección).
  // El croma del vídeo (4:2:0) va a media resolución y con bloques: el núcleo usa la media 3×3 del croma
  // (sin ruido de bloque) y, además, el croma puntual cuando es claramente de objeto (estructuras finas
  // como la membrana de la cebolla).
  const dcs = new Float32Array(N);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const x0 = x > 0 ? x - 1 : x,
        x1 = x < w - 1 ? x + 1 : x,
        y0 = y > 0 ? y - 1 : y,
        y1 = y < h - 1 ? y + 1 : y;
      let s = 0,
        c = 0;
      for (let yy = y0; yy <= y1; yy++)
        for (let xx = x0; xx <= x1; xx++) {
          s += dc[yy * w + xx];
          c++;
        }
      dcs[y * w + x] = s / c;
    }
  const core = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    const th = dl[i] < -opt.darkFrom ? opt.chromaDark : opt.chroma;
    core[i] = dcs[i] > th || dc[i] > 2 * th ? 1 : 0;
  }
  {
    const morph = (mask, passes, grow) => {
      let cur = mask;
      for (let p = 0; p < passes; p++) {
        const nxt = new Uint8Array(cur);
        for (let y = 0; y < h; y++)
          for (let x = 0; x < w; x++) {
            const i = y * w + x;
            if (cur[i] === (grow ? 1 : 0)) continue;
            const x0 = x > 0 ? x - 1 : x,
              x1 = x < w - 1 ? x + 1 : x,
              y0 = y > 0 ? y - 1 : y,
              y1 = y < h - 1 ? y + 1 : y;
            let hit = false;
            for (let yy = y0; yy <= y1 && !hit; yy++)
              for (let xx = x0; xx <= x1; xx++)
                if (cur[yy * w + xx] === (grow ? 1 : 0)) {
                  hit = true;
                  break;
                }
            if (hit) nxt[i] = grow ? 1 : 0;
          }
        cur = nxt;
      }
      return cur;
    };
    const closed = morph(morph(core, opt.close, true), opt.close, false);
    const outside = new Uint8Array(N);
    const stack = [];
    for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
    for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
    while (stack.length) {
      const i = stack.pop();
      if (outside[i] || closed[i]) continue;
      outside[i] = 1;
      const x = i % w,
        y = (i / w) | 0;
      if (x > 0) stack.push(i - 1);
      if (x < w - 1) stack.push(i + 1);
      if (y > 0) stack.push(i - w);
      if (y < h - 1) stack.push(i + w);
    }
    // Huecos encerrados → núcleo, salvo los que dejan ver el fondo (el agujero de un aro de cebolla: mismo
    // croma que el fondo y apenas más oscuro): esos se quedan transparentes. Los brillos del pan, el
    // interior blanco de la cebolla o las grietas oscuras no se parecen al fondo y sí se rellenan.
    // El contorno real sigue siendo el del croma (no el cerrado).
    {
      const seen = new Uint8Array(N);
      const comp = [];
      for (let s0 = 0; s0 < N; s0++) {
        if (seen[s0] || outside[s0] || closed[s0]) continue;
        comp.length = 0;
        let sdc = 0,
          sdl = 0;
        stack.push(s0);
        seen[s0] = 1;
        while (stack.length) {
          const i = stack.pop();
          comp.push(i);
          sdc += dc[i];
          sdl += dl[i];
          const x = i % w,
            y = (i / w) | 0;
          const push = (j) => {
            if (!seen[j] && !outside[j] && !closed[j]) {
              seen[j] = 1;
              stack.push(j);
            }
          };
          if (x > 0) push(i - 1);
          if (x < w - 1) push(i + 1);
          if (y > 0) push(i - w);
          if (y < h - 1) push(i + w);
        }
        const n = comp.length,
          mdc = sdc / n,
          mdl = sdl / n;
        const seeThrough = n >= opt.holeMin && mdc < opt.holeChroma && mdl > -opt.holeDark && mdl < opt.holeLight;
        for (const i of comp) {
          if (seeThrough) outside[i] = 1;
          else core[i] = 1;
        }
      }
    }
    for (let i = 0; i < N; i++) if (!outside[i] && closed[i] && !core[i]) core[i] = 1;
  }

  // --- 3. distancia al núcleo (hacia fuera) y color F del núcleo más cercano; distancia al exterior (hacia dentro)
  const distOut = new Int16Array(N).fill(-1); // 0 = núcleo
  const src = new Int32Array(N).fill(-1); // índice del píxel de núcleo más cercano
  for (let i = 0; i < N; i++)
    if (core[i]) {
      distOut[i] = 0;
      src[i] = i;
    }
  const nb = (i, fn) => {
    const x = i % w,
      y = (i / w) | 0;
    if (x > 0) fn(i - 1);
    if (x < w - 1) fn(i + 1);
    if (y > 0) fn(i - w);
    if (y < h - 1) fn(i + w);
    if (x > 0 && y > 0) fn(i - w - 1);
    if (x < w - 1 && y > 0) fn(i - w + 1);
    if (x > 0 && y < h - 1) fn(i + w - 1);
    if (x < w - 1 && y < h - 1) fn(i + w + 1);
  };
  for (let d = 1; d <= opt.band; d++) {
    for (let i = 0; i < N; i++) {
      if (distOut[i] !== -1) continue;
      let found = -1;
      nb(i, (j) => {
        if (found < 0 && distOut[j] === d - 1) found = src[j];
      });
      if (found >= 0) {
        distOut[i] = d;
        src[i] = found;
      }
    }
  }
  const distIn = new Int16Array(N).fill(-1); // 0 = exterior del núcleo
  for (let i = 0; i < N; i++) if (!core[i]) distIn[i] = 0;
  for (let d = 1; d <= opt.inner; d++) {
    for (let i = 0; i < N; i++) {
      if (distIn[i] !== -1) continue;
      let hit = false;
      nb(i, (j) => {
        if (distIn[j] === d - 1) hit = true;
      });
      if (hit) distIn[i] = d;
    }
  }
  // color F: para el borde interior, el núcleo profundo más cercano; lo aproximamos con el propio src tras una
  // propagación hacia dentro de `inner` px desde los píxeles profundos.
  const deep = new Int32Array(N).fill(-1);
  for (let i = 0; i < N; i++) if (core[i] && distIn[i] === -1) deep[i] = i;
  for (let d = 0; d < opt.inner + opt.band; d++) {
    for (let i = 0; i < N; i++) {
      if (deep[i] !== -1) continue;
      let found = -1;
      nb(i, (j) => {
        if (found < 0 && deep[j] >= 0) found = deep[j];
      });
      if (found >= 0) deep[i] = found;
    }
  }

  // --- 4. alfa y color
  const out = Buffer.alloc(N * 4);
  const alpha = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const k = i * 3,
      o = i * 4;
    const r = data[k],
      g = data[k + 1],
      b = data[k + 2];
    const br = bgR[i],
      bg = bgG[i],
      bb = bgB[i];
    const inCore = core[i] === 1 && distIn[i] === -1;
    const edge = (core[i] === 1 && distIn[i] >= 1) || (core[i] === 0 && distOut[i] >= 1);

    let a = 0,
      cr = r,
      cg = g,
      cb = b;
    if (inCore) {
      a = 1;
    } else if (edge) {
      const f = deep[i] >= 0 ? deep[i] : src[i];
      const fr = data[f * 3],
        fg = data[f * 3 + 1],
        fb = data[f * 3 + 2];
      const dr = fr - br,
        dg = fg - bg,
        db = fb - bb;
      const den = dr * dr + dg * dg + db * db || 1;
      const proj = ((r - br) * dr + (g - bg) * dg + (b - bb) * db) / den;
      const lum = cl((dl[i] - opt.lumEdge) / 30, 0, 1);
      a = cl(Math.max(proj, lum), 0, 1);
      // La sombra de contacto es "fondo más oscuro": proyecta sobre F-B (F es oscuro) y saldría con alfa
      // sin ser objeto. Si F tiene croma propio, la cobertura real se lee en el croma del píxel: un píxel
      // de sombra pura tiene el croma del fondo → alfa ≈ 0. Los brillos (lum) no se tocan.
      {
        const fs = fr + fg + fb || 1,
          bs = br + bg + bb || 1;
        const dcF = Math.hypot(fr / fs - br / bs, fg / fs - bg / bs);
        if (dcF >= opt.edgeChroma) a = Math.min(a, Math.max(lum, (1.3 * Math.max(0, dc[i] - opt.chromaFloor)) / dcF));
      }
      if (core[i]) a = Math.max(a, 0.35); // dentro del núcleo nunca desaparece
      if (a > 0.01) {
        // descontaminación: color sin la parte de fondo; con alfa bajo tiende al color del núcleo
        const ur = cl((r - br * (1 - a)) / a, 0, 255),
          ug = cl((g - bg * (1 - a)) / a, 0, 255),
          ub = cl((b - bb * (1 - a)) / a, 0, 255);
        const t = cl((a - 0.15) / 0.6, 0, 1);
        cr = fr + (ur - fr) * t;
        cg = fg + (ug - fg) * t;
        cb = fb + (ub - fb) * t;
      }
    }
    if (a > 0 && a < 1 && opt.alphaTrim > 0) a = cl((a - opt.alphaTrim) / (1 - 2 * opt.alphaTrim), 0, 1);
    // sombra proyectada: más oscuro que el fondo sin cambio de tono. Se desvanece hacia los bordes del
    // fotograma para que no quede cortada en seco donde el vídeo la recorta.
    let as = 0;
    if (opt.shadowMax > 0 && dc[i] < 0.03 && dl[i] < -opt.shadowStart) {
      const x = i % w,
        y = (i / w) | 0;
      const fx = cl(Math.min(x, w - 1 - x) / (w * opt.shadowFade), 0, 1);
      const fy = cl(Math.min(y, h - 1 - y) / (h * opt.shadowFade), 0, 1);
      const fade = fx * fx * (3 - 2 * fx) * (fy * fy * (3 - 2 * fy));
      as = cl((-dl[i] - opt.shadowStart) / opt.shadowRange, 0, 1) * opt.shadowMax * fade;
    }
    if (as > 0 && a < 1) {
      const tot = a + as * (1 - a);
      cr = (cr * a) / tot;
      cg = (cg * a) / tot;
      cb = (cb * a) / tot;
      a = tot;
    }
    if (a < 0.015) a = 0;
    alpha[i] = a;
    out[o] = cr;
    out[o + 1] = cg;
    out[o + 2] = cb;
    out[o + 3] = Math.round(a * 255);
  }

  // --- 4b. borde limpio: erosionar 1 px (fuera el píxel más contaminado por el fondo), suavizar el alfa
  // (antialias) y extender el color del interior hacia el borde (ningún píxel claro de mezcla).
  {
    const er = new Float32Array(N);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        let m = alpha[i];
        if (m > 0) {
          const x0 = x > 0 ? x - 1 : x,
            x1 = x < w - 1 ? x + 1 : x,
            y0 = y > 0 ? y - 1 : y,
            y1 = y < h - 1 ? y + 1 : y;
          for (let yy = y0; yy <= y1; yy++)
            for (let xx = x0; xx <= x1; xx++) {
              const v = alpha[yy * w + xx];
              if (v < m) m = v;
            }
        }
        er[i] = m;
      }
    const tmp = new Float32Array(N);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const l2 = er[y * w + Math.max(0, x - 2)],
          l = er[y * w + Math.max(0, x - 1)],
          r = er[y * w + Math.min(w - 1, x + 1)],
          r2 = er[y * w + Math.min(w - 1, x + 2)];
        tmp[i] = (l2 + 4 * l + 6 * er[i] + 4 * r + r2) / 16;
      }
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const u2 = tmp[Math.max(0, y - 2) * w + x],
          u = tmp[Math.max(0, y - 1) * w + x],
          d = tmp[Math.min(h - 1, y + 1) * w + x],
          d2 = tmp[Math.min(h - 1, y + 2) * w + x];
        const a = (u2 + 4 * u + 6 * tmp[i] + 4 * d + d2) / 16;
        alpha[i] = a;
        const o = i * 4;
        out[o + 3] = Math.round(a * 255);
        // fuera del núcleo profundo: color del núcleo más cercano
        if (a > 0 && a < 0.999 && (core[i] === 0 || distIn[i] >= 1) && deep[i] >= 0) {
          const f = deep[i] * 3;
          out[o] = data[f];
          out[o + 1] = data[f + 1];
          out[o + 2] = data[f + 2];
        }
      }
  }

  // --- 4c. refinado guiado por luminancia (He et al.). El contorno del núcleo viene del croma, que en un
  // vídeo 4:2:0 va a media resolución y deja escalones de 2 px. El filtro guiado ajusta el alfa a los
  // bordes de luminancia, que sí están a resolución completa, y lo suaviza donde no hay borde.
  if (opt.guideR > 0) {
    const r = opt.guideR,
      eps = opt.guideEps;
    const W1 = w + 1;
    const box = (src) => {
      const sat = new Float64Array(W1 * (h + 1));
      for (let y = 1; y <= h; y++) {
        let row = 0;
        for (let x = 1; x <= w; x++) {
          row += src[(y - 1) * w + (x - 1)];
          sat[y * W1 + x] = sat[(y - 1) * W1 + x] + row;
        }
      }
      const res = new Float32Array(N);
      for (let y = 0; y < h; y++) {
        const y0 = Math.max(0, y - r),
          y1 = Math.min(h - 1, y + r);
        for (let x = 0; x < w; x++) {
          const x0 = Math.max(0, x - r),
            x1 = Math.min(w - 1, x + r);
          const s = sat[(y1 + 1) * W1 + (x1 + 1)] - sat[y0 * W1 + (x1 + 1)] - sat[(y1 + 1) * W1 + x0] + sat[y0 * W1 + x0];
          res[y * w + x] = s / ((y1 - y0 + 1) * (x1 - x0 + 1));
        }
      }
      return res;
    };
    const I = new Float32Array(N);
    for (let i = 0; i < N; i++) I[i] = (data[i * 3] + data[i * 3 + 1] + data[i * 3 + 2]) / 765;
    // alfa previo: el filtro no puede dar alfa a un píxel de fondo (sin croma) que no lo tenía, aunque sea
    // oscuro — así no se cuela la sombra de contacto bajo el pan como un filete oscuro.
    const pre = Float32Array.from(alpha);
    const II = new Float32Array(N),
      IP = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      II[i] = I[i] * I[i];
      IP[i] = I[i] * alpha[i];
    }
    const mI = box(I),
      mP = box(alpha),
      mII = box(II),
      mIP = box(IP);
    const A = new Float32Array(N),
      B = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const vI = mII[i] - mI[i] * mI[i];
      const cIP = mIP[i] - mI[i] * mP[i];
      A[i] = cIP / (vI + eps);
      B[i] = mP[i] - A[i] * mI[i];
    }
    const mA = box(A),
      mB = box(B);
    for (let i = 0; i < N; i++) {
      let a = mA[i] * I[i] + mB[i];
      a = a < 0 ? 0 : a > 1 ? 1 : a;
      if (a < opt.alphaTrim) a = 0;
      else if (a > 1 - opt.alphaTrim) a = 1;
      // sin alfa donde no hay color de núcleo que extender hacia el borde
      if (a > 0 && a < 1 && core[i] === 0 && deep[i] < 0) a = 0;
      if (a > 0 && pre[i] === 0 && dc[i] < 2 * opt.chromaFloor) a = 0;
      alpha[i] = a;
      const o = i * 4;
      out[o + 3] = Math.round(a * 255);
      if (a > 0 && a < 1 && (core[i] === 0 || distIn[i] >= 1) && deep[i] >= 0) {
        const f = deep[i] * 3;
        out[o] = data[f];
        out[o + 1] = data[f + 1];
        out[o + 2] = data[f + 2];
      }
    }
  }

  // --- 5. motas: componentes conexos pequeños (alfa > .05) fuera del objeto principal
  {
    const seen = new Uint8Array(N);
    const stack = [];
    for (let s0 = 0; s0 < N; s0++) {
      if (seen[s0] || alpha[s0] <= 0.05) continue;
      const comp = [];
      stack.push(s0);
      seen[s0] = 1;
      while (stack.length) {
        const i = stack.pop();
        comp.push(i);
        nb(i, (j) => {
          if (!seen[j] && alpha[j] > 0.05) {
            seen[j] = 1;
            stack.push(j);
          }
        });
      }
      // (aunque tengan núcleo: una mota de 100 px no es un ingrediente)
      if (comp.length < opt.minArea) for (const i of comp) out[i * 4 + 3] = 0;
    }
  }

  return { data: out, w, h };
}
