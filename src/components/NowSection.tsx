import Link from "next/link";
import { now } from "@/content/now";
import type { Project } from "@/lib/projects/types";
import { formatDate, relativeTime } from "@/lib/format";
import { ArrowUpRight } from "./icons";
import { StatusBadge, TechLine } from "./ProjectMeta";
import { ActivityStrip } from "./ProjectVisual";

/** Proyectos de `now.building` que existen en GitHub y no están archivados. */
export function currentlyBuilding(projects: Project[]): { project: Project; note: string }[] {
  return now.building
    .map((b) => ({ project: projects.find((p) => p.repo === b.repo), note: b.note }))
    .filter((b): b is { project: Project; note: string } => Boolean(b.project) && !b.project!.archived)
    .slice(0, 3);
}

export function NowSection({ projects }: { projects: Project[] }) {
  const building = currentlyBuilding(projects);
  return (
    <div className="grid grid-cols-12 gap-x-3 md:gap-x-8 gap-y-12">
      <ol className="col-span-12 lg:col-span-8">
        {building.map(({ project, note }, i) => (
          <li key={project.slug} className="group relative grid grid-cols-12 gap-x-6 gap-y-4 border-t border-line py-8">
            <span className="meta col-span-12 md:col-span-1">
              <span className="text-accent">{String(i + 1).padStart(2, "0")}</span>
            </span>
            <div className="col-span-12 md:col-span-7">
              <h3 className="display text-[clamp(2.75rem,6vw,5rem)] transition-colors group-hover:text-accent-ink">
                <Link href={`/projects/${project.slug}`}>{project.title}</Link>
              </h3>
              <p className="mt-3 max-w-lg text-muted">{note}</p>
              <TechLine tech={project.tech} max={5} className="mt-4" />
            </div>
            <div className="col-span-12 flex flex-col gap-4 md:col-span-4">
              <StatusBadge status={project.status} source={project.statusSource} />
              <ActivityStrip weeks={project.weeklyCommits} />
              {project.commits[0] && (
                <a href={project.commits[0].url} target="_blank" rel="noreferrer" className="block font-mono text-xs text-muted hover:text-fg">
                  <span className="text-faint">{project.commits[0].sha.slice(0, 7)}</span> {project.commits[0].message}
                  <span className="mt-1 block text-faint">{relativeTime(project.commits[0].date)}</span>
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>

      <GitLog projects={projects} className="col-span-12 lg:col-span-4" />
    </div>
  );
}

/** `git log` de todo el archivo: los últimos commits reales, de cualquier repo. */
export function GitLog({ projects, className, limit = 9 }: { projects: Project[]; className?: string; limit?: number }) {
  const log = projects
    .flatMap((p) => p.commits.map((c) => ({ ...c, project: p })))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, limit);

  return (
    <section className={className} aria-label="Commits recientes">
      <p className="meta mb-3 flex justify-between border-b border-line pb-2 text-faint">
        <span>$ git log --all</span>
        <span>{log[0] ? formatDate(log[0].date) : ""}</span>
      </p>
      <ol className="font-mono text-xs">
        {log.map((c) => (
          <li key={c.sha} className="border-b border-line">
            <a href={c.url} target="_blank" rel="noreferrer" className="group grid grid-cols-[4.5rem_1fr] gap-x-3 py-2.5">
              <span className="text-accent">{c.sha.slice(0, 7)}</span>
              <span>
                <span className="text-muted transition-colors group-hover:text-fg">{c.message}</span>
                <span className="mt-1 flex items-center gap-2 text-faint">
                  {c.project.title} · {relativeTime(c.date)} <ArrowUpRight size={9} />
                </span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
