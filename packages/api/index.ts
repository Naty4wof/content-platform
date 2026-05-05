import { type Article, type ArticleStatus } from "@repo/db";

export type { Article, ArticleStatus };

const BASE = process.env.MOCK_BACKEND_URL ?? "http://localhost:4001";

export const AUTH_TOKEN_KEY = "content-platform-auth-token";

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token === null) window.localStorage.removeItem(AUTH_TOKEN_KEY);
  else window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

async function fetchJson(path: string, opts: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string> | undefined),
  };

  const token = getAuthToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mock backend error: ${res.status} ${text}`);
  }
  return res.json();
}

export interface AdminMetrics {
  totalArticles: number;
  draftCount: number;
  pendingCount: number;
  publishedCount: number;
}

export interface EditorMetrics {
  queueCount: number;
  draftCount: number;
  publishedCount: number;
}

export interface ArticleEventPayload {
  type: "created" | "submitted" | "approved" | "rejected";
  article: Article;
}

export interface ArticleSearchOptions {
  query?: string;
  status?: ArticleStatus | "all";
  tag?: string;
  limit?: number;
}

export type UserRole = "admin" | "editor" | "client";

export const ROLE_STORAGE_KEY = "content-platform-role";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  editor: "Editor",
  client: "Client",
};

export function isUserRole(value: string | null): value is UserRole {
  return value === "admin" || value === "editor" || value === "client";
}

export function getStoredRole(defaultRole: UserRole): UserRole {
  if (typeof window === "undefined") {
    return defaultRole;
  }

  const storedRole = window.localStorage.getItem(ROLE_STORAGE_KEY);
  return isUserRole(storedRole) ? storedRole : defaultRole;
}

export function setStoredRole(role: UserRole): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ROLE_STORAGE_KEY, role);
}

export function searchArticles(
  articles: Article[],
  options: ArticleSearchOptions = {},
): Article[] {
  const query = options.query?.trim().toLowerCase();
  const tag = options.tag?.trim().toLowerCase();

  return articles
    .filter((article) => {
      const matchesStatus =
        !options.status ||
        options.status === "all" ||
        article.status === options.status;

      const matchesTag =
        !tag ||
        article.tags.some((articleTag) => articleTag.toLowerCase() === tag);

      const matchesQuery =
        !query ||
        [
          article.title,
          article.summary,
          article.body,
          article.slug,
          ...article.tags,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesStatus && matchesTag && matchesQuery;
    })
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, options.limit ?? articles.length);
}

export function getTrendingTags(
  articles: Article[],
  limit = 5,
): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>();

  for (const article of articles) {
    for (const tag of article.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort(
      (left, right) =>
        right.count - left.count || left.tag.localeCompare(right.tag),
    )
    .slice(0, limit);
}

export async function listArticles(): Promise<Article[]> {
  return fetchJson(`/articles`);
}

export async function listPublishedArticles(): Promise<Article[]> {
  const all = await fetchJson(`/articles`);
  return all.filter((a: Article) => a.status === "published");
}

export async function listReviewQueue(): Promise<Article[]> {
  const all = await fetchJson(`/articles`);
  return all.filter((a: Article) => a.status === "pending");
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const all = await fetchJson(`/articles`);
  return {
    totalArticles: all.length,
    draftCount: all.filter((a: Article) => a.status === "draft").length,
    pendingCount: all.filter((a: Article) => a.status === "pending").length,
    publishedCount: all.filter((a: Article) => a.status === "published").length,
  };
}

export async function getEditorMetrics(): Promise<EditorMetrics> {
  const all = await fetchJson(`/articles`);
  return {
    queueCount: all.filter((a: Article) => a.status === "pending").length,
    draftCount: all.filter((a: Article) => a.status === "draft").length,
    publishedCount: all.filter((a: Article) => a.status === "published").length,
  };
}

export async function createArticle(input: Partial<Article>): Promise<Article> {
  return fetchJson(`/articles`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function submitForReview(articleId: string): Promise<Article> {
  return fetchJson(`/articles/${articleId}/submit`, { method: "POST" });
}

export async function approveArticle(articleId: string): Promise<Article> {
  return fetchJson(`/articles/${articleId}/approve`, { method: "POST" });
}

export async function rejectArticle(articleId: string): Promise<Article> {
  return fetchJson(`/articles/${articleId}/reject`, { method: "POST" });
}

export async function getArticleById(
  articleId: string,
): Promise<Article | undefined> {
  try {
    return await fetchJson(`/articles/${articleId}`);
  } catch (e) {
    return undefined;
  }
}

export async function login(
  email: string,
  password: string,
): Promise<{
  token: string;
  user: { id: string; email: string; role: UserRole; name?: string };
}> {
  const res = await fetchJson(`/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  // persist token client-side
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUTH_TOKEN_KEY, res.token);
    }
  } catch (e) {
    // ignore
  }
  return res;
}

export function logout() {
  setAuthToken(null);
}

export function subscribeToArticleEvents(
  onChange: (event: ArticleEventPayload) => void,
): () => void {
  if (typeof window === "undefined" || typeof EventSource === "undefined") {
    return () => undefined;
  }

  const source = new EventSource(`${BASE}/events`);

  const handleArticles = (event: MessageEvent<string>) => {
    try {
      onChange(JSON.parse(event.data) as ArticleEventPayload);
    } catch (error) {
      // ignore malformed events
    }
  };

  source.addEventListener("articles", handleArticles as EventListener);
  return () => {
    source.removeEventListener("articles", handleArticles as EventListener);
    source.close();
  };
}

function buildArticleSeed(): Article[] {
  return [];
}
