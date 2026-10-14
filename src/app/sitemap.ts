import type { MetadataRoute } from "next";
import { dataset, ilSlug, meta } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const sonDerleme = new Date(`${meta.insaTarihi}T00:00:00`);
  return [
    {
      url: SITE_URL,
      lastModified: sonDerleme,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...dataset.iller.map((il) => ({
      url: `${SITE_URL}/il/${ilSlug(il)}`,
      lastModified: sonDerleme,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${SITE_URL}/gizlilik`,
      lastModified: sonDerleme,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
