// ══════════════════════════════════════════════════════════════════
// Filtro de palabras obscenas (ES + EN) — aviso en el cliente
//
// ESTE FILTRO NO PROTEGE NADA POR SÍ SOLO. La clave `anon` es pública,
// así que cualquiera puede insertar directo contra PostgREST y saltarse
// todo lo que haya aquí. La barrera real son los triggers de la base de
// datos (supabase/migrations/20260830_moderacion_servidor.sql), que
// rechazan el INSERT venga de donde venga.
//
// Lo que aporta esta copia es rapidez: avisa mientras se escribe, sin
// esperar al viaje de red ni gastar un error del servidor.
//
// Las reglas de normalización y la lista deben coincidir con las de
// `public.normalize_text` y `public.blocked_words`. Si cambias una,
// cambia la otra: si divergen, el usuario ve un aviso que no se cumple,
// o peor, no ve aviso y el servidor le rechaza el envío.
// ══════════════════════════════════════════════════════════════════

// ── Diccionario ───────────────────────────────────────────────────
// Inflexiones explícitas en lugar de raíces: "put" cazaría "computar".
const BAD_WORDS_ES: string[] = [
  "puta", "putas", "puto", "putos", "putazo", "putona", "puton", "putones",
  "pendejo", "pendejos", "pendeja", "pendejas", "pendejada", "pendejadas",
  "cabron", "cabrones", "cabrona", "cabronazo",
  "mierda", "mierdas", "mierdero",
  "verga", "vergas", "vergazo",
  "chinga", "chingar", "chingada", "chingadas", "chingado", "chingados",
  "chingon", "chingona",
  // Con eñe a propósito: ver la nota de normalización más abajo.
  "coño", "coños", "coñazo",
  "joder", "jodido", "jodida", "jodete",
  "gilipollas", "gilipuertas",
  "mamon", "mamones", "mamona", "mamonazo",
  "polla", "pollas", "pollazo",
  "cojones", "cojonudo", "cojonuda",
  "carajo", "carajos",
  "culero", "culera", "culeros",
  "marica", "maricas", "maricon", "maricones", "mariconada",
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
  "dickhead",
  "cocksucker",
  "pussies",
  "bastard", "bastards",
  "motherfucker", "motherfuckers",
  "twat", "twats",
  "wanker", "wankers",
  "slut", "sluts", "slutty",
  "whore", "whores",
  "faggot", "faggots",
  "retard", "retarded", "retards",
  "nigger", "niggers", "nigga", "niggas",
];

// ── Normalización ────────────────────────────────────────────────
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

/** Marcador temporal para la eñe. No aparece en texto real. */
const ENYE_TOKEN = "";

/**
 * Quita tildes pero CONSERVA la eñe.
 *
 * La versión anterior la convertía en ene, y eso hacía que "coño"
 * quedara como "cono": el filtro bloqueaba la palabra "cono" —la figura
 * geométrica, el del helado— en cualquier frase. En español la eñe es
 * una letra propia, no una ene con adorno.
 *
 * Se aparta la eñe antes de descomponer en NFD en lugar de intentar
 * salvarla con un lookbehind sobre los diacríticos combinantes: esos son
 * caracteres invisibles en el fuente, y una regla que depende de su
 * posición exacta se rompe en cuanto alguien reformatea el fichero.
 */
function stripAccents(s: string): string {
  return s
    .replace(/ñ/g, ENYE_TOKEN)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(new RegExp(ENYE_TOKEN, "g"), "ñ");
}

function normalize(token: string): string {
  return stripAccents(deleet(token));
}

const ALL_BAD: ReadonlySet<string> = new Set(
  [...BAD_WORDS_ES, ...BAD_WORDS_EN].map((w) => normalize(w))
);

// Tokens: letras, dígitos, eñe, vocales acentuadas y los símbolos leet.
const TOKEN_RE = /[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ@!$€]+/g;

/** Por debajo de 3 caracteres los falsos positivos superan a los aciertos. */
const MIN_LENGTH = 3;

// ── API pública ──────────────────────────────────────────────────

/** Devuelve las palabras del texto que dieron match, sin repetir. */
export function findProfanity(text: string): string[] {
  if (!text) return [];
  const matches = text.match(TOKEN_RE);
  if (!matches) return [];

  const found = new Set<string>();
  for (const raw of matches) {
    const norm = normalize(raw);
    if (norm.length < MIN_LENGTH) continue;
    if (ALL_BAD.has(norm)) found.add(raw);
  }
  return Array.from(found);
}

/** True si detecta al menos una palabra prohibida. */
export function hasProfanity(text: string): boolean {
  return findProfanity(text).length > 0;
}
