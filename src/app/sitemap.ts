import type { MetadataRoute } from "next";
import { getSitemapData } from "@/lib/data";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url.replace(/\/$/, "");
  const { collections, designs, stories } = await getSitemapData();
  const fixed = ["", "/collections", "/lookbook", "/about", "/contact", "/privacy"].map((p) => ({ url: `${base}${p}` }));
  return [
    ...fixed,
    ...collections.map((c) => ({ url: `${base}/collections/${c.slug}` })),
    ...designs.map((d) => ({ url: `${base}/designs/${d.slug}`, lastModified: d.updated_at })),
    ...stories.map((s) => ({ url: `${base}/lookbook/${s.slug}`, ...(s.published_at ? { lastModified: s.published_at } : {}) })),
  ];
}
