import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "@/components/icons";
import { JournalCard } from "@/components/JournalCard";
import { Markdown } from "@/components/Markdown";
import { CategoryLabel, LanguageBar, StatusBadge, TechnologyTag } from "@/components/ProjectMeta";
import { ActivityStrip, ProjectVisual } from "@/components/ProjectVisual";
import { getJournal } from "@/lib/journal/service";
import { getProject, getProjects, sortProjects } from "@/lib/projects";
import { TECH_GROUP_LABEL, TECH_GROUP_ORDER } from "@/lib/projects/technologies";
import type { Project } from "@/lib/projects/types";
import { formatDate, relativeTime } from "@/lib/format";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) return {};
  const description = project.tagline ?? project.description ?? project.readmeDigest.summary ?? undefined;
  return {
    title: project.title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { type: "article", title: project.title, description, url: `/projects/${project.slug}` },
    twitter: { card: "summary_large_image", title: project.title, description },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const [project, all, journal] = await Promise.all([getProject(slug), getProjects(), getJournal()]);
  if (!project) notFound();

  const ordered = sortProjects(all, "featured");
  const position = ordered.findIndex((p) => p.slug === project.slug);
  const next = ordered[(position + 1) % ordered.length];
  const related = project.related.map((s) => all.find((p) => p.slug === s)).filter((p): p is Project => Boolean(p));
  const posts = journal.posts.filter((p) => p.project === project.slug);
  const digest = project.readmeDigest;
  const repoRef = { owner: project.owner, name: project.repo, branch: project.defaultBranch };
  const latestRelease = project.releases.find((r) => !r.prerelease) ?? project.releases[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.title,
    description: project.description ?? undefined,
    codeRepository: project.htmlUrl,
    programmingLanguage: project.languages.slice(0, 3).map((l) => l.name),
    dateCreated: project.createdAt,
    dateModified: project.pushedAt,
    author: { "@type": "Person", name: "Sack" },
  };

  return (
    <article className="frame pb-10 pt-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Ruta" className="meta flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
        <ol className="flex gap-2">
          <li>
            <Link href="/work" className="link">
              Work
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-fg">
            {project.repo}
          </li>
        </ol>
        <span>
          Project {String(position + 1).padStart(2, "0")} / {String(ordered.length).padStart(2, "0")}
        </span>
      </nav>

      {/* ── Cabecera ─────────────────────────────────────────── */}
      <header className="grid grid-cols-12 gap-x-3 md:gap-x-8 gap-y-6 pt-10">
        <div className="col-span-12 flex flex-wrap items-center gap-x-6 gap-y-2">
          <CategoryLabel project={project} />
          <StatusBadge status={project.status} source={project.statusSource} />
        </div>
        <h1 className="display col-span-12 text-[clamp(4rem,14vw,13rem)]">{project.title}</h1>
        <p className="col-span-12 text-[clamp(1.25rem,2.2vw,1.75rem)] leading-snug md:col-span-8">
          {project.tagline ?? project.description}
        </p>
        <div className="col-span-12 flex flex-wrap gap-2 md:col-span-4 md:justify-end md:self-end">
          {project.links.map((l) => (
            <a
              key={l.kind}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className={l.kind === "github" ? "bracket bracket-solid" : "bracket"}
            >
              {l.label} <ArrowUpRight />
            </a>
          ))}
        </div>
      </header>

      <ProjectVisual project={project} variant="hero" priority className="mt-12 aspect-[4/3] sm:aspect-[21/9]" />

      {/* ── Ficha técnica + descripción ─────────────────────── */}
      <div className="mt-16 grid grid-cols-12 gap-x-3 md:gap-x-8 gap-y-14">
        <aside className="col-span-12 md:col-span-4 lg:col-span-3" aria-label="Ficha técnica">
          <dl className="grid grid-cols-2 gap-x-4 md:grid-cols-1">
            <Spec label="Repository">
              <a href={project.htmlUrl} target="_blank" rel="noreferrer" className="link break-all font-mono text-sm">
                {project.owner}/{project.repo}
              </a>
            </Spec>
            <Spec label="Status">
              <StatusBadge status={project.status} compact />
              {project.statusNote && <p className="mt-1 text-sm text-muted">{project.statusNote}</p>}
              {project.statusSource === "github" && (
                <p className="mt-1 text-sm text-muted">Deducido: push {relativeTime(project.pushedAt)}.</p>
              )}
            </Spec>
            <Spec label="Created">{formatDate(project.createdAt)}</Spec>
            <Spec label="Last push">
              {formatDate(project.pushedAt)} <span className="text-muted">· {relativeTime(project.pushedAt)}</span>
            </Spec>
            <Spec label="License">
              {project.license
                ? project.license.spdx && project.license.spdx !== "NOASSERTION"
                  ? project.license.spdx
                  : "Propia (ver LICENSE)"
                : "Sin licencia declarada"}
            </Spec>
            <Spec label="Latest release">
              {latestRelease ? (
                <a href={latestRelease.url} className="link" target="_blank" rel="noreferrer">
                  {latestRelease.tag} · {formatDate(latestRelease.publishedAt)}
                </a>
              ) : (
                <span className="text-muted">Ninguna publicada</span>
              )}
            </Spec>
            <div className="col-span-2 grid grid-cols-4 gap-2 border-t border-line py-4 md:col-span-1">
              {(
                [
                  ["Stars", project.stars],
                  ["Forks", project.forks],
                  ["Watch", project.watchers],
                  ["Issues", project.openIssues],
                ] as const
              ).map(([k, v]) => (
                <div key={k}>
                  <dt className="meta text-faint">{k}</dt>
                  <dd className="mt-1 font-mono text-lg">{v}</dd>
                </div>
              ))}
            </div>
          </dl>
          <p className="meta mt-2 text-faint normal-case tracking-normal">Datos de la API de GitHub.</p>
        </aside>

        <div className="col-span-12 md:col-span-8 lg:col-span-6">
          {digest.summary && (
            <Block label="Description" source="README.md">
              <p className="text-[clamp(1.2rem,1.8vw,1.45rem)] leading-normal">{digest.summary}</p>
            </Block>
          )}

          {digest.features.length > 0 && (
            <Block label="Features" source="README.md">
              <ol className="grid gap-x-3 md:gap-x-8 sm:grid-cols-2">
                {digest.features.map((f, i) => (
                  <li key={f} className="flex gap-3 border-t border-line py-3 text-[0.95rem]">
                    <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ol>
            </Block>
          )}

          <Block label="Technology" source="manifiestos · topics · lenguajes">
            <TechGroups project={project} />
            <div className="mt-8">
              <LanguageBar languages={project.languages} />
            </div>
          </Block>

          {digest.architecture ? (
            <Block label="Architecture" source="README.md">
              <Markdown repo={repoRef}>{digest.architecture}</Markdown>
            </Block>
          ) : (
            project.tree.entries.length > 0 && (
              <Block label="Structure" source="árbol del repositorio">
                <ul className="columns-2 gap-6 border border-line bg-sunken p-4 font-mono text-xs leading-relaxed sm:columns-3">
                  {project.tree.entries.map((entry) => {
                    const parts = entry.split("/").filter(Boolean);
                    const nested = parts.length > 1;
                    return (
                      <li key={entry} className={nested ? "pl-3 text-faint" : entry.endsWith("/") ? "text-fg" : "text-muted"}>
                        {nested ? `└ ${parts[parts.length - 1]}/` : entry}
                      </li>
                    );
                  })}
                  {project.tree.truncated && <li className="text-faint">…</li>}
                </ul>
              </Block>
            )
          )}

          {digest.statusNotes && (
            <Block label="Status notes" source="README.md">
              <Markdown repo={repoRef}>{digest.statusNotes}</Markdown>
            </Block>
          )}

          {(project.changelogFile || digest.changelog) && (
            <Block label="Changelog" source={project.changelogFile ? "CHANGELOG.md" : "README.md"}>
              <details className="group">
                <summary className="meta cursor-pointer list-none text-fg">
                  <span className="group-open:hidden">Mostrar cambios →</span>
                  <span className="hidden group-open:inline">Ocultar</span>
                </summary>
                <Markdown repo={repoRef} className="mt-4 text-[0.95rem]">
                  {(project.changelogFile ?? digest.changelog)!}
                </Markdown>
              </details>
            </Block>
          )}
        </div>

        {/* ── Actividad ─────────────────────────────────────── */}
        <aside className="col-span-12 lg:col-span-3" aria-label="Actividad">
          <p className="meta mb-3 border-b border-line pb-2 text-faint">Activity</p>
          {project.weeklyCommits ? (
            <ActivityStrip weeks={project.weeklyCommits} />
          ) : (
            <p className="text-sm text-muted">GitHub aún no ha calculado la actividad semanal.</p>
          )}
          {project.commits.length > 0 && (
            <ol className="mt-6 font-mono text-xs">
              {project.commits.map((c) => (
                <li key={c.sha} className="border-t border-line">
                  <a href={c.url} target="_blank" rel="noreferrer" className="group block py-2.5">
                    <span className="text-accent">{c.sha.slice(0, 7)}</span>{" "}
                    <span className="text-muted group-hover:text-fg">{c.message}</span>
                    <span className="mt-1 block text-faint">{formatDate(c.date)}</span>
                  </a>
                </li>
              ))}
            </ol>
          )}
          {project.docs.length > 0 && (
            <>
              <p className="meta mb-3 mt-10 border-b border-line pb-2 text-faint">Docs</p>
              <ul className="font-mono text-xs">
                {project.docs.map((d) => (
                  <li key={d}>
                    <a
                      href={`${project.htmlUrl}/blob/${project.defaultBranch}/${d}`}
                      target="_blank"
                      rel="noreferrer"
                      className="link"
                    >
                      {d}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>
      </div>

      {/* ── Journal y relacionados ─────────────────────────── */}
      {posts.length > 0 && (
        <section className="mt-24" aria-labelledby="project-journal">
          <h2 id="project-journal" className="meta mb-6 text-faint">
            Journal / {project.title}
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {posts.slice(0, 4).map((p) => (
              <JournalCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-24" aria-labelledby="related">
          <h2 id="related" className="meta mb-2 text-faint">
            Related
          </h2>
          <ul>
            {related.map((r) => (
              <li key={r.slug} className="border-t border-line">
                <Link href={`/projects/${r.slug}`} className="group flex items-baseline justify-between gap-4 py-4">
                  <span className="display text-4xl group-hover:text-accent-ink">{r.title}</span>
                  <span className="hidden text-sm text-muted sm:block">{r.tagline ?? r.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── README completo ─────────────────────────────────── */}
      {project.readme && (
        <section className="mt-24 border-t border-line pt-6" aria-labelledby="readme">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-baseline justify-between">
              <h2 id="readme" className="display text-4xl">
                README.md
              </h2>
              <span className="meta text-fg">
                <span className="group-open:hidden">Leer documento fuente →</span>
                <span className="hidden group-open:inline">Cerrar</span>
              </span>
            </summary>
            <Markdown repo={repoRef} className="mt-10">
              {project.readme}
            </Markdown>
          </details>
        </section>
      )}

      <Link href={`/projects/${next.slug}`} className="group mt-24 block border-t border-line pt-4">
        <span className="meta flex items-center gap-2">
          Next project <ArrowRight />
        </span>
        <span className="display mt-3 block text-[clamp(3rem,10vw,9rem)] text-muted transition-colors group-hover:text-fg">
          {next.title}
        </span>
      </Link>
    </article>
  );
}

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line py-4">
      <dt className="meta text-faint">{label}</dt>
      <dd className="mt-1.5 text-sm">{children}</dd>
    </div>
  );
}

function Block({ label, source, children }: { label: string; source: string; children: React.ReactNode }) {
  return (
    <section className="mb-14">
      <h2 className="meta mb-5 flex items-baseline justify-between border-b border-line pb-2">
        <span className="text-fg">{label}</span>
        <span className="normal-case tracking-normal text-faint">fuente: {source}</span>
      </h2>
      {children}
    </section>
  );
}

function TechGroups({ project }: { project: Project }) {
  const groups = TECH_GROUP_ORDER.map((g) => ({ g, items: project.tech.filter((t) => t.group === g) })).filter(
    (x) => x.items.length,
  );
  if (!groups.length) return <p className="text-muted">No se detectaron tecnologías en los manifiestos.</p>;
  return (
    <dl className="grid gap-x-3 md:gap-x-8 gap-y-5 sm:grid-cols-2">
      {groups.map(({ g, items }) => (
        <div key={g}>
          <dt className="meta mb-2 text-faint">{TECH_GROUP_LABEL[g]}</dt>
          <dd className="flex flex-wrap gap-1.5">
            {items.map((t) => (
              <TechnologyTag key={t.id} tech={t} />
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
