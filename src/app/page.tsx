import { AboutSection } from "@/components/AboutSection";
import { ArchiveTile, FeaturedProject } from "@/components/FeaturedProject";
import { Hero } from "@/components/Hero";
import { JournalFeed } from "@/components/JournalCard";
import { NowSection } from "@/components/NowSection";
import { SectionHeader } from "@/components/SectionHeader";
import { githubStat, SocialLink } from "@/components/SocialLink";
import { TechGraph } from "@/components/TechGraph";
import { social } from "@/content/social";
import { getJournal } from "@/lib/journal/service";
import { getArchive, sortFeatured } from "@/lib/projects";
import { buildUniverse } from "@/lib/projects/universe";

export const revalidate = 3600;

export default async function Home() {
  const [{ archive, projects }, journal] = await Promise.all([getArchive(), getJournal()]);
  const featured = sortFeatured(projects);
  const universe = buildUniverse(projects);
  const projectTitles = Object.fromEntries(projects.map((p) => [p.slug, p.title]));

  return (
    <>
      <Hero projects={projects} archive={archive} />

      <section aria-labelledby="work" className="frame mt-16">
        <SectionHeader
          id="work"
          index="02"
          label="Selected work"
          title={["Selected", "Work"]}
          intro="Una selección editorial, no un ranking. El tamaño de cada pieza es una decisión; los datos de cada una vienen de su repositorio."
        />
        <div className="mt-14 grid grid-flow-dense grid-cols-12 gap-x-3 md:gap-x-8 gap-y-16">
          {featured.map((p, i) => (
            <FeaturedProject key={p.slug} project={p} index={i + 1} />
          ))}
          <ArchiveTile total={projects.length} featured={featured.length} />
        </div>
      </section>

      <section aria-labelledby="about" className="frame mt-40">
        <SectionHeader id="about" index="03" label="About" title={["The", "Engineer"]} />
        <div className="mt-14">
          <AboutSection github={archive.profile} />
        </div>
      </section>

      <section aria-labelledby="building" className="frame mt-40">
        <SectionHeader
          id="building"
          index="04"
          label="Currently building"
          title={["Currently", "Building"]}
          intro="Lo que tiene commits esta semana. La actividad y los mensajes salen tal cual de GitHub."
          action={{ href: "/now", label: "Now" }}
        />
        <div className="mt-10">
          <NowSection projects={projects} />
        </div>
      </section>

      <section aria-labelledby="universe" className="frame mt-40">
        <SectionHeader
          id="universe"
          index="05"
          label="Technology universe"
          title={["Technology", "Universe"]}
          intro="Solo aparece lo que se puede verificar: cada tecnología está detectada en un manifiesto, un topic o un lenguaje de algún repo. Sin porcentajes, sin estrellas."
        />
        <div className="mt-14">
          <TechGraph techs={universe.techs} projects={universe.nodes} />
        </div>
      </section>

      <section aria-labelledby="journal" className="frame mt-40">
        <SectionHeader
          id="journal"
          index="06"
          label="Latest journal"
          title={["Field", "Notes"]}
          intro="Devlogs, lanzamientos y notas de trabajo."
          action={{ href: "/journal", label: "Todo el Journal" }}
        />
        <div className="mt-14">
          <JournalFeed posts={journal.posts} available={journal.available} projectTitles={projectTitles} />
        </div>
      </section>

      <section aria-labelledby="connect" className="frame mt-40">
        <SectionHeader id="connect" index="07" label="Connect" title={["Find", "Me"]} action={{ href: "/connect", label: "Connect" }} />
        <ul className="mt-10">
          {social.map((s, i) => (
            <SocialLink key={s.id} profile={s} index={i + 1} stat={s.id === "github" ? githubStat(archive.profile) : null} />
          ))}
        </ul>
      </section>
    </>
  );
}
