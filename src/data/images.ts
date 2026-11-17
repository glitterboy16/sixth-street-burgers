// Huecos de imagen de la portada. Todas son fotos REALES del local (brand/fotos/cliente-2026-11-17/), retocadas
// sin cambiar la hamburguesa y recortadas en local con BiRefNet (renders/carta/). El texto alternativo sale
// traducido de i18n (alts); el de aquí es solo el de respaldo.
// `cutout`: imagen con fondo transparente. "contact" = objeto apoyado (sombra de contacto + ambiental),
// "float" = objeto flotando (solo sombra ambiental). Las sombras las pinta <Cutout> con CSS.

export type SlotId =
  | "smash-burger"
  | "classic"
  | "texas-cowboy"
  | "double-trouble"
  | "chicken-burger"
  | "volcano"
  | "que-lleva"
  | "patatas";

export type SlotImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  cutout?: "contact" | "float";
};

export const slots: Record<SlotId, SlotImage | null> = {
  "smash-burger": { src: "/images/carta/smash-burger.webp", alt: "Smash Burger", width: 1400, height: 898, cutout: "contact" },
  classic: { src: "/images/carta/classic.webp", alt: "Classic", width: 1400, height: 1029, cutout: "contact" },
  "texas-cowboy": { src: "/images/carta/texas-cowboy.webp", alt: "Texas Cowboy", width: 1400, height: 1022, cutout: "contact" },
  "double-trouble": { src: "/images/carta/double-trouble.webp", alt: "Double Trouble", width: 1400, height: 1606, cutout: "contact" },
  "chicken-burger": { src: "/images/carta/chicken-burger.webp", alt: "Chicken Burger", width: 1400, height: 1015, cutout: "contact" },
  volcano: { src: "/images/carta/volcano.webp", alt: "Hamburguesa con cascada de cheddar fundido", width: 1400, height: 1419, cutout: "float" },
  // la Smash abierta por capas: último fotograma del vídeo de la portada, recortado
  "que-lleva": { src: "/images/carta/smash-abierta.webp", alt: "La Smash Burger abierta por capas", width: 1200, height: 1681, cutout: "float" },
  // foto con su fondo (no recortada)
  patatas: { src: "/images/carta/patatas.webp", alt: "Patatas fritas con salsa y queso rallado", width: 1086, height: 1448 },
};

export const placeholders: Record<SlotId, string> = {
  "smash-burger": "Smash Burger",
  classic: "Classic",
  "texas-cowboy": "Texas Cowboy",
  "double-trouble": "Double Trouble",
  "chicken-burger": "Chicken Burger",
  volcano: "Hamburguesa con cascada de cheddar",
  "que-lleva": "Smash Burger abierta",
  patatas: "Patatas",
};
