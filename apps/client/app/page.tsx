"use client";

import { useEffect, useMemo, useState } from "react";
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
  getTrendingTags,
  getStoredRole,
  listPublishedArticles,
  searchArticles,
  ROLE_LABELS,
  setStoredRole,
  subscribeToArticleEvents,
  type UserRole,
} from "@repo/api";
import { type Article } from "@repo/db";

export default function Home() {
  const [publishedArticles, setPublishedArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState<UserRole>("client");
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null,
  );

  const trendingTags = useMemo(
    () => getTrendingTags(publishedArticles, 4),
    [publishedArticles],
  );

  const visibleArticles = useMemo(
    () => searchArticles(publishedArticles, { query: searchTerm }),
    [publishedArticles, searchTerm],
  );

  const selectedArticle = useMemo(
    () =>
      visibleArticles.find((article) => article.id === selectedArticleId) ??
      null,
    [visibleArticles, selectedArticleId],
  );

  useEffect(() => {
    let mounted = true;
    (async function load() {
      try {
        const all = (await listPublishedArticles()) as Article[];
        if (!mounted) return;
        setPublishedArticles(all);
        setRole(getStoredRole("client"));
      } catch (err) {
        // ignore for now
      }
    })();
    const stop = subscribeToArticleEvents(async () => {
      try {
        const all = (await listPublishedArticles()) as Article[];
        if (!mounted) return;
        setPublishedArticles(all);
      } catch (err) {
        // ignore for now
      }
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
    if (visibleArticles.length === 0) {
      setSelectedArticleId(null);
      return;
    }

    if (
      !selectedArticleId ||
      !visibleArticles.some((a) => a.id === selectedArticleId)
    ) {
      setSelectedArticleId(visibleArticles[0].id);
    }
  }, [visibleArticles, selectedArticleId]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eff6ff_100%)] px-6 py-10 text-slate-950">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.06)]">
          <Badge variant="subtle">Client portal</Badge>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-600">Viewing as</span>
            <Badge variant="success">{ROLE_LABELS[role]}</Badge>
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400"
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
            >
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 max-w-2xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Reusable UI for the customer-facing app.
            </h1>
            <p className="text-lg leading-8 text-slate-600">
              This app can now share the same component package as admin, while
              still keeping its own layout and content.
            </p>
          </div>

          <div className="mt-8 grid gap-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-4 md:grid-cols-[1fr_auto] md:items-end">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Search published articles</span>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search titles, summaries, or tags"
              />
            </label>

            <div className="flex flex-wrap gap-2 md:justify-end">
              {trendingTags.map((item) => (
                <Button
                  key={item.tag}
                  size="sm"
                  variant="secondary"
                  onClick={() => setSearchTerm(item.tag)}
                >
                  {item.tag} · {item.count}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button>Browse updates</Button>
            <Button variant="secondary">Contact support</Button>
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Published now</CardTitle>
            <CardDescription>
              Articles visible to end users from shared packages, searchable by
              topic.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {visibleArticles.length === 0 ? (
              <EmptyState
                title="No results"
                description="Try a different keyword or pick one of the trending tags."
              />
            ) : (
              <ul className="space-y-2 text-sm text-slate-700">
                {visibleArticles.map((article) => (
                  <li
                    key={article.id}
                    className={`cursor-pointer rounded-lg border p-3 transition ${selectedArticleId === article.id ? "border-slate-400 bg-white" : "border-slate-200"}`}
                    onClick={() => setSelectedArticleId(article.id)}
                  >
                    <p className="font-medium text-slate-900">
                      {article.title}
                    </p>
                    <p className="text-slate-600">{article.summary}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      /{article.slug}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-sm leading-6 text-slate-600">
              Shared imports: <Code>@repo/api</Code>, <Code>@repo/db</Code>, and{" "}
              <Code>@repo/ui</Code>
            </p>
          </CardContent>
          <CardFooter>
            <Badge variant="success">Ready to extend</Badge>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Article preview</CardTitle>
            <CardDescription>
              Read the selected published article in detail before sharing it
              with stakeholders.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedArticle ? (
              <EmptyState
                title="No article selected"
                description="Select any published article from the list to open a full preview."
              />
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">
                      {selectedArticle.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      /{selectedArticle.slug}
                    </p>
                  </div>
                  <Badge variant="success">Published</Badge>
                </div>

                <p className="text-sm leading-7 text-slate-700">
                  {selectedArticle.body}
                </p>

                <div className="grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
                  <p>Author: {selectedArticle.authorId}</p>
                  <p>
                    Updated:{" "}
                    {new Date(selectedArticle.updatedAt).toLocaleString()}
                  </p>
                  <p>
                    Published:{" "}
                    {selectedArticle.publishedAt
                      ? new Date(selectedArticle.publishedAt).toLocaleString()
                      : "N/A"}
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
