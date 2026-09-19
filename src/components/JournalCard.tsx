import Link from "next/link";
import type { JournalPost } from "@/lib/journal/types";
import { POST_TYPE_LABEL } from "@/lib/journal/types";
import { cx, formatDate } from "@/lib/format";
import { ArrowRight } from "./icons";

/**
 * Entrada del Journal. Tres escalas, misma gramática:
 *   TYPE / Proyecto — fecha — titular — entradilla — [ READ ]
 */
export function JournalCard({
  post,
  projectTitle,
  size = "md",
}: {
  post: JournalPost;
  projectTitle?: string | null;
  size?: "lg" | "md" | "row";
}) {
  const href = `/journal/${post.slug}`;
  return (
    <article className={cx("group relative border-t border-line pt-4", size === "row" && "grid grid-cols-12 gap-x-6 py-5")}>
      <p className={cx("meta flex flex-wrap gap-x-2", size === "row" && "col-span-12 md:col-span-3")}>
        <span className="text-accent">[ {POST_TYPE_LABEL[post.type]} ]</span>
        {projectTitle && <span>/ {projectTitle}</span>}
        <time dateTime={post.publishedAt} className={size === "row" ? "w-full text-faint md:mt-1" : "ml-auto text-faint"}>
          {formatDate(post.publishedAt)}
        </time>
      </p>

      <div className={size === "row" ? "col-span-12 md:col-span-9" : ""}>
        {size === "lg" && post.coverImage && (
          // Portadas subidas desde el CMS: dominio arbitrario.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt="" className="mt-4 aspect-[16/9] w-full border border-line object-cover" loading="lazy" />
        )}
        <h3
          className={cx(
            "transition-colors group-hover:text-accent-ink",
            size === "lg" ? "display mt-5 text-[clamp(2.75rem,6vw,5.5rem)]" : size === "md" ? "display mt-4 text-3xl" : "mt-2 text-2xl font-medium tracking-tight md:mt-0",
          )}
        >
          <Link href={href} className="after:absolute after:inset-0 after:content-['']">
            {post.title}
          </Link>
        </h3>
        <p className={cx("mt-3 text-muted", size === "lg" ? "max-w-2xl text-lg" : "line-clamp-3 text-[0.95rem]")}>{post.excerpt}</p>
        <p className="meta mt-4 flex items-center gap-3">
          <span className="flex items-center gap-2 text-fg">
            Read <ArrowRight />
          </span>
          <span className="text-faint">{post.readingMinutes} min</span>
          {post.tags.slice(0, 3).map((t) => (
            <span key={t} className="text-faint">
              #{t}
            </span>
          ))}
        </p>
      </div>
    </article>
  );
}

/** Journal sin entradas (o sin conexión): se dice tal cual, sin rellenar. */
export function JournalEmpty({ available }: { available: boolean }) {
  return (
    <div className="grid grid-cols-12 gap-6 border-t border-line pt-6">
      <p className="display col-span-12 text-[clamp(3rem,8vw,6rem)] text-faint md:col-span-7">
        {available ? "Página en blanco." : "Journal offline."}
      </p>
      <p className="col-span-12 self-end text-muted md:col-span-5">
        {available
          ? "Todavía no hay entradas publicadas. Aquí irán devlogs, lanzamientos y notas de lo que estoy construyendo — nada escrito para rellenar."
          : "No se pudo leer el Journal en este momento. El resto del archivo funciona con normalidad."}
      </p>
    </div>
  );
}

export function JournalFeed({
  posts,
  available,
  projectTitles,
}: {
  posts: JournalPost[];
  available: boolean;
  projectTitles: Record<string, string>;
}) {
  if (!posts.length) return <JournalEmpty available={available} />;
  const [lead, ...rest] = [...posts].sort((a, b) => Number(b.featured) - Number(a.featured));
  const title = (p: JournalPost) => (p.project ? (projectTitles[p.project] ?? p.project) : null);
  return (
    <div className="grid grid-cols-12 gap-x-3 md:gap-x-8 gap-y-10">
      <div className="col-span-12 lg:col-span-7">
        <JournalCard post={lead} size="lg" projectTitle={title(lead)} />
      </div>
      <div className="col-span-12 flex flex-col gap-8 lg:col-span-5">
        {rest.slice(0, 3).map((p) => (
          <JournalCard key={p.id} post={p} projectTitle={title(p)} />
        ))}
      </div>
    </div>
  );
}
