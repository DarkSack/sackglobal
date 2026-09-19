import Link from "next/link";
import { profile } from "@/content/profile";
import { social } from "@/content/social";
import { GITHUB_PROFILE_URL } from "@/lib/github/config";
import { BUILD, NAV } from "@/lib/site";
import { formatDate } from "@/lib/format";

export function Footer({ dataFetchedAt, dataSource }: { dataFetchedAt: string; dataSource: "live" | "snapshot" }) {
  const contact = social.filter((s) => s.primary);
  return (
    <footer className="mt-32 border-t border-line">
      <div className="frame grid grid-cols-12 gap-x-3 md:gap-x-8 gap-y-10 py-12">
        <div className="col-span-12 md:col-span-5">
          <p className="display-wide text-[clamp(4rem,12vw,9rem)]">Sack</p>
          <p className="meta mt-4 text-muted">{profile.roles.join(" · ")}</p>
        </div>

        <nav className="col-span-6 md:col-span-2" aria-label="Secciones">
          <p className="meta mb-3 text-faint">Index</p>
          <ul className="space-y-1.5 text-sm">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="link">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/uses" className="link">
                Uses
              </Link>
            </li>
          </ul>
        </nav>

        <div className="col-span-6 md:col-span-2">
          <p className="meta mb-3 text-faint">Code</p>
          <ul className="space-y-1.5 text-sm">
            <li>
              <a href={GITHUB_PROFILE_URL} className="link" target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
            </li>
            <li>
              <Link href="/work" className="link">
                Todos los proyectos
              </Link>
            </li>
          </ul>
        </div>

        <div className="col-span-12 md:col-span-3">
          <p className="meta mb-3 text-faint">Contact</p>
          <ul className="space-y-1.5 text-sm">
            {contact.map((s) => (
              <li key={s.id}>
                <a href={s.href} className="link" target={s.icon === "email" ? undefined : "_blank"} rel="noreferrer">
                  {s.name} — <span className="text-muted">{s.handle}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="frame flex flex-col gap-2 border-t border-line py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="meta">© {new Date().getFullYear()} Sack · {profile.location}</p>
        <p className="meta text-faint">
          github data: {dataSource} · {formatDate(dataFetchedAt)}
          {BUILD.sha && <> · build {BUILD.sha}</>}
        </p>
      </div>
    </footer>
  );
}
