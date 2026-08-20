import type { ReactNode } from "react";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Entrar", "/auth/login");

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
