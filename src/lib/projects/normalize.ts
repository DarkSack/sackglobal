// ══════════════════════════════════════════════════════════════════
// GitHubArchive + metadata editorial → Project[]
//
// Función pura: mismos datos, mismo resultado. La metadata solo pisa
// lo que declara; todo lo demás sale de GitHub.
// ══════════════════════════════════════════════════════════════════

import { projectMeta, type ProjectMeta } from "@/content/projects";
import type { GitHubArchive, RepoRecord } from "@/lib/github/types";
import { classify, deriveStatus, primaryCategory } from "./classify";
import { digestReadme } from "./readme";
import { detectTech, languageShare } from "./technologies";
import type { CategoryMatch, Project, ProjectLink } from "./types";

export function slugify(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_\s.]+/g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

/** El H1 del README solo gana si nombra lo mismo que el repo y no es peor. */
function pickTitle(repo: RepoRecord, readmeTitle: string | null): string {
  if (!readmeTitle) return repo.name;
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (norm(readmeTitle) !== norm(repo.name)) return repo.name;
  return readmeTitle === readmeTitle.toLowerCase() ? repo.name : readmeTitle;
}

function buildLinks(repo: RepoRecord, meta: ProjectMeta, docUrl: string | null): ProjectLink[] {
  const links: ProjectLink[] = [{ kind: "github", label: "GitHub", href: repo.htmlUrl }];
  const home = repo.homepage;

  if (home?.includes("npmjs.com/package/")) {
    links.push({ kind: "npm", label: "npm", href: home });
  } else if (meta.links?.demo ?? home) {
    links.push({ kind: "demo", label: "Live", href: (meta.links?.demo ?? home)! });
  }

  const docs =
    meta.links?.documentation ??
    (docUrl && docUrl !== home ? docUrl : null) ??
    (repo.docs.length ? `${repo.htmlUrl}/tree/${repo.defaultBranch}/docs` : null);
  if (docs) links.push({ kind: "documentation", label: "Docs", href: docs });

  const latest = repo.releases.find((r) => !r.prerelease);
  const download = meta.links?.download ?? latest?.url;
  if (download) links.push({ kind: "download", label: latest && !meta.links?.download ? `Release ${latest.tag}` : "Download", href: download });

  return links;
}

/** Repos relacionados: declarados en metadata o enlazados desde el README. */
function findRelated(repo: RepoRecord, all: RepoRecord[], meta: ProjectMeta): string[] {
  const related = new Set(meta.related ?? []);
  for (const other of all) {
    if (other.name === repo.name || !repo.readme) continue;
    const host = other.homepage ? safeHost(other.homepage) : null;
    if (host && !host.includes("npmjs.com") && repo.readme.includes(host)) related.add(other.name);
    if (repo.readme.includes(`github.com/${other.fullName}`)) related.add(other.name);
  }
  return [...related];
}

function safeHost(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

export function normalizeArchive(archive: GitHubArchive, now = Date.now()): Project[] {
  const visible = archive.repos.filter((r) => !projectMeta[r.name]?.hidden);

  const projects = visible.map((repo): Project => {
    const meta = projectMeta[repo.name] ?? {};
    const digest = digestReadme(repo.readme);
    const tech = detectTech(repo, meta.excludeTech);

    let categories: CategoryMatch[] = classify(repo, tech);
    for (const extra of [meta.category, ...(meta.extraCategories ?? [])]) {
      if (extra && !categories.some((c) => c.id === extra)) {
        categories = [...categories, { id: extra, evidence: ["metadata"] }];
      }
    }
    const category = meta.category ?? primaryCategory(categories);

    const derived = deriveStatus(repo, now);
    const status = meta.status ?? derived;

    return {
      slug: meta.slug ?? slugify(repo.name),
      repo: repo.name,
      title: meta.title ?? pickTitle(repo, digest.title),
      description: repo.description,
      tagline: meta.tagline ?? null,
      category,
      categories,
      status,
      statusSource: meta.status ? "manual" : derived === "UNKNOWN" ? "none" : "github",
      statusNote: meta.statusNote ?? null,
      featured: Boolean(meta.featured),
      displayOrder: meta.displayOrder ?? 999,
      size: meta.size ?? "sm",
      accent: meta.accent ?? "neutral",
      featuredImage: meta.featuredImage ?? null,
      tech,
      languages: languageShare(repo),
      topics: repo.topics,
      stars: repo.stars,
      forks: repo.forks,
      watchers: repo.watchers,
      openIssues: repo.openIssues,
      createdAt: repo.createdAt,
      pushedAt: repo.pushedAt,
      license: repo.license,
      archived: repo.archived,
      sizeKb: repo.sizeKb,
      links: buildLinks(repo, meta, digest.documentationUrl),
      readme: repo.readme,
      readmeDigest: digest,
      tree: repo.tree,
      docs: repo.docs,
      changelogFile: repo.changelog,
      releases: repo.releases,
      commits: repo.commits,
      weeklyCommits: repo.weeklyCommits,
      related: findRelated(repo, visible, meta),
      htmlUrl: repo.htmlUrl,
      defaultBranch: repo.defaultBranch,
      owner: repo.fullName.split("/")[0],
    };
  });

  // Los relacionados se guardan por nombre de repo; se pasan a slug.
  const slugByRepo = new Map(projects.map((p) => [p.repo, p.slug]));
  for (const p of projects) {
    p.related = p.related.map((r) => slugByRepo.get(r)).filter((s): s is string => Boolean(s));
  }
  return projects;
}
