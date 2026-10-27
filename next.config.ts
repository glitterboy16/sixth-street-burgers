import type { NextConfig } from "next";

// Exportación estática para GitHub Pages: PAGES_BASE_PATH=/nombre-del-repo npm run build  →  out/
// Sin esa variable (desarrollo local o Vercel) la configuración es la normal de Next.
// En modo export no puede haber prerender parcial (cacheComponents / partialPrefetching).
const pagesBasePath = process.env.PAGES_BASE_PATH;
const isPages = pagesBasePath !== undefined;

const nextConfig: NextConfig = {
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
        trailingSlash: true,
        basePath: pagesBasePath,
        assetPrefix: pagesBasePath,
        env: { NEXT_PUBLIC_BASE_PATH: pagesBasePath },
        images: { loader: "custom", loaderFile: "./image-loader.ts" },
      }
    : {}),
};

export default nextConfig;
