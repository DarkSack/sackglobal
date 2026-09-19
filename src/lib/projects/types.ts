export type CategoryId =
  | "web"
  | "mobile"
  | "minecraft"
  | "backend"
  | "ai"
  | "devtools"
  | "systems"
  | "infrastructure"
  | "experimental";

export type ProjectStatus =
  | "ACTIVE"
  | "MAINTAINED"
  | "EXPERIMENTAL"
  | "ARCHIVED"
  | "PRIVATE"
  | "WIP"
  | "UNKNOWN";

export type Accent = "ruby" | "cobalt" | "amber" | "sage" | "violet" | "neutral";

export type TechGroup =
  | "language"
  | "frontend"
  | "backend"
  | "data"
  | "mobile"
  | "ai"
  | "minecraft"
  | "systems"
  | "tooling";

/** Dónde se vio una tecnología. Es lo que la hace "verificable". */
export interface Evidence {
  kind: "dependency" | "topic" | "language" | "manifest" | "override";
  /** Fichero o valor concreto: `mobile/package.json`, `topic:groq`… */
  where: string;
}

export interface DetectedTech {
  id: string;
  name: string;
  group: TechGroup;
  evidence: Evidence[];
}

export interface CategoryMatch {
  id: CategoryId;
  evidence: string[];
}

export interface ReadmeDigest {
  title: string | null;
  summary: string | null;
  features: string[];
  /** Markdown de la sección de arquitectura/estructura. */
  architecture: string | null;
  /** Markdown de la sección de estado, si el README la tiene. */
  statusNotes: string | null;
  /** Markdown de "novedades" / changelog dentro del README. */
  changelog: string | null;
  /** Enlaces externos declarados en el README. */
  documentationUrl: string | null;
}

export interface ProjectLink {
  kind: "github" | "documentation" | "demo" | "download" | "npm";
  label: string;
  href: string;
}

export interface Project {
  slug: string;
  repo: string;
  title: string;
  description: string | null;
  tagline: string | null;

  category: CategoryId;
  categories: CategoryMatch[];
  status: ProjectStatus;
  /** "manual" si viene de metadata, "github" si se dedujo de los datos. */
  statusSource: "manual" | "github" | "none";
  statusNote: string | null;

  featured: boolean;
  displayOrder: number;
  size: "xl" | "lg" | "md" | "sm";
  accent: Accent;
  featuredImage: string | null;

  tech: DetectedTech[];
  languages: { name: string; share: number }[];
  topics: string[];

  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  createdAt: string;
  pushedAt: string;
  license: { spdx: string | null; name: string } | null;
  archived: boolean;
  sizeKb: number;

  links: ProjectLink[];
  readme: string | null;
  readmeDigest: ReadmeDigest;
  tree: { entries: string[]; fileCount: number; truncated: boolean };
  docs: string[];
  changelogFile: string | null;
  releases: { tag: string; name: string | null; publishedAt: string | null; url: string; prerelease: boolean }[];
  commits: { sha: string; message: string; date: string; url: string }[];
  weeklyCommits: number[] | null;
  related: string[];
  htmlUrl: string;
  defaultBranch: string;
  owner: string;
}
