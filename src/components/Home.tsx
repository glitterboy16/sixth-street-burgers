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
import HERO_ANCHO from "@/data/hero-ancho.json";
import HERO_ALTO from "@/data/hero-alto.json";
import { AMPLIACION_MAX, Z_CERRADA, Z_MOVIL } from "@/components/sections/hero-zoom";
import { schedule, site } from "@/data/site";
import { dict, homeHref, menuHref, type Lang } from "@/i18n";
import { SITE_URL } from "@/i18n/meta";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Precarga del primer fotograma del hero (el LCP) con la misma elección que hace Hero.tsx: juego por la forma de la
// pantalla (ancho/alto) y tamaño por los píxeles que hacen falta con el zoom de partida (h si m se vería ampliado).
type HeroJson = Pick<typeof HERO_ALTO, "set" | "stamp" | "sizes"> & { plate?: { ext: number } };
const first = (h: HeroJson, z: number) => ({ set: h.set, v: h.stamp, mw: h.sizes.m.width * (1 + (h.plate?.ext ?? 0)), mh: h.sizes.m.height, z });
const preloadScript = `(function(){try{var A=${JSON.stringify(first(HERO_ANCHO, Z_CERRADA))},V=${JSON.stringify(first(HERO_ALTO, Z_MOVIL))};var nav=innerWidth>=900?88:72;var w=innerWidth,h=innerHeight-nav;var S=innerWidth>innerHeight?A:V;var zz=S===A&&w>=900?S.z:${Z_MOVIL};var k=Math.max(w/S.mw,h/S.mh)*zz*Math.min(devicePixelRatio||1,2);var z=k>${AMPLIACION_MAX}?"h":"m";var l=document.createElement("link");l.rel="preload";l.as="image";l.fetchPriority="high";l.href=${JSON.stringify(BASE)}+"/frames/"+S.set+"/"+z+"/frame_000.webp?v="+S.v;document.head.appendChild(l)}catch(e){}})();`;

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
    image: `${SITE_URL}${BASE}/images/og-v4.jpg`,
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
