import type { GitHubRepo } from "@/types";

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

export const GITHUB_PROFILE = `https://github.com/${GITHUB_USER}`;
export { GITHUB_USER };
