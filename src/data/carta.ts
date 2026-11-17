// ── CARTA de Sixth Street Burger (página /carta/) ─────────────────────────────────────────────────────
// Transcrita de la carta real del local (brand/carta/: comida y bebidas, en inglés) el 2026-11-17.
// Cada texto visible es { es, en, de, fr, it }; si falta un idioma se muestra el español. Los nombres propios
// (hamburguesas, cócteles, marcas) van solo en "es" y se ven igual en todos los idiomas.
// Precios en euros como número: la página los formatea según el idioma (12,90 € / €12.90).
// Los alérgenos NO se publican aquí a propósito: en la carta van por iconos y un error sería peligroso;
// la página remite al local.

import type { Lang } from "@/i18n/config";

export type Texto = { es: string } & Partial<Record<Exclude<Lang, "es">, string>>;
export type Plato = { nombre: Texto; desc?: Texto; precio: number };
export type Grupo = { titulo?: Texto; platos: Plato[] };
export type Categoria = {
  id: string;
  titulo: Texto;
  nota?: Texto;
  tone: "cheese" | "plain" | "teal" | "red";
  /** lista apretada en columnas (bebidas) */
  compacta?: boolean;
  grupos: Grupo[];
};

/** Texto en el idioma pedido, español si falta. */
export const L = (v: Texto, lang: Lang) => v[lang] ?? v.es;

const LOCALE: Record<Lang, string> = { es: "es-ES", en: "en-GB", de: "de-DE", fr: "fr-FR", it: "it-IT" };
/** 12.9 → "12,90 €" (es, de, fr, it) o "€12.90" (en) */
export const precio = (n: number, lang: Lang) =>
  new Intl.NumberFormat(LOCALE[lang], { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(n);

const N = (es: string): Texto => ({ es });

export const carta: Categoria[] = [
  {
    id: "hamburguesas",
    titulo: { es: "Hamburguesas", en: "Burgers", de: "Burger", fr: "Burgers", it: "Hamburger" },
    nota: {
      es: "Añade patatas por 1,79 € o patatas de boniato por 2,79 €.",
      en: "Add fries for €1.79 or sweet potato fries for €2.79.",
      de: "Pommes für 1,79 € oder Süßkartoffel-Pommes für 2,79 € dazu.",
      fr: "Ajoute des frites pour 1,79 € ou des frites de patate douce pour 2,79 €.",
      it: "Aggiungi patatine a 1,79 € o patatine di patata dolce a 2,79 €.",
    },
    tone: "cheese",
    grupos: [
      {
        platos: [
          {
            nombre: N("Classic"),
            desc: {
              es: "Pan brioche, carne 100 % ternera de 180 g, cheddar y queso ahumado, cebolla a la plancha estilo Oklahoma, lechuga, tomate, mayonesa de trufa y trocitos de bacon crujiente.",
              en: "Brioche bun, 180 g 100% beef patty, Cheddar and smoked cheese, Oklahoma-style grilled onions, lettuce, tomato, truffle mayonnaise and crispy bacon pieces.",
              de: "Brioche-Bun, 180 g Patty aus 100 % Rind, Cheddar und Räucherkäse, gegrillte Zwiebeln nach Oklahoma-Art, Salat, Tomate, Trüffelmayonnaise und knusprige Baconstücke.",
              fr: "Pain brioché, steak 100 % bœuf de 180 g, cheddar et fromage fumé, oignons grillés façon Oklahoma, salade, tomate, mayonnaise à la truffe et éclats de bacon croustillant.",
              it: "Pane brioche, hamburger 100 % manzo da 180 g, cheddar e formaggio affumicato, cipolla alla piastra stile Oklahoma, lattuga, pomodoro, maionese al tartufo e pezzetti di bacon croccante.",
            },
            precio: 12.9,
          },
          {
            nombre: N("Smash Burger"),
            desc: {
              es: "Dos carnes de ternera smash, doble cheddar, bacon crujiente, cebolla a la plancha y nuestra salsa burger casera.",
              en: "Two smashed beef patties, double Cheddar, crispy bacon, grilled onions and our homemade burger sauce.",
              de: "Zwei Smash-Patties vom Rind, doppelt Cheddar, knuspriger Bacon, gegrillte Zwiebeln und unsere hausgemachte Burgersauce.",
              fr: "Deux steaks de bœuf smashés, double cheddar, bacon croustillant, oignons grillés et notre sauce burger maison.",
              it: "Due hamburger di manzo smash, doppio cheddar, bacon croccante, cipolla alla piastra e la nostra salsa burger fatta in casa.",
            },
            precio: 12.9,
          },
          {
            nombre: N("Chicken Burger"),
            desc: {
              es: "Pan brioche, filete de pollo crujiente, lechuga, tomate, cheddar y nuestra mayonesa casera.",
              en: "Brioche bun, crispy chicken fillet, lettuce, tomato, Cheddar and our homemade mayonnaise.",
              de: "Brioche-Bun, knuspriges Hähnchenfilet, Salat, Tomate, Cheddar und unsere hausgemachte Mayonnaise.",
              fr: "Pain brioché, filet de poulet croustillant, salade, tomate, cheddar et notre mayonnaise maison.",
              it: "Pane brioche, filetto di pollo croccante, lattuga, pomodoro, cheddar e la nostra maionese fatta in casa.",
            },
            precio: 13.9,
          },
          {
            nombre: N("Volcano"),
            desc: {
              es: "Pan brioche, carne 100 % ternera de 180 g, doble cheddar, bacon crujiente y cebolla morada, rematada con una cascada de cheddar fundido.",
              en: "Brioche bun, 180 g 100% beef patty, double Cheddar, crispy bacon and red onion, finished with a cascade of melted Cheddar.",
              de: "Brioche-Bun, 180 g Patty aus 100 % Rind, doppelt Cheddar, knuspriger Bacon und rote Zwiebel, gekrönt von einer Kaskade aus geschmolzenem Cheddar.",
              fr: "Pain brioché, steak 100 % bœuf de 180 g, double cheddar, bacon croustillant et oignon rouge, nappé d'une cascade de cheddar fondu.",
              it: "Pane brioche, hamburger 100 % manzo da 180 g, doppio cheddar, bacon croccante e cipolla rossa, con una cascata di cheddar fuso.",
            },
            precio: 14.9,
          },
          {
            nombre: N("Texas Cowboy"),
            desc: {
              es: "Pan brioche negro, carne 100 % ternera de 180 g, pulled pork, doble cheddar, cebolla caramelizada y salsa barbacoa picante al whisky.",
              en: "Black brioche bun, 180 g 100% beef patty, pulled pork, double Cheddar, caramelised onions and spicy whisky BBQ sauce.",
              de: "Schwarzer Brioche-Bun, 180 g Patty aus 100 % Rind, Pulled Pork, doppelt Cheddar, karamellisierte Zwiebeln und scharfe Whisky-BBQ-Sauce.",
              fr: "Pain brioché noir, steak 100 % bœuf de 180 g, pulled pork, double cheddar, oignons caramélisés et sauce barbecue épicée au whisky.",
              it: "Pane brioche nero, hamburger 100 % manzo da 180 g, pulled pork, doppio cheddar, cipolla caramellata e salsa barbecue piccante al whisky.",
            },
            precio: 14.9,
          },
          {
            nombre: N("Veggie Burger"),
            desc: {
              es: "Hamburguesa vegetal de proteína de guisante, cheddar, guacamole, pico de gallo, lechuga iceberg, mayonesa vegana y pan vegano.",
              en: "Plant-based pea protein burger, Cheddar, guacamole, pico de gallo, iceberg lettuce, vegan mayonnaise and a vegan bun.",
              de: "Pflanzlicher Burger aus Erbsenprotein, Cheddar, Guacamole, Pico de Gallo, Eisbergsalat, vegane Mayonnaise und veganer Bun.",
              fr: "Burger végétal à la protéine de pois, cheddar, guacamole, pico de gallo, salade iceberg, mayonnaise végane et pain végan.",
              it: "Burger vegetale di proteine di pisello, cheddar, guacamole, pico de gallo, lattuga iceberg, maionese vegana e pane vegano.",
            },
            precio: 12.9,
          },
          {
            nombre: N("Tijuana"),
            desc: {
              es: "Pan brioche, carne 100 % ternera de 180 g, guacamole, totopos crujientes, parmesano, bacon crujiente, jalapeños y mayonesa de jalapeño.",
              en: "Brioche bun, 180 g 100% beef patty, guacamole, crispy tortilla chips, Parmesan, crispy bacon, jalapeños and jalapeño mayonnaise.",
              de: "Brioche-Bun, 180 g Patty aus 100 % Rind, Guacamole, knusprige Tortillachips, Parmesan, knuspriger Bacon, Jalapeños und Jalapeño-Mayonnaise.",
              fr: "Pain brioché, steak 100 % bœuf de 180 g, guacamole, chips de tortilla croustillantes, parmesan, bacon croustillant, jalapeños et mayonnaise au jalapeño.",
              it: "Pane brioche, hamburger 100 % manzo da 180 g, guacamole, nachos croccanti, parmigiano, bacon croccante, jalapeño e maionese al jalapeño.",
            },
            precio: 14.9,
          },
          {
            nombre: N("Smoke House"),
            desc: {
              es: "Pan brioche, carne 100 % ternera de 180 g, cheddar, gouda ahumado, bacon crujiente, cebolla caramelizada y pepinillos, servida bajo campana con humo de nogal americano.",
              en: "Brioche bun, 180 g 100% beef patty, Cheddar, smoked Gouda, crispy bacon, caramelised onions and pickles, served under a cloche filled with hickory smoke.",
              de: "Brioche-Bun, 180 g Patty aus 100 % Rind, Cheddar, geräucherter Gouda, knuspriger Bacon, karamellisierte Zwiebeln und Gewürzgurken, serviert unter einer Glocke voller Hickoryrauch.",
              fr: "Pain brioché, steak 100 % bœuf de 180 g, cheddar, gouda fumé, bacon croustillant, oignons caramélisés et cornichons, servi sous une cloche remplie de fumée de hickory.",
              it: "Pane brioche, hamburger 100 % manzo da 180 g, cheddar, gouda affumicato, bacon croccante, cipolla caramellata e cetriolini, servito sotto una campana piena di fumo di hickory.",
            },
            precio: 15.9,
          },
          {
            nombre: N("Truffle Deluxe"),
            desc: {
              es: "Pan brioche, carne de ternera madurada 45 días (180 g), panceta ibérica crujiente, cheddar, huevo frito y mayonesa de trufa negra.",
              en: "Brioche bun, 180 g dry-aged beef patty (45 days), crispy Iberian pork belly, Cheddar, fried egg and black truffle mayonnaise.",
              de: "Brioche-Bun, 180 g Dry-Aged-Patty vom Rind (45 Tage gereift), knuspriger iberischer Schweinebauch, Cheddar, Spiegelei und Mayonnaise mit schwarzem Trüffel.",
              fr: "Pain brioché, steak de bœuf maturé 45 jours (180 g), poitrine de porc ibérique croustillante, cheddar, œuf au plat et mayonnaise à la truffe noire.",
              it: "Pane brioche, hamburger di manzo frollato 45 giorni (180 g), pancetta iberica croccante, cheddar, uovo fritto e maionese al tartufo nero.",
            },
            precio: 15.9,
          },
          {
            nombre: N("Double Trouble"),
            desc: {
              es: "Pan brioche, dos carnes 100 % ternera de 180 g (360 g en total), cuatro lonchas de cheddar, cuatro de bacon crujiente, pepinillos, un aro de cebolla extracrujiente y nuestra mayonesa casera.",
              en: "Brioche bun, two 180 g 100% beef patties (360 g in total), four slices of Cheddar, four rashers of crispy bacon, pickles, an extra-crispy onion ring and our homemade mayonnaise.",
              de: "Brioche-Bun, zwei 180-g-Patties aus 100 % Rind (insgesamt 360 g), vier Scheiben Cheddar, vier Scheiben knuspriger Bacon, Gewürzgurken, ein extra knuspriger Zwiebelring und unsere hausgemachte Mayonnaise.",
              fr: "Pain brioché, deux steaks 100 % bœuf de 180 g (360 g au total), quatre tranches de cheddar, quatre tranches de bacon croustillant, cornichons, un onion ring extra-croustillant et notre mayonnaise maison.",
              it: "Pane brioche, due hamburger 100 % manzo da 180 g (360 g in tutto), quattro fette di cheddar, quattro fette di bacon croccante, cetriolini, un anello di cipolla extra croccante e la nostra maionese fatta in casa.",
            },
            precio: 17.9,
          },
        ],
      },
    ],
  },
  {
    id: "para-empezar",
    titulo: { es: "Para empezar", en: "Sides & starters", de: "Beilagen & Vorspeisen", fr: "Accompagnements & entrées", it: "Contorni e antipasti" },
    tone: "plain",
    grupos: [
      {
        platos: [
          { nombre: { es: "Patatas fritas clásicas", en: "Classic fries", de: "Klassische Pommes", fr: "Frites classiques", it: "Patatine fritte classiche" }, precio: 3.99 },
          { nombre: { es: "Patatas de boniato", en: "Sweet potato fries", de: "Süßkartoffel-Pommes", fr: "Frites de patate douce", it: "Patatine di patata dolce" }, precio: 4.5 },
          {
            nombre: { es: "Patatas Buffalo", en: "Buffalo fries", de: "Buffalo-Pommes", fr: "Frites Buffalo", it: "Patatine Buffalo" },
            desc: {
              es: "Patatas finas con queso fundido, mayonesa casera de bacon y cebolla crujiente.",
              en: "Thin-cut fries topped with melted cheese, homemade bacon mayonnaise and crispy onions.",
              de: "Dünne Pommes mit geschmolzenem Käse, hausgemachter Bacon-Mayonnaise und Röstzwiebeln.",
              fr: "Frites fines nappées de fromage fondu, de mayonnaise maison au bacon et d'oignons croustillants.",
              it: "Patatine sottili con formaggio fuso, maionese al bacon fatta in casa e cipolla croccante.",
            },
            precio: 6.99,
          },
          {
            nombre: { es: "Aros de cebolla", en: "Onion rings", de: "Zwiebelringe", fr: "Onion rings", it: "Anelli di cipolla" },
            desc: {
              es: "Aros de cebolla rebozados y crujientes con dip de queso crema.",
              en: "Crispy battered onion rings served with a cream cheese dip.",
              de: "Knusprig frittierte Zwiebelringe mit Frischkäse-Dip.",
              fr: "Rondelles d'oignon panées et croustillantes, servies avec un dip au fromage frais.",
              it: "Anelli di cipolla in pastella croccante con salsa al formaggio spalmabile.",
            },
            precio: 7.99,
          },
          {
            nombre: { es: "Alitas de pollo BBQ (6 u.)", en: "BBQ chicken wings (6 pcs)", de: "BBQ-Chicken-Wings (6 Stk.)", fr: "Ailes de poulet BBQ (6 pcs)", it: "Alette di pollo BBQ (6 pz)" },
            desc: {
              es: "Alitas de pollo crujientes bañadas en nuestra salsa barbacoa casera.",
              en: "Crispy chicken wings coated in our homemade BBQ sauce.",
              de: "Knusprige Chicken Wings in unserer hausgemachten BBQ-Sauce.",
              fr: "Ailes de poulet croustillantes nappées de notre sauce barbecue maison.",
              it: "Alette di pollo croccanti avvolte nella nostra salsa barbecue fatta in casa.",
            },
            precio: 9.99,
          },
          {
            nombre: { es: "Golden Crunch Chicken (6 u.)", en: "Golden Crunch Chicken (6 pcs)", de: "Golden Crunch Chicken (6 Stk.)", fr: "Golden Crunch Chicken (6 pcs)", it: "Golden Crunch Chicken (6 pz)" },
            desc: {
              es: "Bocados de pollo crujiente al estilo Kentucky con nuestra salsa de yogur.",
              en: "Kentucky-style crispy chicken bites served with our yoghurt dipping sauce.",
              de: "Knusprige Hähnchenstücke nach Kentucky-Art mit unserem Joghurt-Dip.",
              fr: "Bouchées de poulet croustillant façon Kentucky, avec notre sauce au yaourt.",
              it: "Bocconcini di pollo croccante in stile Kentucky con la nostra salsa allo yogurt.",
            },
            precio: 10.99,
          },
          {
            nombre: { es: "Tiras de pollo", en: "Chicken tenders", de: "Chicken Tenders", fr: "Chicken tenders", it: "Straccetti di pollo" },
            desc: {
              es: "Tiras de pollo empanadas con salsa barbacoa.",
              en: "Breaded chicken strips served with BBQ sauce.",
              de: "Panierte Hähnchenstreifen mit BBQ-Sauce.",
              fr: "Aiguillettes de poulet panées, servies avec sauce barbecue.",
              it: "Straccetti di pollo impanati con salsa barbecue.",
            },
            precio: 10.99,
          },
          {
            nombre: { es: "Nachos cargados", en: "Loaded nachos", de: "Loaded Nachos", fr: "Nachos garnis", it: "Nachos farciti" },
            desc: {
              es: "Totopos crujientes con pulled pork, salsa barbacoa, nata agria, guacamole y pico de gallo.",
              en: "Crispy tortilla chips topped with pulled pork, BBQ sauce, sour cream, guacamole and pico de gallo.",
              de: "Knusprige Tortillachips mit Pulled Pork, BBQ-Sauce, Sauerrahm, Guacamole und Pico de Gallo.",
              fr: "Chips de tortilla croustillantes garnies de pulled pork, sauce barbecue, crème aigre, guacamole et pico de gallo.",
              it: "Nachos croccanti con pulled pork, salsa barbecue, panna acida, guacamole e pico de gallo.",
            },
            precio: 10.99,
          },
          {
            nombre: { es: "Croquetas de jamón ibérico (4 u.)", en: "Iberian ham croquettes (4 pcs)", de: "Kroketten mit iberischem Schinken (4 Stk.)", fr: "Croquettes au jambon ibérique (4 pcs)", it: "Crocchette di prosciutto iberico (4 pz)" },
            desc: {
              es: "Croquetas doradas con un relleno cremoso de jamón ibérico.",
              en: "Golden croquettes with a creamy Iberian ham filling.",
              de: "Goldbraune Kroketten mit cremiger Füllung aus iberischem Schinken.",
              fr: "Croquettes dorées à la garniture crémeuse de jambon ibérique.",
              it: "Crocchette dorate con un ripieno cremoso di prosciutto iberico.",
            },
            precio: 9.99,
          },
          {
            nombre: { es: "Tequeños de queso (6 u.)", en: "Cheese tequeños (6 pcs)", de: "Käse-Tequeños (6 Stk.)", fr: "Tequeños au fromage (6 pcs)", it: "Tequeños al formaggio (6 pz)" },
            desc: {
              es: "Palitos de queso venezolanos crujientes con mermelada de frutos rojos ligeramente picante.",
              en: "Crispy Venezuelan cheese sticks served with a mildly spiced red berry jam.",
              de: "Knusprige venezolanische Käsesticks mit leicht scharfer Beerenkonfitüre.",
              fr: "Bâtonnets de fromage vénézuéliens croustillants, avec une confiture de fruits rouges légèrement épicée.",
              it: "Bastoncini di formaggio venezuelani croccanti con confettura di frutti rossi leggermente piccante.",
            },
            precio: 8.99,
          },
          {
            nombre: { es: "Costillas de cerdo BBQ (6 u.)", en: "BBQ pork ribs (6 pcs)", de: "BBQ-Schweinerippchen (6 Stk.)", fr: "Travers de porc BBQ (6 pcs)", it: "Costine di maiale BBQ (6 pz)" },
            desc: {
              es: "Costillas de cerdo ahumadas, a la brasa, glaseadas con salsa barbacoa y sésamo tostado.",
              en: "Smoked pork ribs, chargrilled, glazed with BBQ sauce and finished with toasted sesame seeds.",
              de: "Geräucherte Schweinerippchen vom Holzkohlegrill, mit BBQ-Sauce glasiert und mit geröstetem Sesam bestreut.",
              fr: "Travers de porc fumés, grillés au charbon, laqués à la sauce barbecue et parsemés de sésame grillé.",
              it: "Costine di maiale affumicate, alla brace, glassate con salsa barbecue e sesamo tostato.",
            },
            precio: 9.99,
          },
        ],
      },
    ],
  },
  {
    id: "a-la-brasa",
    titulo: { es: "A la brasa", en: "Chargrilled steaks", de: "Vom Holzkohlegrill", fr: "Grillades au charbon", it: "Alla brace" },
    nota: {
      es: "Todas nuestras carnes se hacen a la brasa en horno Josper.",
      en: "All our meats are cooked over charcoal in a Josper oven.",
      de: "Alle unsere Fleischsorten werden im Josper-Holzkohleofen gegart.",
      fr: "Toutes nos viandes sont cuites au charbon de bois dans un four Josper.",
      it: "Tutte le nostre carni sono cotte alla brace nel forno Josper.",
    },
    tone: "red",
    grupos: [
      {
        platos: [
          {
            nombre: { es: "Lomo alto de Angus (aprox. 300 g)", en: "Angus ribeye steak (approx. 300 g)", de: "Angus-Ribeye-Steak (ca. 300 g)", fr: "Entrecôte Angus (env. 300 g)", it: "Ribeye di Angus (circa 300 g)" },
            desc: {
              es: "Lomo alto de Angus de unos 300 g, tierno, jugoso y lleno de sabor, con patatas fritas.",
              en: "Angus ribeye of about 300 g, tender, juicy and full of flavour, served with fries.",
              de: "Angus-Ribeye von etwa 300 g, zart, saftig und voller Geschmack, mit Pommes.",
              fr: "Entrecôte Angus d'environ 300 g, tendre, juteuse et pleine de saveur, servie avec des frites.",
              it: "Ribeye di Angus di circa 300 g, tenera, succosa e piena di sapore, servita con patatine.",
            },
            precio: 23.9,
          },
          {
            nombre: { es: "Solomillo de Angus (250 g)", en: "Angus fillet steak (250 g)", de: "Angus-Filetsteak (250 g)", fr: "Filet d'Angus (250 g)", it: "Filetto di Angus (250 g)" },
            desc: {
              es: "250 g de solomillo de Angus, tierno y jugoso, con patatas fritas y verduras de temporada.",
              en: "250 g Angus fillet, tender and juicy, served with fries and seasonal vegetables.",
              de: "250 g Angus-Filet, zart und saftig, mit Pommes und Gemüse der Saison.",
              fr: "250 g de filet d'Angus, tendre et juteux, servi avec des frites et des légumes de saison.",
              it: "250 g di filetto di Angus, tenero e succoso, servito con patatine e verdure di stagione.",
            },
            precio: 26.9,
          },
          {
            nombre: { es: "Costillas de ternera ahumadas", en: "Smoked beef ribs", de: "Geräucherte Rinderrippen", fr: "Travers de bœuf fumés", it: "Costine di manzo affumicate" },
            desc: {
              es: "Dos costillas de ternera ahumadas (unos 300 g cada una), cocinadas a fuego lento durante horas hasta quedar tiernas y jugosas, glaseadas con nuestra salsa barbacoa casera.",
              en: "Two smoked beef ribs (about 300 g each), slow-cooked for hours until tender and juicy, glazed with our homemade BBQ sauce.",
              de: "Zwei geräucherte Rinderrippen (je ca. 300 g), stundenlang langsam gegart, bis sie zart und saftig sind, glasiert mit unserer hausgemachten BBQ-Sauce.",
              fr: "Deux travers de bœuf fumés (environ 300 g chacun), cuits lentement pendant des heures jusqu'à être tendres et juteux, laqués à notre sauce barbecue maison.",
              it: "Due costine di manzo affumicate (circa 300 g l'una), cotte lentamente per ore fino a diventare tenere e succose, glassate con la nostra salsa barbecue fatta in casa.",
            },
            precio: 26.9,
          },
        ],
      },
    ],
  },
  {
    id: "ensaladas",
    titulo: { es: "Ensaladas", en: "Salads", de: "Salate", fr: "Salades", it: "Insalate" },
    tone: "teal",
    grupos: [
      {
        platos: [
          {
            nombre: { es: "Ensalada César", en: "Caesar salad", de: "Caesar Salad", fr: "Salade César", it: "Insalata Caesar" },
            desc: {
              es: "Cogollos, tomate, pollo a la plancha, parmesano rallado, picatostes y salsa César.",
              en: "Baby gem lettuce, tomatoes, grilled chicken, grated Parmesan, croutons and Caesar dressing.",
              de: "Baby-Gem-Salat, Tomaten, gegrilltes Hähnchen, geriebener Parmesan, Croûtons und Caesar-Dressing.",
              fr: "Sucrine, tomates, poulet grillé, parmesan râpé, croûtons et sauce César.",
              it: "Lattuga baby gem, pomodori, pollo alla griglia, parmigiano grattugiato, crostini e salsa Caesar.",
            },
            precio: 11.99,
          },
          {
            nombre: { es: "Ensalada Caprese", en: "Caprese salad", de: "Caprese", fr: "Salade Caprese", it: "Insalata Caprese" },
            desc: {
              es: "Mozzarella fresca, tomate, albahaca y aceite de oliva virgen extra.",
              en: "Fresh mozzarella, tomatoes, basil and extra virgin olive oil.",
              de: "Frischer Mozzarella, Tomaten, Basilikum und natives Olivenöl extra.",
              fr: "Mozzarella fraîche, tomates, basilic et huile d'olive vierge extra.",
              it: "Mozzarella fresca, pomodori, basilico e olio extravergine d'oliva.",
            },
            precio: 9.99,
          },
          {
            nombre: { es: "Ensalada de tomate de Lanzarote", en: "Lanzarote tomato salad", de: "Lanzarote-Tomatensalat", fr: "Salade de tomates de Lanzarote", it: "Insalata di pomodori di Lanzarote" },
            desc: {
              es: "Tomate fresco de Lanzarote con aceite de oliva virgen extra y escamas de sal marina.",
              en: "Fresh locally grown Lanzarote tomatoes with extra virgin olive oil and flaky sea salt.",
              de: "Frische Tomaten aus Lanzarote mit nativem Olivenöl extra und Meersalzflocken.",
              fr: "Tomates fraîches de Lanzarote, huile d'olive vierge extra et fleur de sel.",
              it: "Pomodori freschi di Lanzarote con olio extravergine d'oliva e fiocchi di sale marino.",
            },
            precio: 12.99,
          },
        ],
      },
    ],
  },
  {
    id: "postres",
    titulo: { es: "Postres", en: "Desserts", de: "Desserts", fr: "Desserts", it: "Dolci" },
    tone: "cheese",
    grupos: [
      {
        platos: [
          {
            nombre: { es: "Tarta de queso vasca", en: "Basque cheesecake", de: "Baskischer Käsekuchen", fr: "Cheesecake basque", it: "Cheesecake basca" },
            desc: {
              es: "Nuestra tarta de queso vasca casera, muy cremosa.",
              en: "Our homemade creamy Basque cheesecake.",
              de: "Unser hausgemachter, cremiger baskischer Käsekuchen.",
              fr: "Notre cheesecake basque maison, bien crémeux.",
              it: "La nostra cheesecake basca fatta in casa, cremosissima.",
            },
            precio: 6.99,
          },
          {
            nombre: { es: "Tarta de queso vasca de pistacho", en: "Pistachio Basque cheesecake", de: "Baskischer Pistazien-Käsekuchen", fr: "Cheesecake basque à la pistache", it: "Cheesecake basca al pistacchio" },
            desc: {
              es: "Nuestra tarta de queso vasca casera con pistacho.",
              en: "Our homemade creamy pistachio Basque cheesecake.",
              de: "Unser hausgemachter, cremiger baskischer Käsekuchen mit Pistazie.",
              fr: "Notre cheesecake basque maison à la pistache.",
              it: "La nostra cheesecake basca fatta in casa al pistacchio.",
            },
            precio: 7.99,
          },
          {
            nombre: { es: "Brownie de chocolate", en: "Chocolate brownie", de: "Schokoladenbrownie", fr: "Brownie au chocolat", it: "Brownie al cioccolato" },
            desc: {
              es: "Brownie de chocolate y almendra con helado de vainilla y salsa de chocolate.",
              en: "Rich chocolate and almond brownie with vanilla ice cream and chocolate sauce.",
              de: "Saftiger Brownie mit Schokolade und Mandeln, Vanilleeis und Schokoladensauce.",
              fr: "Brownie fondant au chocolat et aux amandes, glace vanille et sauce chocolat.",
              it: "Brownie al cioccolato e mandorle con gelato alla vaniglia e salsa al cioccolato.",
            },
            precio: 6.99,
          },
          {
            nombre: N("Hot Cookie"),
            desc: {
              es: "Cookie recién horneada de chocolate con leche y negro, con helado de vainilla y Nutella.",
              en: "Freshly baked cookie with milk and dark chocolate, served with vanilla ice cream and Nutella.",
              de: "Frisch gebackener Cookie mit Milch- und Zartbitterschokolade, dazu Vanilleeis und Nutella.",
              fr: "Cookie tout juste sorti du four, au chocolat au lait et noir, servi avec glace vanille et Nutella.",
              it: "Cookie appena sfornato al cioccolato al latte e fondente, con gelato alla vaniglia e Nutella.",
            },
            precio: 6.99,
          },
          { nombre: { es: "Helado", en: "Ice cream", de: "Eis", fr: "Glace", it: "Gelato" }, precio: 5.99 },
        ],
      },
    ],
  },
  {
    id: "bebidas",
    titulo: { es: "Bebidas", en: "Drinks", de: "Getränke", fr: "Boissons", it: "Bevande" },
    tone: "plain",
    compacta: true,
    grupos: [
      {
        titulo: { es: "Agua y refrescos", en: "Water & soft drinks", de: "Wasser & Softdrinks", fr: "Eaux & sodas", it: "Acqua e bibite" },
        platos: [
          { nombre: { es: "Agua sin gas", en: "Still water", de: "Stilles Wasser", fr: "Eau plate", it: "Acqua naturale" }, precio: 2.8 },
          { nombre: { es: "Agua con gas", en: "Sparkling water", de: "Sprudelwasser", fr: "Eau gazeuse", it: "Acqua frizzante" }, precio: 2.8 },
          { nombre: N("Coca-Cola"), precio: 2.6 },
          { nombre: N("Coca-Cola Zero"), precio: 2.6 },
          { nombre: { es: "Fanta Naranja", en: "Fanta Orange", de: "Fanta Orange", fr: "Fanta Orange", it: "Fanta Aranciata" }, precio: 2.6 },
          { nombre: { es: "Fanta Limón", en: "Fanta Lemon", de: "Fanta Zitrone", fr: "Fanta Citron", it: "Fanta Limone" }, precio: 2.6 },
          { nombre: { es: "Tónica", en: "Tonic water", de: "Tonic Water", fr: "Tonic", it: "Acqua tonica" }, precio: 2.8 },
          { nombre: N("Sprite"), precio: 2.6 },
          { nombre: N("Nestea"), precio: 2.6 },
          { nombre: N("Appletiser"), precio: 2.6 },
          { nombre: { es: "Limonada natural", en: "Fresh lemonade", de: "Frische Limonade", fr: "Limonade fraîche", it: "Limonata fresca" }, precio: 3.5 },
          { nombre: { es: "Té helado", en: "Iced tea", de: "Eistee", fr: "Thé glacé", it: "Tè freddo" }, precio: 3.5 },
        ],
      },
      {
        titulo: { es: "Café y té", en: "Coffee & tea", de: "Kaffee & Tee", fr: "Café & thé", it: "Caffè e tè" },
        platos: [
          { nombre: N("Espresso"), precio: 1.8 },
          { nombre: { es: "Espresso doble", en: "Double espresso", de: "Doppelter Espresso", fr: "Double espresso", it: "Doppio espresso" }, precio: 2.2 },
          { nombre: N("Americano"), precio: 1.9 },
          { nombre: { es: "Americano con leche", en: "White americano", de: "Americano mit Milch", fr: "Americano au lait", it: "Americano con latte" }, precio: 2.6 },
          { nombre: { es: "Café con leche", en: "Coffee with milk", de: "Milchkaffee", fr: "Café au lait", it: "Caffellatte" }, precio: 2.6 },
          { nombre: N("Cappuccino"), precio: 2.9 },
          { nombre: { es: "Chocolate caliente", en: "Hot chocolate", de: "Heiße Schokolade", fr: "Chocolat chaud", it: "Cioccolata calda" }, precio: 3.6 },
          { nombre: { es: "Té negro", en: "Black tea", de: "Schwarzer Tee", fr: "Thé noir", it: "Tè nero" }, precio: 2 },
          { nombre: { es: "Té verde", en: "Green tea", de: "Grüner Tee", fr: "Thé vert", it: "Tè verde" }, precio: 2 },
          { nombre: { es: "Poleo menta", en: "Peppermint tea", de: "Pfefferminztee", fr: "Infusion à la menthe", it: "Tisana alla menta" }, precio: 2 },
          { nombre: { es: "Manzanilla", en: "Chamomile tea", de: "Kamillentee", fr: "Camomille", it: "Camomilla" }, precio: 2 },
          { nombre: N("Rooibos"), precio: 2 },
          { nombre: { es: "Vaso de leche", en: "Glass of milk", de: "Glas Milch", fr: "Verre de lait", it: "Bicchiere di latte" }, precio: 2 },
        ],
      },
      {
        titulo: { es: "Zumos", en: "Juices", de: "Säfte", fr: "Jus", it: "Succhi" },
        platos: [
          { nombre: { es: "Zumo de naranja", en: "Orange juice", de: "Orangensaft", fr: "Jus d'orange", it: "Succo d'arancia" }, precio: 2.9 },
          { nombre: { es: "Zumo de manzana", en: "Apple juice", de: "Apfelsaft", fr: "Jus de pomme", it: "Succo di mela" }, precio: 2.9 },
          { nombre: { es: "Zumo de piña", en: "Pineapple juice", de: "Ananassaft", fr: "Jus d'ananas", it: "Succo d'ananas" }, precio: 2.9 },
          { nombre: { es: "Zumo de naranja natural", en: "Fresh orange juice", de: "Frisch gepresster Orangensaft", fr: "Jus d'orange pressé", it: "Spremuta d'arancia" }, precio: 3.9 },
        ],
      },
      {
        titulo: { es: "Cócteles", en: "Cocktails", de: "Cocktails", fr: "Cocktails", it: "Cocktail" },
        platos: [
          {
            nombre: N("Mojito Classic"),
            desc: {
              es: "Ron blanco, hierbabuena fresca, zumo de lima natural, azúcar y soda.",
              en: "White rum, fresh mint, fresh lime juice, sugar and soda water.",
              de: "Weißer Rum, frische Minze, frischer Limettensaft, Zucker und Soda.",
              fr: "Rhum blanc, menthe fraîche, jus de citron vert frais, sucre et eau gazeuse.",
              it: "Rum bianco, menta fresca, succo di lime fresco, zucchero e soda.",
            },
            precio: 8.99,
          },
          {
            nombre: N("Mojito Strawberry"),
            desc: {
              es: "Ron blanco, hierbabuena fresca, zumo de lima natural, fresas, azúcar y soda.",
              en: "White rum, fresh mint, fresh lime juice, strawberries, sugar and soda water.",
              de: "Weißer Rum, frische Minze, frischer Limettensaft, Erdbeeren, Zucker und Soda.",
              fr: "Rhum blanc, menthe fraîche, jus de citron vert frais, fraises, sucre et eau gazeuse.",
              it: "Rum bianco, menta fresca, succo di lime fresco, fragole, zucchero e soda.",
            },
            precio: 8.99,
          },
          {
            nombre: N("Sex on the Beach"),
            desc: {
              es: "Vodka, licor de melocotón, zumo de naranja y granadina.",
              en: "Vodka, peach liqueur, orange juice and grenadine.",
              de: "Wodka, Pfirsichlikör, Orangensaft und Grenadine.",
              fr: "Vodka, liqueur de pêche, jus d'orange et grenadine.",
              it: "Vodka, liquore alla pesca, succo d'arancia e granatina.",
            },
            precio: 8.99,
          },
          {
            nombre: N("Piña Colada"),
            desc: {
              es: "Ron, licor de coco, leche de coco y zumo de arándanos.",
              en: "Rum, coconut liqueur, coconut milk and cranberry juice.",
              de: "Rum, Kokoslikör, Kokosmilch und Cranberrysaft.",
              fr: "Rhum, liqueur de coco, lait de coco et jus de cranberry.",
              it: "Rum, liquore al cocco, latte di cocco e succo di mirtillo rosso.",
            },
            precio: 8.99,
          },
          {
            nombre: N("Strawberry Daiquiri"),
            desc: {
              es: "Ron, zumo de lima y fresas.",
              en: "Rum, lime juice and strawberries.",
              de: "Rum, Limettensaft und Erdbeeren.",
              fr: "Rhum, jus de citron vert et fraises.",
              it: "Rum, succo di lime e fragole.",
            },
            precio: 8.99,
          },
          {
            nombre: N("Porn Star Martini"),
            desc: {
              es: "Vodka de vainilla, licor de maracuyá, zumo de lima y prosecco.",
              en: "Vanilla vodka, passion fruit liqueur, lime juice and prosecco.",
              de: "Vanillewodka, Maracujalikör, Limettensaft und Prosecco.",
              fr: "Vodka vanille, liqueur de fruit de la passion, jus de citron vert et prosecco.",
              it: "Vodka alla vaniglia, liquore al frutto della passione, succo di lime e prosecco.",
            },
            precio: 8.99,
          },
          {
            nombre: N("Long Island Iced Tea"),
            desc: {
              es: "Vodka, tequila, ron, ginebra, triple seco, zumo de lima y Coca-Cola.",
              en: "Vodka, tequila, rum, gin, triple sec, lime juice and Coca-Cola.",
              de: "Wodka, Tequila, Rum, Gin, Triple Sec, Limettensaft und Coca-Cola.",
              fr: "Vodka, tequila, rhum, gin, triple sec, jus de citron vert et Coca-Cola.",
              it: "Vodka, tequila, rum, gin, triple sec, succo di lime e Coca-Cola.",
            },
            precio: 8.99,
          },
          {
            nombre: N("Espresso Martini"),
            desc: {
              es: "Vodka, licor de café y un espresso.",
              en: "Vodka, coffee liqueur and an espresso shot.",
              de: "Wodka, Kaffeelikör und ein Espresso.",
              fr: "Vodka, liqueur de café et un shot d'espresso.",
              it: "Vodka, liquore al caffè e un espresso.",
            },
            precio: 8.99,
          },
          {
            nombre: N("Tequila Sunrise"),
            desc: {
              es: "Tequila, zumo de naranja y granadina.",
              en: "Tequila, orange juice and grenadine.",
              de: "Tequila, Orangensaft und Grenadine.",
              fr: "Tequila, jus d'orange et grenadine.",
              it: "Tequila, succo d'arancia e granatina.",
            },
            precio: 8.99,
          },
          {
            nombre: N("Margarita"),
            desc: {
              es: "Tequila, triple seco y zumo de lima.",
              en: "Tequila, triple sec and lime juice.",
              de: "Tequila, Triple Sec und Limettensaft.",
              fr: "Tequila, triple sec et jus de citron vert.",
              it: "Tequila, triple sec e succo di lime.",
            },
            precio: 8.99,
          },
          {
            nombre: { es: "San Francisco (sin alcohol)", en: "San Francisco (alcohol-free)", de: "San Francisco (alkoholfrei)", fr: "San Francisco (sans alcool)", it: "San Francisco (analcolico)" },
            desc: {
              es: "Zumo de naranja y piña con granadina.",
              en: "Orange and pineapple juice with grenadine.",
              de: "Orangen- und Ananassaft mit Grenadine.",
              fr: "Jus d'orange et d'ananas avec grenadine.",
              it: "Succo d'arancia e ananas con granatina.",
            },
            precio: 8.99,
          },
        ],
      },
      {
        titulo: { es: "Cervezas", en: "Beers", de: "Biere", fr: "Bières", it: "Birre" },
        platos: [
          { nombre: { es: "Caña de barril", en: "Draught beer, small", de: "Bier vom Fass, klein", fr: "Pression, petite", it: "Birra alla spina piccola" }, precio: 2.5 },
          { nombre: { es: "Jarra de barril", en: "Draught beer, large", de: "Bier vom Fass, groß", fr: "Pression, grande", it: "Birra alla spina grande" }, precio: 3.5 },
          { nombre: N("Guinness"), precio: 5.5 },
          { nombre: N("Corona"), precio: 3.5 },
          { nombre: N("Budweiser"), precio: 3.5 },
          { nombre: N("Heineken"), precio: 3.5 },
          { nombre: N("Coors Light"), precio: 3.5 },
          { nombre: N("Dorada"), precio: 3.5 },
          { nombre: { es: "Cerveza sin alcohol", en: "Alcohol-free beer", de: "Alkoholfreies Bier", fr: "Bière sans alcool", it: "Birra analcolica" }, precio: 2.9 },
          { nombre: { es: "Cerveza sin gluten", en: "Gluten-free beer", de: "Glutenfreies Bier", fr: "Bière sans gluten", it: "Birra senza glutine" }, precio: 2.9 },
        ],
      },
      {
        titulo: { es: "Sidra y alcopops", en: "Cider & alcopops", de: "Cider & Alcopops", fr: "Cidre & alcopops", it: "Sidro e alcopop" },
        platos: [
          {
            nombre: N("Kopparberg"),
            desc: {
              es: "Fresa y lima · Frutas variadas",
              en: "Strawberry & lime · Mixed fruit",
              de: "Erdbeere-Limette · Gemischte Früchte",
              fr: "Fraise-citron vert · Fruits mélangés",
              it: "Fragola e lime · Frutti misti",
            },
            precio: 5.5,
          },
          { nombre: N("Strongbow"), precio: 3.5 },
          { nombre: N("Magners"), precio: 5.5 },
          { nombre: N("Bacardi Breezer"), precio: 4.5 },
          { nombre: N("Smirnoff Ice"), precio: 4.5 },
        ],
      },
      {
        titulo: { es: "Cafés con licor y sangría", en: "Liqueur coffees & sangria", de: "Kaffee mit Likör & Sangria", fr: "Cafés alcoolisés & sangria", it: "Caffè corretti e sangria" },
        platos: [
          { nombre: N("Irish Coffee"), precio: 5.95 },
          { nombre: N("Baileys Coffee"), precio: 5.95 },
          { nombre: N("Calypso Coffee"), precio: 5.95 },
          { nombre: N("French Coffee"), precio: 5.95 },
          { nombre: N("Barraquito / Carajillo"), precio: 4.95 },
          { nombre: { es: "Sangría ½ l", en: "Sangria ½ l", de: "Sangria ½ l", fr: "Sangria ½ l", it: "Sangria ½ l" }, precio: 8.99 },
          { nombre: { es: "Sangría 1 l", en: "Sangria 1 l", de: "Sangria 1 l", fr: "Sangria 1 l", it: "Sangria 1 l" }, precio: 13.99 },
        ],
      },
    ],
  },
];
