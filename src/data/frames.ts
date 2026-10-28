// Generado por scripts/frames.mjs — no editar a mano. Porcentajes respecto al fotograma 3:4.
export type FrameSize = "h" | "d" | "m";

export const FRAMES = {
  sizes: {
    h: { width: 1440, height: 1920, count: 72 },
    d: { width: 1080, height: 1440, count: 72 },
    m: { width: 720, height: 960, count: 36 },
  },
  /** caja de píxeles opacos de la hamburguesa cerrada (fotograma 0), % del alto y del ancho */
  closed: {"top":42.6,"bottom":93.6,"x":[13.9,84.1]},
  /** bandas verticales de píxeles opacos del fotograma abierto (último), % del alto */
  openBands: [[5.2,24.5],[25.1,40.1],[41.5,52.8],[52.8,74.5],[75.7,93.8]] as [number, number][],
  /** bordes izquierdo y derecho de píxeles opacos de cada banda abierta, % del ancho (misma lista que openBands) */
  openLeft: [18.1,12.2,18.1,15.6,18.4],
  openRight: [81.4,87.2,79.7,82.6,81],
  /** caja vertical de la hamburguesa en cada fotograma [arriba, abajo], % del alto (scripts/frame-boxes.mjs) */
  boxes: [[42.6,93.6],[42.4,93.6],[42.2,93.6],[41.7,93.6],[40.7,93.6],[39.5,93.6],[38.6,93.6],[36.5,93.6],[33.6,93.6],[30.8,93.6],[29.4,93.6],[27,93.6],[24.7,93.6],[22.5,93.5],[21.5,93.5],[19.4,93.5],[17.7,93.5],[16.9,93.5],[15.6,93.5],[14.3,93.5],[13.1,93.5],[12.6,93.5],[11.6,93.5],[10.8,93.6],[10.1,93.6],[9.7,93.6],[9.2,93.6],[8.6,93.6],[8.1,93.7],[7.9,93.7],[7.4,93.7],[7.2,93.8],[6.9,93.8],[6.7,93.8],[6.4,93.8],[6.2,93.8],[6.1,93.8],[5.9,93.8],[5.7,93.8],[5.6,93.8],[5.6,93.8],[5.4,93.8],[5.4,93.8],[5.4,93.8],[5.4,93.8],[5.3,93.8],[5.3,93.8],[5.3,93.8],[5.3,93.8],[5.2,93.8],[5.2,93.8],[5.2,93.8],[5.2,93.8],[5.2,93.8],[5.2,93.8],[5.2,93.8],[5.2,93.8],[5.2,93.8],[5.2,93.8],[5.2,93.8],[5.2,93.8],[5.2,93.8],[5.2,93.8],[5.2,93.8],[5.2,93.8],[5.2,93.8],[5.2,93.8],[5.2,93.8],[5.2,93.8],[5.2,93.8],[5.2,93.8],[5.2,93.8]] as [number, number][],
  path: (i: number, size: FrameSize) => `/frames/${size}/frame_${String(i).padStart(3, "0")}.webp`,
};
