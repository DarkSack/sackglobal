import type { Metadata } from "next";
import { SectionHeader } from "@/components/SectionHeader";
import { githubStat, SocialLink } from "@/components/SocialLink";
import { Terminal } from "@/components/Terminal";
import { profile } from "@/content/profile";
import { social } from "@/content/social";
import { getArchive } from "@/lib/projects";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Connect",
  description: "Dónde encontrar a Sack: GitHub, LinkedIn, X, Twitch y email.",
  alternates: { canonical: "/connect" },
};

export default async function ConnectPage() {
  const { archive } = await getArchive();
  return (
    <div className="frame pt-10">
      <SectionHeader
        index="05"
        label="Connect"
        title={["Find", "Me"]}
        intro="Solo perfiles que existen y uso. Para proyectos o trabajo, el email es lo más directo."
      />
      <ul className="mt-12">
        {social.map((s, i) => (
          <SocialLink key={s.id} profile={s} index={i + 1} stat={s.id === "github" ? githubStat(archive.profile) : null} />
        ))}
      </ul>
      <div className="mt-20 grid grid-cols-12 gap-x-3 gap-y-8 md:gap-8">
        <p className="display col-span-12 text-[clamp(2.5rem,7vw,6rem)] md:col-span-7">
          ¿Un proyecto? <span className="font-serif font-normal normal-case italic text-accent-ink">Escríbeme.</span>
        </p>
        <Terminal
          className="col-span-12 self-end md:col-span-5"
          command={`mail ${profile.email}`}
          lines={[
            { key: "to", value: <a href={`mailto:${profile.email}`} className="link">{profile.email}</a> },
            { key: "based", value: profile.location },
            { key: "lang", value: profile.languages.join(" · ") },
          ]}
        />
      </div>
    </div>
  );
}
