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
  /** bordes izquierdo y derecho de píxeles opacos de cada banda abierta, % del ancho (misma lista que openBands) */
  openLeft: [18.2,12.4,18.3,15.8,18.5],
  openRight: [81.3,86.4,79.6,82.5,80.8],
  /** caja vertical de la hamburguesa en cada fotograma [arriba, abajo], % del alto (scripts/frame-boxes.mjs) */
  boxes: [[42.6,93.5],[42.6,93.5],[42.5,93.5],[42.4,93.6],[42,93.6],[41.5,93.6],[41.1,93.6],[39.9,93.6],[38.1,93.6],[35.9,93.6],[34.8,93.5],[32.6,93.5],[30.5,93.5],[28.5,93.5],[27.5,93.5],[25.6,93.5],[24,93.5],[23.1,93.5],[21.6,93.5],[20.1,93.5],[18.8,93.5],[18.1,93.5],[17,93.5],[16,93.5],[15.1,93.5],[14.7,93.5],[13.8,93.5],[13.1,93.5],[12.3,93.5],[11.9,93.5],[11.3,93.6],[10.6,93.6],[10.3,93.6],[9.8,93.6],[9.3,93.6],[8.9,93.6],[8.7,93.6],[8.3,93.6],[7.8,93.6],[7.5,93.6],[7.4,93.6],[7.1,93.6],[6.8,93.6],[6.7,93.6],[6.5,93.6],[6.3,93.6],[6.1,93.6],[6,93.6],[5.9,93.6],[5.8,93.6],[5.7,93.6],[5.7,93.6],[5.6,93.6],[5.6,93.6],[5.5,93.6],[5.4,93.6],[5.4,93.6],[5.4,93.6],[5.4,93.6],[5.4,93.6],[5.4,93.6],[5.4,93.6],[5.4,93.6],[5.4,93.6],[5.4,93.6],[5.4,93.6],[5.4,93.6],[5.4,93.6],[5.4,93.6],[5.4,93.6],[5.4,93.6],[5.4,93.6]] as [number, number][],
  path: (i: number, size: FrameSize) => `/frames/${size}/frame_${String(i).padStart(3, "0")}.webp`,
};
