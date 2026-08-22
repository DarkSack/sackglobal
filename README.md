# Portfolio — Mi CV / portfolio interactivo online

Sitio estático donde vivo profesionalmente: **Sobre mí**, **Experiencia**, **Educación**, **Proyectos** y **Habilidades**, todo con un formato limpio y una **paleta de comandos** al estilo Raycast/Slack para navegar rápido con el teclado.

Toda la información vive en `cv.json` (ES) y `cv_english.json` (EN). No hay CMS, no hay backend: cambio el JSON, hago push y el sitio se re-genera.

---

## Qué muestra la página

Secciones (`src/components/sections/`), en orden:

1. **Hero** — nombre, cargo ("Frontend Developer con 2 años de experiencia en ReactJS & Creador de Contenido de videojuegos"), foto y accesos directos a LinkedIn / X / GitHub / email / teléfono / ubicación.
2. **About** — resumen profesional (`basics.summary` del JSON).
3. **Experience** — timeline con puestos, empresas, fechas, links y resumen (Inclan Interactive, Inmobiliaria René, OPLE Tuxpan…).
4. **Education** — título, institución, fechas y calificación.
5. **Projects** — tarjetas con `blogdelsack`, `SackitoInventory`, etc., con link directo al proyecto.
6. **Skills** — nube de habilidades con nivel (Basic / Mid / Semi-Mid) e iconos vectoriales por tecnología.

### ⌨️ Command palette

Pulsa **⌘ K** (o Ctrl+K) para abrir la paleta de **ninja-keys** y saltar directo a cualquier sección / red social / idioma.

### 🌐 Multi-idioma

- `/` — versión en español (`cv.json`).
- `/en` — versión en inglés (`cv_english.json`).

El `KeyboardManager.astro` permite alternar idioma con el teclado.

### 🖨 Imprimible / PDF

El `Layout.astro` incluye estilos `@media print` — haces `Ctrl+P` → "Guardar como PDF" y obtienes un CV listo para enviar por email.

---

## Bajo el capó

- **Framework:** Astro 4 (100% estático, SSG).
- **Lenguaje:** TypeScript (`cv.d.ts` tipa el JSON, `types.d.ts` tipa componentes).
- **UX:** `ninja-keys` para la paleta de comandos.
- **Contenido:** JSON siguiendo el estándar [JSON Resume](https://jsonresume.org/).
- **Iconos:** SVGs propios (`src/icons/*.astro`) por tecnología.

---

## Editar el contenido

Todo el CV — experiencia, educación, skills, proyectos, contactos — vive en:

- [`cv.json`](./cv.json) — versión en español.
- [`cv_english.json`](./cv_english.json) — versión en inglés.

Cambia el JSON, guarda, `npm run build`. Si haces push, Vercel lo redeploya automáticamente.

---

## Comandos

```bash
npm install
npm run dev           # http://localhost:4321
npm run build         # dist/ listo para deploy
npm run preview       # sirve el build local
```

---

## Estructura

```
Portfolio/
├── src/
│   ├── pages/
│   │   ├── index.astro          # / (español)
│   │   └── en.astro             # /en (inglés)
│   ├── layouts/Layout.astro     # SEO, print styles, wrapper
│   ├── components/
│   │   ├── Section.astro
│   │   ├── KeyboardManager.astro  # ninja-keys binding
│   │   └── sections/              # Hero, About, Experience, Education, Projects, Skills
│   ├── icons/                   # SVGs por tech (react, node, tailwind, git, ...)
│   ├── cv.d.ts                  # tipos del JSON
│   └── types.d.ts
├── cv.json                      # datos ES
├── cv_english.json              # datos EN
├── public/
├── astro.config.mjs
└── tsconfig.json
```

---

## Licencia

Ver [LICENSE.txt](./LICENSE.txt).

---

Hecho con ❤️ por **Sack**.
