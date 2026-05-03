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
} from "@repo/ui";
import {
  listArticles,
  createArticle as apiCreateArticle,
  submitForReview as apiSubmitForReview,
  searchArticles,
  getTrendingTags,
  subscribeToArticleEvents,
} from "@repo/api";
import { type Article, type ArticleStatus } from "@repo/db";

const filters: Array<{ label: string; value: ArticleStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Pending", value: "pending" },
  { label: "Published", value: "published" },
];

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<ArticleStatus | "all">(
    "all",
  );
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("strategy, platform");
  const [searchTerm, setSearchTerm] = useState("");

  const metrics = useMemo(
    () => ({
      totalArticles: articles.length,
      draftCount: articles.filter((article) => article.status === "draft")
        .length,
      pendingCount: articles.filter((article) => article.status === "pending")
        .length,
      publishedCount: articles.filter(
        (article) => article.status === "published",
      ).length,
    }),
    [articles],
  );

  const visibleArticles = useMemo(() => {
    return searchArticles(articles, {
      status: selectedStatus,
      query: searchTerm,
    });
  }, [articles, selectedStatus, searchTerm]);

  const trendingTags = useMemo(() => getTrendingTags(articles, 4), [articles]);

  const resetForm = () => {
    setTitle("");
    setSummary("");
    setBody("");
    setTags("strategy, platform");
  };

  const createArticle = async (status: "draft" | "pending") => {
    if (!title.trim() || !summary.trim() || !body.trim()) {
      return;
    }
    const created = await apiCreateArticle({
      title,
      summary,
      body,
      authorId: "admin_01",
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });

    if (status === "pending") {
      await apiSubmitForReview(created.id);
    }

    const latest = (await listArticles()) as Article[];
    setArticles(latest);
    resetForm();
  };

  const submitExistingDraft = async (articleId: string) => {
    await apiSubmitForReview(articleId);
    const latest = (await listArticles()) as Article[];
    setArticles(latest);
  };

  useEffect(() => {
    let mounted = true;
    (async function load() {
      const all = (await listArticles()) as Article[];
      if (!mounted) return;
      setArticles(all);
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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fafc,#e2e8f0_70%)] px-6 py-10 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="flex flex-col gap-6 rounded-4xl border border-white/70 bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="success">Admin</Badge>
            <Badge variant="subtle">Create and submit content</Badge>
          </div>

          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Content starts here.
            </h1>
            <p className="text-lg leading-8 text-slate-600">
              Draft articles, save them for later, or submit them directly into
              the review queue for the editor app.
            </p>
          </div>

          <div className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-4 md:grid-cols-[1fr_auto] md:items-end">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Search content</span>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search titles, summaries, tags, or body"
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

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => createArticle("draft")}>Save Draft</Button>
            <Button
              variant="secondary"
              onClick={() => createArticle("pending")}
            >
              Submit for Review
            </Button>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Drafts</CardTitle>
              <CardDescription>Articles ready to be revised.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{metrics.draftCount}</div>
              <p className="mt-2 text-sm text-slate-600">
                Drafts can be refined before they are submitted.
              </p>
            </CardContent>
            <CardFooter>
              <Badge variant="warning">Draft</Badge>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending</CardTitle>
              <CardDescription>
                Items waiting for editorial review.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">
                {metrics.pendingCount}
              </div>
              <p className="mt-2 text-sm text-slate-600">
                These articles move into the editor queue.
              </p>
            </CardContent>
            <CardFooter>
              <Badge variant="warning">Review queue</Badge>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Published</CardTitle>
              <CardDescription>Content visible to clients.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">
                {metrics.publishedCount}
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Published articles appear in the client app.
              </p>
            </CardContent>
            <CardFooter>
              <Badge variant="success">Live</Badge>
            </CardFooter>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Create article</CardTitle>
            <CardDescription>
              Fill out the fields below, then save or submit.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Title</span>
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Monorepo content strategy"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Tags</span>
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="strategy, publishing"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
              <span>Summary</span>
              <textarea
                className="min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="Short preview for the article card"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
              <span>Body</span>
              <textarea
                className="min-h-32 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Long-form article content"
              />
            </label>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-3">
            <Button onClick={() => createArticle("draft")}>Save Draft</Button>
            <Button
              variant="secondary"
              onClick={() => createArticle("pending")}
            >
              Submit for Review
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Article pipeline</CardTitle>
            <CardDescription>
              Search and filter articles before submitting drafts into review.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <Button
                  key={filter.value}
                  size="sm"
                  variant={
                    filter.value === selectedStatus ? "primary" : "secondary"
                  }
                  onClick={() => setSelectedStatus(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {visibleArticles.map((article) => (
                <div
                  key={article.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-slate-300 hover:bg-white"
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
                    <Badge
                      variant={
                        article.status === "published"
                          ? "success"
                          : article.status === "pending"
                            ? "warning"
                            : "subtle"
                      }
                    >
                      {article.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {article.summary}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-600 shadow-sm ring-1 ring-slate-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {article.status === "draft" ? (
                    <div className="mt-4">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => submitExistingDraft(article.id)}
                      >
                        Submit for Review
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            {visibleArticles.length === 0 ? (
              <p className="text-sm text-slate-500">
                No articles match the selected filter.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
