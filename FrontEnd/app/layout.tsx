import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { CookieConsent } from "@/components/cookie-consent";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Gevyro",
    template: "%s | Gevyro",
  },
  description: "Gestão em evolução para vendas, estoque, caixa e resultados do seu negócio.",
  applicationName: "Gevyro",
  keywords: ["Gevyro", "gestão", "vendas", "estoque", "caixa", "pequenos negócios"],
  openGraph: {
    title: "GEVYRO — Gestão em evolução.",
    description: "Tecnologia, simplicidade e organização para a evolução do seu negócio.",
    siteName: "Gevyro",
    locale: "pt_BR",
    type: "website",
  },
  generator: "MartinsDev",
  icons: {
    icon: "/gevyro-fav.png",
    shortcut: "/gevyro-fav.png",
    apple: "/gevyro-fav.png",
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
          <Suspense fallback={null}>{children}</Suspense>
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
