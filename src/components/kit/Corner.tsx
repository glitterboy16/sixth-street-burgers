type Props = { pos: "tl" | "tr" | "bl" | "br"; children: React.ReactNode };

/** Etiqueta mono de esquina de sección. */
export default function Corner({ pos, children }: Props) {
  return <p className={`corner corner--${pos}`}>{children}</p>;
}
