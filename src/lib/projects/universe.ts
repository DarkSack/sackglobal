import type { ProjectNode, TechNode } from "@/components/TechGraph";
import { TECH_GROUP_LABEL, TECH_GROUP_ORDER } from "./technologies";
import type { Project } from "./types";

/** Datos compactos para el Technology Universe: solo tecnologías con evidencia. */
export function buildUniverse(projects: Project[]): { techs: TechNode[]; nodes: ProjectNode[] } {
  const map = new Map<string, TechNode>();
  for (const p of projects) {
    for (const t of p.tech) {
      const node =
        map.get(t.id) ??
        ({ id: t.id, name: t.name, group: t.group, groupLabel: TECH_GROUP_LABEL[t.group], projects: [], evidence: [] } as TechNode);
      node.projects.push(p.slug);
      node.evidence.push(...t.evidence.map((e) => `${p.repo}: ${e.where}`));
      map.set(t.id, node);
    }
  }
  const techs = [...map.values()].sort(
    (a, b) =>
      TECH_GROUP_ORDER.indexOf(a.group as never) - TECH_GROUP_ORDER.indexOf(b.group as never) ||
      b.projects.length - a.projects.length ||
      a.name.localeCompare(b.name),
  );
  const nodes = [...projects]
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.displayOrder - b.displayOrder || b.tech.length - a.tech.length)
    .map((p) => ({ slug: p.slug, title: p.title, tech: p.tech.map((t) => t.id) }));
  return { techs, nodes };
}
