import { supabase } from "@/lib/supabase";

const TABLE = "repo_interactions";

export async function fetchInteractionsForRepos(repoIds) {
  if (!repoIds?.length) return {};
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, repo_id, type, emoji, user_id")
    .in("repo_id", repoIds);
  if (error) {
    console.warn("[repoInteractions] fetch summary:", error.message);
    return {};
  }
  const map = {};
  for (const row of data || []) {
    const bucket = map[row.repo_id] || { reactions: {}, commentCount: 0 };
    if (row.type === "reaction") {
      bucket.reactions[row.emoji] = (bucket.reactions[row.emoji] || 0) + 1;
    } else if (row.type === "comment") {
      bucket.commentCount += 1;
    }
    map[row.repo_id] = bucket;
  }
  return map;
}

export async function fetchMyReactionsForRepos(repoIds, userId) {
  if (!userId || !repoIds?.length) return {};
  const { data, error } = await supabase
    .from(TABLE)
    .select("repo_id, emoji")
    .eq("user_id", userId)
    .eq("type", "reaction")
    .in("repo_id", repoIds);
  if (error) return {};
  const map = {};
  for (const row of data || []) {
    (map[row.repo_id] = map[row.repo_id] || new Set()).add(row.emoji);
  }
  return map;
}

export async function fetchComments(repoId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select(
      "id, repo_id, content, created_at, user_id, users:users!user_id(nickname, avatar_url)"
    )
    .eq("repo_id", repoId)
    .eq("type", "comment")
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("[repoInteractions] fetch comments:", error.message);
    return [];
  }
  return data || [];
}

export async function addComment({ repoId, repoName, userId, content }) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      repo_id: repoId,
      repo_name: repoName,
      user_id: userId,
      type: "comment",
      content,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleReaction({ repoId, repoName, userId, emoji }) {
  const { data: existing } = await supabase
    .from(TABLE)
    .select("id")
    .eq("repo_id", repoId)
    .eq("user_id", userId)
    .eq("type", "reaction")
    .eq("emoji", emoji)
    .maybeSingle();

  if (existing?.id) {
    await supabase.from(TABLE).delete().eq("id", existing.id);
    return { added: false };
  }
  const { error } = await supabase.from(TABLE).insert({
    repo_id: repoId,
    repo_name: repoName,
    user_id: userId,
    type: "reaction",
    emoji,
  });
  if (error) throw error;
  return { added: true };
}
