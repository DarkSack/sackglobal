/** URL canónica sin barra final. En Vercel cae al dominio de producción. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://www.sackito.online")
).replace(/\/$/, "");

export const SITE_NAME = "Sack — Digital Archive";

/** Numeración de secciones: parte de la identidad, no decoración. */
export const NAV = [
  { n: "01", href: "/work", label: "Work" },
  { n: "02", href: "/about", label: "About" },
  { n: "03", href: "/journal", label: "Journal" },
  { n: "04", href: "/now", label: "Now" },
  { n: "05", href: "/connect", label: "Connect" },
] as const;

/** Commit del despliegue, si lo hay (Vercel lo expone en build). */
export const BUILD = {
  sha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
  ref: process.env.VERCEL_GIT_COMMIT_REF ?? null,
};

export const ADMIN_EMAIL = "johanjafet4@gmail.com";
