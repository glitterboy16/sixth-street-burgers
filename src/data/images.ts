// Huecos de imagen de la portada. Todas son fotos REALES del local (brand/fotos/cliente-2026-11-17/). Las hamburguesas
// de producto están retocadas como foto de estudio (misma hamburguesa; renders/premium2/) y recortadas con BiRefNet. El texto alternativo sale
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
  "smash-burger": { src: "/images/carta/smash-burger-v2.webp", alt: "Smash Burger", width: 1400, height: 897, cutout: "contact" },
  classic: { src: "/images/carta/classic-v2.webp", alt: "Classic", width: 1400, height: 999, cutout: "contact" },
  "texas-cowboy": { src: "/images/carta/texas-cowboy-v2.webp", alt: "Texas Cowboy", width: 1400, height: 1018, cutout: "contact" },
  "double-trouble": { src: "/images/carta/double-trouble-v2.webp", alt: "Double Trouble", width: 1400, height: 1459, cutout: "contact" },
  "chicken-burger": { src: "/images/carta/chicken-burger-v2.webp", alt: "Chicken Burger", width: 1400, height: 1001, cutout: "contact" },
  volcano: { src: "/images/carta/volcano-v2.webp", alt: "Hamburguesa con cascada de cheddar fundido", width: 1400, height: 1317, cutout: "float" },
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
