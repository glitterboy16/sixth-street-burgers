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
  frame: { width: 3584, height: 4778 },
  layers: [
    {
      "file": "capa-1-v2.webp",
      "width": 1800,
      "height": 466,
      "top": 5.34,
      "h": 19.4,
      "band": [
        5.4,
        24.59
      ],
      "x": [
        18.25,
        81.28
      ]
    },
    {
      "file": "capa-2-v2.webp",
      "width": 1800,
      "height": 342,
      "top": 26.77,
      "h": 14.23,
      "band": [
        26.89,
        40.85
      ],
      "x": [
        12.36,
        86.5
      ]
    },
    {
      "file": "capa-3-v2.webp",
      "width": 1800,
      "height": 300,
      "top": 41.38,
      "h": 12.52,
      "band": [
        41.5,
        52.76
      ],
      "x": [
        18.25,
        79.63
      ]
    },
    {
      "file": "capa-4-v2.webp",
      "width": 1800,
      "height": 528,
      "top": 52.78,
      "h": 22,
      "band": [
        52.78,
        74.63
      ],
      "x": [
        15.76,
        82.56
      ]
    },
    {
      "file": "capa-5-v2.webp",
      "width": 1800,
      "height": 439,
      "top": 75.37,
      "h": 18.31,
      "band": [
        75.49,
        93.6
      ],
      "x": [
        18.53,
        80.89
      ]
    }
  ] as HeroLayer[],
  path: (file: string) => `/images/hero/${file}`,
};
