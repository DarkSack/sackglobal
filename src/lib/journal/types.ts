export const POST_TYPES = [
  "project_update",
  "devlog",
  "announcement",
  "tutorial",
  "release",
  "note",
  "news",
  "stream",
  "community",
] as const;

export type PostType = (typeof POST_TYPES)[number];
export type PostStatus = "draft" | "published" | "archived";

export const POST_TYPE_LABEL: Record<PostType, string> = {
  project_update: "Project update",
  devlog: "Devlog",
  announcement: "Announcement",
  tutorial: "Tutorial",
  release: "Release",
  note: "Note",
  news: "News",
  stream: "Stream",
  community: "Community",
};

/** Fila de `journal_posts` tal cual la devuelve Supabase. */
export interface JournalRow {
  id: string;
  slug: string;
  title: string;
  type: PostType;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  published_at: string | null;
  tags: string[];
  project: string | null;
  featured: boolean;
  status: PostStatus;
  author: string;
  created_at: string;
  updated_at: string;
}

export interface JournalPost {
  id: string;
  slug: string;
  title: string;
  type: PostType;
  excerpt: string;
  content: string;
  coverImage: string | null;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  project: string | null;
  featured: boolean;
  author: string;
  readingMinutes: number;
}
