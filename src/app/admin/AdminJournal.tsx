"use client";

import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { Markdown } from "@/components/MarkdownClient";
import { POST_TYPES, POST_TYPE_LABEL, type JournalRow, type PostStatus, type PostType } from "@/lib/journal/types";
import { ADMIN_EMAIL } from "@/lib/site";
import { cx, formatDate } from "@/lib/format";

// ══════════════════════════════════════════════════════════════════
// Panel del Journal
//
// Todo pasa por Supabase con la sesión del navegador: la seguridad la
// ponen las políticas RLS de `journal_posts` (solo el email admin
// escribe), no esta pantalla. Tras guardar se avisa a /api/revalidate
// para que la web pública muestre el cambio en la siguiente visita.
// ══════════════════════════════════════════════════════════════════

type Draft = Omit<JournalRow, "id" | "created_at" | "updated_at"> & { id?: string };

const EMPTY: Draft = {
  slug: "",
  title: "",
  type: "devlog",
  excerpt: "",
  content: "",
  cover_image: null,
  published_at: null,
  tags: [],
  project: null,
  featured: false,
  status: "draft",
  author: "Sack",
};

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/** ISO → valor de <input type="datetime-local"> en hora local. */
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function AdminJournal({ projects }: { projects: { slug: string; title: string }[] }) {
  const supabase = useMemo<SupabaseClient | null>(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return url && key ? createClient(url, key) : null;
  }, []);

  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [rows, setRows] = useState<JournalRow[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const isAdmin = session?.user.email === ADMIN_EMAIL;

  // Contador que fuerza una recarga de la lista tras guardar o borrar.
  const [version, setVersion] = useState(0);
  const load = () => setVersion((v) => v + 1);

  useEffect(() => {
    if (!isAdmin || !supabase) return;
    let cancelled = false;
    supabase
      .from("journal_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setMessage({ tone: "error", text: `No se pudo leer journal_posts: ${error.message}` });
        else setRows(data as JournalRow[]);
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin, supabase, version]);

  if (!supabase) {
    return <Notice title="Supabase no configurado">Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.</Notice>;
  }
  if (!ready) return <p className="meta py-20">Comprobando sesión…</p>;

  if (!session) {
    return (
      <Notice title="Journal / Admin">
        <button
          type="button"
          className="bracket bracket-solid mt-6"
          onClick={() =>
            supabase.auth.signInWithOAuth({ provider: "github", options: { redirectTo: `${window.location.origin}/admin` } })
          }
        >
          Entrar con GitHub
        </button>
      </Notice>
    );
  }

  if (!isAdmin) {
    return (
      <Notice title="Sin permiso">
        La sesión de {session.user.email} no puede publicar.{" "}
        <button type="button" className="link text-fg" onClick={() => supabase.auth.signOut()}>
          Cerrar sesión
        </button>
      </Notice>
    );
  }

  function edit(row: JournalRow | null) {
    setMessage(null);
    setPreview(false);
    setSlugTouched(Boolean(row));
    setDraft(row ? { ...row } : { ...EMPTY });
  }

  async function save(status?: PostStatus) {
    if (!draft || !supabase) return;
    const next: Draft = { ...draft, status: status ?? draft.status };
    if (!next.title.trim() || !next.slug) {
      setMessage({ tone: "error", text: "Título y slug son obligatorios." });
      return;
    }
    if (next.status === "published" && !next.published_at) next.published_at = new Date().toISOString();

    setBusy(true);
    const payload = { ...next, excerpt: next.excerpt || null, cover_image: next.cover_image || null };
    const query = next.id
      ? supabase.from("journal_posts").update(payload).eq("id", next.id).select().single()
      : supabase.from("journal_posts").insert(payload).select().single();
    const { data, error } = await query;
    setBusy(false);

    if (error) {
      setMessage({ tone: "error", text: error.message });
      return;
    }
    setDraft({ ...(data as JournalRow) });
    setMessage({ tone: "ok", text: next.status === "published" ? "Publicado." : "Guardado." });
    load();

    // Refresca la web pública. Si falla, el contenido aparece igual en ≤ 5 min.
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ tags: ["journal"] }),
    }).catch(() => undefined);
  }

  async function remove() {
    if (!draft?.id || !supabase) return;
    if (!window.confirm(`¿Borrar "${draft.title}" definitivamente? Archivar lo oculta sin borrarlo.`)) return;
    const { error } = await supabase.from("journal_posts").delete().eq("id", draft.id);
    if (error) setMessage({ tone: "error", text: error.message });
    else {
      setDraft(null);
      load();
    }
  }

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => (d ? { ...d, [key]: value } : d));

  return (
    <div className="grid grid-cols-12 gap-x-3 md:gap-x-8 gap-y-8">
      <aside className="col-span-12 lg:col-span-4">
        <div className="flex items-baseline justify-between border-b border-line pb-3">
          <h1 className="display text-4xl">Journal</h1>
          <button type="button" className="bracket" onClick={() => edit(null)}>
            + Nuevo
          </button>
        </div>
        <ul>
          {rows.map((r) => (
            <li key={r.id} className="border-b border-line">
              <button
                type="button"
                onClick={() => edit(r)}
                className={cx("w-full py-3 text-left", draft?.id === r.id ? "text-accent-ink" : "hover:text-fg")}
              >
                <span className="meta flex justify-between">
                  <span>{POST_TYPE_LABEL[r.type]}</span>
                  <span className={r.status === "published" ? "text-accent" : "text-faint"}>{r.status}</span>
                </span>
                <span className="mt-1 block">{r.title}</span>
                <span className="meta text-faint">{formatDate(r.published_at ?? r.created_at)}</span>
              </button>
            </li>
          ))}
          {rows.length === 0 && <li className="py-6 text-sm text-muted">Sin entradas todavía.</li>}
        </ul>
        <p className="meta mt-6 text-faint">
          {session.user.email} ·{" "}
          <button type="button" className="link" onClick={() => supabase.auth.signOut()}>
            salir
          </button>
        </p>
      </aside>

      <section className="col-span-12 lg:col-span-8">
        {!draft ? (
          <p className="py-20 text-muted">Elige una entrada o crea una nueva.</p>
        ) : (
          <form
            className="grid grid-cols-6 gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <Field label="Título" className="col-span-6">
              <input
                required
                value={draft.title}
                onChange={(e) => {
                  set("title", e.target.value);
                  if (!slugTouched) set("slug", slugify(e.target.value));
                }}
                className="input text-xl"
              />
            </Field>
            <Field label="Slug" className="col-span-6 sm:col-span-3">
              <input
                required
                value={draft.slug}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
                className="input font-mono text-sm"
              />
            </Field>
            <Field label="Tipo" className="col-span-3 sm:col-span-3">
              <select value={draft.type} onChange={(e) => set("type", e.target.value as PostType)} className="input">
                {POST_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {POST_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Proyecto" className="col-span-3 sm:col-span-2">
              <select value={draft.project ?? ""} onChange={(e) => set("project", e.target.value || null)} className="input">
                <option value="">—</option>
                {projects.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Fecha de publicación" className="col-span-6 sm:col-span-2">
              <input
                type="datetime-local"
                value={toLocalInput(draft.published_at)}
                onChange={(e) => set("published_at", e.target.value ? new Date(e.target.value).toISOString() : null)}
                className="input"
              />
            </Field>
            <Field label="Tags (coma)" className="col-span-6 sm:col-span-2">
              <input
                value={draft.tags.join(", ")}
                onChange={(e) =>
                  set(
                    "tags",
                    e.target.value
                      .split(",")
                      .map((t) => t.trim().toLowerCase())
                      .filter(Boolean),
                  )
                }
                className="input"
              />
            </Field>
            <Field label="Entradilla" className="col-span-6">
              <textarea rows={2} value={draft.excerpt ?? ""} onChange={(e) => set("excerpt", e.target.value)} className="input" />
            </Field>
            <Field label="Portada (URL)" className="col-span-6 sm:col-span-4">
              <input
                type="url"
                value={draft.cover_image ?? ""}
                onChange={(e) => set("cover_image", e.target.value || null)}
                className="input"
              />
            </Field>
            <label className="meta col-span-6 flex items-center gap-2 self-end pb-3 sm:col-span-2">
              <input type="checkbox" checked={draft.featured} onChange={(e) => set("featured", e.target.checked)} />
              Destacado
            </label>

            <div className="col-span-6">
              <div className="meta mb-2 flex gap-4">
                <button type="button" className={!preview ? "text-fg" : "text-faint"} onClick={() => setPreview(false)}>
                  Markdown
                </button>
                <button type="button" className={preview ? "text-fg" : "text-faint"} onClick={() => setPreview(true)}>
                  Vista previa
                </button>
              </div>
              {preview ? (
                <div className="min-h-80 border border-line p-5">
                  <Markdown>{draft.content || "_Vacío_"}</Markdown>
                </div>
              ) : (
                <textarea
                  rows={18}
                  value={draft.content}
                  onChange={(e) => set("content", e.target.value)}
                  className="input font-mono text-sm leading-relaxed"
                />
              )}
            </div>

            {message && (
              <p role="status" className={cx("col-span-6 font-mono text-sm", message.tone === "error" ? "text-accent-ink" : "text-fg")}>
                {message.text}
              </p>
            )}

            <div className="col-span-6 flex flex-wrap gap-2 border-t border-line pt-4">
              <button type="submit" disabled={busy} className="bracket">
                Guardar ({draft.status})
              </button>
              {draft.status !== "published" && (
                <button type="button" disabled={busy} className="bracket bracket-solid" onClick={() => save("published")}>
                  Publicar
                </button>
              )}
              {draft.status === "published" && (
                <button type="button" disabled={busy} className="bracket" onClick={() => save("draft")}>
                  Pasar a borrador
                </button>
              )}
              {draft.status !== "archived" && draft.id && (
                <button type="button" disabled={busy} className="bracket" onClick={() => save("archived")}>
                  Archivar
                </button>
              )}
              {draft.id && (
                <button type="button" disabled={busy} className="meta ml-auto text-faint hover:text-accent-ink" onClick={remove}>
                  Borrar
                </button>
              )}
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={cx("flex flex-col gap-1.5", className)}>
      <span className="meta text-faint">{label}</span>
      {children}
    </label>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-xl py-20">
      <h1 className="display text-6xl">{title}</h1>
      <div className="mt-4 text-muted">{children}</div>
    </div>
  );
}
