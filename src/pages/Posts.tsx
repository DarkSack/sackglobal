import { useEffect, useState, type FormEvent } from "react";
import { FileText, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createPost, deletePost, listPosts } from "@/api/posts";
import { formatDateTime } from "@/lib/utils";
import type { Post } from "@/types";

export default function Posts() {
  const { user, isLogged } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [content, setContent] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [posting, setPosting] = useState<boolean>(false);

  const load = async (): Promise<void> => {
    setLoading(true);
    try {
      setPosts(await listPosts());
    } catch (e) {
      console.warn((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !isLogged || !user) return;
    setPosting(true);
    try {
      await createPost({
        userId: user.id,
        content: content.trim(),
        imageUrl: imageUrl.trim() || null,
      });
      setContent("");
      setImageUrl("");
      void load();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setPosting(false);
    }
  };

  const remove = async (id: number): Promise<void> => {
    if (!confirm("Borrar este post?")) return;
    try {
      await deletePost(id);
      void load();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="flex items-center gap-3 mb-6">
        <FileText size={28} className="text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="text-sm text-muted-foreground">
            Ideas, apuntes y novedades.
          </p>
        </div>
      </header>

      {isLogged ? (
        <form
          onSubmit={submit}
          className="flex flex-col gap-2 mb-8 p-4 rounded-xl border border-border bg-card"
        >
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Que quieres publicar?"
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
            disabled={posting || !content.trim()}
            className="self-end px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
          >
            {posting ? "Publicando…" : "Publicar"}
          </button>
        </form>
      ) : (
        <div className="mb-8 p-4 rounded-lg border border-dashed border-border text-muted-foreground text-sm text-center">
          Inicia sesion con GitHub para publicar posts.
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 size={16} className="animate-spin" /> Cargando…
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Aun no hay posts.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((p) => (
            <article
              key={p.id}
              className="p-4 rounded-xl border border-border bg-card"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  {p.users?.avatar_url ? (
                    <img
                      src={p.users.avatar_url}
                      alt="avatar"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : null}
                  <div>
                    <div className="text-sm font-semibold text-primary">
                      {p.users?.nickname || "Anonimo"}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {formatDateTime(p.created_at)}
                    </div>
                  </div>
                </div>
                {isLogged && user?.id === p.user_id && (
                  <button
                    type="button"
                    onClick={() => void remove(p.id)}
                    className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-accent transition"
                    title="Borrar"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p className="text-sm whitespace-pre-wrap">{p.content}</p>
              {p.image_url && (
                <img
                  src={p.image_url}
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
