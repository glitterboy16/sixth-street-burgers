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
  openBands: [[5.3,24.6],[24.9,40.1],[41.4,52.8],[52.8,74.8],[75.8,94]] as [number, number][],
  /** bordes izquierdo y derecho de píxeles opacos de cada banda abierta, % del ancho (misma lista que openBands) */
  openLeft: [18,12.1,18,15.5,18.3],
  openRight: [81.5,87.4,79.9,82.8,81],
  /** caja vertical de la hamburguesa en cada fotograma [arriba, abajo], % del alto (scripts/frame-boxes.mjs) */
  boxes: [[42.6,93.8],[42.5,93.8],[42.4,93.8],[42,93.8],[41.4,93.8],[40.3,93.8],[39.5,93.8],[37.4,93.8],[34.4,93.8],[31.6,93.8],[30.1,93.8],[27.4,93.8],[25.1,93.8],[22.6,93.7],[21.6,93.7],[19.5,93.8],[17.8,93.8],[17.2,93.8],[15.8,93.8],[14.4,93.8],[13.1,93.8],[12.6,93.8],[11.6,93.8],[10.8,93.8],[10.1,93.8],[9.8,93.8],[9.2,93.8],[8.6,93.8],[8.1,93.9],[7.8,93.9],[7.4,93.9],[7.1,93.9],[6.9,93.9],[6.7,93.9],[6.5,94],[6.2,94],[6.1,94],[5.9,94],[5.8,94],[5.6,94],[5.6,94],[5.4,94],[5.3,94],[5.3,94],[5.3,94],[5.3,94],[5.2,94],[5.2,94],[5.2,94],[5.2,94],[5.3,94],[5.2,94],[5.2,94],[5.2,94],[5.2,94],[5.2,94],[5.2,94],[5.2,94],[5.2,94],[5.2,94],[5.2,94],[5.2,94],[5.2,94],[5.2,94],[5.2,94],[5.2,94],[5.2,94],[5.2,94],[5.2,94],[5.2,94],[5.2,94],[5.2,94]] as [number, number][],
  path: (i: number, size: FrameSize) => `/frames/dark/${size}/frame_${String(i).padStart(3, "0")}.webp`,
};
