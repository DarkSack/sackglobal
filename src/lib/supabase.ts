import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn(
    "⚠️  Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Auth y persistencia no funcionaran."
  );
}

export const supabase: SupabaseClient = createClient(url || "", key || "");
