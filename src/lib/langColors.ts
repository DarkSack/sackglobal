/**
 * Color oficial de cada lenguaje segun GitHub (linguist).
 *
 * Vive aparte del componente porque lo usan dos: la retícula de
 * proyectos y el recuento de lenguajes de "Sobre mi". Ademas, exportar
 * constantes desde un fichero de componentes rompe el refresco en
 * caliente de Vite.
 */
export const LANG_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Java: "#b07219",
  Python: "#3572A5",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Astro: "#ff5a03",
  Vue: "#41b883",
  Shell: "#89e051",
  "C#": "#178600",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Dockerfile: "#384d54",
};

/** Gris neutro para lenguajes sin color asignado. */
export const LANG_FALLBACK = "#8b949e";
