import { supabase } from "@/lib/supabase";
import type {
  MyReactionsMap,
  RepoInteraction,
  RepoSummary,
  RepoSummaryMap,
} from "@/types";

const TABLE = "repo_interactions";

export async function fetchInteractionsForRepos(
  repoIds: number[]
): Promise<RepoSummaryMap> {
  if (!repoIds?.length) return {};
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, repo_id, type, emoji, user_id")
    .in("repo_id", repoIds);
  if (error) {
    console.warn("[repoInteractions] fetch summary:", error.message);
    return {};
  }
  const map: RepoSummaryMap = {};
  for (const row of (data || []) as Pick<
    RepoInteraction,
    "id" | "repo_id" | "type" | "emoji" | "user_id"
  >[]) {
    const bucket: RepoSummary = map[row.repo_id] || {
      reactions: {},
      commentCount: 0,
    };
    if (row.type === "reaction" && row.emoji) {
      bucket.reactions[row.emoji] = (bucket.reactions[row.emoji] || 0) + 1;
    } else if (row.type === "comment") {
      bucket.commentCount += 1;
    }
    map[row.repo_id] = bucket;
  }
  return map;
}

export async function fetchMyReactionsForRepos(
  repoIds: number[],
  userId: string | null
): Promise<MyReactionsMap> {
  if (!userId || !repoIds?.length) return {};
  const { data, error } = await supabase
    .from(TABLE)
    .select("repo_id, emoji")
    .eq("user_id", userId)
    .eq("type", "reaction")
    .in("repo_id", repoIds);
  if (error) return {};
  const map: MyReactionsMap = {};
  for (const row of (data || []) as Pick<
    RepoInteraction,
    "repo_id" | "emoji"
  >[]) {
    if (!row.emoji) continue;
    (map[row.repo_id] = map[row.repo_id] || new Set<string>()).add(row.emoji);
  }
  return map;
}

export async function fetchComments(
  repoId: number
): Promise<RepoInteraction[]> {
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
  return (data || []) as unknown as RepoInteraction[];
}

export interface AddCommentInput {
  repoId: number;
  repoName: string;
  userId: string;
  content: string;
}

export async function addComment({
  repoId,
  repoName,
  userId,
  content,
}: AddCommentInput): Promise<RepoInteraction> {
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
  return data as unknown as RepoInteraction;
}

export interface ToggleReactionInput {
  repoId: number;
  repoName: string;
  userId: string;
  emoji: string;
}

export async function toggleReaction({
  repoId,
  repoName,
  userId,
  emoji,
}: ToggleReactionInput): Promise<{ added: boolean }> {
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
