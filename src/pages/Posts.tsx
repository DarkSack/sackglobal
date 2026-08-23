import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  FileText,
  Trash2,
  Loader2,
  MessageCircle,
  Send,
  Github,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createPost, deletePost, listPosts } from "@/api/posts";
import {
  addComment as addPostComment,
  countCommentsPerPost,
  deleteComment as deletePostComment,
  listComments,
} from "@/api/postComments";
import { formatDateTime } from "@/lib/utils";
import { confirm, toast } from "@/lib/notify";
import { findProfanity } from "@/lib/profanity";
import type { Post, PostComment } from "@/types";

function warnProfanity(text: string): boolean {
  const bad = findProfanity(text);
  if (bad.length === 0) return false;
  toast.warning(
    `Evita palabras como: ${bad.slice(0, 3).join(", ")}${
      bad.length > 3 ? "…" : ""
    }`,
    { duration: 4500 }
  );
  return true;
}

const ADMIN_EMAIL = "johanjafet4@gmail.com";

export default function Posts() {
  const { user, isLogged } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [content, setContent] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [posting, setPosting] = useState<boolean>(false);
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});

  const postIds = useMemo(() => posts.map((p) => p.id), [posts]);

  const refreshCounts = async () => {
    if (!postIds.length) {
      setCommentCounts({});
      return;
    }
    setCommentCounts(await countCommentsPerPost(postIds));
  };

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

  useEffect(() => {
    void refreshCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postIds.join(",")]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !isAdmin || !user) return;
    if (warnProfanity(content)) return;
    setPosting(true);
    try {
      await createPost({
        userId: user.id,
        content: content.trim(),
        imageUrl: imageUrl.trim() || null,
      });
      setContent("");
      setImageUrl("");
      toast.success("Post publicado");
      void load();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setPosting(false);
    }
  };

  const remove = async (id: number): Promise<void> => {
    const ok = await confirm({
      title: "Borrar este post?",
      text: "Esta accion no se puede deshacer y se borran tambien sus comentarios.",
      icon: "warning",
      confirmButtonText: "Si, borrar",
      danger: true,
    });
    if (!ok) return;
    try {
      await deletePost(id);
      toast.success("Post borrado");
      void load();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="flex items-center gap-3 mb-6">
        <FileText size={28} className="text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Publica un post nuevo para tu comunidad."
              : "Ultimas publicaciones del canal."}
          </p>
        </div>
      </header>

      {isAdmin && (
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
            <PostCard
              key={p.id}
              post={p}
              isAdmin={isAdmin}
              isLogged={isLogged}
              currentUserId={user?.id || null}
              commentCount={commentCounts[p.id] || 0}
              onDeletePost={() => void remove(p.id)}
              onCommentsChanged={() => void refreshCounts()}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PostCard: post + hilo de comentarios
// ══════════════════════════════════════════════════════════════════

interface PostCardProps {
  post: Post;
  isAdmin: boolean;
  isLogged: boolean;
  currentUserId: string | null;
  commentCount: number;
  onDeletePost: () => void;
  onCommentsChanged: () => void;
}

function PostCard({
  post,
  isAdmin,
  isLogged,
  currentUserId,
  commentCount,
  onDeletePost,
  onCommentsChanged,
}: PostCardProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loadingComments, setLoadingComments] = useState<boolean>(false);
  const [newText, setNewText] = useState<string>("");
  const [posting, setPosting] = useState<boolean>(false);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && comments.length === 0) {
      setLoadingComments(true);
      try {
        setComments(await listComments(post.id));
      } catch (err) {
        toast.error((err as Error).message);
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || !currentUserId) return;
    if (warnProfanity(newText)) return;
    setPosting(true);
    try {
      await addPostComment({
        postId: post.id,
        userId: currentUserId,
        content: newText.trim(),
      });
      setNewText("");
      setComments(await listComments(post.id));
      onCommentsChanged();
      toast.success("Comentario publicado");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setPosting(false);
    }
  };

  const removeComment = async (id: string) => {
    const ok = await confirm({
      title: "Borrar este comentario?",
      icon: "warning",
      confirmButtonText: "Si, borrar",
      danger: true,
    });
    if (!ok) return;
    try {
      await deletePostComment(id);
      setComments((cs) => cs.filter((c) => c.id !== id));
      onCommentsChanged();
      toast.success("Comentario borrado");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <article className="p-4 rounded-xl border border-border bg-card">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          {post.users?.avatar_url ? (
            <img
              src={post.users.avatar_url}
              alt="avatar"
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : null}
          <div>
            <div className="text-sm font-semibold text-primary">
              {post.users?.nickname || "Sack"}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {formatDateTime(post.created_at)}
            </div>
          </div>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={onDeletePost}
            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-accent transition"
            title="Borrar post"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <p className="text-sm whitespace-pre-wrap">{post.content}</p>

      {post.image_url && (
        <img
          src={post.image_url}
          alt=""
          className="mt-3 rounded-md max-h-96 w-full object-cover"
        />
      )}

      <div className="mt-4 pt-3 border-t border-border/60">
        <button
          type="button"
          onClick={() => void toggle()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition"
        >
          <MessageCircle size={16} />
          {commentCount} {commentCount === 1 ? "comentario" : "comentarios"}
          <span className="text-[11px] opacity-70">
            {open ? "· ocultar" : "· ver"}
          </span>
        </button>

        {open && (
          <div className="mt-3 flex flex-col gap-3">
            {isLogged ? (
              <form
                onSubmit={submit}
                className="flex items-start gap-2 p-2 rounded-lg border border-border bg-background"
              >
                <textarea
                  rows={1}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  disabled={posting}
                  placeholder="Escribe un comentario…"
                  className="flex-1 bg-transparent outline-none text-sm resize-y min-h-[36px]"
                />
                <button
                  type="submit"
                  disabled={posting || !newText.trim()}
                  className="p-2 rounded bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  title="Publicar"
                >
                  {posting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </form>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-muted-foreground text-xs">
                <Github size={12} /> Inicia sesion con GitHub para comentar.
              </div>
            )}

            {loadingComments && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Loader2 size={12} className="animate-spin" /> Cargando comentarios…
              </div>
            )}

            {!loadingComments && comments.length === 0 && (
              <div className="text-muted-foreground text-xs italic">
                Se el primero en comentar ✨
              </div>
            )}

            {!loadingComments &&
              comments.map((c) => {
                const canDelete =
                  isAdmin || (currentUserId && c.user_id === currentUserId);
                return (
                  <div
                    key={c.id}
                    className="flex gap-2 p-2 rounded-lg bg-background border border-border/60"
                  >
                    {c.users?.avatar_url ? (
                      <img
                        src={c.users.avatar_url}
                        alt="avatar"
                        className="h-7 w-7 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-accent grid place-items-center text-muted-foreground flex-shrink-0 text-xs">
                        ?
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 mb-0.5">
                        <b className="text-primary text-xs">
                          {c.users?.nickname || "Anonimo"}
                        </b>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">
                            {formatDateTime(c.created_at)}
                          </span>
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => void removeComment(c.id)}
                              className="p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-accent transition"
                              title="Borrar"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs whitespace-pre-wrap">{c.content}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </article>
  );
}
