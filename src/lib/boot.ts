// Señales de arranque de la página. La cortina (components/Boot.tsx) espera a que estén las que le tocan
// (fuentes, primer fotograma del hero) antes de levantarse; así nada entra a medias ni cambia de forma a la vista.
type Key = "fonts" | "frame";

const done = new Set<Key>();
const subs = new Set<() => void>();

export function markReady(k: Key) {
  if (done.has(k)) return;
  done.add(k);
  subs.forEach((f) => f());
}

export const isReady = (k: Key) => done.has(k);

export function onBoot(cb: () => void) {
  subs.add(cb);
  return () => {
    subs.delete(cb);
  };
}
