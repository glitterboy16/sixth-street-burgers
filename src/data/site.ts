// Datos de la landing que no cambian con el idioma. Todo lo marcado MUESTRA lo tiene que confirmar el cliente.
// Los textos traducibles viven en src/i18n/*.ts; la carta completa en src/data/carta.ts.

// Horario por tramos (días: 0 = domingo … 6 = sábado). MUESTRA hasta que el cliente confirme.
// Las etiquetas de los tramos ("Lun–Jue") salen traducidas de i18n (schedule), en el mismo orden.
export const schedule = [
  { label: "Lun–Jue", days: [1, 2, 3, 4], open: "13:00", close: "23:30" },
  { label: "Vie–Sáb", days: [5, 6], open: "13:00", close: "00:30" },
  { label: "Dom", days: [0], open: "13:00", close: "23:00" },
];

export const site = {
  name: "Sixth Street Burgers",
  coords: "Lanzarote · 28.95°N",
  address: ["Calle Ejemplo 6", "Puerto del Carmen", "Lanzarote"], // MUESTRA
  postalCode: "35510", // MUESTRA
  phone: "+34 928 000 000", // MUESTRA
  instagram: { handle: "@sixthstreetburgers", url: "https://instagram.com/sixthstreetburgers" }, // MUESTRA
  mapsUrl: "https://maps.google.com/?q=Sixth+Street+Burgers+Puerto+del+Carmen",
  // Pin del mapa (seccion Donde). MUESTRA: centro de Puerto del Carmen hasta que el cliente pase la ubicacion real.
  geo: { lng: -13.6633, lat: 28.9208 },
  year: 2026,
};

// Las cintas de arriba van SIEMPRE en inglés, en todos los idiomas (decisión de Angel, 2026-11-05).
export const tickerWords = ["JUICY", "SMASHED", "HOT", "CRISPY", "NO RUSH"];

// Hamburguesas de la portada (bloque con scroll lateral): las reales de la carta con foto del cliente.
// El nombre es propio y no se traduce; la descripción sale de i18n (products.desc) y el precio, de la carta.
export type ProductId = "smash-burger" | "classic" | "texas-cowboy" | "double-trouble" | "chicken-burger";
export type Product = {
  id: ProductId;
  name: [string] | [string, string];
  price: number;
};

export const products: Product[] = [
  { id: "smash-burger", name: ["SMASH", "BURGER"], price: 12.9 },
  { id: "classic", name: ["CLASSIC"], price: 12.9 },
  { id: "texas-cowboy", name: ["TEXAS", "COWBOY"], price: 14.9 },
  { id: "double-trouble", name: ["DOUBLE", "TROUBLE"], price: 17.9 },
  { id: "chicken-burger", name: ["CHICKEN", "BURGER"], price: 13.9 },
];
