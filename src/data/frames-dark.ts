// Generado por scripts/frames.mjs — no editar a mano. Porcentajes respecto al fotograma 3:4.
export type FrameSize = "h" | "d" | "m";

export const FRAMES_DARK = {
  sizes: {
    h: { width: 1440, height: 1920, count: 72 },
    d: { width: 1080, height: 1440, count: 72 },
    m: { width: 720, height: 960, count: 36 },
  },
  /** caja de píxeles opacos de la hamburguesa cerrada (fotograma 0), % del alto y del ancho */
  closed: {"top":42.6,"bottom":93.9,"x":[13.8,84.2]},
  /** bandas verticales de píxeles opacos del fotograma abierto (último), % del alto */
  openBands: [[5.5,24.7],[26.8,40.7],[41.4,52.8],[52.8,74.6],[75.6,93.8]] as [number, number][],
  /** bordes izquierdo y derecho de píxeles opacos de cada banda abierta, % del ancho (misma lista que openBands) */
  openLeft: [18.1,12.2,18.1,15.6,18.4],
  openRight: [81.4,86.7,79.7,82.7,81],
  /** caja vertical de la hamburguesa en cada fotograma [arriba, abajo], % del alto (scripts/frame-boxes.mjs) */
  boxes: [[42.6,93.8],[42.6,93.8],[42.6,93.8],[42.4,93.8],[42.2,93.8],[41.7,93.8],[41.4,93.8],[40.2,93.8],[38.4,93.8],[36.2,93.8],[34.9,93.8],[32.6,93.8],[30.5,93.8],[28.5,93.8],[27.4,93.8],[25.6,93.7],[24,93.7],[23.3,93.7],[21.7,93.8],[20.3,93.8],[19,93.8],[18.3,93.8],[17.2,93.8],[16.1,93.8],[15.1,93.8],[14.7,93.8],[13.8,93.8],[13.1,93.8],[12.3,93.8],[11.9,93.8],[11.2,93.8],[10.6,93.8],[10.3,93.8],[9.8,93.8],[9.3,93.8],[8.8,93.8],[8.6,93.8],[8.2,93.8],[7.8,93.8],[7.4,93.8],[7.4,93.8],[7.1,93.8],[6.8,93.8],[6.7,93.8],[6.5,93.8],[6.3,93.8],[6.1,93.8],[6,93.8],[5.9,93.8],[5.8,93.8],[5.8,93.8],[5.7,93.8],[5.6,93.8],[5.6,93.8],[5.6,93.8],[5.5,93.8],[5.5,93.8],[5.5,93.8],[5.5,93.8],[5.5,93.8],[5.5,93.8],[5.5,93.8],[5.5,93.8],[5.5,93.8],[5.5,93.8],[5.5,93.8],[5.5,93.8],[5.5,93.8],[5.5,93.8],[5.5,93.8],[5.5,93.8],[5.5,93.8]] as [number, number][],
  path: (i: number, size: FrameSize) => `/frames/dark/${size}/frame_${String(i).padStart(3, "0")}.webp`,
};
