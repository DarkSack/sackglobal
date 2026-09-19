// ══════════════════════════════════════════════════════════════════
// Perfil — CONTENIDO CURADO A MANO
//
// Todo lo de aquí sale de fuentes reales: el README del perfil
// (github.com/DarkSack/DarkSack) y el `about.ts` del sitio anterior.
// Lo que GitHub sabe mejor (repos, lenguajes, fechas, actividad) NO va
// aquí: se lee en vivo en `lib/github`.
//
// Regla: si un dato no se puede respaldar, se deja fuera o se marca
// con `pending: true`. Los pendientes solo se ven en desarrollo.
// ══════════════════════════════════════════════════════════════════

export const profile = {
  alias: "Sack",
  fullName: "Johan Jafet Del Valle Santiago",
  roles: ["Engineer", "Builder", "Experimenter"],
  title: "Ingeniero en TIC · Full-Stack Developer",
  location: "Ciudad de México, México",
  /** Versión corta para metadata: hero, menú móvil. */
  locationShort: "CDMX / MX",
  email: "johanjafet4@gmail.com",

  /** Titular del hero. Describe lo que hay en los repos, nada más. */
  statement:
    "Construyo software, herramientas y sistemas: de la web y el móvil a servidores de Minecraft y agentes de escritorio.",

  focus: ["Software", "Web", "Systems"],

  /** Áreas con al menos un repo público que las respalde. */
  areas: [
    { label: "Frontend", evidence: "AGM, NxS, RPGRoll Docs, cvpro" },
    { label: "Full-Stack", evidence: "AGM, DnD Online, SackGlobal" },
    { label: "Mobile", evidence: "LevelUp (Expo), PC Remote (Kotlin)" },
    { label: "Game server ecosystems", evidence: "RPGRoll (Paper)" },
    { label: "Developer tools", evidence: "create-sackapp, RPGRoll Docs" },
    { label: "AI integrations", evidence: "cvpro, DnD Backend (Groq)" },
  ],

  about: [
    "Me llamo Johan Jafet. En internet soy Sack, un apodo que viene del stream. Estudié Ingeniería en Tecnologías de la Información y Comunicaciones y desde entonces lo que más hago es construir cosas y publicarlas.",
    "Lo que construyo no cabe en una sola categoría, y es a propósito. Un framework RPG en Java para servidores de Minecraft, una mesa de D&D en tiempo real en el navegador, un agente en .NET que se controla desde una app nativa en Kotlin, bots que vigilan precios, un CLI publicado en npm. Cada proyecto es una excusa para entender un sistema distinto de principio a fin.",
    "Trabajo publicando pronto y puliendo después, que es lo que me enseñó el stream. También me enseñó a explicar: mis READMEs cuentan por qué se eligió cada pieza y qué limitaciones están verificadas, no supuestas. Prefiero que la documentación diga lo que el código hace de verdad.",
    "En paralelo al código trabajo en operaciones: superviso un equipo de soporte técnico bilingüe para clientes en EE. UU. Esa parte —hablar con gente no técnica, priorizar, medir— se nota en cómo documento y en qué decido construir primero.",
  ],

  education: {
    title: "Ingeniería en Tecnologías de la Información y Comunicaciones",
    school: "Instituto Tecnológico Superior de Álamo Temapache",
    period: "2019 — 2025",
  },

  languages: ["Español — nativo", "Inglés — B2"],

  /** Experiencia, de lo más reciente a lo más antiguo. Cifras del README de perfil. */
  experience: [
    {
      role: "Supervisor de Operaciones",
      org: "Teleperformance · cuenta Comcast",
      period: "Jun 2026 — hoy",
      notes: [
        "Lidero un equipo de 15 agentes de soporte técnico bilingüe para clientes en EE. UU.",
        "NPS mensual del equipo del 12 % al 47 % con coaching individual y revisión de llamadas.",
      ],
    },
    {
      role: "Soporte Técnico Bilingüe",
      org: "Teleperformance · cuenta Comcast",
      period: "Nov 2024 — Jun 2026",
      notes: [
        "Atención en inglés a clientes de EE. UU. con documentación exhaustiva de cada caso.",
        "Estructuré los reportes de segundo nivel para reducir el reproceso de escalados.",
      ],
    },
    {
      role: "Desarrollador Frontend",
      org: "Inclan Interactive",
      period: "Ene 2022 — Dic 2023",
      notes: [
        "Tiempo de carga de una vista crítica −35 % optimizando imágenes y lazy loading.",
        "Componentes reutilizables en React e interfaces responsivas desde Figma.",
      ],
    },
  ],

  lookingFor: [
    "Productos SaaS con React / Next.js y Node",
    "Apps móviles con React Native o Expo",
    "Integraciones con IA donde pesen el prompt y la experiencia de uso",
    "Herramientas para creadores de contenido y bots de comunidad",
  ],
} as const;
