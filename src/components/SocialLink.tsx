import type { SocialProfile } from "@/content/social";
import type { GitHubProfileRecord } from "@/lib/github/types";
import { SocialIcon, ArrowUpRight } from "./icons";

/** Una red como fila de índice: icono, nombre, usuario, nota y dato real si lo hay. */
export function SocialLink({ profile, index, stat }: { profile: SocialProfile; index: number; stat?: string | null }) {
  const external = profile.icon !== "email";
  return (
    <li className="group relative grid grid-cols-12 items-baseline gap-x-4 border-t border-line py-5">
      <span className="meta col-span-2 md:col-span-1">{String(index).padStart(2, "0")}</span>
      <span className="col-span-10 flex items-center gap-3 md:col-span-4">
        <span className="text-muted transition-colors group-hover:text-accent">
          <SocialIcon id={profile.icon} size={20} />
        </span>
        <a
          href={profile.href}
          {...(external ? { target: "_blank", rel: "me noreferrer" } : {})}
          className="display text-[clamp(2rem,5vw,3.25rem)] transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-accent-ink"
        >
          {profile.name}
        </a>
      </span>
      <span className="col-span-10 col-start-3 truncate font-mono text-sm md:col-span-3 md:col-start-auto">{profile.handle}</span>
      <span className="col-span-10 col-start-3 text-sm text-muted md:col-span-3 md:col-start-auto">
        {profile.note}
        {stat && <span className="meta mt-1 block text-fg">{stat}</span>}
      </span>
      <span className="hidden justify-self-end text-faint transition-colors group-hover:text-accent md:col-span-1 md:block">
        <ArrowUpRight size={14} />
      </span>
    </li>
  );
}

/** Metadatos reales de GitHub para la fila de GitHub. Cero se omite, no se maquilla. */
export function githubStat(p: GitHubProfileRecord): string {
  const since = new Date(p.createdAt).getUTCFullYear();
  return [`${p.publicRepos} repos públicos`, `desde ${since}`].join(" · ");
}
