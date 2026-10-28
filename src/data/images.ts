// Huecos de imagen de la web. `null` = todavía no hay foto: se muestra el placeholder con el nombre del hueco.
// Cuando llegue una foto, cópiala a public/images/ y apunta aquí su ruta.
// `cutout`: imagen con fondo transparente. "contact" = objeto apoyado (sombra de contacto + ambiental),
// "float" = objeto flotando (solo sombra ambiental). Las sombras las pinta <Cutout> con CSS.

export type SlotId =
  | "statement-mano-burger"
  | "producto-1-la-de-la-casa"
  | "producto-2-la-picante"
  | "producto-3-la-doble"
  | "que-lleva-render-abierta"
  | "que-lleva-render-abierta-oscuro"
  | "patatas-cucurucho"
  | "coge-la-tuya-burger"
  | "manifiesto-burger";

export type SlotImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  cutout?: "contact" | "float";
};

const burgerCerrada = (alt: string): SlotImage => ({
  src: "/images/burger-cerrada-v2.webp",
  alt,
  width: 1400,
  height: 1457,
  cutout: "contact",
});

// Fotos generadas el 2026-10-27 (GPT Image 2.5 vía Higgsfield) con la receta definitiva: lechuga arriba,
// tomate, cheddar sobre doble smash, salsa en el pan de abajo. Sin cebolla ni pepinillo.
export const slots: Record<SlotId, SlotImage | null> = {
  "statement-mano-burger": {
    src: "/images/mano-burger-v2.webp", // regenerada 2026-10-28 con la mano bien (pulgar debajo, dedos sobre el pan)
    alt: "Una mano sujetando la smash burger de Sixth Street, con el cheddar saliéndose por los lados",
    width: 1600,
    height: 1800,
    cutout: "float",
  },
  "producto-1-la-de-la-casa": burgerCerrada("La de la casa: doble smash con cheddar, lechuga, tomate y salsa Sixth"),
  "producto-2-la-picante": {
    src: "/images/la-picante.webp",
    alt: "La picante: doble smash con cheddar, bacon crujiente, jalapeños y mayonesa de chipotle",
    width: 1400,
    height: 1358,
    cutout: "contact",
  },
  "producto-3-la-doble": {
    src: "/images/la-doble.webp",
    alt: "La doble: dos smash con cheddar fundido y cebolla caramelizada a la plancha",
    width: 1400,
    height: 1510,
    cutout: "contact",
  },
  // Último fotograma del vídeo del hero (lechuga sobre tomate), uno por tema: el recorte del fondo rosa deja
  // halo sobre negro, así que en oscuro va el fotograma generado sobre negro.
  "que-lleva-render-abierta": {
    src: "/images/burger-abierta-v3.webp",
    alt: "La hamburguesa abierta por capas: pan brioche, lechuga y tomate, cheddar, doble smash, pan con salsa",
    width: 1200,
    height: 1856,
    cutout: "float",
  },
  "que-lleva-render-abierta-oscuro": {
    src: "/images/burger-abierta-v3-oscuro.webp",
    alt: "La hamburguesa abierta por capas: pan brioche, lechuga y tomate, cheddar, doble smash, pan con salsa",
    width: 1200,
    height: 1858,
    cutout: "float",
  },
  "patatas-cucurucho": {
    src: "/images/patatas.webp",
    alt: "Patatas fritas en cucurucho de cuadros rojos y crema con un bote de salsa Sixth",
    width: 1200,
    height: 1552,
    cutout: "contact",
  },
  "coge-la-tuya-burger": burgerCerrada("Smash burger de Sixth Street cerrada"),
  "manifiesto-burger": burgerCerrada("Smash burger de Sixth Street cerrada"),
};

export const placeholders: Record<SlotId, string> = {
  "statement-mano-burger": "Mano sujetando la hamburguesa (PNG sin fondo)",
  "producto-1-la-de-la-casa": "La de la casa · foto estudio",
  "producto-2-la-picante": "La picante · foto estudio",
  "producto-3-la-doble": "La doble · foto estudio",
  "que-lleva-render-abierta": "Render hamburguesa abierta · capas flotando",
  "que-lleva-render-abierta-oscuro": "Render hamburguesa abierta · capas flotando (tema oscuro)",
  "patatas-cucurucho": "Patatas en cucurucho a cuadros rojo/crema + bote de salsa (PNG sin fondo)",
  "coge-la-tuya-burger": "Hamburguesa cerrada · misma foto del hero",
  "manifiesto-burger": "Hamburguesa · misma foto del hero",
};
