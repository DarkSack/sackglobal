import type { Metadata } from "next";
import { GitLog, NowSection } from "@/components/NowSection";
import { SectionHeader } from "@/components/SectionHeader";
import { now, type NowItem } from "@/content/now";
import { getProjects } from "@/lib/projects";
import type { Project } from "@/lib/projects/types";
import { formatDate } from "@/lib/format";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Now",
  description: "Lo que Sack está construyendo, aprendiendo y usando ahora mismo.",
  alternates: { canonical: "/now" },
};

const DEV = process.env.NODE_ENV === "development";
const RECENT_DAYS = 30;

export default async function NowPage() {
  const projects = await getProjects();

  const recent = pushedWithin(projects, RECENT_DAYS);
  const usage = new Map<string, { name: string; repos: string[] }>();
  for (const p of recent) {
    for (const t of p.tech) {
      if (t.group === "tooling") continue;
      const e = usage.get(t.id) ?? { name: t.name, repos: [] };
      e.repos.push(p.title);
      usage.set(t.id, e);
    }
  }
  const using = [...usage.values()].sort((a, b) => b.repos.length - a.repos.length).slice(0, 14);

  return (
    <div className="frame pt-10">
      <SectionHeader
        index="04"
        label="Now"
        title={["Right", "Now"]}
        intro={
          <>
            Una página <span className="font-serif italic text-fg">/now</span>: qué tengo entre manos. Revisada a mano el{" "}
            <time dateTime={now.updated} className="font-mono text-sm text-fg">
              {formatDate(now.updated)}
            </time>
            ; la actividad se actualiza sola desde GitHub.
          </>
        }
      />

      <section className="mt-16" aria-labelledby="now-building">
        <h2 id="now-building" className="meta mb-4 text-faint">
          Currently building
        </h2>
        <NowSection projects={projects} />
      </section>

      <div className="mt-24 grid grid-cols-12 gap-x-3 md:gap-x-8 gap-y-14">
        <section className="col-span-12 md:col-span-6 lg:col-span-4" aria-labelledby="now-using">
          <h2 id="now-using" className="meta mb-3 border-b border-line pb-2 text-faint">
            Currently using
          </h2>
          <p className="mb-4 text-sm text-muted">
            Calculado: tecnologías de los {recent.length} repos con commits en los últimos {RECENT_DAYS} días.
          </p>
          <ul>
            {using.map((u) => (
              <li key={u.name} className="flex items-baseline justify-between gap-4 border-t border-line py-2">
                <span>{u.name}</span>
                <span className="truncate font-mono text-[11px] text-faint">{u.repos.join(", ")}</span>
              </li>
            ))}
          </ul>
        </section>

        <ManualList id="now-learning" label="Currently learning" items={now.learning} />
        <ManualList id="now-exploring" label="Currently exploring" items={now.exploring} />

        <GitLog projects={projects} limit={12} className="col-span-12 lg:col-span-8" />
      </div>
    </div>
  );
}

/** "Using lately": repos con push en los últimos N días (calculado al regenerar la página). */
function pushedWithin(projects: Project[], days: number): Project[] {
  const cutoff = Date.now() - days * 86_400_000;
  return projects.filter((p) => new Date(p.pushedAt).getTime() >= cutoff);
}

function ManualList({ id, label, items }: { id: string; label: string; items: NowItem[] }) {
  const shown = items.filter((i) => DEV || !i.pending);
  if (!shown.length) return null;
  return (
    <section className="col-span-12 md:col-span-6 lg:col-span-4" aria-labelledby={id}>
      <h2 id={id} className="meta mb-3 border-b border-line pb-2 text-faint">
        {label}
      </h2>
      <ul>
        {shown.map((i) => (
          <li
            key={i.text}
            className={i.pending ? "border border-dashed border-accent/60 p-3 font-mono text-xs text-accent-ink" : "border-t border-line py-2"}
          >
            {i.pending && <span className="meta mb-1 block text-accent">pendiente · solo visible en dev</span>}
            {i.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
