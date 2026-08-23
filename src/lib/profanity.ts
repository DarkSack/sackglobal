// ══════════════════════════════════════════════════════════════════
// Filtro de palabras obscenas (ES + EN)
//
// Detecta profanidades en un texto normalizando tildes y leetspeak
// (a=@, e=3, i=1, o=0, s=5$, t=7). Diseñado para minimizar falsos
// positivos: match por token completo, con inflexiones explicitas.
// ══════════════════════════════════════════════════════════════════

// ── Diccionarios (inflexiones explicitas para evitar falsos positivos) ────
const BAD_WORDS_ES: string[] = [
  // Sexuales / insultos comunes
  "puta", "putas", "puto", "putos", "putazo", "putona",
  "pendejo", "pendejos", "pendeja", "pendejas", "pendejada", "pendejadas",
  "cabron", "cabrones", "cabrona", "cabronazo",
  "mierda", "mierdas", "mierdero",
  "verga", "vergas", "vergazo",
  "chinga", "chingar", "chingada", "chingadas", "chingado", "chingados", "chingon", "chingona",
  "cono", "conos", "conazo",
  "joder", "jodido", "jodida", "jodete",
  "gilipollas", "gilipuertas",
  "mamon", "mamones", "mamona", "mamonazo",
  "polla", "pollas", "pollazo",
  "cojones", "cojonudo", "cojonuda",
  "carajo", "carajos",
  "culero", "culera", "culeros",
  "marica", "maricas", "maricon", "maricones", "mariconada",
  "puton", "putones", "putona",
  "coger",
  "follar", "follada", "follado",
  "hijueputa", "hijoputa", "hijaputa", "hijodeputa", "hijadeputa",
  // Slurs / discriminatorios
  "negrata", "negrero", "sudaca", "gitanada", "moraco",
  "retrasado", "retrasada", "subnormal", "mongolo", "mongola",
];

const BAD_WORDS_EN: string[] = [
  "fuck", "fucked", "fucker", "fuckers", "fucking", "fucks", "fck",
  "shit", "shitty", "bullshit",
  "bitch", "bitches", "bitchy",
  "asshole", "assholes",
  "cunt", "cunts",
  "dick", "dicks", "dickhead",
  "cock", "cocks", "cocksucker",
  "pussy", "pussies",
  "bastard", "bastards",
  "motherfucker", "motherfuckers", "mf", "mfs",
  "twat", "twats",
  "wanker", "wankers",
  "slut", "sluts", "slutty",
  "whore", "whores",
  "faggot", "faggots", "fag", "fags",
  "retard", "retarded", "retards",
  "nigger", "niggers", "nigga", "niggas",
];

// ── Normalizacion ────────────────────────────────────────────────
const LEET_MAP: Record<string, string> = {
  "@": "a",
  "4": "a",
  "3": "e",
  "€": "e",
  "1": "i",
  "!": "i",
  "0": "o",
  "5": "s",
  "$": "s",
  "7": "t",
};

function deleet(s: string): string {
  return s
    .toLowerCase()
    .split("")
    .map((c) => LEET_MAP[c] ?? c)
    .join("");
}

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function normalize(token: string): string {
  return stripAccents(deleet(token));
}

// Set de todas las palabras prohibidas ya normalizadas
const ALL_BAD: Set<string> = new Set(
  [...BAD_WORDS_ES, ...BAD_WORDS_EN].map((w) => normalize(w))
);

// Regex para tokens: letras, digitos, tildes/eñes, y simbolos leet
const TOKEN_RE = /[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ@!$€]+/g;

// ── API publica ──────────────────────────────────────────────────

/** Devuelve el conjunto (unico) de palabras del texto que dieron match. */
export function findProfanity(text: string): string[] {
  if (!text) return [];
  const matches = text.match(TOKEN_RE);
  if (!matches) return [];
  const found = new Set<string>();
  for (const raw of matches) {
    const norm = normalize(raw);
    if (norm.length < 3) continue; // ignora tokens muy cortos
    if (ALL_BAD.has(norm)) {
      found.add(raw);
    }
  }
  return Array.from(found);
}

/** True si detecta al menos una palabra prohibida. */
export function hasProfanity(text: string): boolean {
  return findProfanity(text).length > 0;
}

/** Reemplaza cada palabra prohibida con `p***a` (primera y ultima + asteriscos). */
export function censor(text: string, mask = "*"): string {
  if (!text) return text;
  return text.replace(TOKEN_RE, (tok) => {
    const norm = normalize(tok);
    if (norm.length < 3 || !ALL_BAD.has(norm)) return tok;
    if (tok.length <= 2) return mask.repeat(tok.length);
    return tok[0] + mask.repeat(tok.length - 2) + tok[tok.length - 1];
  });
}
