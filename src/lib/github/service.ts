// ══════════════════════════════════════════════════════════════════
// Repository Service (solo servidor)
//
//   GitHub API ──► fetchGitHubArchive ──► caché de Next (1 h, tag
//   "github") ──► si falla o no hay token ──► snapshot del repo
//
// El token vive solo aquí: `server-only` hace que importar este módulo
// desde un componente de cliente rompa el build en vez de filtrarlo.
// ══════════════════════════════════════════════════════════════════

import "server-only";
import { unstable_cache } from "next/cache";
import snapshot from "@/data/github-snapshot.json";
import { GITHUB_USER } from "./config";
import { fetchGitHubArchive } from "./fetch-archive";
import type { GitHubArchive } from "./types";

export const GITHUB_TAG = "github";
const REVALIDATE_SECONDS = 3600;

const fromSnapshot = (): GitHubArchive => snapshot as unknown as GitHubArchive;

const fetchLive = unstable_cache(
  async (): Promise<GitHubArchive> =>
    fetchGitHubArchive({
      user: GITHUB_USER,
      token: process.env.GITHUB_TOKEN,
      // unstable_cache ya guarda el resultado entero; las peticiones
      // individuales no necesitan su propia entrada en la caché.
      fetchImpl: (url, init) => fetch(url, { ...init, cache: "no-store" }),
    }),
  ["github-archive-v1"],
  { revalidate: REVALIDATE_SECONDS, tags: [GITHUB_TAG] },
);

export async function getGitHubArchive(): Promise<GitHubArchive> {
  if (!process.env.GITHUB_TOKEN) return fromSnapshot();
  try {
    return await fetchLive();
  } catch (error) {
    console.warn("[github] usando snapshot:", (error as Error).message);
    return fromSnapshot();
  }
}
