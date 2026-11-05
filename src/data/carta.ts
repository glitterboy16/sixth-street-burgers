// ── CARTA de Sixth Street Burgers (página /carta/) ─────────────────────────────────────────────────────
// Misma estructura que la carta de Casa Tere: cada texto visible es { es, en, de, fr, it }; si falta un
// idioma se muestra el español. Precios con IGIC incluido, como texto libre ("5,90 €").
//
// Fuente: brand/copy.md. "Para picar", "Ensaladas" y "Bebidas" están leídos de la carta física del local
// (precios por confirmar). Las HAMBURGUESAS son MUESTRA: son las tres de la portada, hasta que el cliente
// pase la carta real de hamburguesas. Para añadir un plato basta con copiar un objeto de `platos`.

import type { Lang } from "@/i18n/config";

export type Texto = { es: string } & Partial<Record<Exclude<Lang, "es">, string>>;
export type Plato = { nombre: Texto; desc?: Texto; precio: string };
export type Categoria = {
  id: string;
  titulo: Texto;
  nota?: Texto;
  tone: "cheese" | "plain" | "teal" | "red";
  platos: Plato[];
};

/** Texto en el idioma pedido, español si falta. */
export const L = (v: Texto, lang: Lang) => v[lang] ?? v.es;

export const carta: Categoria[] = [
  {
    id: "hamburguesas",
    titulo: { es: "Hamburguesas", en: "Burgers", de: "Burger", fr: "Burgers", it: "Hamburger" },
    nota: {
      es: "Smash de ternera 150 g, pan brioche tostado en mantequilla y salsa Sixth. Patatas aparte.",
      en: "150 g beef smash, butter-toasted brioche bun and Sixth sauce. Fries on the side.",
      de: "150 g Rind-Smash, in Butter getoasteter Brioche-Bun und Sixth-Sauce. Pommes extra.",
      fr: "Smash de bœuf 150 g, pain brioché toasté au beurre et sauce Sixth. Frites à part.",
      it: "Smash di manzo 150 g, pane brioche tostato nel burro e salsa Sixth. Patatine a parte.",
    },
    tone: "cheese",
    platos: [
      // MUESTRA: las tres de la portada, hasta que llegue la carta real
      {
        nombre: { es: "La de la casa" },
        desc: {
          es: "Doble smash, cheddar, lechuga, tomate, salsa Sixth.",
          en: "Double smash, cheddar, lettuce, tomato, Sixth sauce.",
          de: "Doppeltes Smash, Cheddar, Salat, Tomate, Sixth-Sauce.",
          fr: "Double smash, cheddar, salade, tomate, sauce Sixth.",
          it: "Doppio smash, cheddar, lattuga, pomodoro, salsa Sixth.",
        },
        precio: "12,90 €",
      },
      {
        nombre: { es: "La picante" },
        desc: {
          es: "Jalapeño, bacon, cheddar, mayo de chipotle.",
          en: "Jalapeño, bacon, cheddar, chipotle mayo.",
          de: "Jalapeño, Bacon, Cheddar, Chipotle-Mayo.",
          fr: "Jalapeño, bacon, cheddar, mayo chipotle.",
          it: "Jalapeño, bacon, cheddar, maionese al chipotle.",
        },
        precio: "13,90 €",
      },
      {
        nombre: { es: "La doble" },
        desc: {
          es: "Dos smash, doble cheddar, cebolla a la plancha.",
          en: "Two smash patties, double cheddar, griddled onion.",
          de: "Zwei Smash-Patties, doppelt Cheddar, Zwiebeln von der Plancha.",
          fr: "Deux smash, double cheddar, oignons à la plancha.",
          it: "Due smash, doppio cheddar, cipolla alla piastra.",
        },
        precio: "15,90 €",
      },
    ],
  },
  {
    id: "para-picar",
    titulo: { es: "Para picar", en: "Snacks", de: "Zum Teilen", fr: "À partager", it: "Da stuzzicare" },
    tone: "plain",
    platos: [
      { nombre: { es: "Papas Buffalo", en: "Buffalo fries", de: "Buffalo-Pommes", fr: "Frites Buffalo", it: "Patatine Buffalo" }, precio: "5,90 €" },
      { nombre: { es: "Aros de cebolla", en: "Onion rings", de: "Zwiebelringe", fr: "Onion rings", it: "Anelli di cipolla" }, precio: "4,50 €" },
      { nombre: { es: "Alitas de pollo BBQ", en: "BBQ chicken wings", de: "BBQ-Chicken-Wings", fr: "Ailes de poulet BBQ", it: "Alette di pollo BBQ" }, precio: "7,90 €" },
      { nombre: { es: "Nachos" }, precio: "7,90 €" },
      {
        nombre: { es: "Tequeños", en: "Tequeños (fried cheese sticks)", de: "Tequeños (frittierte Käsestangen)", fr: "Tequeños (bâtonnets de fromage frits)", it: "Tequeños (bastoncini di formaggio fritti)" },
        precio: "6,90 €",
      },
      {
        nombre: { es: "Croquetas de jamón ibérico", en: "Iberian ham croquettes", de: "Kroketten mit iberischem Schinken", fr: "Croquettes au jambon ibérique", it: "Crocchette di prosciutto iberico" },
        precio: "7,90 €",
      },
      { nombre: { es: "Costillas BBQ", en: "BBQ ribs", de: "BBQ-Rippchen", fr: "Côtes BBQ", it: "Costine BBQ" }, precio: "11,90 €" },
      { nombre: { es: "Fingers de pollo", en: "Chicken fingers", de: "Chicken Fingers", fr: "Fingers de poulet", it: "Fingers di pollo" }, precio: "8,90 €" },
      { nombre: { es: "Golden Crunch Chicken" }, precio: "9,90 €" },
    ],
  },
  {
    id: "ensaladas",
    titulo: { es: "Ensaladas", en: "Salads", de: "Salate", fr: "Salades", it: "Insalate" },
    tone: "teal",
    platos: [
      {
        nombre: { es: "Ensalada César", en: "Caesar salad", de: "Caesar Salad", fr: "Salade César", it: "Insalata Caesar" },
        desc: {
          es: "Lechuga, pollo, parmesano, picatostes, salsa césar.",
          en: "Lettuce, chicken, parmesan, croutons, Caesar dressing.",
          de: "Salat, Hähnchen, Parmesan, Croûtons, Caesar-Dressing.",
          fr: "Salade, poulet, parmesan, croûtons, sauce César.",
          it: "Lattuga, pollo, parmigiano, crostini, salsa Caesar.",
        },
        precio: "11,99 €",
      },
      {
        nombre: { es: "Ensalada Caprese", en: "Caprese salad", de: "Caprese", fr: "Salade Caprese", it: "Insalata Caprese" },
        desc: {
          es: "Mozzarella, tomate, albahaca, aceite de oliva virgen.",
          en: "Mozzarella, tomato, basil, virgin olive oil.",
          de: "Mozzarella, Tomate, Basilikum, natives Olivenöl.",
          fr: "Mozzarella, tomate, basilic, huile d'olive vierge.",
          it: "Mozzarella, pomodoro, basilico, olio d'oliva vergine.",
        },
        precio: "9,99 €",
      },
      {
        nombre: { es: "Ensalada Tomate Lanzarote", en: "Lanzarote tomato salad", de: "Lanzarote-Tomatensalat", fr: "Salade de tomates de Lanzarote", it: "Insalata di pomodoro di Lanzarote" },
        desc: {
          es: "Tomate de Lanzarote, cebolla roja, aguacate, aceite y sal.",
          en: "Lanzarote tomato, red onion, avocado, olive oil and salt.",
          de: "Tomaten aus Lanzarote, rote Zwiebel, Avocado, Öl und Salz.",
          fr: "Tomate de Lanzarote, oignon rouge, avocat, huile et sel.",
          it: "Pomodoro di Lanzarote, cipolla rossa, avocado, olio e sale.",
        },
        precio: "12,99 €",
      },
    ],
  },
  {
    id: "bebidas",
    titulo: { es: "Bebidas", en: "Drinks", de: "Getränke", fr: "Boissons", it: "Bevande" },
    tone: "plain",
    platos: [
      { nombre: { es: "Agua", en: "Water", de: "Wasser", fr: "Eau", it: "Acqua" }, precio: "2,00 €" },
      { nombre: { es: "Agua con gas", en: "Sparkling water", de: "Mineralwasser mit Kohlensäure", fr: "Eau gazeuse", it: "Acqua frizzante" }, precio: "2,50 €" },
      { nombre: { es: "Coca-Cola · Coke Zero · Fanta" }, precio: "2,50 €" },
      { nombre: { es: "Zumo de manzana o piña", en: "Apple or pineapple juice", de: "Apfel- oder Ananassaft", fr: "Jus de pomme ou d'ananas", it: "Succo di mela o ananas" }, precio: "2,90 €" },
      { nombre: { es: "Zumo de naranja natural", en: "Fresh orange juice", de: "Frisch gepresster Orangensaft", fr: "Jus d'orange pressé", it: "Spremuta d'arancia" }, precio: "3,90 €" },
      { nombre: { es: "Espresso" }, precio: "1,80 €" },
      { nombre: { es: "Cappuccino" }, precio: "2,90 €" },
    ],
  },
];
