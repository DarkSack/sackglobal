import { supabase } from "@/lib/supabase";

export async function listPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, content, image_url, created_at, user_id, users:users!user_id(nickname, avatar_url)"
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createPost({ userId, content, imageUrl }) {
  const { data, error } = await supabase
    .from("posts")
    .insert({ user_id: userId, content, image_url: imageUrl || null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePost(id) {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}
