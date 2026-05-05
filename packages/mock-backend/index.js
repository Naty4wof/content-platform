import { readFileSync, writeFileSync, existsSync } from "fs";
import http from "http";
import crypto from "crypto";

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

function createDraftArticle({
  title,
  summary,
  body,
  authorId,
  tags = [],
  slug,
}) {
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
  return {
    ...article,
    status: next,
    updatedAt: now,
    publishedAt: next === "published" ? now : null,
  };
}

function buildSeed() {
  const draft = createDraftArticle({
    title: "Q2 editorial roadmap for the content team",
    summary:
      "A planning draft that outlines upcoming campaigns, review cycles, and publishing goals.",
    body: "The content team will focus on launch sequencing, evergreen updates, and a tighter review cadence. This draft captures the quarterly plan before editorial sign-off.",
    authorId: "admin_01",
    tags: ["strategy", "planning", "quarterly"],
  });

  const review = transitionArticle(
    createDraftArticle({
      title: "How to standardize article review across teams",
      summary:
        "A practical checklist for editors and admins to keep reviews consistent.",
      body: "This article covers title checks, summary length, metadata review, and final approval steps so every article follows the same quality bar.",
      authorId: "admin_02",
      tags: ["editorial", "workflow", "quality"],
    }),
    "pending",
  );

  const published = transitionArticle(
    transitionArticle(
      createDraftArticle({
        title: "Publishing pipeline launch notes",
        summary:
          "A short rollout update for teams using the new monorepo content platform.",
        body: "The publishing workflow now spans admin, editor, and client experiences, with shared UI, live sync, and persistent article state.",
        authorId: "admin_03",
        tags: ["launch", "updates", "platform"],
      }),
      "pending",
    ),
    "published",
    new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  );

  const publishedHowTo = transitionArticle(
    transitionArticle(
      createDraftArticle({
        title: "A simple checklist for publishing fast without missing details",
        summary:
          "A client-friendly guide that shows the finished product of the workflow.",
        body: "Strong publishing teams keep drafts focused, review queue items short, and live articles easy to scan on mobile and desktop.",
        authorId: "editor_01",
        tags: ["guides", "operations", "publishing"],
      }),
      "pending",
    ),
    "published",
    new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  );

  return [draft, review, published, publishedHowTo];
}

function loadData() {
  if (!existsSync(DATA_PATH)) {
    const seed = buildSeed();
    writeFileSync(DATA_PATH, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }
  const raw = readFileSync(DATA_PATH, "utf8");
  try {
    // Serve uploaded files
    if (req.method === "GET" && url.pathname.startsWith("/uploads/")) {
      const filename = decodeURIComponent(url.pathname.replace("/uploads/", ""));
      const filePath = new URL(`./uploads/${filename}`, import.meta.url);
      if (!existsSync(filePath)) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "not found" }));
        return;
      }
      const data = readFileSync(filePath);
      // rudimentary content-type
      const ext = filename.split(".").pop();
      const contentType = ext === "png" ? "image/png" : ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      res.end(data);
      return;
    }

    // Upload endpoint (accepts JSON with base64 data)
    if (req.method === "POST" && url.pathname === "/uploads") {
      let body = "";
      for await (const chunk of req) body += chunk;
      const payload = JSON.parse(body || "{}");
      const { filename, data } = payload;
      if (!filename || !data) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "filename and data required" }));
        return;
      }
      // ensure uploads dir exists
      const UPLOADS_DIR = new URL("./uploads", import.meta.url);
      try {
        if (!existsSync(UPLOADS_DIR)) {
          // create dir
          import("fs").then(({ mkdirSync }) => mkdirSync(UPLOADS_DIR, { recursive: true }));
        }
      } catch (e) {
        // ignore
      }
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2,8)}-${filename}`;
      const filePath = new URL(`./uploads/${unique}`, import.meta.url);
      const buffer = Buffer.from(data, "base64");
      writeFileSync(filePath, buffer);
      const urlOut = `/uploads/${encodeURIComponent(unique)}`;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ url: urlOut }));
      return;
    }
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
const USERS_PATH = new URL("./users.json", import.meta.url);

function loadUsers() {
  if (!existsSync(USERS_PATH)) {
    writeFileSync(USERS_PATH, JSON.stringify([], null, 2), "utf8");
    return [];
  }
  const raw = readFileSync(USERS_PATH, "utf8");
  try {
    return JSON.parse(raw);
  } catch (e) {
    writeFileSync(USERS_PATH, JSON.stringify([], null, 2), "utf8");
    return [];
  }
}

function saveUsers(users) {
  writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), "utf8");
}

let USERS = loadUsers();

function base64url(input) {
  return Buffer.from(JSON.stringify(input))
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64urlDecode(str) {
  const s = str.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(Buffer.from(s, "base64").toString("utf8"));
}

const TOKEN_SECRET = process.env.MOCK_BACKEND_JWT_SECRET || "dev-secret";

function signToken(payload, expiresInSeconds = 60 * 60) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresInSeconds };
  const headerB64 = base64url(header);
  const payloadB64 = base64url(body);
  const signature = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${headerB64}.${payloadB64}.${signature}`;
}

function verifyToken(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, sig] = parts;
  const expected = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  if (expected !== sig) return null;
  try {
    const payload = base64urlDecode(payloadB64);
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

function getAuthUser(req) {
  const auth = req.headers && req.headers.authorization;
  if (!auth) return null;
  const m = String(auth).match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const token = m[1];
  const payload = verifyToken(token);
  if (!payload) return null;
  const user = USERS.find((u) => u.id === payload.sub);
  if (!user) return null;
  return { id: user.id, email: user.email, role: user.role, name: user.name };
}
const CLIENTS = new Set();

function sendEvent(res, event, payload) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function broadcast(event, payload) {
  for (const res of CLIENTS) {
    try {
      sendEvent(res, event, payload);
    } catch (err) {
      CLIENTS.delete(res);
    }
  }
}

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
    // Auth: login
    if (req.method === "POST" && url.pathname === "/auth/login") {
      let body = "";
      for await (const chunk of req) body += chunk;
      const { email, password } = JSON.parse(body || "{}");
      const found = USERS.find(
        (u) => u.email === email && u.password === password,
      );
      if (!found) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "invalid credentials" }));
        return;
      }
      const token = signToken({ sub: found.id, role: found.role });
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          token,
          user: {
            id: found.id,
            email: found.email,
            role: found.role,
            name: found.name,
          },
        }),
      );
      return;
    }

    if (req.method === "GET" && url.pathname === "/articles") {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(STORE));
      return;
    }

    if (req.method === "GET" && url.pathname === "/events") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });
      res.write("retry: 3000\n\n");
      CLIENTS.add(res);
      sendEvent(res, "ready", { ok: true });

      req.on("close", () => {
        CLIENTS.delete(res);
      });
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
      const caller = getAuthUser(req);
      if (!caller || (caller.role !== "admin" && caller.role !== "editor")) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "unauthorized" }));
        return;
      }
      const payload = JSON.parse(body || "{}");
      const article = createDraftArticle(payload);
      article.authorId = article.authorId ?? caller.id;
      STORE = [article, ...STORE];
      saveData(STORE);
      broadcast("articles", { type: "created", article });
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(article));
      return;
    }

    const submitMatch = url.pathname.match(/^\/articles\/(.+)\/submit$/);
    const approveMatch = url.pathname.match(/^\/articles\/(.+)\/approve$/);
    const rejectMatch = url.pathname.match(/^\/articles\/(.+)\/reject$/);

    if (req.method === "POST" && submitMatch) {
      const id = submitMatch[1];
      const caller = getAuthUser(req);
      if (!caller) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "unauthorized" }));
        return;
      }
      const idx = STORE.findIndex((a) => a.id === id);
      if (idx === -1) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "not found" }));
        return;
      }
      // authors can submit their own drafts, editors/admins can submit any
      const article = STORE[idx];
      if (
        caller.role !== "admin" &&
        caller.role !== "editor" &&
        caller.id !== article.authorId
      ) {
        res.statusCode = 403;
        res.end(JSON.stringify({ error: "forbidden" }));
        return;
      }
      const updated = transitionArticle(article, "pending");
      STORE[idx] = updated;
      saveData(STORE);
      broadcast("articles", { type: "submitted", article: updated });
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(updated));
      return;
    }

    if (req.method === "POST" && approveMatch) {
      const id = approveMatch[1];
      const caller = getAuthUser(req);
      if (!caller || (caller.role !== "admin" && caller.role !== "editor")) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "unauthorized" }));
        return;
      }
      const idx = STORE.findIndex((a) => a.id === id);
      if (idx === -1) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "not found" }));
        return;
      }
      const updated = transitionArticle(STORE[idx], "published");
      STORE[idx] = updated;
      saveData(STORE);
      broadcast("articles", { type: "approved", article: updated });
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(updated));
      return;
    }

    if (req.method === "POST" && rejectMatch) {
      const id = rejectMatch[1];
      const caller = getAuthUser(req);
      if (!caller || (caller.role !== "admin" && caller.role !== "editor")) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: "unauthorized" }));
        return;
      }
      const idx = STORE.findIndex((a) => a.id === id);
      if (idx === -1) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "not found" }));
        return;
      }
      const updated = transitionArticle(STORE[idx], "draft");
      STORE[idx] = updated;
      saveData(STORE);
      broadcast("articles", { type: "rejected", article: updated });
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
