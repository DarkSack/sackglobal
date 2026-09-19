"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { JournalPost, PostType } from "@/lib/journal/types";
import { POST_TYPE_LABEL } from "@/lib/journal/types";
import { cx } from "@/lib/format";
import { JournalCard } from "./JournalCard";

/** Índice del Journal con filtro por tipo y por tag (?type=&tag=). */
export function JournalIndex({ posts, projectTitles }: { posts: JournalPost[]; projectTitles: Record<string, string> }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const type = params.get("type") as PostType | null;
  const tag = params.get("tag");

  const types = [...new Set(posts.map((p) => p.type))];
  const visible = posts.filter((p) => (!type || p.type === type) && (!tag || p.tags.includes(tag)));

  function set(key: string, value: string | null) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(next.size ? `${pathname}?${next}` : pathname, { scroll: false });
  }

  return (
    <div>
      <div role="group" aria-label="Filtrar por tipo" className="flex flex-wrap gap-1 border-b border-line pb-4">
        <Chip active={!type} onClick={() => set("type", null)}>
          All
        </Chip>
        {types.map((t) => (
          <Chip key={t} active={type === t} onClick={() => set("type", type === t ? null : t)}>
            {POST_TYPE_LABEL[t]}
          </Chip>
        ))}
        {tag && (
          <button type="button" onClick={() => set("tag", null)} className="meta ml-auto text-accent-ink">
            #{tag} ✕
          </button>
        )}
      </div>
      <div className="mt-2">
        {visible.map((p) => (
          <JournalCard key={p.id} post={p} size="row" projectTitle={p.project ? (projectTitles[p.project] ?? p.project) : null} />
        ))}
        {visible.length === 0 && <p className="py-10 text-muted">Nada con ese filtro.</p>}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cx(
        "meta border px-3 py-2 transition-colors",
        active ? "border-fg bg-fg text-bg" : "border-line text-muted hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}
