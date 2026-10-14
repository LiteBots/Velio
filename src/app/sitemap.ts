import type { MetadataRoute } from "next";
import { getPosts, getServices } from "@/lib/catalog/repository";
import { siteConfig } from "@/lib/config";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const [services, posts] = await Promise.all([getServices(), getPosts()]);
  const now = new Date();

  const staticPaths: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/uslugi", priority: 0.9 },
    { path: "/pakiety", priority: 0.9 },
    { path: "/abonamenty", priority: 0.8 },
    { path: "/wycena", priority: 0.8 },
    { path: "/realizacje", priority: 0.6 },
    { path: "/o-nas", priority: 0.6 },
    { path: "/kontakt", priority: 0.7 },
    { path: "/faq", priority: 0.6 },
    { path: "/blog", priority: 0.6 },
    { path: "/polityka-prywatnosci", priority: 0.2 },
    { path: "/regulamin", priority: 0.2 },
    { path: "/cookies", priority: 0.1 },
  ];

  return [
    ...staticPaths.map((p) => ({ url: `${base}${p.path}`, lastModified: now, priority: p.priority })),
    ...services.map((s) => ({ url: `${base}/uslugi/${s.slug}`, lastModified: now, priority: 0.8 })),
    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.publishedAt ? new Date(p.publishedAt) : now,
      priority: 0.5,
    })),
  ];
}
