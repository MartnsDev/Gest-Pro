import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gevyro | Software de Gestão Empresarial",
    short_name: "Gevyro",
    description: "Gestão em evolução para vendas, estoque, clientes, caixa e resultados.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#258c53",
    lang: "pt-BR",
    icons: [
      { src: "/gevyro-fav.png", sizes: "192x192", type: "image/png" },
      { src: "/gevyro-fav-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
