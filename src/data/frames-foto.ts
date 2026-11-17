// Generado por scripts/frames-foto.mjs — no editar a mano. Porcentajes respecto al fotograma 3:4.
// La Smash Burger real en el bar (fondo incluido): de cerrada (0) a abierta (último), un solo juego para los dos temas.
export type FotoSize = "h" | "d" | "m";

export const FRAMES_FOTO = {
  sizes: {"h":{"width":1440,"height":1920,"count":167},"d":{"width":1080,"height":1440,"count":167},"m":{"width":720,"height":960,"count":167}} as Record<FotoSize, { width: number; height: number; count: number }>,
  /** caja de la hamburguesa cerrada (primer fotograma): [izquierda, arriba, derecha, abajo] */
  closed: [10.1,34,87.2,70.9] as [number, number, number, number],
  /** etiquetas de la abierta: centro vertical de cada capa y su borde derecho */
  labels: [{"y":20.9,"right":75.6},{"y":35.4,"right":69.6},{"y":48.5,"right":82.1},{"y":62.5,"right":77.8},{"y":74.5,"right":77.4}],
  path: (i: number, size: FotoSize) => `/frames/foto/${size}/frame_${String(i).padStart(3, "0")}.webp?v=mwk52hhm`,
};
