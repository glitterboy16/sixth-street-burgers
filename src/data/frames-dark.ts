// Generado por scripts/frames.mjs — no editar a mano. Porcentajes respecto al fotograma 3:4.
export type FrameSize = "d" | "m";

export const FRAMES_DARK = {
  sizes: {
    d: { width: 1080, height: 1440, count: 72 },
    m: { width: 720, height: 960, count: 36 },
  },
  /** caja de píxeles opacos de la hamburguesa cerrada (fotograma 0), % del alto y del ancho */
  closed: {"top":42.5,"bottom":93.9,"x":[13.7,84.4]},
  /** bandas verticales de píxeles opacos del fotograma abierto (último), % del alto */
  openBands: [[5.2,24.6],[26.7,40.7],[41.4,52.8],[52.8,74.7],[75.7,93.9]] as [number, number][],
  path: (i: number, size: FrameSize) => `/frames/dark/${size}/frame_${String(i).padStart(3, "0")}.webp`,
};
