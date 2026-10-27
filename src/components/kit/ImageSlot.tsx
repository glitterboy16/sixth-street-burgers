import Image from "next/image";
import { slots, placeholders, type SlotId } from "@/data/images";
import Cutout from "@/components/kit/Cutout";

type Props = {
  id: SlotId;
  shape?: "rect" | "circle";
  fit?: "contain" | "cover";
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/**
 * Hueco de imagen: foto real si está en data/images.ts, placeholder neutro con el nombre del hueco si no.
 * Las imágenes recortadas (`cutout`) se pintan con sus sombras CSS y sin recorte circular.
 */
export default function ImageSlot({
  id,
  shape = "rect",
  fit = "contain",
  sizes = "(max-width: 640px) 90vw, 50vw",
  priority,
  className = "",
}: Props) {
  const img = slots[id];
  const circle = shape === "circle" ? "slot--circle" : "";
  if (!img) {
    return (
      <div className={`slot slot--empty ${circle} ${className}`} role="img" aria-label={placeholders[id]}>
        <span>{placeholders[id]}</span>
      </div>
    );
  }
  if (img.cutout) {
    return (
      <div className={`slot slot--cutout ${className}`}>
        <Cutout src={img.src} alt={img.alt} sizes={sizes} priority={priority} contact={img.cutout === "contact"} />
      </div>
    );
  }
  return (
    <div className={`slot ${circle} ${className}`}>
      <Image src={img.src} alt={img.alt} fill sizes={sizes} priority={priority} style={{ objectFit: fit }} />
    </div>
  );
}
