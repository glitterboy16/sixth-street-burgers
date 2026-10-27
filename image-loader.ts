// Cargador de next/image para la exportación estática (GitHub Pages): sirve el archivo tal cual, con el
// prefijo del repositorio delante. Sin servidor no hay optimización de imágenes; las exportamos ya al
// tamaño y calidad finales (WebP) desde los scripts.
export default function imageLoader({ src }: { src: string; width: number; quality?: number }) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return src.startsWith("/") ? `${base}${src}` : src;
}
