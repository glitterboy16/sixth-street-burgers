import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  /** Sombra de contacto elíptica bajo el objeto (objetos apoyados). Desactivar para objetos flotando. */
  contact?: boolean;
  /** Sombra ambiental que sigue la silueta (drop-shadow). */
  ambient?: boolean;
};

/**
 * Imagen recortada (PNG/WebP con alfa) con sombras pintadas por CSS en vez de horneadas en la foto:
 * así la sombra es la misma en todos los fondos y nunca aparece cortada por el borde del recorte.
 */
export default function Cutout({ src, alt, sizes, priority, contact = true, ambient = true }: Props) {
  return (
    <div className="cutout">
      {contact && <span className="cutout__contact" aria-hidden="true" />}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={ambient ? "cutout__img cutout__img--ambient" : "cutout__img"}
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}
