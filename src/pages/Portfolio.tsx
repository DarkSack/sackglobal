import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Github, ExternalLink, Boxes, User, Share2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchProfile,
  fetchRepos,
  GITHUB_PROFILE,
  GITHUB_USER,
} from "@/api/github";
import {
  fetchInteractionsForRepos,
  fetchMyReactionsForRepos,
} from "@/api/repoInteractions";
import { Tabs, TabPanel, type TabDef } from "@/components/Tabs";
import { cacheKeys, useCachedResource } from "@/lib/cache";
import ProjectsTab from "@/pages/portfolio/ProjectsTab";
import AboutTab from "@/pages/portfolio/AboutTab";
import LinksTab from "@/pages/portfolio/LinksTab";
import type {
  GitHubProfile,
  GitHubRepo,
  MyReactionsMap,
  RepoSummaryMap,
} from "@/types";

// "Sobre mi" va primero y es la pestana de entrada: en un portafolio,
// lo primero que interesa es quien firma los proyectos.
const TAB_IDS = ["sobre-mi", "proyectos", "redes"] as const;
type TabId = (typeof TAB_IDS)[number];

/** La pestana por defecto no lleva `?seccion=` en la URL. */
const DEFAULT_TAB: TabId = "sobre-mi";

const TABS: readonly TabDef<TabId>[] = [
  { id: "sobre-mi", label: "Sobre mí", icon: <User size={15} /> },
  { id: "proyectos", label: "Proyectos", icon: <Boxes size={15} /> },
  { id: "redes", label: "Redes", icon: <Share2 size={15} /> },
];

function isTabId(value: string | null): value is TabId {
  return value !== null && (TAB_IDS as readonly string[]).includes(value);
}

/**
 * Portafolio: una sola página con pestañas.
 *
 * La pestaña activa vive en la URL (`?seccion=sobre-mi`) y no en el
 * estado del componente. Cuesta lo mismo y se gana bastante: el enlace
 * se puede compartir apuntando a una sección concreta, el botón "atrás"
 * hace lo que el usuario espera, y recargar no devuelve a la primera
 * pestaña.
 *
 * Cambiar de pestaña no navega ni desmonta: los repos y el perfil se
 * cargan una vez y se comparten entre paneles.
 */
export default function Portfolio() {
  const { user } = useAuth();
  const currentUserId = user?.id || null;

  const [params, setParams] = useSearchParams();
  const raw = params.get("seccion");
  const tab: TabId = isTabId(raw) ? raw : DEFAULT_TAB;

  const selectTab = useCallback(
    (id: TabId) => {
      const next = new URLSearchParams(params);
      // La pestaña de entrada no ensucia la URL con `?seccion=…`.
      if (id === DEFAULT_TAB) next.delete("seccion");
      else next.set("seccion", id);
      setParams(next);
    },
    [params, setParams],
  );

  const {
    data: repos,
    loading: loadingRepos,
    error: reposError,
  } = useCachedResource<GitHubRepo[]>(cacheKeys.repos, fetchRepos, {
    fallback: [],
  });

  // El perfil alimenta la pestaña de entrada, así que se pide desde el
  // principio. Los repos también hacen falta aquí: de ellos salen el
  // recuento de lenguajes y las estrellas.
  const { data: profile } = useCachedResource<GitHubProfile | null>(
    cacheKeys.profile,
    fetchProfile,
    { fallback: null },
  );

  // Reacciones y comentarios: viven en Supabase y cambian con el uso, así
  // que se quedan fuera de la caché de la vista.
  const [interactions, setInteractions] = useState<RepoSummaryMap>({});
  const [myReactions, setMyReactions] = useState<MyReactionsMap>({});

  const repoIds = useMemo<number[]>(() => repos.map((r) => r.id), [repos]);
  const repoIdsKey = repoIds.join(",");

  const refreshInteractions = useCallback(async (): Promise<void> => {
    if (repoIds.length === 0) return;
    setInteractions(await fetchInteractionsForRepos(repoIds));
    setMyReactions(
      currentUserId
        ? await fetchMyReactionsForRepos(repoIds, currentUserId)
        : {},
    );
    // `repoIdsKey` compara por contenido; `repoIds` sería un array nuevo
    // en cada render y dispararía el efecto en bucle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repoIdsKey, currentUserId]);

  useEffect(() => {
    void refreshInteractions();
  }, [refreshInteractions]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Github size={36} className="text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Portfolio</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Quién soy, qué he construido y dónde encontrarme.
            </p>
          </div>
        </div>
        <a
          href={GITHUB_PROFILE}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-primary transition hover:bg-secondary"
        >
          @{GITHUB_USER}
          <ExternalLink size={14} />
        </a>
      </div>

      <Tabs
        tabs={TABS}
        value={tab}
        onChange={selectTab}
        label="Secciones del portafolio"
      />

      <TabPanel id="sobre-mi" active={tab === "sobre-mi"}>
        <AboutTab profile={profile} repos={repos} />
      </TabPanel>

      <TabPanel id="proyectos" active={tab === "proyectos"}>
        <ProjectsTab
          repos={repos}
          loading={loadingRepos}
          error={reposError}
          interactions={interactions}
          myReactions={myReactions}
          onInteractionsChanged={() => void refreshInteractions()}
        />
      </TabPanel>

      <TabPanel id="redes" active={tab === "redes"}>
        <LinksTab />
      </TabPanel>
    </div>
  );
}
