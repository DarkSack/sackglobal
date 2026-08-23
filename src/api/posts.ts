import { supabase } from "@/lib/supabase";
import type { Post } from "@/types";

export async function listPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, content, image_url, created_at, user_id, users:users!user_id(nickname, avatar_url)"
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as Post[];
}

export interface CreatePostInput {
  userId: string;
  content: string;
  imageUrl?: string | null;
}

export async function createPost({
  userId,
  content,
  imageUrl,
}: CreatePostInput): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .insert({ user_id: userId, content, image_url: imageUrl || null })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Post;
}

export async function deletePost(id: number): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}
