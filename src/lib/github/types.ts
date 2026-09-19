// ══════════════════════════════════════════════════════════════════
// Forma de los datos tal y como salen de GitHub (FACT).
//
// Esto es lo que se guarda en el snapshot y lo que devuelve la capa de
// fetch. No lleva nada interpretado: ni categorías, ni estado, ni
// tecnologías "detectadas". Esa lectura se hace después, en
// `lib/projects`, y así se puede cambiar la heurística sin volver a
// pedirle nada a la API.
// ══════════════════════════════════════════════════════════════════

export interface GitHubProfileRecord {
  login: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  htmlUrl: string;
  blog: string | null;
  location: string | null;
  twitterUsername: string | null;
  publicRepos: number;
  followers: number;
  createdAt: string;
}

/** Resumen de un fichero de manifiesto: solo lo que sirve para detectar. */
export type ManifestRecord =
  | {
      kind: "package.json";
      path: string;
      name: string | null;
      hasBin: boolean;
      dependencies: string[];
      devDependencies: string[];
    }
  | {
      kind: "gradle";
      path: string;
      /** Coordenadas `grupo:artefacto` y ids de plugin encontrados. */
      coordinates: string[];
      plugins: string[];
    }
  | {
      kind: "csproj";
      path: string;
      packages: string[];
      targetFramework: string | null;
      windowsForms: boolean;
    }
  | { kind: "expo-app.json"; path: string }
  | { kind: "chrome-manifest"; path: string; manifestVersion: number | null }
  | { kind: "requirements.txt"; path: string; packages: string[] }
  | { kind: "docker"; path: string; images: string[] }
  | { kind: "pom.xml"; path: string; artifacts: string[] };

export interface ReleaseRecord {
  tag: string;
  name: string | null;
  publishedAt: string | null;
  url: string;
  prerelease: boolean;
}

export interface CommitRecord {
  sha: string;
  message: string;
  date: string;
  url: string;
}

export interface RepoRecord {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  topics: string[];
  language: string | null;
  /** Bytes por lenguaje, tal cual los da `/languages`. */
  languages: Record<string, number>;
  stars: number;
  forks: number;
  /** `subscribers_count`: los "watchers" reales, no el alias de stars. */
  watchers: number;
  openIssues: number;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  license: { spdx: string | null; name: string } | null;
  archived: boolean;
  fork: boolean;
  defaultBranch: string;
  sizeKb: number;

  readme: string | null;
  /** Estructura recortada a dos niveles; el árbol completo no hace falta. */
  tree: { entries: string[]; fileCount: number; truncated: boolean };
  manifests: ManifestRecord[];
  docs: string[];
  changelog: string | null;
  releases: ReleaseRecord[];
  commits: CommitRecord[];
  /** Commits por semana, 52 semanas. `null` si GitHub aún no lo calculó. */
  weeklyCommits: number[] | null;
}

export interface GitHubArchive {
  fetchedAt: string;
  source: "live" | "snapshot";
  profile: GitHubProfileRecord;
  repos: RepoRecord[];
}
