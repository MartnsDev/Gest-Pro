import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const publicRoutes = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/como-usar", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/contato", priority: 0.6, changeFrequency: "yearly" as const },
  { path: "/seguranca", priority: 0.5, changeFrequency: "yearly" as const },
  { path: "/privacidade", priority: 0.4, changeFrequency: "yearly" as const },
  { path: "/cookies", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/termos", priority: 0.4, changeFrequency: "yearly" as const },
  { path: "/cancelamento-reembolsos", priority: 0.4, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  }));
}
