import type { ReactNode } from "react";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Recuperar senha", "/esqueceu-senha");

export default function PasswordRecoveryLayout({ children }: { children: ReactNode }) {
  return children;
}
