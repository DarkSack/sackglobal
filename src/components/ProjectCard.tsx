import Link from "next/link";
import type { Project } from "@/lib/projects/types";
import { formatDate } from "@/lib/format";
import { CategoryLabel, StatusBadge, TechLine, ACCENT_VAR } from "./ProjectMeta";

/**
 * Entrada del archivo (/work). Deliberadamente una fila de índice y no
 * una tarjeta: el archivo se lee como una tabla de contenidos.
 */
export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <article className="group relative grid grid-cols-12 gap-x-4 gap-y-2 border-t border-line py-5 md:gap-x-8">
      <span
        aria-hidden="true"
        className="absolute -top-px left-0 h-px w-0 transition-[width] duration-500 group-hover:w-full"
        style={{ background: ACCENT_VAR[project.accent === "neutral" ? "ruby" : project.accent] }}
      />
      <span className="meta col-span-2 pt-1 md:col-span-1">{String(index).padStart(3, "0")}</span>

      <div className="col-span-10 md:col-span-5">
        <h3 className="display text-3xl transition-colors group-hover:text-accent-ink md:text-4xl">
          <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {project.title}
          </Link>
        </h3>
        <p className="mt-2 max-w-xl text-[0.95rem] text-muted">{project.tagline ?? project.description ?? "Sin descripción en GitHub."}</p>
      </div>

      <div className="col-span-10 col-start-3 flex flex-col gap-2 md:col-span-4 md:col-start-auto">
        <CategoryLabel project={project} />
        <TechLine tech={project.tech} max={4} />
      </div>

      <div className="col-span-10 col-start-3 flex flex-row flex-wrap items-baseline justify-between gap-2 md:col-span-2 md:col-start-auto md:flex-col md:items-end">
        <StatusBadge status={project.status} compact />
        <time className="meta" dateTime={project.pushedAt}>
          {formatDate(project.pushedAt)}
        </time>
      </div>
    </article>
  );
}
