import { useState, type FormEvent } from "react";
import { Newspaper, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createNews, listNews } from "@/api/news";
import { cacheKeys, useCachedResource } from "@/lib/cache";
import { formatDateTime } from "@/lib/utils";
import { toast } from "@/lib/notify";
import { findProfanity } from "@/lib/profanity";
import type { NewsItem } from "@/types";

const ADMIN_EMAIL = "johanjafet4@gmail.com";

export default function News() {
  const { user, isLogged } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  // Cacheado: volver a esta seccion no vuelve a pedir las noticias.
  const {
    data: items,
    loading,
    refresh: load,
  } = useCachedResource<NewsItem[]>(cacheKeys.news, listNews, { fallback: [] });

  const [title, setTitle] = useState<string>("");
  const [notice, setNotice] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [posting, setPosting] = useState<boolean>(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !notice.trim() || !isAdmin || !user) return;
    const bad = findProfanity(`${title} ${notice}`);
    if (bad.length > 0) {
      toast.warning(
        `Evita palabras como: ${bad.slice(0, 3).join(", ")}${
          bad.length > 3 ? "…" : ""
        }`,
        { duration: 4500 }
      );
      return;
    }
    setPosting(true);
    try {
      await createNews({
        userId: user.id,
        title: title.trim(),
        notice: notice.trim(),
        imageUrl: imageUrl.trim() || null,
      });
      setTitle("");
      setNotice("");
      setImageUrl("");
      toast.success("Noticia publicada");
      void load();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="flex items-center gap-3 mb-6">
        <Newspaper size={28} className="text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Noticias</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Publica una noticia para toda la comunidad."
              : "Ultimas noticias del canal."}
          </p>
        </div>
      </header>

      {isAdmin && (
        <form
          onSubmit={submit}
          className="flex flex-col gap-2 mb-8 p-4 rounded-xl border border-border bg-card"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titulo"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <textarea
            rows={3}
            value={notice}
            onChange={(e) => setNotice(e.target.value)}
            placeholder="Contenido de la noticia…"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-y"
          />
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="URL de imagen (opcional)"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={posting || !title.trim() || !notice.trim()}
            className="self-end px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
          >
            {posting ? "Publicando…" : "Publicar"}
          </button>
        </form>
      )}

      {!isAdmin && isLogged && (
        <div className="mb-8 p-3 rounded-lg border border-dashed border-border text-muted-foreground text-sm text-center">
          Solo el admin publica noticias.
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 size={16} className="animate-spin" /> Cargando…
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Aun no hay noticias.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((n) => (
            <article
              key={n.id}
              className="p-4 rounded-xl border border-border bg-card"
            >
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <h3 className="font-semibold text-primary text-lg">{n.title}</h3>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {formatDateTime(n.created_at)}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{n.notice}</p>
              {n.image_url && (
                <img
                  src={n.image_url}
                  alt=""
                  className="mt-3 rounded-md max-h-96 w-full object-cover"
                />
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
