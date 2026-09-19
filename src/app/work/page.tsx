import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectFilter, type ProjectSummary } from "@/components/ProjectFilter";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionHeader } from "@/components/SectionHeader";
import { ActivityStrip } from "@/components/ProjectVisual";
import { getArchive, sortProjects, usedCategories } from "@/lib/projects";
import { formatDate } from "@/lib/format";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Work",
  description: "Archivo completo de proyectos de Sack, leído directamente de sus repositorios públicos de GitHub.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage() {
  const { archive, projects } = await getArchive();

  // Al cliente solo viaja lo que la lista necesita: nada de READMEs.
  const summaries: ProjectSummary[] = projects.map((p) => {
    const { readme: _r, readmeDigest: _d, changelogFile: _c, commits: _co, weeklyCommits: _w, docs: _do, ...rest } = p;
    return { ...rest, tree: { entries: [], fileCount: p.tree.fileCount, truncated: false } };
  });

  // Actividad agregada: suma semana a semana de todos los repos con datos.
  const weeks = projects
    .map((p) => p.weeklyCommits)
    .filter((w): w is number[] => Boolean(w))
    .reduce<number[]>((acc, w) => w.map((v, i) => v + (acc[i] ?? 0)), []);
  const languages = new Set(projects.flatMap((p) => p.tech.filter((t) => t.group === "language").map((t) => t.name)));

  return (
    <div className="frame pt-10">
      <SectionHeader
        index="01"
        label="Work / archive"
        title={["The", "Archive"]}
        intro={
          <>
            Todos los repositorios públicos de{" "}
            <a href={archive.profile.htmlUrl} className="link text-fg" target="_blank" rel="noreferrer">
              @{archive.profile.login}
            </a>
            , clasificados automáticamente a partir de sus topics, manifiestos y lenguajes. Los destacados los elijo yo; las estrellas no deciden nada.
          </>
        }
      />

      <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-line pt-6 md:grid-cols-4">
        <div>
          <dt className="meta text-faint">Projects</dt>
          <dd className="display mt-1 text-5xl">{projects.length}</dd>
        </div>
        <div>
          <dt className="meta text-faint">Languages</dt>
          <dd className="display mt-1 text-5xl">{languages.size}</dd>
        </div>
        <div className="col-span-2">
          <dt className="meta text-faint">Commits, todo el archivo</dt>
          <dd className="mt-2">
            <ActivityStrip weeks={weeks.length ? weeks : null} />
          </dd>
        </div>
      </dl>
      <p className="meta mt-3 text-faint normal-case tracking-normal">
        Fuente: GitHub ({archive.source}), {formatDate(archive.fetchedAt)}.
      </p>

      <div className="mt-14">
        <Suspense
          fallback={sortProjects(projects, "featured").map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i + 1} />
          ))}
        >
          <ProjectFilter projects={summaries} categories={usedCategories(projects)} />
        </Suspense>
      </div>
    </div>
  );
}
