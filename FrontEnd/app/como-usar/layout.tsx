import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Como usar o Gevyro",
  description: "Aprenda a usar vendas, produtos, estoque, clientes, caixa, relatórios e empresas no software de gestão Gevyro.",
  path: "/como-usar",
});

export default function HowToLayout({ children }: { children: ReactNode }) {
  return children;
}
