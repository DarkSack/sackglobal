import { ExternalLink, Loader2, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { listLinks } from "@/api/socialLinks";
import { cacheKeys, useCachedResource } from "@/lib/cache";
import type { SocialLink } from "@/types";

/**
 * Pestaña "Redes".
 *
 * Lee la misma tabla `social_links` que la página /social/redes-sociales
 * y comparte su clave de caché, así que visitar una deja la otra
 * instantánea. Los enlaces se siguen administrando desde allí: duplicar
 * el formulario de alta aquí solo daría dos sitios donde arreglar el
 * mismo fallo.
 */
export default function LinksTab() {
  const { data: links, loading, error } = useCachedResource<SocialLink[]>(
    cacheKeys.socialLinks,
    listLinks,
    { fallback: [] },
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-10 text-muted-foreground">
        <Loader2 size={16} className="animate-spin" /> Cargando enlaces…
      </div>
    );
  }

  if (error) {
    return (
      <p className="py-10 text-sm text-destructive">
        No se pudieron cargar los enlaces: {error}
      </p>
    );
  }

  if (links.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-12 text-center">
        <Share2 size={22} className="mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Todavía no hay redes publicadas.
        </p>
        <Link
          to="/social/redes-sociales"
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          Añadir desde el panel de redes
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="mb-6 text-sm text-muted-foreground">
        Donde publico y donde se me puede encontrar.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_10px_24px_rgba(74,163,255,0.12)]"
          >
            <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-secondary text-primary">
              <Share2 size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-foreground">
                {link.name}
              </span>
              {link.channel_name && (
                <span className="block truncate text-xs text-muted-foreground">
                  {link.channel_name}
                </span>
              )}
            </span>
            <ExternalLink
              size={14}
              className="flex-shrink-0 text-muted-foreground transition group-hover:text-primary"
            />
          </a>
        ))}
      </div>
    </>
  );
}
