# Sixth Street Burgers — landing

Next.js 16 (App Router) + TypeScript + Tailwind 4 (tokens como CSS vars) + `next/font/google` (Anton, Geist, Geist Mono).
Sin librerías de componentes ni de animación: el scroll-scrub del hero, el carrusel fijado y los reveals son código propio
(`src/lib/motion.ts`, `src/components/Reveals.tsx`).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Estructura

- `src/app/globals.css` — tokens (modo oscuro/claro), tipografía, kit gráfico (starburst, sparkle, rayo, ajedrez, smiley,
  badge WELCOME, placa del logo, botones, callouts), reveals y marquesinas.
- `src/app/sections.css` — layout de cada sección (00 Nav … 15 Footer).
- `src/components/sections/*` — una sección por archivo, en el orden de la página.
- `src/components/kit/*` — piezas reutilizables.
- `src/data/site.ts` — textos, carta, horario, dirección (lo marcado MUESTRA lo confirma el cliente).
- `src/data/images.ts` — huecos de imagen: `null` muestra un placeholder con el nombre del hueco.
- `src/data/frames.ts` — manifiesto de la secuencia del hero (lo genera el script).

## Secuencia del hero

Los fotogramas del vídeo (`design_handoff_sixth_street_burgers/assets/hero/*.jpg`, fondo rosa plano) se convierten a WebP
con alfa con:

```bash
node scripts/frames.mjs --n 60
```

Genera `public/frames/d/` (escritorio 900×1200), `public/frames/m/` (móvil 600×800), `public/images/burger-cerrada.webp`,
`public/images/burger-abierta.webp`, `public/images/og.jpg` y `src/data/frames.ts`. El matte está en `scripts/key.mjs`:
fondo bilineal, núcleo por croma con relleno de huecos, alfa por proyección en el borde, erosión de 1 px + antialias,
color del interior extendido al borde y limpieza de motas. **Los recortes van sin sombra**: las sombras las pinta la web
(`.hero__shadow` en el hero y el componente `kit/Cutout.tsx` en el resto: sombra de contacto elíptica + `drop-shadow`),
así son iguales en todos los fondos y nunca aparecen cortadas. `--shadow 0.5` conserva la sombra del vídeo si hiciera falta.

## Fotos pendientes

Ver `design_handoff_sixth_street_burgers/higgsfield-prompts.md`. Cuando llegue una foto: copiarla a `public/images/` y
apuntar la ruta en `src/data/images.ts` (huecos `statement-mano-burger`, `producto-2-la-picante`, `producto-3-la-doble`,
`patatas-cucurucho`, `macro-queso-carne`).
