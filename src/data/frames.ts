// Generado por scripts/frames.mjs — no editar a mano.
export type FrameSize = "d" | "m";

export const FRAMES = {
  sizes: {
    d: { width: 1080, height: 1440, count: 145 },
    m: { width: 720, height: 960, count: 73 },
  },
  path: (i: number, size: FrameSize) => `/frames/${size}/frame_${String(i).padStart(3, "0")}.webp`,
};
