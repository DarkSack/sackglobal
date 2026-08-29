import type { GitHubProfile, GitHubRepo } from "@/types";

const GITHUB_USER = "DarkSack";

export async function fetchRepos(): Promise<GitHubRepo[]> {
  const res = await fetch(
    `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`
  );
  if (!res.ok) throw new Error(`GitHub API respondio con ${res.status}`);
  const data = (await res.json()) as GitHubRepo[];
  return data
    .filter((r) => !r.fork && !r.archived)
    .sort(
      (a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
    );
}

/**
 * Perfil publico de GitHub.
 *
 * Alimenta la pestana "Sobre mi" con datos reales —bio, enlaces, fecha
 * de alta— en lugar de texto inventado. Si GitHub falla, la pestana cae
 * en el texto de `src/content/about.ts` y no se rompe nada.
 */
export async function fetchProfile(): Promise<GitHubProfile> {
  const res = await fetch(`https://api.github.com/users/${GITHUB_USER}`);
  if (!res.ok) throw new Error(`GitHub API respondio con ${res.status}`);
  return (await res.json()) as GitHubProfile;
}

export const GITHUB_PROFILE = `https://github.com/${GITHUB_USER}`;
export { GITHUB_USER };
