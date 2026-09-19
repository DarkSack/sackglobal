// ══════════════════════════════════════════════════════════════════
// Lectura de GitHub → GitHubArchive
//
// Código sin dependencias de Next a propósito: lo usan tanto el sitio
// (envuelto en la caché de Next, ver `service.ts`) como el script
// `npm run sync:github`, que corre con Node a secas y genera el
// snapshot de respaldo. Por eso los imports llevan extensión `.ts`.
//
// Presupuesto de API: ~6 llamadas por repo más 2 globales. Los ficheros
// (README, manifiestos, CHANGELOG) se leen de raw.githubusercontent.com,
// que no descuenta del límite. Aun así, con la API anónima (60/hora) no
// alcanza para 15 repos: sin token se usa el snapshot.
// ══════════════════════════════════════════════════════════════════

import type {
  CommitRecord,
  GitHubArchive,
  GitHubProfileRecord,
  ManifestRecord,
  ReleaseRecord,
  RepoRecord,
} from "./types.ts";

export interface FetchArchiveOptions {
  user: string;
  token?: string;
  /** Permite a Next inyectar su `fetch` con opciones de caché. */
  fetchImpl?: (url: string, init?: RequestInit) => Promise<Response>;
  /**
   * `/stats/commit_activity` responde 202 mientras GitHub lo calcula.
   * El script puede permitirse esperar y reintentar; una petición del
   * sitio no, así que ahí se acepta `null` y se sigue.
   */
  statsRetries?: number;
}

const API = "https://api.github.com";
const RAW = "https://raw.githubusercontent.com";

const MAX_MANIFESTS = 10;
const MAX_TREE_ENTRIES = 80;
const MAX_CHANGELOG_BYTES = 12_000;

export async function fetchGitHubArchive(
  options: FetchArchiveOptions,
): Promise<GitHubArchive> {
  const { user } = options;
  const get = makeGetter(options);

  const [profileRaw, reposRaw] = await Promise.all([
    get<RawUser>(`${API}/users/${user}`),
    get<RawRepo[]>(`${API}/users/${user}/repos?per_page=100&type=owner&sort=pushed`),
  ]);

  const candidates = reposRaw.filter((r) => !r.fork && !r.private);
  const repos = await mapLimit(candidates, 4, (r) => fetchRepo(r, options, get));

  return {
    fetchedAt: new Date().toISOString(),
    source: "live",
    profile: toProfile(profileRaw),
    repos,
  };
}

// ── Un repositorio ───────────────────────────────────────────────

async function fetchRepo(
  base: RawRepo,
  options: FetchArchiveOptions,
  get: Getter,
): Promise<RepoRecord> {
  const slug = `${options.user}/${base.name}`;
  const branch = base.default_branch;

  const [detail, languages, treeRaw, releasesRaw, commitsRaw, weekly] =
    await Promise.all([
      get<RawRepo>(`${API}/repos/${slug}`),
      get<Record<string, number>>(`${API}/repos/${slug}/languages`),
      get<RawTree>(`${API}/repos/${slug}/git/trees/${branch}?recursive=1`).catch(
        () => ({ tree: [], truncated: false }) as RawTree,
      ),
      get<RawRelease[]>(`${API}/repos/${slug}/releases?per_page=5`).catch(() => []),
      get<RawCommit[]>(`${API}/repos/${slug}/commits?per_page=6`).catch(() => []),
      fetchWeeklyCommits(slug, options, get),
    ]);

  const blobs = treeRaw.tree.filter((n) => n.type === "blob").map((n) => n.path);
  const raw = (path: string) => getText(options, `${RAW}/${slug}/${branch}/${encodePath(path)}`);

  const readmePath = blobs.find((p) => /^readme(\.md|\.markdown)?$/i.test(p)) ?? null;
  const changelogPath = blobs.find((p) => /^changelog(\.md)?$/i.test(p)) ?? null;
  const manifestPaths = pickManifests(blobs);

  const [readme, changelog, manifests] = await Promise.all([
    readmePath ? raw(readmePath) : Promise.resolve(null),
    changelogPath
      ? raw(changelogPath).then((t) => (t ? t.slice(0, MAX_CHANGELOG_BYTES) : null))
      : Promise.resolve(null),
    Promise.all(
      manifestPaths.map(async (p) => {
        const text = await raw(p);
        return text ? parseManifest(p, text) : null;
      }),
    ).then((list) => list.filter((m): m is ManifestRecord => m !== null)),
  ]);

  return {
    id: detail.id,
    name: detail.name,
    fullName: detail.full_name,
    description: detail.description,
    htmlUrl: detail.html_url,
    homepage: detail.homepage || null,
    topics: detail.topics ?? [],
    language: detail.language,
    languages,
    stars: detail.stargazers_count,
    forks: detail.forks_count,
    watchers: detail.subscribers_count ?? 0,
    openIssues: detail.open_issues_count,
    createdAt: detail.created_at,
    updatedAt: detail.updated_at,
    pushedAt: detail.pushed_at,
    license: detail.license
      ? { spdx: detail.license.spdx_id, name: detail.license.name }
      : null,
    archived: detail.archived,
    fork: detail.fork,
    defaultBranch: branch,
    sizeKb: detail.size,
    readme,
    tree: summarizeTree(treeRaw),
    manifests,
    docs: blobs.filter((p) => /^docs\/.+\.mdx?$/i.test(p)).slice(0, 20),
    changelog,
    releases: releasesRaw.filter((r) => !r.draft).map(toRelease),
    commits: commitsRaw.map(toCommit),
    weeklyCommits: weekly,
  };
}

async function fetchWeeklyCommits(
  slug: string,
  options: FetchArchiveOptions,
  get: Getter,
): Promise<number[] | null> {
  const tries = Math.max(1, (options.statsRetries ?? 0) + 1);
  for (let i = 0; i < tries; i++) {
    try {
      const res = await get<RawWeek[] | Record<string, never>>(
        `${API}/repos/${slug}/stats/commit_activity`,
        { allowAccepted: true },
      );
      if (Array.isArray(res) && res.length > 0) return res.map((w) => w.total);
    } catch {
      return null;
    }
    if (i < tries - 1) await sleep(2500);
  }
  return null;
}

// ── Árbol y manifiestos ──────────────────────────────────────────

function summarizeTree(raw: RawTree): RepoRecord["tree"] {
  const entries = new Set<string>();
  let files = 0;
  for (const node of raw.tree) {
    if (isNoise(node.path)) continue;
    if (node.type === "blob") files++;
    const depth = node.path.split("/").length;
    if (node.type === "tree" && depth <= 2) entries.add(`${node.path}/`);
    if (node.type === "blob" && depth === 1) entries.add(node.path);
  }
  // Orden alfabético: cada carpeta queda seguida de sus subcarpetas.
  const sorted = [...entries].sort((a, b) => a.localeCompare(b));
  return {
    entries: sorted.slice(0, MAX_TREE_ENTRIES),
    fileCount: files,
    truncated: raw.truncated || sorted.length > MAX_TREE_ENTRIES,
  };
}

function isNoise(path: string): boolean {
  return /(^|\/)(node_modules|\.git|\.idea|\.vscode|\.claude|\.cursor|dist|build|\.next|\.gradle|bin|obj)(\/|$)/.test(path);
}

const MANIFEST_RULES: { test: RegExp; maxDepth: number; priority: number }[] = [
  { test: /(^|\/)package\.json$/, maxDepth: 2, priority: 1 },
  { test: /(^|\/)libs\.versions\.toml$/, maxDepth: 2, priority: 1 },
  { test: /(^|\/)(build|settings)\.gradle(\.kts)?$/, maxDepth: 3, priority: 2 },
  // Los plugins de convenciones concentran las dependencias de todos los
  // módulos de un multi-proyecto: se leen antes que cualquier submódulo.
  { test: /^build-logic\/.+\.gradle\.kts$/, maxDepth: 8, priority: 0 },
  { test: /(^|\/)pom\.xml$/, maxDepth: 2, priority: 2 },
  { test: /\.csproj$/, maxDepth: 4, priority: 2 },
  { test: /(^|\/)app\.json$/, maxDepth: 2, priority: 3 },
  { test: /^manifest\.json$/, maxDepth: 1, priority: 3 },
  { test: /(^|\/)requirements\.txt$/, maxDepth: 2, priority: 3 },
  { test: /(^|\/)(docker-compose\.ya?ml|Dockerfile)$/, maxDepth: 2, priority: 3 },
];

function pickManifests(blobs: string[]): string[] {
  const picked: { path: string; score: number }[] = [];
  for (const path of blobs) {
    if (isNoise(path) || /(^|\/)(test|tests|fixtures|examples?)\//.test(path)) continue;
    const depth = path.split("/").length;
    const rule = MANIFEST_RULES.find((r) => r.test.test(path) && depth <= r.maxDepth);
    if (rule) picked.push({ path, score: rule.priority === 0 ? 0 : depth * 10 + rule.priority });
  }
  return picked
    .sort((a, b) => a.score - b.score || a.path.localeCompare(b.path))
    .slice(0, MAX_MANIFESTS)
    .map((p) => p.path);
}

export function parseManifest(path: string, text: string): ManifestRecord | null {
  const file = path.split("/").pop() ?? path;
  try {
    if (file === "package.json") {
      const pkg = JSON.parse(text) as {
        name?: string;
        bin?: unknown;
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      return {
        kind: "package.json",
        path,
        name: pkg.name ?? null,
        hasBin: Boolean(pkg.bin),
        dependencies: Object.keys(pkg.dependencies ?? {}),
        devDependencies: Object.keys(pkg.devDependencies ?? {}),
      };
    }
    if (/\.gradle(\.kts)?$|libs\.versions\.toml$/.test(file)) {
      const coords = new Set<string>();
      for (const m of text.matchAll(/["']([\w.-]+):([\w.-]+)(?::[^"']*)?["']/g)) {
        coords.add(`${m[1]}:${m[2]}`);
      }
      for (const m of text.matchAll(/group\s*=\s*"([\w.-]+)"\s*,\s*name\s*=\s*"([\w.-]+)"/g)) {
        coords.add(`${m[1]}:${m[2]}`);
      }
      const plugins = new Set<string>();
      for (const m of text.matchAll(/\bid\s*\(?\s*["']([\w.-]+)["']/g)) plugins.add(m[1]);
      for (const m of text.matchAll(/\bkotlin\s*\(\s*["']([\w.-]+)["']/g)) plugins.add(`kotlin-${m[1]}`);
      for (const m of text.matchAll(/^\s*`?([\w-]+)`?\s*$/gm)) {
        // `plugins { java; `java-library` }` sin comillas.
        if (["java", "java-library", "application"].includes(m[1])) plugins.add(m[1]);
      }
      return { kind: "gradle", path, coordinates: [...coords], plugins: [...plugins] };
    }
    if (file.endsWith(".csproj")) {
      return {
        kind: "csproj",
        path,
        packages: [...text.matchAll(/<PackageReference\s+Include="([^"]+)"/g)].map((m) => m[1]),
        targetFramework: /<TargetFrameworks?>([^<]+)</.exec(text)?.[1] ?? null,
        windowsForms: /<UseWindowsForms>\s*true/i.test(text),
      };
    }
    if (file === "app.json") {
      const json = JSON.parse(text) as { expo?: unknown };
      return json.expo ? { kind: "expo-app.json", path } : null;
    }
    if (file === "manifest.json") {
      const json = JSON.parse(text) as { manifest_version?: number };
      return json.manifest_version
        ? { kind: "chrome-manifest", path, manifestVersion: json.manifest_version }
        : null;
    }
    if (file === "requirements.txt") {
      const packages = text
        .split("\n")
        .map((l) => l.trim().split(/[=<>~!;\[ ]/)[0])
        .filter((l) => l && !l.startsWith("#") && !l.startsWith("-"));
      return { kind: "requirements.txt", path, packages };
    }
    if (/docker-compose\.ya?ml$|Dockerfile$/.test(file)) {
      const images = [
        ...text.matchAll(/^\s*(?:image:|FROM)\s+([^\s]+)/gim),
      ].map((m) => m[1].split(":")[0]);
      return { kind: "docker", path, images };
    }
    if (file === "pom.xml") {
      const artifacts = [...text.matchAll(/<artifactId>([^<]+)<\/artifactId>/g)].map((m) => m[1]);
      return { kind: "pom.xml", path, artifacts };
    }
  } catch {
    // Un manifiesto mal formado no debe tumbar el repo entero.
    return null;
  }
  return null;
}

// ── Transporte ───────────────────────────────────────────────────

type Getter = <T>(url: string, opts?: { allowAccepted?: boolean }) => Promise<T>;

function makeGetter(options: FetchArchiveOptions): Getter {
  const doFetch = options.fetchImpl ?? fetch;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "sackglobal-archive",
  };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  return async <T>(url: string, opts?: { allowAccepted?: boolean }): Promise<T> => {
    const res = await doFetch(url, { headers });
    if (res.status === 202 && opts?.allowAccepted) return {} as T;
    if (!res.ok) {
      const remaining = res.headers.get("x-ratelimit-remaining");
      throw new Error(
        `GitHub ${res.status} en ${url.replace(API, "")}` +
          (remaining === "0" ? " (límite de peticiones agotado)" : ""),
      );
    }
    return (await res.json()) as T;
  };
}

async function getText(options: FetchArchiveOptions, url: string): Promise<string | null> {
  const doFetch = options.fetchImpl ?? fetch;
  try {
    const res = await doFetch(url, { headers: { "User-Agent": "sackglobal-archive" } });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return out;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Conversión desde la forma de la API ──────────────────────────

function toProfile(u: RawUser): GitHubProfileRecord {
  return {
    login: u.login,
    name: u.name,
    bio: u.bio,
    avatarUrl: u.avatar_url,
    htmlUrl: u.html_url,
    blog: u.blog || null,
    location: u.location,
    twitterUsername: u.twitter_username,
    publicRepos: u.public_repos,
    followers: u.followers,
    createdAt: u.created_at,
  };
}

function toRelease(r: RawRelease): ReleaseRecord {
  return {
    tag: r.tag_name,
    name: r.name || null,
    publishedAt: r.published_at,
    url: r.html_url,
    prerelease: r.prerelease,
  };
}

function toCommit(c: RawCommit): CommitRecord {
  return {
    sha: c.sha,
    message: c.commit.message.split("\n")[0].slice(0, 160),
    date: c.commit.author?.date ?? c.commit.committer?.date ?? "",
    url: c.html_url,
  };
}

interface RawUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  blog: string | null;
  location: string | null;
  twitter_username: string | null;
  public_repos: number;
  followers: number;
  created_at: string;
}

interface RawRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  topics?: string[];
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  subscribers_count?: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  license: { spdx_id: string | null; name: string } | null;
  archived: boolean;
  fork: boolean;
  private: boolean;
  default_branch: string;
  size: number;
}

interface RawTree {
  tree: { path: string; type: "blob" | "tree" | "commit" }[];
  truncated: boolean;
}

interface RawRelease {
  tag_name: string;
  name: string | null;
  published_at: string | null;
  html_url: string;
  prerelease: boolean;
  draft: boolean;
}

interface RawCommit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { date: string } | null;
    committer: { date: string } | null;
  };
}

interface RawWeek {
  total: number;
  week: number;
}
