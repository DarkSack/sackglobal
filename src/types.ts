export interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string;
  updated_at: string;
  private: boolean;
  fork: boolean;
  archived: boolean;
}

/** Subconjunto del perfil publico de GitHub que usa el portafolio. */
export interface GitHubProfile {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitter_username: string | null;
  public_repos: number;
  followers: number;
  created_at: string;
}

export interface UserPublic {
  nickname: string | null;
  avatar_url: string | null;
}

export type InteractionType = "reaction" | "comment";

export interface RepoInteraction {
  id: string;
  repo_id: number;
  repo_name: string;
  user_id: string;
  type: InteractionType;
  emoji: string | null;
  content: string | null;
  created_at: string;
  users?: UserPublic | null;
}

export interface RepoSummary {
  reactions: Record<string, number>;
  commentCount: number;
}

export type RepoSummaryMap = Record<number, RepoSummary>;
export type MyReactionsMap = Record<number, Set<string>>;

export interface Post {
  id: number;
  user_id: string | null;
  content: string;
  image_url: string | null;
  created_at: string;
  users?: UserPublic | null;
}

export interface PostComment {
  id: string;
  post_id: number;
  user_id: string;
  content: string;
  created_at: string;
  users?: UserPublic | null;
}

export interface NewsItem {
  id: number;
  title: string;
  notice: string;
  image_url: string | null;
  created_at: string;
}

export interface SocialLink {
  id: number;
  name: string;
  url: string;
  channel_name: string | null;
  iconify_name: string | null;
}
