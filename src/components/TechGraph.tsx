"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cx } from "@/lib/format";

export interface TechNode {
  id: string;
  name: string;
  group: string;
  groupLabel: string;
  projects: string[];
  evidence: string[];
}
export interface ProjectNode {
  slug: string;
  title: string;
  tech: string[];
}

type Selection = { kind: "tech"; id: string } | { kind: "project"; id: string } | null;

/**
 * Technology Universe.
 *
 * No es un grafo de nodos y aristas —con 45 tecnologías y 14 proyectos
 * eso es una maraña—, sino un mapa tipográfico con selección cruzada:
 * al elegir una tecnología se encienden los proyectos que la usan y las
 * tecnologías que conviven con ella; al elegir un proyecto, su stack.
 * Los números son recuentos reales de repos.
 */
export function TechGraph({ techs, projects }: { techs: TechNode[]; projects: ProjectNode[] }) {
  const [sel, setSel] = useState<Selection>(null);

  const groups = useMemo(() => {
    const map = new Map<string, { label: string; items: TechNode[] }>();
    for (const t of techs) {
      const g = map.get(t.group) ?? { label: t.groupLabel, items: [] };
      g.items.push(t);
      map.set(t.group, g);
    }
    return [...map.entries()];
  }, [techs]);

  const { litTech, litProjects, selectedTech } = useMemo(() => {
    if (!sel) return { litTech: null, litProjects: null, selectedTech: null };
    if (sel.kind === "tech") {
      const t = techs.find((x) => x.id === sel.id)!;
      const ps = new Set(t.projects);
      const co = new Set<string>();
      for (const p of projects) if (ps.has(p.slug)) p.tech.forEach((id) => co.add(id));
      return { litTech: co, litProjects: ps, selectedTech: t };
    }
    const p = projects.find((x) => x.slug === sel.id)!;
    return { litTech: new Set(p.tech), litProjects: new Set([p.slug]), selectedTech: null };
  }, [sel, techs, projects]);

  const toggle = (next: Selection) =>
    setSel((cur) => (cur && next && cur.kind === next.kind && cur.id === next.id ? null : next));

  const selectedProject = sel?.kind === "project" ? projects.find((p) => p.slug === sel.id) : null;

  return (
    <div className="grid grid-cols-12 gap-x-3 md:gap-x-8 gap-y-10">
      <div className="col-span-12 lg:col-span-8">
        <div className="columns-2 gap-x-3 md:gap-x-8 sm:columns-3" role="group" aria-label="Tecnologías">
          {groups.map(([id, g]) => (
            <section key={id} className="mb-8 break-inside-avoid">
              <h3 className="meta mb-3 border-b border-line pb-2 text-faint">{g.label}</h3>
              <ul className="space-y-1">
                {g.items.map((t) => {
                  const isSel = sel?.kind === "tech" && sel.id === t.id;
                  const dim = litTech && !litTech.has(t.id);
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        aria-pressed={isSel}
                        onClick={() => toggle({ kind: "tech", id: t.id })}
                        title={t.evidence.slice(0, 3).join(" · ")}
                        className={cx(
                          "group flex w-full items-baseline justify-between gap-2 text-left text-[0.95rem] transition-[color,opacity] duration-300",
                          isSel ? "text-accent-ink" : dim ? "text-faint opacity-50" : "text-fg hover:text-accent-ink",
                        )}
                      >
                        <span className={isSel ? "underline decoration-1 underline-offset-4" : ""}>{t.name}</span>
                        <span className="font-mono text-[10px] text-faint">{String(t.projects.length).padStart(2, "0")}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>

      <aside className="col-span-12 lg:col-span-4" aria-label="Proyectos del universo">
        <div className="lg:sticky lg:top-24">
          <div className="border border-line bg-raised p-5" aria-live="polite">
            <p className="meta text-faint">Selection</p>
            {selectedTech ? (
              <>
                <p className="display mt-2 text-4xl">{selectedTech.name}</p>
                <p className="mt-2 text-sm text-muted">
                  En {selectedTech.projects.length} {selectedTech.projects.length === 1 ? "proyecto" : "proyectos"}. Se detectó en{" "}
                  <span className="font-mono text-xs">{selectedTech.evidence[0]}</span>
                  {selectedTech.evidence.length > 1 && ` y ${selectedTech.evidence.length - 1} sitios más`}.
                </p>
                <Link href={`/work?tech=${selectedTech.id}`} className="meta link mt-3 inline-block text-fg">
                  Ver en el archivo →
                </Link>
              </>
            ) : selectedProject ? (
              <>
                <p className="display mt-2 text-4xl">{selectedProject.title}</p>
                <p className="mt-2 text-sm text-muted">{selectedProject.tech.length} tecnologías detectadas en su repositorio.</p>
                <Link href={`/projects/${selectedProject.slug}`} className="meta link mt-3 inline-block text-fg">
                  Abrir proyecto →
                </Link>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted">
                Elige una tecnología para ver dónde se usa, o un proyecto para ver su stack. Todo sale de manifiestos, topics y lenguajes de GitHub.
              </p>
            )}
          </div>

          <ul className="mt-6">
            {projects.map((p) => {
              const on = litProjects?.has(p.slug);
              const isSel = sel?.kind === "project" && sel.id === p.slug;
              return (
                <li key={p.slug} className="border-t border-line">
                  <button
                    type="button"
                    aria-pressed={isSel}
                    onClick={() => toggle({ kind: "project", id: p.slug })}
                    className={cx(
                      "flex w-full items-baseline justify-between py-2 text-left transition-[color,opacity] duration-300",
                      litProjects ? (on ? "text-fg" : "text-faint opacity-40") : "text-muted hover:text-fg",
                    )}
                  >
                    <span className={cx("display text-xl", isSel && "text-accent-ink")}>{p.title}</span>
                    <span className="font-mono text-[10px] text-faint">{p.tech.length}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {sel && (
            <button type="button" onClick={() => setSel(null)} className="meta link mt-4 text-fg">
              Limpiar selección
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
