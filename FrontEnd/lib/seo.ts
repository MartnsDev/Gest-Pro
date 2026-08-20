import type { Metadata } from "next";

export const SITE_URL = "https://www.gevyro.com.br";
export const SITE_NAME = "Gevyro";
export const DEFAULT_TITLE = "Gevyro | Software de Gestão Empresarial";
export const DEFAULT_DESCRIPTION =
  "Administre vendas, estoque, clientes, caixa e resultados da sua empresa em um só lugar com o software de gestão empresarial Gevyro.";
export const SOCIAL_IMAGE = "/images/social/gevyro-dashboard.avif";

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "pt_BR",
      type: "website",
      images: [{ url: SOCIAL_IMAGE, width: 1200, height: 630, alt: "Painel de gestão empresarial Gevyro", type: "image/avif" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [SOCIAL_IMAGE],
    },
  };
}

export function privatePageMetadata(title: string, path: string): Metadata {
  return {
    title,
    alternates: { canonical: path },
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false, noimageindex: true },
    },
  };
}
