// ══════════════════════════════════════════════════════════════════
// Contenido de la pestaña "Sobre mí"
//
// Los datos salen del README del repositorio de perfil
// (github.com/DarkSack/DarkSack), pasados aquí como datos tipados en
// lugar de leerse y parsearse en tiempo de ejecución: ese README es
// markdown con tablas, insignias y HTML suelto, y un parser sobre eso
// se rompe en cuanto se reordena una sección.
//
// Lo que sí se lee en vivo de la API de GitHub —y por tanto no hace
// falta tocar aquí— es el avatar, el nombre, la bio corta, el número de
// repositorios, las estrellas y el año de alta.
//
// Para actualizar la presentación se edita este fichero. Nada más.
// ══════════════════════════════════════════════════════════════════

export interface AboutParagraph {
  text: string;
  /** Marca los textos que siguen siendo de relleno. */
  placeholder?: boolean;
}

export interface AboutJob {
  role: string;
  company: string;
  period: string;
  bullets: string[];
}

export interface AboutLink {
  label: string;
  href: string;
  /** Clave del icono en AboutTab. */
  icon: "linkedin" | "mail" | "blog" | "x" | "twitch";
}

export const about = {
  /** Nombre completo. La API de GitHub solo devuelve el alias. */
  fullName: "Johan Jafet Del Valle Santiago",
  role: "Desarrollador Full-Stack",
  location: "Veracruz, México",

  /** Si se deja vacío se usa la bio corta de GitHub. */
  headline: "React · React Native · Next.js · Node · TypeScript · Java",

  paragraphs: [
    {
      text: "Ingeniero en TIC con perfil full-stack real: React, React Native y Next.js en el frontend; Node, Express y Supabase/PostgreSQL en el backend. Integro modelos de IA (Groq, Replicate) y publico herramientas propias en npm.",
    },
    {
      text: "Lo que hay en este portafolio son proyectos en producción, no demos ni forks. En paralelo superviso un equipo de soporte técnico bilingüe en Teleperformance, y esa parte —coaching, métricas, hablar con gente que no es técnica— se nota en cómo documento y cómo priorizo.",
    },
    {
      text: "También hago stream, que es de donde sale el apodo. Explicar algo técnico en directo a quien no lo es me enseñó a escribir mejores commits y mejor documentación; y la costumbre de publicar y después pulir, en vez de esperar a que esté perfecto, la aplico igual al software.",
    },
  ] as AboutParagraph[],

  currently: [
    "RPGRollSack: framework RPG modular para servidores Minecraft, con lanzamiento previsto en septiembre de 2026",
    "Integraciones con IA donde lo que decide es el prompt y la experiencia de uso, no el modelo",
  ],

  /** Experiencia, de lo más reciente a lo más antiguo. */
  experience: [
    {
      role: "Supervisor de Operaciones",
      company: "Teleperformance · cuenta Comcast",
      period: "Jun 2026 — Actualidad",
      bullets: [
        "Lidero un equipo de 15 agentes de soporte técnico bilingüe para clientes en EE. UU.",
        "Subí el NPS mensual del 12 % al 47 % con coaching individual y revisión de llamadas",
      ],
    },
    {
      role: "Soporte Técnico Bilingüe",
      company: "Teleperformance · cuenta Comcast",
      period: "Nov 2024 — Jun 2026",
      bullets: [
        "Atención en inglés a clientes de EE. UU., con documentación exhaustiva de cada caso",
        "Reduje el reproceso de escalados estructurando los reportes de segundo nivel",
      ],
    },
    {
      role: "Desarrollador Frontend",
      company: "Inclan Interactive",
      period: "Ene 2022 — Dic 2023",
      bullets: [
        "Bajé un 35 % el tiempo de carga de una vista crítica optimizando imágenes y lazy loading",
        "Componentes reutilizables en React e interfaces responsivas partiendo de Figma",
      ],
    },
  ] as AboutJob[],

  education: {
    title: "Ingeniería en Tecnologías de la Información y Comunicaciones",
    school: "Instituto Tecnológico Superior de Álamo Temapache",
    period: "2019 — 2025",
    location: "Veracruz, México",
  },

  /** Idiomas, tal y como los declara el README de perfil. */
  languages: ["Español nativo", "Inglés B2"],

  lookingFor: [
    "Productos SaaS con React / Next.js y Node",
    "Apps móviles con React Native, Expo o Ionic",
    "Integraciones con IA donde pesen el prompt y el UX",
    "Herramientas para creadores de contenido y bots de comunidad",
  ],

  links: [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/johan-jafet-del-valle-santiago-3257a62a1/",
      icon: "linkedin",
    },
    { label: "Blog", href: "https://blogdelsack.vercel.app/", icon: "blog" },
    { label: "Twitch", href: "https://twitch.tv/sackitogamer", icon: "twitch" },
    { label: "@SackTheCrack", href: "https://x.com/SackTheCrack", icon: "x" },
  ] as AboutLink[],

  email: "johanjafet4@gmail.com",
} as const;
