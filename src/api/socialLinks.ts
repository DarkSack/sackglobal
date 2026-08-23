import { supabase } from "@/lib/supabase";
import type { SocialLink } from "@/types";

export async function listLinks(): Promise<SocialLink[]> {
  const { data, error } = await supabase
    .from("social_links")
    .select("id, name, url, channel_name, iconify_name")
    .order("name");
  if (error) throw error;
  return (data || []) as SocialLink[];
}

export interface CreateLinkInput {
  name: string;
  url: string;
  channelName?: string | null;
  iconifyName?: string | null;
}

export async function createLink({
  name,
  url,
  channelName,
  iconifyName,
}: CreateLinkInput): Promise<SocialLink> {
  const { data, error } = await supabase
    .from("social_links")
    .insert({
      name,
      url,
      channel_name: channelName || null,
      iconify_name: iconifyName || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as SocialLink;
}

export async function deleteLink(id: number): Promise<void> {
  const { error } = await supabase.from("social_links").delete().eq("id", id);
  if (error) throw error;
}
