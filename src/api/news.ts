import { supabase } from "@/lib/supabase";
import type { NewsItem } from "@/types";

export async function listNews(): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from("news")
    .select("id, title, notice, image_url, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as NewsItem[];
}

export interface CreateNewsInput {
  userId: string;
  title: string;
  notice: string;
  imageUrl?: string | null;
}

export async function createNews({
  userId,
  title,
  notice,
  imageUrl,
}: CreateNewsInput): Promise<NewsItem> {
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
  return data as NewsItem;
}

export async function deleteNews(id: number): Promise<void> {
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) throw error;
}
