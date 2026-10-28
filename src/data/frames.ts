// Generado por scripts/frames.mjs — no editar a mano. Porcentajes respecto al fotograma 3:4.
export type FrameSize = "h" | "d" | "m";

export const FRAMES = {
  sizes: {
    h: { width: 1440, height: 1920, count: 72 },
    d: { width: 1080, height: 1440, count: 72 },
    m: { width: 720, height: 960, count: 36 },
  },
  /** caja de píxeles opacos de la hamburguesa cerrada (fotograma 0), % del alto y del ancho */
  closed: {"top":42.6,"bottom":93.6,"x":[13.8,84.2]},
  /** bandas verticales de píxeles opacos del fotograma abierto (último), % del alto */
  openBands: [[5.4,24.6],[26.9,40.6],[41.5,52.8],[52.8,74.4],[75.6,93.6]] as [number, number][],
  path: (i: number, size: FrameSize) => `/frames/${size}/frame_${String(i).padStart(3, "0")}.webp`,
};
