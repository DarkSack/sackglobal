import { createClient } from "@supabase/supabase-js";
import { revalidateTag } from "next/cache";
import { GITHUB_TAG } from "@/lib/github/service";
import { JOURNAL_TAG } from "@/lib/journal/service";
import { ADMIN_EMAIL } from "@/lib/site";

// ══════════════════════════════════════════════════════════════════
// POST /api/revalidate  { "tags": ["journal"] }
//
// Dos formas de autorizarse:
//   · Authorization: Bearer <access token de Supabase> del admin
//     (lo usa /admin justo después de guardar un post).
//   · x-revalidate-secret: <REVALIDATE_SECRET> (webhooks, p. ej. un
//     webhook de push de GitHub para refrescar los proyectos al momento).
// ══════════════════════════════════════════════════════════════════

const ALLOWED = new Set([JOURNAL_TAG, GITHUB_TAG]);

async function isAuthorized(req: Request): Promise<boolean> {
  const secret = process.env.REVALIDATE_SECRET;
  if (secret && req.headers.get("x-revalidate-secret") === secret) return true;

  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !key) return false;

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase.auth.getUser(token);
  return !error && data.user?.email === ADMIN_EMAIL;
}

export async function POST(req: Request) {
  if (!(await isAuthorized(req))) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { tags?: unknown };
  const tags = Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === "string" && ALLOWED.has(t)) : [JOURNAL_TAG];

  // expire: 0 → la siguiente visita ya ve el contenido nuevo, sin servir
  // la versión vieja mientras tanto. Es lo esperable al pulsar "publicar".
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return Response.json({ revalidated: tags });
}
