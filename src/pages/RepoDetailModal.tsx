import { useEffect, useState, type FormEvent } from "react";
import {
  X,
  ExternalLink,
  MessageSquare,
  Loader2,
  Github,
  Book,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { addComment, fetchComments } from "@/api/repoInteractions";
import { formatDateTime } from "@/lib/utils";
import type { GitHubRepo, RepoInteraction } from "@/types";

interface RepoDetailModalProps {
  repo: GitHubRepo;
  onClose: () => void;
}

export default function RepoDetailModal({ repo, onClose }: RepoDetailModalProps) {
  const { user, isLogged } = useAuth();
  const [comments, setComments] = useState<RepoInteraction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newComment, setNewComment] = useState<string>("");
  const [posting, setPosting] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await fetchComments(repo.id);
      if (!cancelled) {
        setComments(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [repo.id]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isLogged || !user) return;
    setPosting(true);
    try {
      await addComment({
        repoId: repo.id,
        repoName: repo.name,
        userId: user.id,
        content: newComment.trim(),
      });
      setNewComment("");
      setComments(await fetchComments(repo.id));
    } catch (err) {
      console.error(err);
      alert("No se pudo publicar el comentario.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl border border-border bg-card"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 p-4 border-b border-border">
          <div className="flex items-center gap-2 text-primary min-w-0">
            <Book size={18} />
            <h2 className="font-semibold truncate">{repo.name}</h2>
          </div>
          <div className="flex items-center gap-1">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-primary text-sm hover:bg-secondary transition"
            >
              GitHub <ExternalLink size={12} />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="p-5 overflow-y-auto">
          <p className="text-sm mb-3">
            {repo.description || (
              <span className="text-muted-foreground italic">
                Sin descripcion.
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-6">
            {repo.language && <span>💻 {repo.language}</span>}
            <span>⭐ {repo.stargazers_count}</span>
            <span>🍴 {repo.forks_count}</span>
            <span>⚠️ {repo.open_issues_count} issues</span>
          </div>

          <h3 className="flex items-center gap-2 font-semibold mb-3">
            <MessageSquare size={16} /> Comentarios
          </h3>

          {isLogged ? (
            <form onSubmit={submit} className="flex flex-col gap-2 mb-5">
              <textarea
                rows={2}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={posting}
                placeholder="Escribe un comentario…"
                className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-y min-h-[60px]"
              />
              <button
                type="submit"
                disabled={posting || !newComment.trim()}
                className="self-end px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {posting ? "Publicando…" : "Publicar"}
              </button>
            </form>
          ) : (
            <div className="mb-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border text-muted-foreground text-sm">
              <Github size={14} /> Inicia sesion con GitHub para comentar.
            </div>
          )}

          <div className="flex flex-col gap-3">
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="animate-spin" size={14} /> Cargando comentarios…
              </div>
            )}
            {!loading && comments.length === 0 && (
              <div className="text-muted-foreground text-sm">
                Aun no hay comentarios. Se el primero ✨
              </div>
            )}
            {!loading &&
              comments.map((c) => (
                <div
                  key={c.id}
                  className="flex gap-3 p-3 rounded-lg border border-border bg-background"
                >
                  {c.users?.avatar_url ? (
                    <img
                      src={c.users.avatar_url}
                      alt="avatar"
                      className="h-9 w-9 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-accent grid place-items-center text-muted-foreground flex-shrink-0">
                      ?
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2 mb-1">
                      <b className="text-primary text-sm">
                        {c.users?.nickname || "Anonimo"}
                      </b>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDateTime(c.created_at)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
