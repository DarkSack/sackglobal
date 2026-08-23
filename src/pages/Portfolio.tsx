import { useEffect, useMemo, useState, type ReactNode } from "react";
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
  Github,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchRepos, GITHUB_PROFILE, GITHUB_USER } from "@/api/github";
import {
  fetchInteractionsForRepos,
  fetchMyReactionsForRepos,
  toggleReaction,
} from "@/api/repoInteractions";
import RepoDetailModal from "@/pages/RepoDetailModal";
import { cn, formatDate } from "@/lib/utils";
import { requireLoginPrompt, toast } from "@/lib/notify";
import type {
  GitHubRepo,
  MyReactionsMap,
  RepoSummaryMap,
} from "@/types";

const REACTIONS = ["❤️", "👍", "🚀", "🔥", "👀"] as const;

const LANG_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Java: "#b07219",
  Python: "#3572A5",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Astro: "#ff5a03",
  Vue: "#41b883",
  Shell: "#89e051",
};

export default function Portfolio() {
  const { user, isLogged, signInWithGitHub } = useAuth();
  const currentUserId = user?.id || null;

  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [langFilter, setLangFilter] = useState<string>("all");

  const [interactions, setInteractions] = useState<RepoSummaryMap>({});
  const [myReactions, setMyReactions] = useState<MyReactionsMap>({});

  const [selected, setSelected] = useState<GitHubRepo | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchRepos();
        if (!cancelled) setRepos(data);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const repoIds = useMemo<number[]>(() => repos.map((r) => r.id), [repos]);

  const refresh = async (): Promise<void> => {
    if (!repoIds.length) return;
    const summary = await fetchInteractionsForRepos(repoIds);
    setInteractions(summary);
    if (currentUserId) {
      setMyReactions(await fetchMyReactionsForRepos(repoIds, currentUserId));
    } else {
      setMyReactions({});
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repoIds.join(","), currentUserId]);

  const languages: string[] = Array.from(
    new Set(repos.map((r) => r.language).filter((v): v is string => Boolean(v)))
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
    e: React.MouseEvent
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
        added ? `${emoji} añadida a ${repo.name}` : `${emoji} retirada de ${repo.name}`,
        { duration: 1600 }
      );
      void refresh();
    } catch (err) {
      console.error(err);
      toast.error("No se pudo registrar la reacción.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Github size={36} className="text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Portfolio</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Proyectos publicos de{" "}
              <span className="text-primary font-semibold">@{GITHUB_USER}</span>
              — reacciona y comenta con tu cuenta de GitHub.
            </p>
          </div>
        </div>
        <a
          href={GITHUB_PROFILE}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-primary text-sm font-semibold hover:bg-secondary transition"
        >
          @{GITHUB_USER}
          <ExternalLink size={14} />
        </a>
      </div>

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
          const langColor = (repo.language && LANG_COLORS[repo.language]) || "#8b949e";
          const info = interactions[repo.id] || {
            reactions: {},
            commentCount: 0,
          };
          const mine: Set<string> = myReactions[repo.id] || new Set<string>();

          return (
            <button
              key={repo.id}
              type="button"
              onClick={() => setSelected(repo)}
              className="flex flex-col gap-3 p-5 rounded-xl border border-border bg-card text-left cursor-pointer hover:-translate-y-1 hover:border-primary hover:shadow-[0_10px_24px_rgba(74,163,255,0.15)] transition"
            >
              <div className="flex items-center gap-2 text-primary">
                {repo.private ? <Lock size={16} /> : <Book size={16} />}
                <h3 className="font-semibold flex-1 break-words">{repo.name}</h3>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded hover:bg-accent"
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

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/60">
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
                          : "bg-background border-border text-muted-foreground hover:bg-accent"
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
            </button>
          );
        })}
      </div>

      {selected && (
        <RepoDetailModal
          repo={selected}
          onClose={() => {
            setSelected(null);
            void refresh();
          }}
        />
      )}
    </div>
  );
}

interface StatProps {
  icon: ReactNode;
  v: number;
}

function Stat({ icon, v }: StatProps) {
  return (
    <span className="inline-flex items-center gap-1">
      {icon}
      {v}
    </span>
  );
}
