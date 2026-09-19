import Image from "next/image";
import type { Project } from "@/lib/projects/types";
import { cx, formatMonth } from "@/lib/format";
import { ACCENT_VAR } from "./ProjectMeta";
import { Spatial } from "./Spatial";

/**
 * Visual de un proyecto sin imágenes de stock.
 *
 * Tres capas, todas con datos reales del repo:
 *   1. base       — el nombre como forma tipográfica, desbordando.
 *   2. estructura — las carpetas reales del repositorio, en mono.
 *   3. metadata   — lenguaje principal, nº de ficheros, fecha de alta.
 *
 * Si el proyecto declara `featuredImage`, la imagen sustituye a la capa
 * base y el resto se mantiene encima.
 */
export function ProjectVisual({
  project,
  variant = "card",
  className,
  priority = false,
}: {
  project: Project;
  variant?: "card" | "hero";
  className?: string;
  priority?: boolean;
}) {
  const accent = ACCENT_VAR[project.accent];
  const lead = project.languages[0];
  const dirs = project.tree.entries.filter((e) => e.endsWith("/")).slice(0, variant === "hero" ? 22 : 12);
  const word = project.title.replace(/\s+/g, "");

  return (
    <Spatial
      className={cx(
        "blueprint relative isolate overflow-hidden border border-line bg-raised",
        className,
      )}
    >
      {/* 1 · Base */}
      {project.featuredImage ? (
        <Image
          src={project.featuredImage}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover"
          data-depth="6"
        />
      ) : (
        <div
          aria-hidden="true"
          data-depth="-10"
          className="display-wide pointer-events-none absolute -bottom-[0.14em] -left-[0.04em] whitespace-nowrap leading-none transition-transform duration-500 ease-out select-none"
          style={{
            fontSize: variant === "hero" ? "clamp(6rem, 22vw, 20rem)" : "clamp(4.5rem, 12vw, 11rem)",
            color: "transparent",
            WebkitTextStroke: `1px ${accent}`,
            opacity: 0.9,
          }}
        >
          {word}
        </div>
      )}

      {/* Marca de acento: una sola línea, no un degradado. */}
      <span aria-hidden="true" className="absolute left-0 top-0 h-full w-[3px]" style={{ background: accent }} />

      {/* 2 · Estructura real del repositorio */}
      {dirs.length > 0 && (
        <ul
          aria-hidden="true"
          data-depth="8"
          className="pointer-events-none absolute right-4 top-4 hidden font-mono text-[10px] leading-[1.55] text-faint transition-transform duration-500 ease-out xs:block"
        >
          {dirs.map((d) => (
            <li key={d} className={d.split("/").length > 2 ? "pl-3" : "text-muted"}>
              {d.split("/").length > 2 ? "└ " : ""}
              {d.split("/").filter(Boolean).pop()}/
            </li>
          ))}
          {project.tree.truncated && <li>…</li>}
        </ul>
      )}

      {/* 3 · Metadata */}
      <dl
        data-depth="3"
        className="absolute left-5 top-4 grid gap-y-1 font-mono text-[10px] uppercase tracking-wider text-muted transition-transform duration-500 ease-out"
      >
        {lead && (
          <div className="flex gap-2">
            <dt className="text-faint">lang</dt>
            <dd>
              {lead.name} {Math.round(lead.share * 100)}%
            </dd>
          </div>
        )}
        <div className="flex gap-2">
          <dt className="text-faint">files</dt>
          <dd>{project.tree.fileCount}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-faint">since</dt>
          <dd>{formatMonth(project.createdAt)}</dd>
        </div>
      </dl>
    </Spatial>
  );
}

/** 52 semanas de commits como una tira de barras. Solo si GitHub lo calculó. */
export function ActivityStrip({
  weeks,
  className,
  label = true,
}: {
  weeks: number[] | null;
  className?: string;
  label?: boolean;
}) {
  if (!weeks?.length) return null;
  const max = Math.max(1, ...weeks);
  const total = weeks.reduce((a, b) => a + b, 0);
  const active = weeks.filter(Boolean).length;
  return (
    <figure className={className}>
      <svg
        viewBox={`0 0 ${weeks.length * 4} 24`}
        preserveAspectRatio="none"
        className="h-8 w-full"
        role="img"
        aria-label={`${total} commits en las últimas 52 semanas, ${active} semanas con actividad`}
      >
        {weeks.map((w, i) => {
          const h = w ? Math.max(2, (w / max) * 24) : 1;
          return (
            <rect
              key={i}
              x={i * 4}
              y={24 - h}
              width={3}
              height={h}
              fill={w ? "var(--accent)" : "var(--line-strong)"}
              opacity={w ? 0.35 + (w / max) * 0.65 : 1}
            />
          );
        })}
      </svg>
      {label && (
        <figcaption className="meta mt-2 flex justify-between">
          <span>52 semanas</span>
          <span>
            <span className="text-fg">{total}</span> commits · {active} sem. activas
          </span>
        </figcaption>
      )}
    </figure>
  );
}
