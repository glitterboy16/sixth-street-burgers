import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

// Exportación estática para GitHub Pages: PAGES_BASE_PATH=/nombre-del-repo npm run build  →  out/
// Sin esa variable (desarrollo local o Vercel) la configuración es la normal de Next.
// En modo export no puede haber prerender parcial (cacheComponents / partialPrefetching).
const pagesBasePath = process.env.PAGES_BASE_PATH;
const isPages = pagesBasePath !== undefined;

// sitemap.xml y robots.txt se escriben en public/ al arrancar el build: valen para Vercel y para la exportación
// estática (app/sitemap.ts no puede ser estático con cacheComponents ni dinámico con output: export).
{
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const base = pagesBasePath ?? "";
  const langs = ["es", "en", "de", "fr", "it"];
  const pages = ["/", "/carta/"];
  const loc = (l: string, p: string) => `${siteUrl}${base}${l === "es" ? "" : `/${l}`}${p}`;
  const alt = (x: string, href: string) => `    <xhtml:link rel="alternate" hreflang="${x}" href="${href}" />`;
  const url = (l: string, p: string) =>
    [`  <url>`, `    <loc>${loc(l, p)}</loc>`, ...langs.map((x) => alt(x, loc(x, p))), alt("x-default", loc("es", p)), `  </url>`].join("\n");
  const body = pages.flatMap((p) => langs.map((l) => url(l, p))).join("\n");
  const pub = path.join(process.cwd(), "public");
  fs.writeFileSync(
    path.join(pub, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`,
  );
  fs.writeFileSync(path.join(pub, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}${base}/sitemap.xml\n`);
}

const nextConfig: NextConfig = {
  // El token publico de Mapbox (MAPBOX_TOKEN en .env.local / Vercel) llega al navegador como NEXT_PUBLIC_MAPBOX_TOKEN
  env: {
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.MAPBOX_TOKEN ?? "",
    ...(isPages ? { NEXT_PUBLIC_BASE_PATH: pagesBasePath } : {}),
  },
  // las URL llevan barra final en todos los despliegues (/en/, /carta/): mismas rutas en Vercel y GitHub Pages
  trailingSlash: true,
  cacheComponents: !isPages,
  partialPrefetching: !isPages,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  ...(isPages
    ? {
        output: "export",
        basePath: pagesBasePath,
        assetPrefix: pagesBasePath,
        images: { loader: "custom", loaderFile: "./image-loader.ts" },
      }
    : {}),
};

export default nextConfig;
