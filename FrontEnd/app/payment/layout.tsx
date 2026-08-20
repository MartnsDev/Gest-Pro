import type { ReactNode } from "react";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Confirmação de pagamento", "/payment/sucesso");

export default function PaymentResultLayout({ children }: { children: ReactNode }) {
  return children;
}
