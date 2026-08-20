import type { ReactNode } from "react";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Assinatura", "/pagamento");

export default function PaymentLayout({ children }: { children: ReactNode }) {
  return children;
}
