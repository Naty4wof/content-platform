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
} from "@repo/ui";
import {
  getTrendingTags,
  listPublishedArticles,
  searchArticles,
  subscribeToArticleEvents,
} from "@repo/api";
import { type Article } from "@repo/db";

export default function Home() {
  const [publishedArticles, setPublishedArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const trendingTags = useMemo(
    () => getTrendingTags(publishedArticles, 4),
    [publishedArticles],
  );

  const visibleArticles = useMemo(
    () => searchArticles(publishedArticles, { query: searchTerm }),
    [publishedArticles, searchTerm],
  );

  useEffect(() => {
    let mounted = true;
    (async function load() {
      try {
        const all = (await listPublishedArticles()) as Article[];
        if (!mounted) return;
        setPublishedArticles(all);
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

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eff6ff_100%)] px-6 py-10 text-slate-950">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.06)]">
          <Badge variant="subtle">Client portal</Badge>
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
              <p className="text-sm leading-6 text-slate-600">
                No published articles match your search.
              </p>
            ) : (
              <ul className="space-y-2 text-sm text-slate-700">
                {visibleArticles.map((article) => (
                  <li
                    key={article.id}
                    className="rounded-lg border border-slate-200 p-3"
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
      </div>
    </main>
  );
}
