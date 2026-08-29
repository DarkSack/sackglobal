import {
  Github,
  Linkedin,
  Mail,
  CalendarDays,
  Boxes,
  Star,
  ExternalLink,
  MapPin,
  Briefcase,
  GraduationCap,
  Handshake,
  Rss,
  Twitch,
  Languages,
  type LucideIcon,
} from "lucide-react";
import { about, type AboutLink } from "@/content/about";
import { LANG_COLORS, LANG_FALLBACK } from "@/lib/langColors";
import type { GitHubProfile, GitHubRepo } from "@/types";

interface AboutTabProps {
  profile: GitHubProfile | null;
  repos: GitHubRepo[];
}

const LINK_ICONS: Record<AboutLink["icon"], LucideIcon> = {
  linkedin: Linkedin,
  mail: Mail,
  blog: Rss,
  x: ExternalLink,
  twitch: Twitch,
};

/**
 * Pestaña "Sobre mí".
 *
 * Combina dos fuentes, ninguna inventada: el perfil público de GitHub
 * (avatar, alias, bio, antigüedad) y `src/content/about.ts`, que recoge
 * los datos del README del repositorio de perfil. Los lenguajes se
 * cuentan sobre los repos ya cargados, así que se actualizan solos.
 */
export default function AboutTab({ profile, repos }: AboutTabProps) {
  const languages = Object.entries(
    repos.reduce<Record<string, number>>((acc, r) => {
      if (r.language) acc[r.language] = (acc[r.language] || 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const sinceYear = profile ? new Date(profile.created_at).getFullYear() : null;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        {/* ── Cabecera ────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {profile?.avatar_url && (
            <img
              src={profile.avatar_url}
              alt=""
              className="h-24 w-24 flex-shrink-0 rounded-2xl border border-border object-cover"
            />
          )}
          <div className="min-w-0">
            <h2 className="text-2xl font-bold">{about.fullName}</h2>
            <p className="mt-1 text-sm font-semibold text-primary">
              {about.role}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {about.headline || profile?.bio}
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin size={12} />
              {about.location}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {profile && (
                <Chip
                  href={profile.html_url}
                  icon={Github}
                  label={`@${profile.login}`}
                />
              )}
              {about.links.map((link) => (
                <Chip
                  key={link.href}
                  href={link.href}
                  icon={LINK_ICONS[link.icon]}
                  label={link.label}
                />
              ))}
              <Chip
                href={`mailto:${about.email}`}
                icon={Mail}
                label="Correo"
                external={false}
              />
            </div>
          </div>
        </div>

        {/* ── Presentación ────────────────────────────────────── */}
        <div className="mt-8 flex flex-col gap-4">
          {about.paragraphs.map((p, i) => (
            <p
              key={i}
              className={
                p.placeholder
                  ? "text-sm italic leading-relaxed text-muted-foreground/70"
                  : "text-sm leading-relaxed text-foreground/90"
              }
            >
              {p.text}
            </p>
          ))}
        </div>

        {/* ── Experiencia ─────────────────────────────────────── */}
        <Section icon={Briefcase} title="Experiencia">
          <ol className="flex flex-col gap-5">
            {about.experience.map((job) => (
              <li
                key={`${job.company}-${job.period}`}
                className="border-l border-border pl-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <h4 className="text-sm font-semibold text-foreground">
                    {job.role}
                  </h4>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {job.period}
                  </span>
                </div>
                <p className="text-xs text-primary">{job.company}</p>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {job.bullets.map((b, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-muted-foreground/60" />
                      {b}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </Section>

        {/* ── Formación ───────────────────────────────────────── */}
        <Section icon={GraduationCap} title="Formación">
          <div className="border-l border-border pl-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <h4 className="text-sm font-semibold">{about.education.title}</h4>
              <span className="text-xs tabular-nums text-muted-foreground">
                {about.education.period}
              </span>
            </div>
            <p className="text-xs text-primary">{about.education.school}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {about.education.location}
            </p>
          </div>
        </Section>

        {/* ── Colaboración ────────────────────────────────────── */}
        <Section icon={Handshake} title="Busco colaborar en">
          <ul className="grid gap-2 sm:grid-cols-2">
            {about.lookingFor.map((item, i) => (
              <li
                key={i}
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground"
              >
                {item}
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {/* ── Columna lateral ───────────────────────────────────── */}
      <aside className="flex flex-col gap-4">
        <Card title="En números">
          <Metric icon={Boxes} label="Repositorios públicos" value={repos.length} />
          <Metric icon={Star} label="Estrellas recibidas" value={totalStars} />
          {sinceYear && (
            <Metric icon={CalendarDays} label="En GitHub desde" value={sinceYear} />
          )}
        </Card>

        {about.currently.length > 0 && (
          <Card title="Ahora mismo">
            <ul className="flex flex-col gap-3">
              {about.currently.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {languages.length > 0 && (
          <Card
            title="Lenguajes"
            subtitle="Contados sobre los repositorios publicados, no declarados a mano."
          >
            <ul className="flex flex-col gap-2.5">
              {languages.map(([lang, count]) => (
                <li key={lang} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                    style={{ background: LANG_COLORS[lang] || LANG_FALLBACK }}
                  />
                  <span className="flex-1 truncate">{lang}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {count}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card title="Idiomas">
          <ul className="flex flex-col gap-2">
            {about.languages.map((idioma) => (
              <li
                key={idioma}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Languages size={13} className="text-primary" />
                {idioma}
              </li>
            ))}
          </ul>
        </Card>
      </aside>
    </div>
  );
}

/* ── Piezas ────────────────────────────────────────────────── */

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary">
        <Icon size={15} />
        {title}
      </h3>
      {children}
    </section>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      {subtitle && (
        <p className="mt-1 mb-4 text-xs text-muted-foreground">{subtitle}</p>
      )}
      <div className={subtitle ? "" : "mt-4"}>{children}</div>
    </div>
  );
}

function Chip({
  href,
  icon: Icon,
  label,
  external = true,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs text-foreground transition hover:bg-accent hover:text-primary"
    >
      <Icon size={13} />
      {label}
      {external && <ExternalLink size={11} className="opacity-60" />}
    </a>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 py-1">
      <Icon size={14} className="text-primary" />
      <span className="flex-1 text-xs text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}
