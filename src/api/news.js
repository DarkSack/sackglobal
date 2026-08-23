import { supabase } from "@/lib/supabase";

export async function listNews() {
  const { data, error } = await supabase
    .from("news")
    .select("id, title, notice, image_url, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createNews({ userId, title, notice, imageUrl }) {
  const { data, error } = await supabase
    .from("news")
    .insert({
      user_id: userId,
      title,
      notice,
      image_url: imageUrl || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteNews(id) {
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) throw error;
}
