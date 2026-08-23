import { supabase } from "@/lib/supabase";
import type { PostComment } from "@/types";

const TABLE = "post_comments";

export async function listComments(postId: number): Promise<PostComment[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(
      "id, post_id, user_id, content, created_at, users:users!user_id(nickname, avatar_url)"
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []) as unknown as PostComment[];
}

export async function countCommentsPerPost(
  postIds: number[]
): Promise<Record<number, number>> {
  if (!postIds.length) return {};
  const { data, error } = await supabase
    .from(TABLE)
    .select("post_id")
    .in("post_id", postIds);
  if (error) {
    console.warn("[postComments] count:", error.message);
    return {};
  }
  const map: Record<number, number> = {};
  for (const row of (data || []) as { post_id: number }[]) {
    map[row.post_id] = (map[row.post_id] || 0) + 1;
  }
  return map;
}

export interface AddPostCommentInput {
  postId: number;
  userId: string;
  content: string;
}

export async function addComment({
  postId,
  userId,
  content,
}: AddPostCommentInput): Promise<PostComment> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ post_id: postId, user_id: userId, content })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as PostComment;
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
