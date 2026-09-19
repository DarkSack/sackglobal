# SackGlobal — digital archive

Sitio personal de **Sack** (Johan Jafet Del Valle Santiago): portfolio, perfil, journal y redes en un solo archivo digital.

La regla del proyecto: **el contenido real es el protagonista y no se inventa nada.** Los proyectos, tecnologías, fechas y actividad salen de GitHub; lo editorial se escribe a mano en `src/content/`; el Journal lo publica el autor desde `/admin`.

---

## Rutas

| Ruta | Qué es |
| --- | --- |
| `/` | Portada: hero, Selected Work, About, Currently Building, Technology Universe, Journal, Connect |
| `/work` | Archivo completo con filtros (`?category=`, `?tech=`) y orden (`?sort=updated\|stars\|created`) |
| `/projects/[slug]` | Ficha de proyecto: README, features, stack con evidencia, estructura, actividad, commits |
| `/about` | Perfil, experiencia, Technology Map |
| `/journal`, `/journal/[slug]` | Field notes (`?type=`, `?tag=`) · RSS en `/journal/rss.xml` |
| `/now` | Lo que se está construyendo; "using lately" calculado de los repos |
| `/uses` | Herramientas, cada una con su fuente |
| `/connect` | Redes |
| `/admin` | CMS del Journal (login con GitHub, solo el email admin) |

---

## Tres fuentes, sin mezclarlas

```
GitHub API ──► lib/github (fetch + caché 1 h + snapshot) ──► lib/projects (normaliza, detecta, clasifica) ──► UI
Supabase   ──► lib/journal (RLS: solo publicados, caché 5 min)                                        ──► UI
src/content (a mano: perfil, redes, now, uses, metadata editorial de proyectos)                        ──► UI
```

| Fuente | Tipo | Dónde se edita |
| --- | --- | --- |
| GitHub | **FACT** — repos, lenguajes, topics, README, manifiestos, commits, actividad | Nada: se lee solo |
| `src/content/*` | **METADATA / EDITORIAL** — destacados, textos, estado cuando la heurística no alcanza | Los ficheros `.ts` |
| Supabase `journal_posts` | **USER GENERATED** — posts | `/admin` |

### GitHub como fuente de verdad

- `src/lib/github/fetch-archive.ts` lee, por repo: detalle, lenguajes, árbol, releases, commits, actividad semanal y, desde `raw.githubusercontent.com` (no gasta cuota), README, CHANGELOG y manifiestos (`package.json`, Gradle, `.csproj`, `app.json`, `manifest.json`, `requirements.txt`, Docker, `pom.xml`).
- El token (`GITHUB_TOKEN`) vive solo en el servidor (`server-only`).
- **Sin token, o si la API falla**, el sitio sirve `src/data/github-snapshot.json`. Regenerarlo:

  ```bash
  npm run sync:github   # usa GITHUB_TOKEN o `gh auth token`
  ```

### Project intelligence

- **Tecnologías** (`lib/projects/technologies.ts`): catálogo con reglas por dependencia, topic, lenguaje (≥ 8 %) o manifiesto. Cada detección guarda su evidencia (`mobile/package.json → expo`), visible al pasar el ratón.
- **Categorías** (`lib/projects/classify.ts`): web, mobile, minecraft, backend, ai, devtools, systems, infrastructure, experimental — solo con evidencia.
- **Estado**: `ARCHIVED` si GitHub lo dice, `ACTIVE` si hubo push en 45 días, `UNKNOWN` en otro caso. `WIP`, `MAINTAINED`, `EXPERIMENTAL`… solo por metadata. La UI siempre dice de dónde sale el estado.
- **README** (`lib/projects/readme.ts`): resumen, features, arquitectura, estado y changelog por encabezado; lo que no existe no se muestra.

### Metadata editorial — `src/content/projects.ts`

```ts
RPGRollSack: {
  slug: "rpgroll", title: "RPGRoll", featured: true, displayOrder: 1,
  size: "xl",            // peso en el bento: xl | lg | md | sm
  status: "ACTIVE", statusNote: "…", accent: "ruby",
  featuredImage: "/projects/rpgroll.png",   // opcional; sin ella, composición tipográfica
  excludeTech: [], links: { download: "…" }, related: ["RPGRollDocs"],
}
```

---

## Journal / CMS

1. Aplicar `supabase/migrations/20260919_journal_posts.sql` en el SQL Editor de Supabase (crea `journal_posts` con RLS; `posts` y `news` antiguas no se tocan).
2. Entrar en `/admin` con GitHub (mismo provider OAuth de siempre) usando la cuenta admin.
3. Crear, previsualizar (Markdown), publicar, pasar a borrador o archivar. Al guardar, `/api/revalidate` refresca la web pública.

Tipos: Project update, Devlog, Announcement, Tutorial, Release, Note, News, Stream, Community.

---

## Desarrollo

```bash
npm install
cp .env.example .env.local
npm run dev          # http://localhost:3000
npm run build
npm run lint
npm run typecheck
```

Variables: ver `.env.example`. Los nombres `VITE_SUPABASE_*` del despliegue anterior se siguen aceptando.

### Añadir una red, una tecnología o un texto

- Red → `src/content/social.ts`
- Tecnología que no se detecta → entrada en `TECH_CATALOG` (`src/lib/projects/technologies.ts`)
- /now, /uses → `src/content/now.ts`, `src/content/uses.ts` (las entradas `pending: true` solo se ven en desarrollo)

---

## Stack

Next.js 16 (App Router, SSG + ISR) · React 19 · TypeScript estricto · Tailwind CSS v4 · Supabase · react-markdown · next/og.
Tipografía: Archivo (display, eje de anchura) · Geist · Geist Mono · Instrument Serif.
