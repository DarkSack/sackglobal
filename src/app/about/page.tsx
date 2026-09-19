import type { Metadata } from "next";
import Link from "next/link";
import { AboutSection } from "@/components/AboutSection";
import { SectionHeader } from "@/components/SectionHeader";
import { Terminal } from "@/components/Terminal";
import { profile } from "@/content/profile";
import { getArchive } from "@/lib/projects";
import { buildUniverse } from "@/lib/projects/universe";
import { TECH_GROUP_LABEL, TECH_GROUP_ORDER } from "@/lib/projects/technologies";
import { formatDate } from "@/lib/format";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About",
  description: `${profile.fullName}: ${profile.title}. ${profile.about[0]}`,
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const { archive, projects } = await getArchive();
  const { techs } = buildUniverse(projects);
  const byGroup = TECH_GROUP_ORDER.map((g) => ({ g, items: techs.filter((t) => t.group === g) })).filter((x) => x.items.length);

  return (
    <div className="frame pt-10">
      <SectionHeader index="02" label="About" title={["The", "Engineer"]} />

      <div className="mt-14">
        <AboutSection github={archive.profile} full />
      </div>

      {/* ── Experiencia ─────────────────────────────────────── */}
      <section className="mt-32 grid grid-cols-12 gap-x-3 md:gap-x-8 gap-y-8" aria-labelledby="experience">
        <h2 id="experience" className="meta col-span-12 border-t border-line pt-4 md:col-span-3">
          Experience
        </h2>
        <ol className="col-span-12 md:col-span-9">
          {profile.experience.map((job) => (
            <li key={job.role + job.period} className="grid grid-cols-9 gap-x-6 gap-y-2 border-t border-line py-6">
              <p className="meta col-span-9 sm:col-span-2">{job.period}</p>
              <div className="col-span-9 sm:col-span-7">
                <h3 className="text-2xl font-medium tracking-tight">{job.role}</h3>
                <p className="text-muted">{job.org}</p>
                <ul className="mt-3 space-y-1.5 text-[0.95rem] text-muted">
                  {job.notes.map((n) => (
                    <li key={n} className="flex gap-3">
                      <span className="text-faint">—</span>
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Technology Map ───────────────────────────────────── */}
      <section className="mt-32 grid grid-cols-12 gap-x-3 md:gap-x-8 gap-y-8" aria-labelledby="techmap">
        <div className="col-span-12 border-t border-line pt-4 md:col-span-3">
          <h2 id="techmap" className="meta">
            Technology map
          </h2>
          <p className="mt-3 text-sm text-muted">
            Sin barras ni porcentajes: cada tecnología aparece porque algún repo la usa. El número es cuántos.
          </p>
        </div>
        <div className="col-span-12 grid gap-x-3 md:gap-x-8 gap-y-8 sm:grid-cols-2 md:col-span-9 lg:grid-cols-3">
          {byGroup.map(({ g, items }) => (
            <div key={g} className="border-t border-line pt-3">
              <h3 className="meta mb-3 text-faint">{TECH_GROUP_LABEL[g]}</h3>
              <ul className="space-y-1">
                {items.map((t) => (
                  <li key={t.id} className="flex items-baseline justify-between gap-2">
                    <Link href={`/work?tech=${t.id}`} className="link">
                      {t.name}
                    </Link>
                    <span className="font-mono text-[10px] text-faint">{String(t.projects.length).padStart(2, "0")}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Buscando ──────────────────────────────────────────── */}
      <section className="mt-32 grid grid-cols-12 gap-x-3 md:gap-x-8 gap-y-8" aria-labelledby="looking">
        <h2 id="looking" className="meta col-span-12 border-t border-line pt-4 md:col-span-3">
          Open to
        </h2>
        <div className="col-span-12 md:col-span-5">
          <ul>
            {profile.lookingFor.map((l, i) => (
              <li key={l} className="flex gap-4 border-t border-line py-3 text-lg">
                <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                {l}
              </li>
            ))}
          </ul>
        </div>
        <Terminal
          className="col-span-12 md:col-span-4"
          command="whoami --verbose"
          lines={[
            { key: "name", value: profile.fullName },
            { key: "alias", value: profile.alias },
            { key: "github", value: `@${archive.profile.login} · desde ${new Date(archive.profile.createdAt).getUTCFullYear()}` },
            { key: "based", value: profile.location },
            { key: "contact", value: <a href={`mailto:${profile.email}`} className="link">{profile.email}</a> },
          ]}
          footer={<span className="text-faint">datos de GitHub: {formatDate(archive.fetchedAt)}</span>}
        />
      </section>
    </div>
  );
}
