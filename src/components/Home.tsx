import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Ticker from "@/components/sections/Ticker";
import Statement from "@/components/sections/Statement";
import Choose from "@/components/sections/Choose";
import Products from "@/components/sections/Products";
import Inside from "@/components/sections/Inside";
import BigType from "@/components/sections/BigType";
import Fries from "@/components/sections/Fries";
import Venue from "@/components/sections/Venue";
import Collage from "@/components/sections/Collage";
import Grab from "@/components/sections/Grab";
import Manifesto from "@/components/sections/Manifesto";
import Wordmark from "@/components/sections/Wordmark";
import Cta from "@/components/sections/Cta";
import MapSection from "@/components/sections/MapSection";
import Footer from "@/components/sections/Footer";
import Reveals from "@/components/Reveals";
import Boot from "@/components/Boot";
import { FRAMES } from "@/data/frames";
import { FRAMES_DARK } from "@/data/frames-dark";
import { schedule, site } from "@/data/site";
import { dict, homeHref, menuHref, type Lang } from "@/i18n";
import { SITE_URL } from "@/i18n/meta";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Precarga del primer fotograma del hero (el LCP) elegido como lo hará Hero.tsx: juego del tema activo y tamaño
// según pantalla (h escritorio, d móvil de alta densidad, m móvil de baja). Antes se precargaba siempre el 2K
// oscuro, que en un iPhone claro eran 300 KB tirados.
const first = (set: typeof FRAMES) => ({ h: set.path(0, "h"), d: set.path(0, "d"), m: set.path(0, "m") });
const preloadScript = `(function(){try{var F=${JSON.stringify({ dark: first(FRAMES_DARK), light: first(FRAMES) })};var dark=document.documentElement.dataset.theme!=="light";var s=innerWidth<640?((devicePixelRatio||1)<2?"m":"d"):"h";var l=document.createElement("link");l.rel="preload";l.as="image";l.fetchPriority="high";l.href=${JSON.stringify(BASE)}+F[dark?"dark":"light"][s];document.head.appendChild(l)}catch(e){}})();`;

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Home({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const url = `${SITE_URL}${homeHref(lang)}`;
  // datos estructurados del restaurante (Google): dirección, horario, mapa y carta
  const ld = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: site.name,
    url,
    image: `${SITE_URL}${BASE}/images/og-v3.jpg`,
    description: t.meta.description,
    servesCuisine: ["Smash burgers", "American"],
    priceRange: "€€",
    telephone: site.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address[0],
      addressLocality: site.address[1],
      addressRegion: site.address[2],
      postalCode: site.postalCode,
      addressCountry: "ES",
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    openingHoursSpecification: schedule.map((s) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: s.days.map((d) => DAYS[d]),
      opens: s.open,
      closes: s.close,
    })),
    hasMenu: `${SITE_URL}${menuHref(lang)}`,
    sameAs: [site.instagram.url],
  };

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: preloadScript }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <a href="#contenido" className="skip">
        {t.common.skip}
      </a>
      <Boot waitFrame />
      <Nav page="/" />
      <main id="contenido" tabIndex={-1}>
        <Hero />
        <Ticker />
        <Statement lang={lang} />
        <Choose lang={lang} />
        <Products />
        <Inside lang={lang} />
        <BigType lang={lang} />
        <Fries lang={lang} />
        <Venue lang={lang} />
        <Collage lang={lang} />
        <Grab lang={lang} />
        <Manifesto lang={lang} />
        <Wordmark lang={lang} />
        <MapSection />
        <Cta lang={lang} />
      </main>
      <Footer lang={lang} />
      <Reveals />
    </>
  );
}
