"use client";

import { useMemo, useState, useEffect } from "react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Code,
  EmptyState,
} from "@repo/ui";
import {
  listArticles,
  approveArticle as apiApproveArticle,
  rejectArticle as apiRejectArticle,
  getStoredRole,
  setStoredRole,
  ROLE_LABELS,
  subscribeToArticleEvents,
  trackAction,
  trackPageView,
  type UserRole,
} from "@repo/api";
import { type Article } from "@repo/db";

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [role, setRole] = useState<UserRole>("editor");
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null,
  );

  const metrics = useMemo(
    () => ({
      queueCount: articles.filter((article) => article.status === "pending")
        .length,
      draftCount: articles.filter((article) => article.status === "draft")
        .length,
      publishedCount: articles.filter(
        (article) => article.status === "published",
      ).length,
    }),
    [articles],
  );

  const queue = useMemo(
    () => articles.filter((article) => article.status === "pending"),
    [articles],
  );
  const selectedArticle = useMemo(
    () => queue.find((article) => article.id === selectedArticleId) ?? null,
    [queue, selectedArticleId],
  );
  const canReview = role === "editor";

  const approveArticle = async (articleId: string) => {
    await apiApproveArticle(articleId);
    await trackAction("approve_article", role);
    const latest = (await listArticles()) as Article[];
    setArticles(latest);
  };

  const rejectArticle = async (articleId: string) => {
    await apiRejectArticle(articleId);
    await trackAction("reject_article", role);
    const latest = (await listArticles()) as Article[];
    setArticles(latest);
  };

  const approveAllPending = async () => {
    for (const article of queue) {
      await apiApproveArticle(article.id);
    }
    const latest = (await listArticles()) as Article[];
    setArticles(latest);
  };

  useEffect(() => {
    let mounted = true;
    (async function load() {
      const all = (await listArticles()) as Article[];
      if (!mounted) return;
      setArticles(all);
      const storedRole = getStoredRole("editor");
      setRole(storedRole);
      void trackPageView("editor", storedRole);
    })();
    const stop = subscribeToArticleEvents(async () => {
      const all = (await listArticles()) as Article[];
      if (!mounted) return;
      setArticles(all);
    });
    return () => {
      mounted = false;
      stop();
    };
  }, []);

  useEffect(() => {
    setStoredRole(role);
  }, [role]);

  useEffect(() => {
    if (queue.length === 0) {
      setSelectedArticleId(null);
      return;
    }

    if (!selectedArticleId || !queue.some((a) => a.id === selectedArticleId)) {
      setSelectedArticleId(queue[0].id);
    }
  }, [queue, selectedArticleId]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_center,#fff7ed,#f8fafc_60%)] px-6 py-10 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-4xl border border-amber-200 bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="warning">Editor</Badge>
            <Badge variant="subtle">Review pending content</Badge>
          </div>

          <div className="mt-4 grid gap-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-4 md:grid-cols-[1fr_auto] md:items-end">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Signed in as</span>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                value={role}
                onChange={(event) => setRole(event.target.value as UserRole)}
              >
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-center justify-end">
              <Badge variant={canReview ? "success" : "warning"}>
                {canReview ? "Review access" : "Read-only preview"}
              </Badge>
            </div>
          </div>

          {!canReview ? (
            <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50/80 p-4 text-sm leading-6 text-amber-900">
              Switch to the Editor role to approve or reject pending content.
            </div>
          ) : null}

          <div className="mt-5 max-w-2xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              The review desk for pending articles.
            </h1>
            <p className="text-lg leading-8 text-slate-600">
              Pending content flows here from admin, and each item can be
              approved into publishing or rejected back to draft for revision.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button disabled={!canReview}>Open review queue</Button>
            <Button variant="secondary" disabled={!canReview}>
              Refresh status
            </Button>
            <Button
              variant="ghost"
              disabled={!canReview || queue.length === 0}
              onClick={approveAllPending}
            >
              Approve All Pending
            </Button>
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Editorial queue snapshot</CardTitle>
            <CardDescription>
              Shared data from the same article model used by admin and client.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500">Pending</p>
                <p className="text-2xl font-semibold">{metrics.queueCount}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500">Drafts</p>
                <p className="text-2xl font-semibold">{metrics.draftCount}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500">Published</p>
                <p className="text-2xl font-semibold">
                  {metrics.publishedCount}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-900">
                Pending articles
              </p>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {queue.map((article) => (
                  <div
                    key={article.id}
                    className={`rounded-2xl border p-4 transition hover:border-slate-300 hover:bg-white ${selectedArticleId === article.id ? "border-slate-400 bg-white" : "border-slate-200 bg-slate-50/80"}`}
                    onClick={() => setSelectedArticleId(article.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {article.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          /{article.slug}
                        </p>
                      </div>
                      <Badge variant="warning">Pending</Badge>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {article.summary}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        disabled={!canReview}
                        onClick={() => approveArticle(article.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={!canReview}
                        onClick={() => rejectArticle(article.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {queue.length === 0 ? (
                <EmptyState
                  title="Queue is clear"
                  description="No pending articles right now. New submissions will appear here automatically."
                />
              ) : null}
            </div>

            <p className="text-sm leading-6 text-slate-600">
              Shared imports: <Code>@repo/api</Code> and <Code>@repo/db</Code>
            </p>
          </CardContent>
          <CardFooter>
            <Badge variant="success">Reusable</Badge>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review detail</CardTitle>
            <CardDescription>
              Inspect the selected pending article before approving or rejecting
              it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedArticle ? (
              <EmptyState
                title="No pending article selected"
                description="Select any pending article from the queue to see detailed context."
              />
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {selectedArticle.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      /{selectedArticle.slug}
                    </p>
                  </div>
                  <Badge variant="warning">Pending review</Badge>
                </div>

                <p className="text-sm leading-6 text-slate-600">
                  {selectedArticle.body}
                </p>

                <div className="grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                  <p>Author: {selectedArticle.authorId}</p>
                  <p>
                    Updated:{" "}
                    {new Date(selectedArticle.updatedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedArticle.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-600 shadow-sm ring-1 ring-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
