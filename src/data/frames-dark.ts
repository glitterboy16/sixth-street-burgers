// Generado por scripts/frames.mjs — no editar a mano. Porcentajes respecto al fotograma 3:4.
export type FrameSize = "h" | "d" | "m";

export const FRAMES_DARK = {
  sizes: {
    h: { width: 1440, height: 1920, count: 72 },
    d: { width: 1080, height: 1440, count: 72 },
    m: { width: 720, height: 960, count: 36 },
  },
  /** caja de píxeles opacos de la hamburguesa cerrada (fotograma 0), % del alto y del ancho */
  closed: {"top":42.6,"bottom":93.9,"x":[13.7,84.4]},
  /** bandas verticales de píxeles opacos del fotograma abierto (último), % del alto */
  openBands: [[5.2,24.6],[26.7,40.7],[41.4,52.8],[52.8,74.7],[75.6,93.9]] as [number, number][],
  /** bordes izquierdo y derecho de píxeles opacos de cada banda abierta, % del ancho (misma lista que openBands) */
  openLeft: [18.1,12.2,18.1,15.6,18.4],
  openRight: [81.5,86.8,79.8,82.8,81],
  /** caja vertical de la hamburguesa en cada fotograma [arriba, abajo], % del alto (scripts/frame-boxes.mjs) */
  boxes: [[42.6,93.8],[42.4,93.8],[42.4,93.8],[42.2,93.8],[41.7,93.8],[41.2,93.8],[40.9,93.8],[40.1,93.8],[39,93.8],[37.7,93.8],[37,93.8],[35.5,93.8],[33.8,93.8],[32,93.8],[31.1,93.8],[29.2,93.8],[27.4,93.8],[26.5,93.8],[24.7,93.8],[22.9,93.8],[21.2,93.8],[20.5,93.8],[19,93.8],[17.6,93.8],[16.4,93.8],[15.8,93.9],[14.7,93.8],[13.7,93.9],[12.6,93.8],[12.2,93.8],[11.4,93.8],[10.6,93.8],[10.3,93.8],[9.7,93.8],[9.2,93.8],[8.7,93.8],[8.4,93.8],[8,93.8],[7.6,93.8],[7.2,93.8],[7,93.8],[6.7,93.8],[6.5,93.8],[6.4,93.8],[6.2,93.8],[6,93.8],[5.8,93.8],[5.8,93.8],[5.6,93.8],[5.5,93.8],[5.4,93.8],[5.3,93.8],[5.3,93.8],[5.3,93.8],[5.2,93.8],[5.2,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8]] as [number, number][],
  path: (i: number, size: FrameSize) => `/frames/dark/${size}/frame_${String(i).padStart(3, "0")}.webp`,
};
