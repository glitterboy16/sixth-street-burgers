// Textos y datos de la landing. Todo lo marcado MUESTRA lo tiene que confirmar el cliente.

// Horario por tramos (días: 0 = domingo … 6 = sábado). MUESTRA hasta que el cliente confirme.
export const schedule = [
  { label: "Lun–Jue", days: [1, 2, 3, 4], open: "13:00", close: "23:30" },
  { label: "Vie–Sáb", days: [5, 6], open: "13:00", close: "00:30" },
  { label: "Dom", days: [0], open: "13:00", close: "23:00" },
];

export const site = {
  name: "Sixth Street Burgers",
  tagline: "Muerde fuerte. Vive más.",
  description:
    "Smash burgers a la plancha. Un diner americano de noche, en Puerto del Carmen, Lanzarote.",
  coords: "Lanzarote · 28.95°N",
  todayHours: "Abierto hoy 13:00–23:30", // texto genérico (servidor); el cliente lo ajusta al día
  address: ["Calle Ejemplo 6", "Puerto del Carmen", "Lanzarote"], // MUESTRA
  hours: schedule.map((s) => `${s.label} ${s.open}–${s.close}`),
  phone: "+34 928 000 000", // MUESTRA
  instagram: { handle: "@sixthstreetburgers", url: "https://instagram.com/sixthstreetburgers" }, // MUESTRA
  mapsUrl: "https://maps.google.com/?q=Sixth+Street+Burgers+Puerto+del+Carmen",
  year: 2026,
};

export const nav = [
  { label: "Carta", href: "#carta" },
  { label: "El local", href: "#local" },
  { label: "Visítanos", href: "#visitanos" },
];

export const heroLabels = ["Pan brioche", "Lechuga y tomate", "Cheddar fundido", "Doble smash de ternera", "Pan con salsa Sixth"];

export const tickerWords = ["JUGOSA", "A LA PLANCHA", "CALIENTE", "CRUJIENTE", "SIN PRISA"];

export type Product = {
  id: string;
  name: [string, string];
  desc: string;
  price: string;
  slot: "producto-1-la-de-la-casa" | "producto-2-la-picante" | "producto-3-la-doble";
};

export const products: Product[] = [
  {
    id: "la-de-la-casa",
    name: ["LA DE", "LA CASA"],
    desc: "Doble smash, cheddar, lechuga, tomate, salsa Sixth.",
    price: "12,90 €",
    slot: "producto-1-la-de-la-casa",
  },
  {
    id: "la-picante",
    name: ["LA", "PICANTE"],
    desc: "Jalapeño, bacon, cheddar, mayo de chipotle.",
    price: "13,90 €",
    slot: "producto-2-la-picante",
  },
  {
    id: "la-doble",
    name: ["LA", "DOBLE"],
    desc: "Dos smash, doble cheddar, cebolla a la plancha.",
    price: "15,90 €",
    slot: "producto-3-la-doble",
  },
];

export const ingredients: [string, string][] = [
  ["Brioche", "Tostado en mantequilla"],
  ["Lechuga y tomate", "Frescos, cortados al día"],
  ["Cheddar", "Fundido en plancha"],
  ["Smash", "Ternera 150 g, borde crujiente"],
  ["Salsa Sixth", "Receta de la casa"],
];
