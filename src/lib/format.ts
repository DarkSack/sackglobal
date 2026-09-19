const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

/** 19 SEP 2026 — formato de metadata, independiente del locale del servidor. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** 2026.09 */
export function formatMonth(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** 2026-09-19 */
export function isoDay(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

/** "hace 3 días". Se calcula al renderizar en el servidor. */
export function relativeTime(iso: string, now = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const min = diff / 60_000;
  if (min < 60) return `hace ${Math.max(1, Math.round(min))} min`;
  const h = min / 60;
  if (h < 24) return `hace ${Math.round(h)} h`;
  const d = h / 24;
  if (d < 30) return `hace ${Math.round(d)} ${Math.round(d) === 1 ? "día" : "días"}`;
  const m = d / 30.44;
  if (m < 12) return `hace ${Math.round(m)} ${Math.round(m) === 1 ? "mes" : "meses"}`;
  const y = Math.round(m / 12);
  return `hace ${y} ${y === 1 ? "año" : "años"}`;
}

export function pad(n: number, width = 2): string {
  return String(n).padStart(width, "0");
}

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
