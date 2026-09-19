import { CATEGORY_LABEL } from "@/lib/projects/classify";
import type { Accent, DetectedTech, Project, ProjectStatus } from "@/lib/projects/types";
import { cx } from "@/lib/format";

export const ACCENT_VAR: Record<Accent, string> = {
  ruby: "var(--acc-ruby)",
  cobalt: "var(--acc-cobalt)",
  amber: "var(--acc-amber)",
  sage: "var(--acc-sage)",
  violet: "var(--acc-violet)",
  neutral: "var(--acc-neutral)",
};

const STATUS_TITLE: Record<ProjectStatus, string> = {
  ACTIVE: "Con actividad reciente",
  MAINTAINED: "Mantenido",
  EXPERIMENTAL: "Experimental",
  ARCHIVED: "Archivado en GitHub",
  PRIVATE: "Privado",
  WIP: "En construcción",
  UNKNOWN: "Sin datos suficientes para afirmar un estado",
};

/** Estado con su procedencia: nunca un estado sin decir de dónde sale. */
export function StatusBadge({
  status,
  source,
  compact = false,
}: {
  status: ProjectStatus;
  source?: Project["statusSource"];
  compact?: boolean;
}) {
  const live = status === "ACTIVE" || status === "WIP";
  const sourceLabel =
    source === "manual" ? "curado" : source === "github" ? "según último push" : undefined;
  return (
    <span
      className="meta inline-flex items-center gap-2 text-fg"
      title={`${STATUS_TITLE[status]}${sourceLabel ? ` — ${sourceLabel}` : ""}`}
    >
      <span
        aria-hidden="true"
        className={cx("inline-block size-1.5", live ? "bg-accent" : "bg-faint", status === "ACTIVE" && "animate-pulse")}
      />
      {status}
      {!compact && sourceLabel && <span className="text-faint normal-case tracking-normal">· {sourceLabel}</span>}
    </span>
  );
}

export function CategoryLabel({ project }: { project: Project }) {
  const extra = project.categories.map((c) => c.id).filter((c) => c !== project.category);
  return (
    <span className="meta">
      {CATEGORY_LABEL[project.category]}
      {extra.length > 0 && <span className="text-faint"> / {extra.map((c) => CATEGORY_LABEL[c]).join(" / ")}</span>}
    </span>
  );
}

/** Etiqueta de tecnología. El título enseña la evidencia que la respalda. */
export function TechnologyTag({ tech, active = false }: { tech: DetectedTech; active?: boolean }) {
  return (
    <span
      className={cx(
        "inline-flex items-center border px-2 py-1 font-mono text-[0.6875rem] leading-none",
        active ? "border-accent text-accent-ink" : "border-line text-muted",
      )}
      title={`Detectado en: ${tech.evidence.map((e) => e.where).join(" · ")}`}
    >
      {tech.name}
    </span>
  );
}

/** Lista separada por puntos medios: "Java · Paper API · Gradle". */
export function TechLine({ tech, max = 5, className }: { tech: DetectedTech[]; max?: number; className?: string }) {
  return <p className={cx("font-mono text-xs text-muted", className)}>{headlineTech(tech, max).map((t) => t.name).join(" · ")}</p>;
}

/** Lo que define el proyecto primero: lenguaje principal, luego plataforma, luego el resto. */
const HEADLINE_ORDER: DetectedTech["group"][] = ["minecraft", "mobile", "systems", "frontend", "backend", "ai", "data", "tooling"];

export function headlineTech(tech: DetectedTech[], max: number): DetectedTech[] {
  const lang = tech.find((t) => t.group === "language");
  const rest = tech
    .filter((t) => t.group !== "language")
    .sort((a, b) => HEADLINE_ORDER.indexOf(a.group) - HEADLINE_ORDER.indexOf(b.group));
  return (lang ? [lang, ...rest] : rest).slice(0, max);
}

/** Barra de lenguajes proporcional, al estilo de GitHub pero monocroma. */
export function LanguageBar({ languages }: { languages: Project["languages"] }) {
  const visible = languages.filter((l) => l.share >= 0.01);
  return (
    <div>
      <div className="flex h-1.5 w-full gap-px" role="img" aria-label={visible.map((l) => `${l.name} ${Math.round(l.share * 100)} %`).join(", ")}>
        {visible.map((l, i) => (
          <span
            key={l.name}
            style={{ flexGrow: l.share, opacity: 1 - i * 0.2 }}
            className="bg-fg"
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted">
        {visible.map((l) => (
          <li key={l.name}>
            <span className="text-fg">{l.name}</span> {(l.share * 100).toFixed(1)} %
          </li>
        ))}
      </ul>
    </div>
  );
}
