// ══════════════════════════════════════════════════════════════════
// Proyectos — METADATA EDITORIAL
//
// GitHub sigue siendo la fuente principal: nombre, descripción,
// lenguajes, fechas, README y tecnologías se leen de allí. Esto solo
// añade lo que GitHub no puede saber:
//
//   · qué se destaca y en qué orden (SELECTED WORK)
//   · el tamaño visual que ocupa cada destacado
//   · un estado cuando la heurística no alcanza
//   · slugs, títulos o categorías cuando la detección se equivoca
//
// Clave: nombre exacto del repositorio. Todo es opcional.
// ══════════════════════════════════════════════════════════════════

import type { Accent, CategoryId, ProjectStatus } from "@/lib/projects/types";

export interface ProjectMeta {
  slug?: string;
  title?: string;
  /** Una línea editorial que sustituye a la descripción en las tarjetas. */
  tagline?: string;
  featured?: boolean;
  /** Menor = antes. Solo cuenta entre destacados. */
  displayOrder?: number;
  /** Peso visual en el bento de SELECTED WORK. */
  size?: "xl" | "lg" | "md" | "sm";
  category?: CategoryId;
  /** Categorías extra que la detección no ve. */
  extraCategories?: CategoryId[];
  status?: ProjectStatus;
  /** Por qué ese estado, en una frase. Se muestra junto al estado. */
  statusNote?: string;
  accent?: Accent;
  /** Ruta en /public. Sin imagen se genera una composición tipográfica. */
  featuredImage?: string;
  /** Tecnologías detectadas que no representan el proyecto actual. */
  excludeTech?: string[];
  /** Enlaces que no salen de GitHub ni del README. */
  links?: { documentation?: string; download?: string; demo?: string };
  related?: string[];
  hidden?: boolean;
}

export const projectMeta: Record<string, ProjectMeta> = {
  RPGRollSack: {
    slug: "rpgroll",
    title: "RPGRoll",
    tagline: "Framework RPG modular para servidores Minecraft",
    featured: true,
    displayOrder: 1,
    size: "xl",
    status: "ACTIVE",
    statusNote: "Core + 23 addons en 1.0.0; lanzamiento previsto en sep 2026",
    accent: "ruby",
    extraCategories: ["devtools"],
    links: { download: "https://store.sackito.online" },
    related: ["RPGRollDocs"],
  },
  "pc-remote": {
    title: "PC Remote",
    tagline: "Control remoto de Windows desde Android, por LAN y cifrado",
    featured: true,
    displayOrder: 2,
    size: "lg",
    category: "systems",
    status: "WIP",
    statusNote: "El README lista pantallas pendientes en la app Android",
    accent: "cobalt",
    // `mobile/` es la primera versión en React Native, deprecada según
    // el propio README. La app actual es Kotlin + Compose.
    excludeTech: ["React Native", "Expo", "Zustand", "React"],
  },
  DnDOnline: {
    slug: "dnd-online",
    title: "DnD Online",
    tagline: "Virtual tabletop de D&D en tiempo real",
    featured: true,
    displayOrder: 3,
    size: "md",
    accent: "amber",
    related: ["DnDBackend"],
  },
  AGM: {
    title: "AGM",
    tagline: "Sitio bilingüe y CMS para un despacho de arquitectura",
    featured: true,
    displayOrder: 4,
    size: "sm",
    accent: "sage",
  },
  "random-game-generator": {
    tagline: "Extensión de Chrome que decide a qué juegas hoy",
    featured: true,
    displayOrder: 5,
    size: "sm",
  },
  "create-sackapp": {
    tagline: "CLI en npm: Vite + React + Tailwind + shadcn en cuatro preguntas",
    featured: true,
    displayOrder: 6,
    size: "sm",
  },
  RPGRollDocs: {
    slug: "rpgroll-docs",
    title: "RPGRoll Docs",
    category: "devtools",
    related: ["RPGRollSack"],
  },
  DnDBackend: {
    slug: "dnd-backend",
    title: "DnD Backend",
    related: ["DnDOnline"],
  },
  LevelUp: { title: "LevelUp" },
  twitch_commands: { title: "Twitch Commands" },
  sackglobal: {
    title: "SackGlobal",
    tagline: "Este sitio",
  },
  // El repo de perfil ya se lee en /about; no es un proyecto.
  DarkSack: { hidden: true },
};
