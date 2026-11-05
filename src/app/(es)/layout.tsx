import type { ReactNode } from "react";
import Shell, { viewport as shellViewport } from "@/components/Shell";

// Layout raíz del español (la raíz del sitio). El resto de idiomas vive en app/[lang]/.
export const viewport = shellViewport;

export default function EsLayout({ children }: { children: ReactNode }) {
  return <Shell lang="es">{children}</Shell>;
}
