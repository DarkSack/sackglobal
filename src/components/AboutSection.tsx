import Image from "next/image";
import Link from "next/link";
import { profile } from "@/content/profile";
import type { GitHubProfileRecord } from "@/lib/github/types";
import { ArrowRight } from "./icons";

/**
 * About en la portada: composición editorial a dos columnas. Retrato
 * (el avatar real de GitHub) con ficha técnica a la izquierda; primer
 * párrafo en grande a la derecha, como entradilla de revista.
 */
export function AboutSection({ github, full = false }: { github: GitHubProfileRecord; full?: boolean }) {
  const paragraphs = full ? profile.about : profile.about.slice(0, 2);
  return (
    <div className="grid grid-cols-12 gap-x-3 md:gap-x-8 gap-y-10">
      <aside className="col-span-12 sm:col-span-5 lg:col-span-3">
        <figure className="relative w-40 sm:w-full">
          <Image
            // GitHub ya sirve el avatar al tamaño pedido (`s=`); pasar por el
            // optimizador de Next solo añadiría un salto.
            src={`${github.avatarUrl}${github.avatarUrl.includes("?") ? "&" : "?"}s=460`}
            unoptimized
            alt={`Avatar de GitHub de ${profile.alias}`}
            width={460}
            height={460}
            className="aspect-square w-full border border-line object-cover grayscale transition-[filter] duration-700 hover:grayscale-0"
          />
          <figcaption className="meta mt-2 text-faint">github.com/{github.login}</figcaption>
        </figure>

        <dl className="mt-8 space-y-5 text-sm">
          <div>
            <dt className="meta text-faint">Name</dt>
            <dd className="mt-1">{profile.fullName}</dd>
          </div>
          <div>
            <dt className="meta text-faint">Background</dt>
            <dd className="mt-1">
              {profile.education.title}
              <span className="block text-muted">
                {profile.education.school} · {profile.education.period}
              </span>
            </dd>
          </div>
          <div>
            <dt className="meta text-faint">Languages</dt>
            <dd className="mt-1">{profile.languages.join(" · ")}</dd>
          </div>
        </dl>
      </aside>

      <div className="col-span-12 sm:col-span-7 lg:col-span-6">
        {paragraphs.map((p, i) => (
          <p
            key={i}
            className={
              i === 0
                ? "text-[clamp(1.35rem,2.4vw,1.9rem)] leading-[1.3] tracking-[-0.01em]"
                : "mt-6 max-w-[62ch] text-[1.0625rem] leading-relaxed text-muted"
            }
          >
            {p}
          </p>
        ))}
        {!full && (
          <Link href="/about" className="bracket mt-10">
            Leer completo <ArrowRight />
          </Link>
        )}
      </div>

      <div className="col-span-12 lg:col-span-3">
        <p className="meta mb-3 border-b border-line pb-2 text-faint">Focus</p>
        <ul>
          {profile.areas.map((a) => (
            <li key={a.label} className="border-b border-line py-2.5">
              <span className="block">{a.label}</span>
              <span className="font-mono text-[11px] text-faint">{a.evidence}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
