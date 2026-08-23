# SackGlobal

Mi **hub personal** en la web. Dos cosas en una:

1. **Portfolio público** que lista todos mis repos de GitHub, con **reacciones y comentarios** para cualquiera que inicie sesión con su cuenta de GitHub.
2. **Zona social** donde publico posts, noticias del canal y mis redes sociales — todo respaldado por Supabase.

Antes esto vivía como dos proyectos separados (`Portfolio` en Astro y `blogdelsack` en CRA). Ahora es un solo sitio.

---

## Qué hace

### `/` — Portfolio

- Trae en vivo todos los repos públicos de `github.com/DarkSack` desde la API de GitHub.
- Cards con nombre, descripción, lenguaje (con color estilo GitHub), stars, forks, issues abiertas y fecha de último push.
- Buscador + filtro por lenguaje.
- **5 reacciones** por repo (❤️ 👍 🚀 🔥 👀). Toggle al clickar. Aparece resaltada si ya la diste.
- Click en la tarjeta abre un **modal** con la descripción completa + hilo de comentarios (leer para todos, escribir con sesión).

### `/social` — Hub social

- Landing con 3 tarjetas hacia:
  - **`/social/posts`** — timeline de posts (cualquier usuario logueado puede publicar los suyos).
  - **`/social/noticias`** — noticias globales del canal (solo el admin publica).
  - **`/social/redes-sociales`** — links a mis perfiles (Twitch, X, LinkedIn, etc.), con iconos de Iconify.

### `/profile`

- Perfil del usuario: avatar de GitHub, nombre, `@handle`, email y logout.

---

## Autenticación

**GitHub OAuth** vía Supabase Auth. La primera vez que un usuario inicia sesión:

1. Supabase lo redirige a GitHub → autoriza → vuelve.
2. `AuthContext` hace `upsert` en `public.users` con `user_id`, `nickname` (usa `user_name` de GitHub), `email`, `name`, `avatar_url`.
3. Sus reacciones y comentarios quedan ligados a su `user_id`.

Rol admin: hardcodeado por email en `Posts`, `News`, `SocialLinks` (`johanjafet4@gmail.com`).

---

## Setup local

```bash
git clone https://github.com/DarkSack/sackglobal.git
cd sackglobal
npm install
cp .env.example .env      # rellena URL + anon key
npm run dev               # http://localhost:5173
```

### Variables de entorno

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxx
```

### Supabase

Aplica la migración `supabase/migrations/20260823_sackglobal_init.sql` en el SQL Editor de tu proyecto Supabase. Crea/renombra las tablas:

- `users` (espejo de `auth.users`, con `nickname`, `avatar_url`, `email`)
- `posts` (feed público, escritura por owner)
- `news` (solo admin publica)
- `social_links` (solo admin edita)
- `repo_interactions` (reacciones + comentarios sobre repos, lectura pública, escritura autenticada)

Todas con RLS y policies por dueño / rol.

**Habilita el provider GitHub** en Supabase → Authentication → Providers, con un OAuth App de GitHub cuyo callback apunte a `https://<tu-proyecto>.supabase.co/auth/v1/callback`.

---

## Stack

- **React 18** + **Vite 5**
- **TailwindCSS 3** con paleta dark GitHub-style + `tailwindcss-animate`
- **shadcn/ui**-flavor (Radix Dialog, Slot; utilidades `cn` y `class-variance-authority`)
- **Iconos:** `lucide-react` + Iconify (para redes sociales)
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **Router:** `react-router-dom` v6

---

## Estructura

```
sackglobal/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── lib/
│   │   ├── supabase.js
│   │   └── utils.js         # cn, formatDate, formatDateTime
│   ├── context/
│   │   └── AuthContext.jsx  # login GitHub + upsert users
│   ├── routes/
│   │   └── Router.jsx
│   ├── api/
│   │   ├── github.js        # fetch repos (GitHub API)
│   │   ├── repoInteractions.js
│   │   ├── posts.js
│   │   ├── news.js
│   │   └── socialLinks.js
│   ├── components/
│   │   └── TopBar.jsx
│   └── pages/
│       ├── Portfolio.jsx
│       ├── RepoDetailModal.jsx
│       ├── SocialHome.jsx
│       ├── Posts.jsx
│       ├── News.jsx
│       ├── SocialLinks.jsx
│       └── Profile.jsx
├── supabase/
│   └── migrations/20260823_sackglobal_init.sql
├── public/favicon.svg
├── tailwind.config.js
├── vite.config.js
├── package.json
└── .env.example
```

---

Hecho con 💻 y ☕ por **Sack**.
