// Generado por scripts/frames.mjs — no editar a mano. Porcentajes respecto al fotograma 3:4.
export type FrameSize = "h" | "d" | "m";

export const FRAMES_DARK = {
  sizes: {
    h: { width: 1440, height: 1920, count: 72 },
    d: { width: 1080, height: 1440, count: 72 },
    m: { width: 720, height: 960, count: 36 },
  },
  /** caja de píxeles opacos de la hamburguesa cerrada (fotograma 0), % del alto y del ancho */
  closed: {"top":42.5,"bottom":93.9,"x":[13.7,84.4]},
  /** bandas verticales de píxeles opacos del fotograma abierto (último), % del alto */
  openBands: [[5.2,24.6],[26.7,40.7],[41.4,52.8],[52.8,74.7],[75.7,93.9]] as [number, number][],
  /** bordes izquierdo y derecho de píxeles opacos de cada banda abierta, % del ancho (misma lista que openBands) */
  openLeft: [18.1,12.2,18.1,15.6,18.4],
  openRight: [81.5,86.8,79.8,82.8,81],
  /** caja vertical de la hamburguesa en cada fotograma [arriba, abajo], % del alto (scripts/frame-boxes.mjs) */
  boxes: [[42.5,93.8],[42.5,93.8],[42.5,93.8],[42.3,93.8],[41.9,93.8],[41.4,93.8],[41,93.8],[40.1,93.8],[38.8,93.5],[37.2,93.3],[36.3,93.1],[33.8,92.6],[31.5,92.2],[28.9,91.8],[27.6,91.7],[25.3,91.5],[23.1,91.5],[22.1,91.5],[20.1,91.7],[18.4,91.8],[16.7,91.9],[16,92.1],[14.7,92.2],[13.5,92.4],[12.2,92.5],[11.9,92.6],[11.2,92.7],[10.5,92.8],[9.9,93],[9.7,93],[9.1,93.1],[8.7,93.2],[8.5,93.3],[8.1,93.3],[7.8,93.4],[7.4,93.5],[7.3,93.5],[7,93.6],[6.7,93.6],[6.6,93.7],[6.5,93.8],[6.3,93.8],[6.1,93.8],[6,93.8],[5.9,93.8],[5.8,93.8],[5.6,93.8],[5.6,93.8],[5.5,93.8],[5.3,93.8],[5.3,93.8],[5.3,93.8],[5.3,93.8],[5.3,93.8],[5.2,93.8],[5.2,93.8],[5.2,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8],[5.1,93.8]] as [number, number][],
  path: (i: number, size: FrameSize) => `/frames/dark/${size}/frame_${String(i).padStart(3, "0")}.webp`,
};
