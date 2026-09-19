"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { SearchItem } from "@/lib/search";

const KIND_LABEL: Record<SearchItem["kind"], string> = {
  project: "Projects",
  journal: "Journal",
  technology: "Technology",
  tag: "Tags",
  page: "Pages",
};
const KIND_ORDER: SearchItem["kind"][] = ["project", "technology", "journal", "tag", "page"];

function score(item: SearchItem, q: string): number {
  const t = item.title.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 60;
  if (t.includes(q)) return 40;
  const words = q.split(/\s+/).filter(Boolean);
  return words.every((w) => item.haystack.includes(w)) ? 20 : 0;
}

/**
 * Búsqueda global. Se abre con ⌘K / Ctrl+K o "/". El índice llega
 * ya construido desde el servidor; aquí solo se filtra.
 */
export function SearchCommand({ index }: { index: SearchItem[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const router = useRouter();
  const listId = useId();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index.filter((i) => i.kind === "page" || i.kind === "project").slice(0, 12);
    return index
      .map((item) => ({ item, s: score(item, q) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => KIND_ORDER.indexOf(a.item.kind) - KIND_ORDER.indexOf(b.item.kind) || b.s - a.s)
      .slice(0, 24)
      .map((r) => r.item);
  }, [index, query]);

  const show = useCallback(() => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
    returnFocus.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const typing = /INPUT|TEXTAREA|SELECT/.test(target.tagName) || target.isContentEditable;
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        show();
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-search", show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-search", show);
    };
  }, [show]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function go(item: SearchItem | undefined) {
    if (!item) return;
    close();
    router.push(item.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === "Tab") {
      // Foco atrapado: el diálogo solo tiene el campo de texto.
      e.preventDefault();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-bg/80 px-4 pt-[12vh] backdrop-blur-sm" onMouseDown={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buscar en el archivo"
        className="w-full max-w-2xl border border-line-strong bg-raised shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <span className="font-mono text-accent" aria-hidden="true">
            $
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="buscar proyectos, tecnologías, notas…"
            className="h-14 flex-1 bg-transparent font-mono text-sm text-fg outline-none placeholder:text-faint"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
            aria-autocomplete="list"
          />
          <kbd className="meta border border-line px-1.5 py-0.5">esc</kbd>
        </div>

        <ul id={listId} role="listbox" className="max-h-[55vh] overflow-y-auto py-2">
          {results.length === 0 && (
            <li className="px-4 py-8 text-center font-mono text-sm text-muted">Sin resultados para “{query}”.</li>
          )}
          {results.map((item, i) => {
            const header = i === 0 || results[i - 1].kind !== item.kind;
            return (
              <li key={`${item.kind}-${item.href}`} role="presentation">
                {header && <p className="meta px-4 pb-1 pt-3 text-faint">{KIND_LABEL[item.kind]}</p>}
                <div
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(item)}
                  className={`flex cursor-pointer items-baseline justify-between gap-4 px-4 py-2.5 ${
                    i === active ? "bg-accent-soft text-fg" : "text-muted"
                  }`}
                >
                  <span className={i === active ? "text-fg" : ""}>{item.title}</span>
                  <span className="truncate font-mono text-[11px] text-faint">{item.subtitle}</span>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="meta flex gap-4 border-t border-line px-4 py-2 text-faint">
          <span>↑↓ navegar</span>
          <span>↵ abrir</span>
        </p>
      </div>
    </div>
  );
}

export function SearchTrigger({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-search"))}
      className={`meta flex h-9 items-center gap-3 border border-line px-3 text-muted transition-colors hover:border-line-strong hover:text-fg ${className ?? ""}`}
      aria-label="Buscar (Ctrl+K)"
    >
      <span>Search</span>
      <kbd className="hidden text-faint sm:inline">⌘K</kbd>
    </button>
  );
}
