"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { CATEGORY_LABEL } from "@/lib/projects/classify";
import type { CategoryId, Project } from "@/lib/projects/types";
import { cx } from "@/lib/format";
import { ProjectCard } from "./ProjectCard";

export type ProjectSummary = Omit<Project, "readme" | "readmeDigest" | "tree" | "changelogFile" | "commits" | "weeklyCommits" | "docs"> & {
  tree: Project["tree"];
};

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "updated", label: "Recently updated" },
  { id: "stars", label: "Most starred" },
  { id: "created", label: "Recently created" },
] as const;
type SortId = (typeof SORTS)[number]["id"];

const time = (s: string) => new Date(s).getTime();

function sortList(list: ProjectSummary[], key: SortId): ProjectSummary[] {
  const l = [...list];
  if (key === "updated") return l.sort((a, b) => time(b.pushedAt) - time(a.pushedAt));
  if (key === "stars") return l.sort((a, b) => b.stars - a.stars || time(b.pushedAt) - time(a.pushedAt));
  if (key === "created") return l.sort((a, b) => time(b.createdAt) - time(a.createdAt));
  return l.sort(
    (a, b) => Number(b.featured) - Number(a.featured) || a.displayOrder - b.displayOrder || time(b.pushedAt) - time(a.pushedAt),
  );
}

/**
 * Filtros del archivo. El estado vive en la URL (?category=&tech=&sort=)
 * para que un filtro se pueda compartir y el botón atrás funcione.
 * Solo se ofrecen categorías que algún proyecto tiene de verdad.
 */
export function ProjectFilter({ projects, categories }: { projects: ProjectSummary[]; categories: CategoryId[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const category = params.get("category") as CategoryId | null;
  const tech = params.get("tech");
  const sort = (SORTS.find((s) => s.id === params.get("sort"))?.id ?? "featured") as SortId;

  function set(key: string, value: string | null) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const techName = tech ? projects.flatMap((p) => p.tech).find((t) => t.id === tech)?.name : null;

  const visible = useMemo(() => {
    const filtered = projects.filter(
      (p) => (!category || p.categories.some((c) => c.id === category)) && (!tech || p.tech.some((t) => t.id === tech)),
    );
    return sortList(filtered, sort);
  }, [projects, category, tech, sort]);

  const count = (c: CategoryId) => projects.filter((p) => p.categories.some((x) => x.id === c)).length;

  return (
    <div>
      <div className="sticky top-14 z-20 -mx-4 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur md:mx-0 md:px-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div role="group" aria-label="Filtrar por categoría" className="-mx-1 flex gap-1 overflow-x-auto pb-1 lg:pb-0">
            <FilterChip active={!category} onClick={() => set("category", null)}>
              All <Count n={projects.length} />
            </FilterChip>
            {categories.map((c) => (
              <FilterChip key={c} active={category === c} onClick={() => set("category", category === c ? null : c)}>
                {CATEGORY_LABEL[c]} <Count n={count(c)} />
              </FilterChip>
            ))}
          </div>
          <label className="meta flex items-center gap-2">
            <span className="text-faint">Sort</span>
            <select
              value={sort}
              onChange={(e) => set("sort", e.target.value === "featured" ? null : e.target.value)}
              className="border border-line bg-bg px-2 py-1.5 font-mono text-xs uppercase text-fg"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {techName && (
          <p className="meta mt-3 flex items-center gap-3">
            <span>
              Technology: <span className="text-accent-ink">{techName}</span>
            </span>
            <button type="button" onClick={() => set("tech", null)} className="link text-fg">
              quitar ✕
            </button>
          </p>
        )}
      </div>

      <p className="meta mt-6 text-faint" aria-live="polite">
        {visible.length} {visible.length === 1 ? "proyecto" : "proyectos"}
      </p>
      <div className="mt-2">
        {visible.map((p, i) => (
          <ProjectCard key={p.slug} project={p as Project} index={i + 1} />
        ))}
        {visible.length === 0 && <p className="border-t border-line py-10 text-muted">Ningún proyecto coincide con ese filtro.</p>}
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cx(
        "meta shrink-0 border px-3 py-2 transition-colors",
        active ? "border-fg bg-fg text-bg" : "border-line text-muted hover:border-line-strong hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

function Count({ n }: { n: number }) {
  return <sup className="ml-0.5 opacity-60">{n}</sup>;
}
