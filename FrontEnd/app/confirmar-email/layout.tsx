import type { ReactNode } from "react";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Confirmar e-mail", "/confirmar-email");

export default function EmailConfirmationLayout({ children }: { children: ReactNode }) {
  return children;
}
