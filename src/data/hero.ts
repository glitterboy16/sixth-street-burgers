// Generado por scripts/hero-layers.mjs — no editar a mano. Porcentajes respecto al fotograma 3:4.
export type HeroLayer = {
  file: string;
  width: number;
  height: number;
  /** borde superior de la imagen de la capa, % del alto del fotograma */
  top: number;
  /** alto de la imagen de la capa, % del alto del fotograma */
  h: number;
  /** banda de píxeles opacos [desde, hasta], % del alto */
  band: [number, number];
  /** extensión horizontal [desde, hasta], % del ancho */
  x: [number, number];
};

export const HERO = {
  frame: { width: 1744, height: 2336 },
  layers: [
    {
      "file": "capa-1.webp",
      "width": 1400,
      "height": 365,
      "top": 5.48,
      "h": 19.48,
      "band": [
        5.61,
        24.66
      ],
      "x": [
        18.18,
        81.19
      ]
    },
    {
      "file": "capa-2.webp",
      "width": 1400,
      "height": 269,
      "top": 26.76,
      "h": 14.34,
      "band": [
        27.01,
        40.8
      ],
      "x": [
        12.39,
        86.35
      ]
    },
    {
      "file": "capa-3.webp",
      "width": 1400,
      "height": 212,
      "top": 41.27,
      "h": 11.3,
      "band": [
        41.52,
        52.53
      ],
      "x": [
        18.23,
        79.47
      ]
    },
    {
      "file": "capa-4.webp",
      "width": 1400,
      "height": 415,
      "top": 52.57,
      "h": 22.13,
      "band": [
        52.57,
        74.4
      ],
      "x": [
        15.71,
        82.45
      ]
    },
    {
      "file": "capa-5.webp",
      "width": 1400,
      "height": 344,
      "top": 75.13,
      "h": 18.32,
      "band": [
        75.39,
        93.28
      ],
      "x": [
        18.46,
        80.79
      ]
    }
  ] as HeroLayer[],
  path: (file: string) => `/images/hero/${file}`,
};
