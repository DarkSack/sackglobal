// ══════════════════════════════════════════════════════════════════
// Redes — CONTENIDO CURADO A MANO
//
// Solo perfiles que existen y que aparecen en alguna fuente propia
// (README de perfil, perfil de GitHub, README de RPGRoll). Para añadir
// una red, se añade una entrada; no hay nada más que tocar.
//
// Sin incluir, a propósito:
//   · Blog (blogdelsack.vercel.app): retirado; su sucesor es este sitio,
//     www.sackito.online.
//   · X @SackAnomalo: handle antiguo. El bueno es @SackTheCrack.
//   · Discord, YouTube, Instagram: no hay ninguna fuente todavía.
// ══════════════════════════════════════════════════════════════════

export type SocialIcon = "github" | "linkedin" | "x" | "twitch" | "email" | "kofi";

export interface SocialProfile {
  id: string;
  name: string;
  handle: string;
  href: string;
  icon: SocialIcon;
  /** Qué hay ahí, en una línea. */
  note: string;
  /** Aparece en el pie y en el hero. */
  primary?: boolean;
}

export const social: SocialProfile[] = [
  {
    id: "github",
    name: "GitHub",
    handle: "@DarkSack",
    href: "https://github.com/DarkSack",
    icon: "github",
    note: "Todo el código de este archivo.",
    primary: true,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    handle: "Johan Jafet Del Valle Santiago",
    href: "https://www.linkedin.com/in/johan-jafet-del-valle-santiago-3257a62a1/",
    icon: "linkedin",
    note: "Experiencia y contacto profesional.",
    primary: true,
  },
  {
    id: "x",
    name: "X",
    handle: "@SackTheCrack",
    href: "https://x.com/SackTheCrack",
    icon: "x",
    note: "Notas cortas y lo que voy publicando.",
  },
  {
    id: "twitch",
    name: "Twitch",
    handle: "sackitogamer",
    href: "https://twitch.tv/sackitogamer",
    icon: "twitch",
    note: "Stream. De aquí viene el apodo.",
  },
  {
    id: "kofi",
    name: "Ko-fi",
    handle: "sackito",
    href: "https://ko-fi.com/sackito",
    icon: "kofi",
    note: "Apoyo al desarrollo de RPGRoll.",
  },
  {
    id: "email",
    name: "Email",
    handle: "johanjafet4@gmail.com",
    href: "mailto:johanjafet4@gmail.com",
    icon: "email",
    note: "Para proyectos y trabajo.",
    primary: true,
  },
];
