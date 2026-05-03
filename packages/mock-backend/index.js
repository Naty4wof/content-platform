import { readFileSync, writeFileSync, existsSync } from "fs";
import http from "http";

const DATA_PATH = new URL("./data.json", import.meta.url);

function nowIso() {
  return new Date().toISOString();
}

function toSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function randId() {
  if (globalThis.crypto && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2, 9);
}

function createDraftArticle({ title, summary, body, authorId, tags = [], slug }) {
  const now = nowIso();
  return {
    id: randId(),
    slug: slug ?? toSlug(title),
    title,
    summary,
    body,
    authorId,
    status: "draft",
    tags,
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
  };
}

function canTransition(current, next) {
  const transitions = {
    draft: ["pending"],
    pending: ["draft", "published"],
    published: [],
  };
  return transitions[current] && transitions[current].includes(next);
}

function transitionArticle(article, next, now = nowIso()) {
  if (!canTransition(article.status, next)) {
    throw new Error(`Invalid transition ${article.status} -> ${next}`);
  }
  return { ...article, status: next, updatedAt: now, publishedAt: next === "published" ? now : null };
}

function buildSeed() {
  const draft = createDraftArticle({
    title: "Monorepo content strategy for Q2",
    summary: "How shared packages accelerate publishing teams.",
    body: "Draft content body",
    authorId: "admin_01",
    tags: ["strategy", "platform"],
  });

  const review = transitionArticle(
    createDraftArticle({
      title: "Editorial quality checklist",
      summary: "A checklist to standardize editorial reviews.",
      body: "Editor checklist body",
      authorId: "admin_02",
      tags: ["editorial", "quality"],
    }),
    "pending",
  );

  const published = transitionArticle(
    transitionArticle(
      createDraftArticle({
        title: "Launch notes for the publishing pipeline",
        summary: "A finished article ready for the client portal.",
        body: "Published article body",
        authorId: "admin_03",
        tags: ["launch", "updates"],
      }),
      "pending",
    ),
    "published",
    new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  );

  return [draft, review, published];
}

function loadData() {
  if (!existsSync(DATA_PATH)) {
    const seed = buildSeed();
    writeFileSync(DATA_PATH, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }
  const raw = readFileSync(DATA_PATH, "utf8");
  try {
    return JSON.parse(raw);
  } catch (e) {
    const seed = buildSeed();
    writeFileSync(DATA_PATH, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }
}

function saveData(data) {
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
}

let STORE = loadData();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost`);

  // simple CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    if (req.method === "GET" && url.pathname === "/articles") {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(STORE));
      return;
    }

    if (req.method === "GET" && url.pathname.startsWith("/articles/")) {
      const id = url.pathname.split("/")[2];
      const found = STORE.find((a) => a.id === id);
      if (!found) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "not found" }));
        return;
      }
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(found));
      return;
    }

    if (req.method === "POST" && url.pathname === "/articles") {
      let body = "";
      for await (const chunk of req) body += chunk;
      const payload = JSON.parse(body || "{}");
      const article = createDraftArticle(payload);
      STORE = [article, ...STORE];
      saveData(STORE);
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(article));
      return;
    }

    const submitMatch = url.pathname.match(/^\/articles\/(.+)\/submit$/);
    const approveMatch = url.pathname.match(/^\/articles\/(.+)\/approve$/);
    const rejectMatch = url.pathname.match(/^\/articles\/(.+)\/reject$/);

    if (req.method === "POST" && submitMatch) {
      const id = submitMatch[1];
      const idx = STORE.findIndex((a) => a.id === id);
      if (idx === -1) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "not found" }));
        return;
      }
      const updated = transitionArticle(STORE[idx], "pending");
      STORE[idx] = updated;
      saveData(STORE);
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(updated));
      return;
    }

    if (req.method === "POST" && approveMatch) {
      const id = approveMatch[1];
      const idx = STORE.findIndex((a) => a.id === id);
      if (idx === -1) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "not found" }));
        return;
      }
      const updated = transitionArticle(STORE[idx], "published");
      STORE[idx] = updated;
      saveData(STORE);
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(updated));
      return;
    }

    if (req.method === "POST" && rejectMatch) {
      const id = rejectMatch[1];
      const idx = STORE.findIndex((a) => a.id === id);
      if (idx === -1) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "not found" }));
        return;
      }
      const updated = transitionArticle(STORE[idx], "draft");
      STORE[idx] = updated;
      saveData(STORE);
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(updated));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: "not found" }));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: String(err) }));
  }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4001;
server.listen(PORT, () => {
  console.log(`Mock backend listening on http://localhost:${PORT}`);
});
