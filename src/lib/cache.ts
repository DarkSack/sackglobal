import { useCallback, useEffect, useRef, useState } from "react";

// ══════════════════════════════════════════════════════════════════
// Caché de datos entre pantallas
//
// Cada sección de /social es una ruta distinta, así que al cambiar de
// una a otra React desmonta la anterior y la nueva vuelve a pedirlo
// todo a Supabase. Ir a Posts, volver a Noticias y regresar a Posts
// eran tres viajes de red para ver exactamente los mismos datos, con
// su spinner cada vez. Se sentía como si la página se recargara.
//
// Esto guarda la última respuesta por clave en memoria del módulo (no
// en el estado de ningún componente, que es lo que se pierde al
// desmontar) y la devuelve al instante en la siguiente visita. Si ya
// está vieja, se refresca de fondo sin quitar lo que se está viendo:
// el patrón "stale while revalidate".
//
// Se guarda en memoria a propósito, no en localStorage: son datos que
// cambian y que no interesa conservar entre recargas del navegador.
//
// No es react-query. Es lo mínimo que resuelve este problema sin
// añadir una dependencia de 40 KB a un portafolio.
// ══════════════════════════════════════════════════════════════════

interface Entry {
  data: unknown;
  /** Marca de tiempo de la última carga con éxito. */
  at: number;
}

const store = new Map<string, Entry>();

/**
 * Peticiones en vuelo por clave.
 *
 * Si dos componentes piden lo mismo a la vez (o se entra y se sale de
 * una sección rápido), comparten la misma promesa en lugar de lanzar
 * dos consultas iguales.
 */
const inflight = new Map<string, Promise<unknown>>();

/**
 * Cómo se dispara una carga.
 *
 *   initial     — primer montaje sin caché; `loading` ya viene en true.
 *   background  — hay datos en pantalla; se refresca sin taparlos.
 *   manual      — recarga forzada sin nada que enseñar mientras tanto.
 */
type LoadMode = "initial" | "background" | "manual";

/** Tiempo por defecto antes de considerar los datos viejos. */
const DEFAULT_TTL_MS = 60_000;

/** Olvida una clave para que la próxima lectura vaya a la red. */
export function invalidate(key: string): void {
  store.delete(key);
}

/** Sustituye lo cacheado sin ir a la red (tras un alta o un borrado). */
export function setCached<T>(key: string, data: T): void {
  store.set(key, { data, at: Date.now() });
}

/** Vacía toda la caché. Se usa al cerrar sesión. */
export function clearCache(): void {
  store.clear();
  inflight.clear();
}

export interface CachedResource<T> {
  data: T;
  /** Solo true en la primera carga, cuando no hay nada que enseñar. */
  loading: boolean;
  /** True mientras se refresca de fondo con datos ya en pantalla. */
  refreshing: boolean;
  error: string | null;
  /** Fuerza una recarga desde la red. */
  refresh: () => Promise<void>;
  /** Actualiza el valor en local y en la caché, sin ir a la red. */
  mutate: (next: T) => void;
}

export function useCachedResource<T>(
  key: string,
  loader: () => Promise<T>,
  options: { ttlMs?: number; enabled?: boolean; fallback: T },
): CachedResource<T> {
  const { ttlMs = DEFAULT_TTL_MS, enabled = true, fallback } = options;

  const cached = store.get(key);
  const [data, setData] = useState<T>(
    cached ? (cached.data as T) : fallback,
  );
  const [loading, setLoading] = useState<boolean>(!cached && enabled);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Si cambia la clave en un componente que ya está montado, el estado
  // se reajusta aquí, durante el render, en lugar de en un efecto.
  //
  // Es el patrón que recomienda React para "ajustar estado cuando
  // cambia una prop": hacerlo en un efecto obligaría a pintar una vez
  // con los datos de la clave anterior y otra con los nuevos, y eso es
  // exactamente el parpadeo que este hook existe para evitar.
  const [renderedKey, setRenderedKey] = useState(key);
  if (renderedKey !== key) {
    const entry = store.get(key);
    setRenderedKey(key);
    setData(entry ? (entry.data as T) : fallback);
    setLoading(!entry && enabled);
    setError(null);
  }

  // El loader suele ser una función nueva en cada render; guardarlo en
  // una ref evita que el efecto se vuelva a disparar por eso.
  //
  // La asignación va dentro de un efecto y no en el cuerpo del render:
  // escribir en una ref mientras se renderiza rompe con el modo
  // concurrente, donde React puede descartar un render a medias y dejar
  // la ref apuntando a algo que nunca se llegó a montar. En el primer
  // render vale el valor con el que se inicializó la ref, así que la
  // carga inicial nunca usa un loader viejo.
  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  });

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(
    async (mode: LoadMode): Promise<void> => {
      // "initial" no toca `loading`: ya vale true desde el render, y
      // volver a ponerlo provocaria un setState sincrono dentro del
      // efecto, con su render de mas.
      if (mode === "background") setRefreshing(true);
      else if (mode === "manual") setLoading(true);

      try {
        let promise = inflight.get(key) as Promise<T> | undefined;
        if (!promise) {
          promise = loaderRef.current();
          inflight.set(key, promise as Promise<unknown>);
          // Se limpia pase lo que pase, o una consulta fallida dejaría
          // la clave bloqueada para siempre.
          void promise.finally(() => inflight.delete(key));
        }

        const result = await promise;
        store.set(key, { data: result, at: Date.now() });
        if (mounted.current) setData(result);
      } catch (e) {
        if (mounted.current) setError((e as Error).message);
      } finally {
        if (mounted.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [key],
  );

  useEffect(() => {
    if (!enabled) return;

    const entry = store.get(key);

    // Sin nada cacheado se carga; con algo cacheado ya se pintó durante
    // el render, así que solo se refresca de fondo si caducó.
    if (!entry) void load("initial");
    else if (Date.now() - entry.at > ttlMs) void load("background");
  }, [key, enabled, ttlMs, load]);

  const refresh = useCallback(async () => {
    // Se mira si habia datos ANTES de invalidar: si los habia, la
    // recarga es de fondo y no se vacia la pantalla.
    const hadData = store.has(key);
    invalidate(key);
    // Tambien se descarta la peticion en vuelo, o un refresh tras un
    // alta reutilizaria la respuesta anterior, sin el elemento nuevo.
    inflight.delete(key);
    await load(hadData ? "background" : "manual");
  }, [key, load]);

  const mutate = useCallback(
    (next: T) => {
      setCached(key, next);
      setData(next);
    },
    [key],
  );

  return { data, loading, refreshing, error, refresh, mutate };
}

/** Claves de caché, en un solo sitio para que no se escriban a mano. */
export const cacheKeys = {
  repos: "github:repos",
  profile: "github:profile",
  posts: "supabase:posts",
  news: "supabase:news",
  socialLinks: "supabase:social_links",
} as const;
