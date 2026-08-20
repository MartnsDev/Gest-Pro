import type { ReactNode } from "react";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Criar conta", "/auth/cadastro");

export default function RegistrationLayout({ children }: { children: ReactNode }) {
  return children;
}
