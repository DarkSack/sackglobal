// ══════════════════════════════════════════════════════════════════
// Clasificación y estado
//
// Cada categoría se asigna por reglas con evidencia (topics, lenguajes,
// tecnologías detectadas, nombre). Un repo puede caer en varias; la
// principal sale del orden de prioridad de abajo o de la metadata.
//
// "experimental" e "infrastructure" no se deducen nunca por heurística
// más allá de pruebas claras: son fáciles de asignar mal.
// ══════════════════════════════════════════════════════════════════

import type { RepoRecord } from "@/lib/github/types";
import type { CategoryId, CategoryMatch, DetectedTech, ProjectStatus } from "./types";

export const CATEGORY_LABEL: Record<CategoryId, string> = {
  web: "Web",
  mobile: "Mobile",
  minecraft: "Minecraft",
  backend: "Backend",
  ai: "AI",
  devtools: "Dev Tools",
  systems: "Systems",
  infrastructure: "Infrastructure",
  experimental: "Experimental",
};

/** Orden para elegir la categoría principal cuando hay varias. */
const PRIMARY_ORDER: CategoryId[] = [
  "systems",
  "mobile",
  "minecraft",
  "devtools",
  "backend",
  "ai",
  "infrastructure",
  "web",
  "experimental",
];

export function classify(repo: RepoRecord, tech: DetectedTech[]): CategoryMatch[] {
  const has = (id: string) => tech.find((t) => t.id === id);
  const topic = (...ts: string[]) => ts.filter((t) => repo.topics.includes(t)).map((t) => `topic:${t}`);
  const techEv = (...ids: string[]) =>
    ids.map(has).filter(Boolean).map((t) => `tech:${t!.name}`);
  const out: CategoryMatch[] = [];
  const add = (id: CategoryId, evidence: string[]) => {
    if (evidence.length) out.push({ id, evidence });
  };

  add("minecraft", [...topic("minecraft", "minecraft-plugin", "paper-plugin", "spigot", "bukkit"), ...techEv("paper")]);
  add("mobile", techEv("react-native", "expo", "compose", "android"));
  add("ai", [...topic("ai"), ...techEv("groq", "replicate")]);
  add("devtools", [
    ...topic("cli", "generator", "npm-package", "docs-site", "documentation", "developer-tools"),
    ...techEv("npm-publish"),
  ]);
  add("backend", [
    ...topic("api", "bot", "telegram-bot"),
    ...techEv("express", "telegram", "libsql", "graphql", "jwt"),
    ...(/backend|api|server/i.test(repo.name) ? [`name:${repo.name}`] : []),
  ]);
  add("systems", [
    ...techEv("dotnet"),
    ...repoLanguagesOver(repo, ["C#", "C++", "C", "Rust", "Go"], 0.3),
  ]);
  add("infrastructure", [...topic("infrastructure", "devops", "kubernetes", "terraform"), ...techEv("docker")]);
  add("web", techEv("nextjs", "vite", "chrome-ext").length ? techEv("nextjs", "vite", "chrome-ext", "react") : []);

  return out;
}

function repoLanguagesOver(repo: RepoRecord, names: string[], min: number): string[] {
  const total = Object.values(repo.languages).reduce((a, b) => a + b, 0) || 1;
  return names
    .filter((n) => (repo.languages[n] ?? 0) / total >= min)
    .map((n) => `language:${n}`);
}

export function primaryCategory(matches: CategoryMatch[]): CategoryId {
  for (const id of PRIMARY_ORDER) if (matches.some((m) => m.id === id)) return id;
  return "experimental";
}

// ── Estado ───────────────────────────────────────────────────────

/** Días sin push a partir de los cuales ya no se llama "activo". */
export const ACTIVE_WINDOW_DAYS = 45;

/**
 * Estado deducido de GitHub. Solo afirma lo que los datos sostienen:
 * archivado → ARCHIVED; push reciente → ACTIVE. El resto es UNKNOWN.
 * Nunca deduce MAINTAINED, WIP ni EXPERIMENTAL: eso es una opinión y
 * va en la metadata.
 */
export function deriveStatus(repo: RepoRecord, now = Date.now()): ProjectStatus {
  if (repo.archived) return "ARCHIVED";
  const days = (now - new Date(repo.pushedAt).getTime()) / 86_400_000;
  return days <= ACTIVE_WINDOW_DAYS ? "ACTIVE" : "UNKNOWN";
}
