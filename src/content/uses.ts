// ══════════════════════════════════════════════════════════════════
// /uses — CONTENIDO CURADO A MANO
//
// Las entradas con `source` están respaldadas por los repos (se cita
// cuál). Las `pending` son huecos por rellenar: en producción no se
// muestran, en desarrollo sí, para que se vea qué falta.
// ══════════════════════════════════════════════════════════════════

export interface UsesItem {
  name: string;
  detail?: string;
  /** De dónde sale el dato. */
  source?: string;
  pending?: boolean;
}

export interface UsesGroup {
  id: string;
  label: string;
  items: UsesItem[];
}

export const uses: UsesGroup[] = [
  {
    id: "hardware",
    label: "Hardware",
    items: [
      { name: "Equipo principal", detail: "Completar: CPU, RAM, GPU", pending: true },
      { name: "Monitores / periféricos", pending: true },
    ],
  },
  {
    id: "editor",
    label: "Editor & terminal",
    items: [
      { name: "Editor", detail: "Completar", pending: true },
      { name: "Terminal / shell", detail: "Completar", pending: true },
    ],
  },
  {
    id: "ai",
    label: "AI tools",
    items: [
      {
        name: "Groq",
        detail: "LLM en cvpro y DnDBackend",
        source: "cvpro, DnDBackend",
      },
      { name: "Replicate", detail: "Generación de imagen", source: "DnDBackend" },
      { name: "Asistentes de código", detail: "Completar", pending: true },
    ],
  },
  {
    id: "platform",
    label: "Deploy & data",
    items: [
      { name: "Vercel", detail: "Deploy de casi todo lo web", source: "vercel.json y homepages" },
      { name: "Supabase", detail: "Auth, Postgres, Realtime, Storage", source: "AGM, DnDOnline, NxS, SackGlobal" },
      { name: "Turso / libSQL", detail: "Persistencia de twitch_commands", source: "twitch_commands" },
      { name: "npm", detail: "Publicación de create-sackapp", source: "create-sackapp" },
    ],
  },
  {
    id: "build",
    label: "Build & test",
    items: [
      { name: "Gradle", detail: "Multi-módulo con build-logic y Shadow", source: "RPGRollSack" },
      { name: "Vitest", source: "AGM, DnDOnline" },
      { name: "xUnit", source: "pc-remote" },
      { name: "GitHub Actions", detail: "Lint + tests + build en cada PR", source: "DnDOnline" },
    ],
  },
];
