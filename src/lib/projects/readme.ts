// ══════════════════════════════════════════════════════════════════
// Lectura del README
//
// No es un parser de markdown: parte el documento por encabezados
// (respetando los bloques de código) y busca secciones por su título
// en español o inglés. Si una sección no existe, el campo queda en
// null y la página simplemente no la muestra. Nada se rellena.
// ══════════════════════════════════════════════════════════════════

import type { ReadmeDigest } from "./types";

interface Section {
  level: number;
  heading: string;
  body: string;
}

export function splitSections(md: string): { intro: string; sections: Section[] } {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const sections: Section[] = [];
  const intro: string[] = [];
  let current: Section | null = null;
  let inFence = false;

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    const h = !inFence && /^(#{1,4})\s+(.+?)\s*#*\s*$/.exec(line);
    if (h) {
      current = { level: h[1].length, heading: cleanInline(h[2]), body: "" };
      sections.push(current);
      continue;
    }
    if (current) current.body += line + "\n";
    else intro.push(line);
  }
  return { intro: intro.join("\n"), sections };
}

/** Quita emoji, énfasis, enlaces y código en línea. */
export function cleanInline(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]{1,3}([^*_`]+)[*_`]{1,3}/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\p{Extended_Pictographic}️?/gu, "")
    .replace(/‍/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sectionWithChildren(sections: Section[], index: number): string {
  const base = sections[index];
  let body = base.body;
  for (let i = index + 1; i < sections.length && sections[i].level > base.level; i++) {
    body += `${"#".repeat(sections[i].level)} ${sections[i].heading}\n${sections[i].body}`;
  }
  return body.trim();
}

function find(sections: Section[], pattern: RegExp): number {
  return sections.findIndex((s) => pattern.test(s.heading));
}

/** Primer párrafo de prosa: se saltan insignias, imágenes, citas de navegación y HTML. */
function firstParagraph(text: string): string | null {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  for (const block of blocks) {
    if (/^(<|!\[|\[!\[|```|\||-{3,}|>\s*\*\*)/.test(block)) continue;
    if (/^[-*]\s/.test(block)) continue;
    const clean = cleanInline(block.replace(/^>\s?/gm, ""));
    if (clean.length >= 40) return clean;
  }
  return null;
}

function listItems(md: string, max: number): string[] {
  const items: string[] = [];
  let inFence = false;
  for (const line of md.split("\n")) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const m = /^[-*]\s+(.+)$/.exec(line); // solo primer nivel
    if (m) {
      const text = cleanInline(m[1]);
      if (text.length > 3) items.push(text);
    }
    if (items.length >= max) break;
  }
  return items;
}

export function digestReadme(md: string | null): ReadmeDigest {
  const empty: ReadmeDigest = {
    title: null,
    summary: null,
    features: [],
    architecture: null,
    statusNotes: null,
    changelog: null,
    documentationUrl: null,
  };
  if (!md) return empty;

  const { intro, sections } = splitSections(md);
  const h1 = sections.find((s) => s.level === 1);
  const title = h1 ? cleanInline(h1.heading.split(/\s[—–-]\s/)[0]) : null;

  // El resumen se busca después del H1 y antes de la primera sección.
  const firstBody = h1 ? h1.body : intro;
  let summary = firstParagraph(firstBody) ?? firstParagraph(intro);
  if (!summary && sections[0]) summary = firstParagraph(sections[0].body);

  const featIdx = find(sections, /caracter[ií]sticas|features|qu[eé] hace|funcionalidades|what it does/i);
  let features: string[] = [];
  if (featIdx >= 0) {
    const body = sectionWithChildren(sections, featIdx);
    features = listItems(body, 8);
    if (!features.length) {
      // Secciones como "Qué hace" que usan subtítulos en vez de listas.
      const base = sections[featIdx].level;
      for (let i = featIdx + 1; i < sections.length && sections[i].level > base; i++) {
        if (sections[i].level === base + 1) features.push(sections[i].heading);
      }
      features = features.slice(0, 8);
    }
  }

  const archIdx = find(sections, /arquitectura|architecture|^estructura|^structure/i);
  const statusIdx = find(sections, /^estado|^status|estado del (desarrollo|proyecto)/i);
  const logIdx = find(sections, /novedades|changelog|cambios recientes|what'?s new/i);

  const docMatch =
    /\[[^\]]*(?:documentaci[oó]n|docs)[^\]]*\]\((https?:\/\/[^)\s]+)\)/i.exec(md) ??
    /documentaci[oó]n[^\n]{0,40}?\((https?:\/\/[^)\s]+)\)/i.exec(md);

  return {
    title,
    summary,
    features,
    architecture: archIdx >= 0 ? sectionWithChildren(sections, archIdx) || null : null,
    statusNotes: statusIdx >= 0 ? sectionWithChildren(sections, statusIdx) || null : null,
    changelog: logIdx >= 0 ? sectionWithChildren(sections, logIdx) || null : null,
    documentationUrl: docMatch ? docMatch[1] : null,
  };
}

/** Minutos de lectura a 220 palabras por minuto. */
export function readingMinutes(md: string): number {
  const words = md.replace(/```[\s\S]*?```/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
