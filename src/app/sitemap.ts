import type { MetadataRoute } from "next";
import { getJournal } from "@/lib/journal/service";
import { getProjects } from "@/lib/projects";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, { posts }] = await Promise.all([getProjects(), getJournal()]);
  const pages = ["", "/work", "/about", "/journal", "/now", "/uses", "/connect"].map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  return [
    ...pages,
    ...projects.map((p) => ({ url: `${SITE_URL}/projects/${p.slug}`, lastModified: p.pushedAt, priority: p.featured ? 0.8 : 0.5 })),
    ...posts.map((p) => ({ url: `${SITE_URL}/journal/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
  ];
}
