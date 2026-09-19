import Link from "next/link";
import { now } from "@/content/now";
import { profile } from "@/content/profile";
import type { GitHubArchive } from "@/lib/github/types";
import type { Project } from "@/lib/projects/types";
import { formatMonth, relativeTime } from "@/lib/format";
import { ArrowRight } from "./icons";
import { Terminal } from "./Terminal";

/**
 * Portada. Composición asimétrica en tres bandas:
 *   cabecera de "número" (fecha real del archivo) ·
 *   nombre + roles a escala de cartel ·
 *   titular, llamadas y metadata con la terminal a un lado.
 */
export function Hero({ projects, archive }: { projects: Project[]; archive: GitHubArchive }) {
  const latest = [...projects].sort((a, b) => +new Date(b.pushedAt) - +new Date(a.pushedAt))[0];
  const building = now.building
    .map((b) => projects.find((p) => p.repo === b.repo))
    .filter((p): p is Project => Boolean(p));

  return (
    <section aria-labelledby="hero-title" className="frame relative pb-20 pt-6 md:pt-10">
      {/* Banda superior: la "cabecera de revista" */}
      <div className="meta flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-line pb-3">
        <span>
          Issue <span className="text-fg">{formatMonth(archive.fetchedAt)}</span>
        </span>
        <span className="hidden sm:inline">A digital engineering notebook</span>
        <span>
          {projects.length} projects · {archive.source === "live" ? "live from GitHub" : "GitHub snapshot"}
        </span>
      </div>

      {/* Nombre y roles */}
      <div className="grid grid-cols-12 items-end gap-x-6 pt-8 md:pt-14">
        <h1 id="hero-title" className="col-span-12 lg:col-span-8">
          <span className="sr-only">
            {profile.alias} — {profile.roles.join(", ")}
          </span>
          {/* Ancho de "SACK" ≈ 3.7em: el tamaño se deriva del ancho de columna disponible. */}
          <span aria-hidden="true" className="display-wide rise block text-[24vw] lg:text-[15.5vw] 2xl:text-[14rem]">
            Sack
          </span>
        </h1>
        <ul aria-hidden="true" className="col-span-12 mt-4 flex flex-wrap gap-x-4 lg:col-span-4 lg:mt-0 lg:block lg:pb-[1.2vw]">
          {profile.roles.map((r, i) => (
            <li
              key={r}
              className="display rise text-[clamp(2rem,6vw,4.25rem)]"
              style={{ animationDelay: `${150 + i * 110}ms` }}
            >
              <span className={i === 1 ? "text-muted" : i === 2 ? "font-serif font-normal italic normal-case tracking-normal text-accent-ink" : ""}>
                {r}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Titular + metadata */}
      <div className="mt-12 grid grid-cols-12 gap-x-6 gap-y-10 border-t border-line pt-8 md:mt-16">
        <div className="col-span-12 md:col-span-7 lg:col-span-6">
          <p className="text-[clamp(1.4rem,2.6vw,2.1rem)] leading-[1.2] tracking-[-0.01em]">{profile.statement}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/work" className="bracket bracket-solid">
              Explore work <ArrowRight />
            </Link>
            <Link href="/about" className="bracket">
              About me
            </Link>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3">
            <div>
              <dt className="meta text-faint">Location</dt>
              <dd className="mt-1 font-mono text-sm uppercase">{profile.locationShort}</dd>
            </div>
            <div>
              <dt className="meta text-faint">Focus</dt>
              <dd className="mt-1 font-mono text-sm uppercase">{profile.focus.join(" / ")}</dd>
            </div>
            {building.length > 0 && (
              <div className="col-span-2 sm:col-span-1">
                <dt className="meta text-faint">Currently</dt>
                <dd className="mt-1 font-mono text-sm uppercase">
                  {building.map((p, i) => (
                    <span key={p.slug}>
                      {i > 0 && " · "}
                      <Link href={`/projects/${p.slug}`} className="link">
                        {p.title}
                      </Link>
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <Terminal
          className="col-span-12 self-start md:col-span-5 lg:col-span-4 lg:col-start-9"
          command="sack --status"
          lines={[
            { key: "role", value: "Software engineer" },
            { key: "focus", value: "Web · Systems · Game infra" },
            { key: "status", value: <span className="text-accent-ink">building</span> },
            { key: "repos", value: `${archive.profile.publicRepos} public` },
            ...(latest
              ? [
                  {
                    key: "last push",
                    value: (
                      <Link href={`/projects/${latest.slug}`} className="link">
                        {latest.title} · {relativeTime(latest.pushedAt)}
                      </Link>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </div>
    </section>
  );
}
