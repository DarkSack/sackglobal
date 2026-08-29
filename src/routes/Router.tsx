import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Portfolio from "@/pages/Portfolio";

// ══════════════════════════════════════════════════════════════════
// El portafolio es la portada: se importa de forma normal para que
// esté en el primer bundle y aparezca sin esperas.
//
// El resto llega bajo demanda. Alguien que entra a ver los proyectos
// —el caso mayoritario— ya no descarga el código de Posts, Noticias,
// Redes ni Perfil, que antes viajaban en el mismo fichero aunque nunca
// se visitaran.
// ══════════════════════════════════════════════════════════════════
const SocialHome = lazy(() => import("@/pages/SocialHome"));
const Posts = lazy(() => import("@/pages/Posts"));
const News = lazy(() => import("@/pages/News"));
const SocialLinks = lazy(() => import("@/pages/SocialLinks"));
const Profile = lazy(() => import("@/pages/Profile"));

/** Se ve solo mientras descarga el trozo de una sección nueva. */
function RouteFallback() {
  return (
    <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
      <Loader2 size={18} className="animate-spin" />
      Cargando…
    </div>
  );
}

export default function Router() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/social" element={<SocialHome />} />
        <Route path="/social/posts" element={<Posts />} />
        <Route path="/social/noticias" element={<News />} />
        <Route path="/social/redes-sociales" element={<SocialLinks />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
