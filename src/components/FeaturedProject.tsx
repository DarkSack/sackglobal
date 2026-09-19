import Link from "next/link";
import type { Project } from "@/lib/projects/types";
import { cx, pad, relativeTime } from "@/lib/format";
import { ArrowUpRight } from "./icons";
import { CategoryLabel, StatusBadge, TechLine } from "./ProjectMeta";
import { ProjectVisual } from "./ProjectVisual";

const SPAN: Record<Project["size"], string> = {
  xl: "md:col-span-12",
  lg: "md:col-span-7",
  md: "md:col-span-5",
  sm: "md:col-span-6 lg:col-span-4",
};

/**
 * Un destacado. El tamaño cambia la composición, no solo la escala:
 * el XL es horizontal y con titular enorme; LG y MD comparten fila con
 * pesos distintos; los pequeños son casi una ficha de catálogo.
 */
export function FeaturedProject({ project, index }: { project: Project; index: number }) {
  const href = `/projects/${project.slug}`;
  const github = project.links.find((l) => l.kind === "github");
  const xl = project.size === "xl";
  const small = project.size === "sm";

  return (
    <article
      className={cx(
        "group relative col-span-12 flex flex-col border-t border-line pt-4",
        SPAN[project.size],
        xl && "md:grid md:grid-cols-12 md:gap-8",
      )}
      aria-labelledby={`fp-${project.slug}`}
    >
      <div className={cx("flex flex-col", xl ? "md:col-span-4 md:justify-between" : "order-2")}>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <span className="meta">
            <span className="text-accent">{pad(index)}</span> — <CategoryLabel project={project} />
          </span>
          <StatusBadge status={project.status} source={project.statusSource} compact />
        </div>

        <h3
          id={`fp-${project.slug}`}
          className={cx(
            "display mt-4 transition-colors group-hover:text-accent-ink",
            xl ? "text-[clamp(3.5rem,6.6vw,7rem)]" : small ? "text-4xl" : "text-[clamp(2.5rem,5vw,4.5rem)]",
          )}
        >
          <Link href={href} className="after:absolute after:inset-0 after:content-['']">
            {project.title}
          </Link>
        </h3>

        <p className={cx("mt-3 max-w-md text-muted", xl ? "text-lg" : "text-[0.95rem]")}>
          {project.tagline ?? project.description}
        </p>

        <TechLine tech={project.tech} max={xl ? 6 : 4} className="mt-4" />

        <div className="relative z-10 mt-5 flex flex-wrap items-center gap-2">
          <Link href={href} className="bracket bracket-solid">
            Project
          </Link>
          {github && (
            <a href={github.href} className="bracket" target="_blank" rel="noreferrer">
              GitHub <ArrowUpRight />
            </a>
          )}
          <span className="meta ml-auto hidden sm:inline">push {relativeTime(project.pushedAt)}</span>
        </div>
      </div>

      <ProjectVisual
        project={project}
        variant={xl ? "hero" : "card"}
        priority={xl}
        className={cx(
          xl
            ? "mt-6 aspect-[4/3] md:col-span-8 md:mt-0 md:aspect-auto md:min-h-[30rem]"
            : project.size === "lg"
              ? "order-1 mb-5 aspect-[16/10]"
              : project.size === "md"
                ? // Se estira hasta la altura de la fila que marca la pieza LG.
                  "order-1 mb-5 aspect-[16/10] md:aspect-auto md:min-h-56 md:flex-1"
                : "order-1 mb-5 aspect-[16/9]",
        )}
      />
    </article>
  );
}

/** Ficha de cierre del bento: lo que no está destacado sigue a un clic. */
export function ArchiveTile({ total, featured }: { total: number; featured: number }) {
  return (
    <Link
      href="/work"
      className="group col-span-12 grid grid-cols-12 items-end gap-x-3 md:gap-x-8 gap-y-4 border-t border-line pt-4"
    >
      <span className="meta col-span-12 self-start md:col-span-3">Archive</span>
      <span className="display col-span-6 text-[clamp(4rem,9vw,8rem)] transition-colors group-hover:text-accent-ink md:col-span-4">
        +{total - featured}
      </span>
      <span className="col-span-6 flex flex-col items-start gap-4 text-sm text-muted md:col-span-5 md:flex-row md:items-end md:justify-between">
        proyectos más en el archivo completo, con filtros por categoría y tecnología.
        <span className="bracket shrink-0">Work →</span>
      </span>
    </Link>
  );
}
