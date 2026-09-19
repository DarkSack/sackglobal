import "server-only";
import { cache } from "react";
import { getGitHubArchive } from "@/lib/github/service";
import { normalizeArchive } from "./normalize";
import type { CategoryId, Project } from "./types";

/** Una sola normalización por petición, aunque la pidan varios componentes. */
export const getArchive = cache(async () => {
  const archive = await getGitHubArchive();
  return { archive, projects: normalizeArchive(archive) };
});

export async function getProjects(): Promise<Project[]> {
  return (await getArchive()).projects;
}

export async function getProject(slug: string): Promise<Project | null> {
  return (await getProjects()).find((p) => p.slug === slug) ?? null;
}

export function sortFeatured(projects: Project[]): Project[] {
  return projects.filter((p) => p.featured).sort((a, b) => a.displayOrder - b.displayOrder);
}

export type SortKey = "featured" | "updated" | "stars" | "created";

export function sortProjects(projects: Project[], key: SortKey): Project[] {
  const list = [...projects];
  const time = (s: string) => new Date(s).getTime();
  switch (key) {
    case "featured":
      // Destacados primero en su orden editorial; el resto por actividad.
      return list.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          a.displayOrder - b.displayOrder ||
          time(b.pushedAt) - time(a.pushedAt),
      );
    case "updated":
      return list.sort((a, b) => time(b.pushedAt) - time(a.pushedAt));
    case "stars":
      return list.sort((a, b) => b.stars - a.stars || time(b.pushedAt) - time(a.pushedAt));
    case "created":
      return list.sort((a, b) => time(b.createdAt) - time(a.createdAt));
  }
}

export function usedCategories(projects: Project[]): CategoryId[] {
  const set = new Set<CategoryId>();
  for (const p of projects) for (const c of p.categories) set.add(c.id);
  return [...set];
}
