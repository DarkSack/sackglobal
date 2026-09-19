// ══════════════════════════════════════════════════════════════════
// Journal Service (solo servidor)
//
//   Supabase (journal_posts, RLS: solo publicados) ──► caché de Next
//   (5 min, tag "journal") ──► JournalPost[]
//
// Si Supabase no está configurado o falla, devuelve una lista vacía y
// `available: false`: el sitio sigue funcionando y la sección lo dice,
// en lugar de parecer un journal sin entradas.
// ══════════════════════════════════════════════════════════════════

import "server-only";
import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { readingMinutes } from "@/lib/projects/readme";
import type { JournalPost, JournalRow } from "./types";

export const JOURNAL_TAG = "journal";

function toPost(row: JournalRow): JournalPost {
  const excerpt =
    row.excerpt?.trim() ||
    row.content
      .replace(/[#>*_`\[\]()!-]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 220);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    type: row.type,
    excerpt,
    content: row.content,
    coverImage: row.cover_image,
    publishedAt: row.published_at ?? row.created_at,
    updatedAt: row.updated_at,
    tags: row.tags ?? [],
    project: row.project,
    featured: row.featured,
    author: row.author,
    readingMinutes: readingMinutes(row.content),
  };
}

const loadPublished = unstable_cache(
  async (): Promise<{ posts: JournalPost[]; available: boolean }> => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return { posts: [], available: false };

    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from("journal_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(200);

    if (error) {
      // No se cachea un fallo: se lanza para que unstable_cache no lo guarde.
      throw new Error(error.message);
    }
    return { posts: (data as JournalRow[]).map(toPost), available: true };
  },
  ["journal-published-v1"],
  { revalidate: 300, tags: [JOURNAL_TAG] },
);

export const getJournal = cache(async () => {
  try {
    return await loadPublished();
  } catch (error) {
    console.warn("[journal] no disponible:", (error as Error).message);
    return { posts: [] as JournalPost[], available: false };
  }
});

export async function getPost(slug: string): Promise<JournalPost | null> {
  const { posts } = await getJournal();
  return posts.find((p) => p.slug === slug) ?? null;
}
