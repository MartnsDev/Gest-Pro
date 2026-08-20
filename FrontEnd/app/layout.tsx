import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { CookieConsent } from "@/components/cookie-consent";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { LanguageProvider } from "@/components/language-provider";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_URL,
  SOCIAL_IMAGE,
} from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | Gevyro",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "default" },
  keywords: ["Gevyro", "software de gestão empresarial", "gestão de vendas", "controle de estoque", "controle de caixa"],
  alternates: { canonical: "/" },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "website",
    images: [{ url: SOCIAL_IMAGE, width: 1200, height: 630, alt: "Painel de gestão empresarial Gevyro", type: "image/avif" }],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
  generator: "MartinsDev",
  category: "technology",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/gevyro-fav.png", type: "image/png", sizes: "192x192" }],
    shortcut: "/gevyro-fav.png",
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false} themes={["dark", "light"]}>
          <LanguageProvider>
            <Suspense fallback={null}>{children}</Suspense>
            <PwaInstallPrompt />
            <CookieConsent />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
