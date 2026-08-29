import { useState, type ReactNode } from "react";
import {
  Search,
  Loader2,
  AlertCircle,
  FolderSearch,
  Lock,
  Book,
  ExternalLink,
  Star,
  GitFork,
  MessageSquare,
  Clock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import RepoDetailModal from "@/pages/RepoDetailModal";
import { toggleReaction } from "@/api/repoInteractions";
import { LANG_COLORS, LANG_FALLBACK } from "@/lib/langColors";
import { cn, formatDate } from "@/lib/utils";
import { requireLoginPrompt, toast } from "@/lib/notify";
import type { GitHubRepo, MyReactionsMap, RepoSummaryMap } from "@/types";

const REACTIONS = ["❤️", "👍", "🚀", "🔥", "👀"] as const;

interface ProjectsTabProps {
  repos: GitHubRepo[];
  loading: boolean;
  error: string | null;
  interactions: RepoSummaryMap;
  myReactions: MyReactionsMap;
  onInteractionsChanged: () => void;
}

export default function ProjectsTab({
  repos,
  loading,
  error,
  interactions,
  myReactions,
  onInteractionsChanged,
}: ProjectsTabProps) {
  const { isLogged, user, signInWithGitHub } = useAuth();
  const currentUserId = user?.id || null;

  const [search, setSearch] = useState<string>("");
  const [langFilter, setLangFilter] = useState<string>("all");
  const [selected, setSelected] = useState<GitHubRepo | null>(null);

  const languages: string[] = Array.from(
    new Set(repos.map((r) => r.language).filter((v): v is string => Boolean(v))),
  ).sort();

  const filtered: GitHubRepo[] = repos.filter((r) => {
    const matchesLang = langFilter === "all" || r.language === langFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      (r.description || "").toLowerCase().includes(q);
    return matchesLang && matchesSearch;
  });

  const handleReact = async (
    repo: GitHubRepo,
    emoji: string,
    e: React.MouseEvent,
  ): Promise<void> => {
    e.stopPropagation();
    if (!isLogged || !currentUserId) {
      await requireLoginPrompt("reaccionar", () => void signInWithGitHub());
      return;
    }
    try {
      const { added } = await toggleReaction({
        repoId: repo.id,
        repoName: repo.name,
        userId: currentUserId,
        emoji,
      });
      toast.success(
        added
          ? `${emoji} añadida a ${repo.name}`
          : `${emoji} retirada de ${repo.name}`,
        { duration: 1600 },
      );
      onInteractionsChanged();
    } catch (err) {
      console.error(err);
      toast.error("No se pudo registrar la reacción.");
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex-1 min-w-[240px] flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card">
          <Search size={16} className="text-muted-foreground" />
          <input
            className="bg-transparent outline-none flex-1 text-sm placeholder:text-muted-foreground"
            placeholder="Buscar repositorio…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <label htmlFor="lang">Lenguaje:</label>
          <select
            id="lang"
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value)}
            className="px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm cursor-pointer"
          >
            <option value="all">Todos</option>
            {languages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} de {repos.length}
        </span>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="animate-spin" size={20} /> Cargando repositorios…
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center gap-2 py-16 text-destructive">
          <AlertCircle size={20} /> {error}
        </div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <FolderSearch size={20} /> Sin resultados.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((repo) => {
          const langColor =
            (repo.language && LANG_COLORS[repo.language]) || LANG_FALLBACK;
          const info = interactions[repo.id] || {
            reactions: {},
            commentCount: 0,
          };
          const mine: Set<string> = myReactions[repo.id] || new Set<string>();

          return (
            // La tarjeta es un <article>, no un <button>.
            //
            // Antes era un botón que contenía otros botones (las
            // reacciones) y un enlace a GitHub. Anidar controles
            // interactivos es HTML inválido: el navegador lo "repara"
            // como puede y el resultado con teclado o lector de
            // pantalla es impredecible.
            //
            // En su lugar, el botón que abre el detalle se extiende
            // sobre toda la tarjeta con un pseudo-elemento, y los
            // controles que van encima suben de capa con `z-10`. Se
            // conserva el clic en cualquier punto y queda un solo
            // destino tabulable por tarjeta.
            <article
              key={repo.id}
              className="relative flex flex-col gap-3 p-5 rounded-xl border border-border bg-card text-left transition hover:-translate-y-1 hover:border-primary hover:shadow-[0_10px_24px_rgba(74,163,255,0.15)] focus-within:border-primary"
            >
              <div className="flex items-center gap-2 text-primary">
                {repo.private ? <Lock size={16} /> : <Book size={16} />}
                <h3 className="font-semibold flex-1 break-words">
                  <button
                    type="button"
                    onClick={() => setSelected(repo)}
                    className="text-left after:absolute after:inset-0 after:rounded-xl after:content-[''] focus:outline-none"
                  >
                    {repo.name}
                  </button>
                </h3>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="relative z-10 p-1 rounded hover:bg-accent"
                  title="Abrir en GitHub"
                >
                  <ExternalLink size={14} />
                </a>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-3 min-h-[3rem]">
                {repo.description || "Sin descripcion."}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {repo.language && (
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: langColor }}
                    />
                    {repo.language}
                  </span>
                )}
                <Stat icon={<Star size={12} />} v={repo.stargazers_count} />
                <Stat icon={<GitFork size={12} />} v={repo.forks_count} />
                <Stat icon={<MessageSquare size={12} />} v={info.commentCount} />
              </div>

              <div className="relative z-10 flex flex-wrap gap-1.5 pt-2 border-t border-border/60">
                {REACTIONS.map((emoji) => {
                  const count = info.reactions[emoji] || 0;
                  const active = mine.has(emoji);
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={(e) => void handleReact(repo, emoji, e)}
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs transition",
                        active
                          ? "bg-primary/20 border-primary text-primary"
                          : "bg-background border-border text-muted-foreground hover:bg-accent",
                      )}
                      title={
                        isLogged
                          ? "Reaccionar"
                          : "Login con GitHub para reaccionar"
                      }
                    >
                      <span className="text-sm leading-none">{emoji}</span>
                      <span>{count}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-auto pt-1">
                <Clock size={11} /> Actualizado {formatDate(repo.pushed_at)}
              </div>
            </article>
          );
        })}
      </div>

      {selected && (
        <RepoDetailModal
          repo={selected}
          onClose={() => {
            setSelected(null);
            onInteractionsChanged();
          }}
        />
      )}
    </>
  );
}

function Stat({ icon, v }: { icon: ReactNode; v: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      {icon}
      {v}
    </span>
  );
}
