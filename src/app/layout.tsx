import type { Metadata, Viewport } from "next";
import { Alfa_Slab_One, Anton, Geist, Geist_Mono, Yellowtail } from "next/font/google";
import { site } from "@/data/site";
import "./globals.css";
import "./sections.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const geist = Geist({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-geist", display: "swap" });
// tipografías del rombo del cartel (WelcomeBadge): caligrafía de "to Fabulous" y letra de las fichas WELCOME
const yellowtail = Yellowtail({ weight: "400", subsets: ["latin"], variable: "--font-yellowtail", display: "swap" });
const alfa = Alfa_Slab_One({ weight: "400", subsets: ["latin"], variable: "--font-alfa", display: "swap" });
const geistMono = Geist_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: `${site.name} — Smash burgers en Lanzarote`,
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    siteName: site.name,
    // vista previa al compartir el enlace (WhatsApp, Instagram…): si cambia, cambia también el nombre del archivo
    // para que las apps no sigan mostrando la versión que tienen en caché
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/og-v2.jpg`,
        width: 1200,
        height: 630,
        alt: "Sixth Street Burger Club: Muerde fuerte. Smash burger doble con cheddar, lechuga y tomate.",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0B0A09" },
    { media: "(prefers-color-scheme: light)", color: "#F6F1E7" },
  ],
};

// Aplica el tema guardado antes del primer pintado para evitar el parpadeo.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const themeScript = `(function(){try{var t=localStorage.getItem("ssb-theme");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      data-theme="dark"
      suppressHydrationWarning
      className={`${anton.variable} ${geist.variable} ${geistMono.variable} ${yellowtail.variable} ${alfa.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* primer fotograma del hero (LCP): el canvas lo pinta en cuanto llega */}
        <link rel="preload" as="image" href={`${BASE}/frames/dark/h/frame_000.webp`} />
      </head>
      <body>{children}</body>
    </html>
  );
}
