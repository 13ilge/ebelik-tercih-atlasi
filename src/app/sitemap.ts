import type { MetadataRoute } from "next";
import { dataset, ilSlug } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const simdi = new Date();
  return [
    {
      url: SITE_URL,
      lastModified: simdi,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...dataset.iller.map((il) => ({
      url: `${SITE_URL}/il/${ilSlug(il)}`,
      lastModified: simdi,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
