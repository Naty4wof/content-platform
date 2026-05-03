import { type Article, type ArticleStatus } from "@repo/db";

export type { Article, ArticleStatus };

const BASE = process.env.MOCK_BACKEND_URL ?? "http://localhost:4001";

async function fetchJson(path: string, opts?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
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

function buildArticleSeed(): Article[] {
  return [];
}
