import "server-only";
import { getJournal } from "@/lib/journal/service";
import { POST_TYPE_LABEL } from "@/lib/journal/types";
import { getProjects } from "@/lib/projects";
import { CATEGORY_LABEL } from "@/lib/projects/classify";

export interface SearchItem {
  kind: "project" | "journal" | "technology" | "tag" | "page";
  title: string;
  subtitle: string;
  href: string;
  /** Texto contra el que se busca, ya en minúsculas. */
  haystack: string;
}

const PAGES: SearchItem[] = [
  ["Work", "Archivo completo de proyectos", "/work"],
  ["About", "Quién soy y cómo trabajo", "/about"],
  ["Journal", "Notas, devlogs y publicaciones", "/journal"],
  ["Now", "Lo que estoy construyendo ahora", "/now"],
  ["Uses", "Herramientas y stack", "/uses"],
  ["Connect", "Redes y contacto", "/connect"],
].map(([title, subtitle, href]) => ({
  kind: "page" as const,
  title,
  subtitle,
  href,
  haystack: `${title} ${subtitle}`.toLowerCase(),
}));

/** Índice compacto: se manda al cliente una vez y se filtra allí. */
export async function getSearchIndex(): Promise<SearchItem[]> {
  const [projects, { posts }] = await Promise.all([getProjects(), getJournal()]);
  const items: SearchItem[] = [...PAGES];

  const techUse = new Map<string, { name: string; projects: string[] }>();
  const tagUse = new Map<string, number>();

  for (const p of projects) {
    const tech = p.tech.map((t) => t.name);
    items.push({
      kind: "project",
      title: p.title,
      subtitle: [CATEGORY_LABEL[p.category], ...tech.slice(0, 3)].join(" · "),
      href: `/projects/${p.slug}`,
      haystack: [p.title, p.repo, p.description, p.tagline, ...tech, ...p.topics, ...p.categories.map((c) => CATEGORY_LABEL[c.id])]
        .join(" ")
        .toLowerCase(),
    });
    for (const t of p.tech) {
      const entry = techUse.get(t.id) ?? { name: t.name, projects: [] };
      entry.projects.push(p.title);
      techUse.set(t.id, entry);
    }
  }

  for (const post of posts) {
    items.push({
      kind: "journal",
      title: post.title,
      subtitle: POST_TYPE_LABEL[post.type],
      href: `/journal/${post.slug}`,
      haystack: [post.title, post.excerpt, POST_TYPE_LABEL[post.type], ...post.tags].join(" ").toLowerCase(),
    });
    for (const tag of post.tags) tagUse.set(tag, (tagUse.get(tag) ?? 0) + 1);
  }

  for (const [id, t] of techUse) {
    items.push({
      kind: "technology",
      title: t.name,
      subtitle: t.projects.join(", "),
      href: `/work?tech=${encodeURIComponent(id)}`,
      haystack: `${t.name} ${t.projects.join(" ")}`.toLowerCase(),
    });
  }
  for (const [tag, n] of tagUse) {
    items.push({
      kind: "tag",
      title: `#${tag}`,
      subtitle: `${n} ${n === 1 ? "entrada" : "entradas"}`,
      href: `/journal?tag=${encodeURIComponent(tag)}`,
      haystack: tag.toLowerCase(),
    });
  }
  return items;
}
