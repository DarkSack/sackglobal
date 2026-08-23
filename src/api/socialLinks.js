import { supabase } from "@/lib/supabase";

export async function listLinks() {
  const { data, error } = await supabase
    .from("social_links")
    .select("id, name, url, channel_name, iconify_name")
    .order("name");
  if (error) throw error;
  return data || [];
}

export async function createLink({ name, url, channelName, iconifyName }) {
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
  return data;
}

export async function deleteLink(id) {
  const { error } = await supabase.from("social_links").delete().eq("id", id);
  if (error) throw error;
}
