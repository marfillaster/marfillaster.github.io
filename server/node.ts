// -----------------------------------------------------------------------------
// Node adapter — the no-build dev loop:
//
//   pnpm remix:assets   (once, and after CSS/static changes)
//   pnpm dev:remix      (node --import remix/node-tsx server/node.ts)
//
// Serves the same app the workerd adapter serves. The only file besides
// workers/remix-app.ts that knows what runtime it's on.
// -----------------------------------------------------------------------------

import { createServer } from "node:http";
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import { extname, join, relative, resolve, sep } from "node:path";
import { createRequestListener } from "remix/node-fetch-server";
import { createApp } from "../app/app.tsx";
import type { Platform } from "../app/platform.ts";

const repoRoot = resolve(import.meta.dirname, "..");
const contentDir = join(repoRoot, "src/content");
const assetsDir = join(repoRoot, ".remix-assets");

function loadContent(): Map<string, string> {
  const map = new Map<string, string>();
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(path);
      } else if ([".md", ".mdx"].includes(extname(entry.name))) {
        map.set(relative(contentDir, path).split(sep).join("/"), readFileSync(path, "utf8"));
      }
    }
  };
  walk(contentDir);
  return map;
}

function gitVersionId(): string {
  try {
    return execSync("git rev-parse --short HEAD", { cwd: repoRoot })
      .toString()
      .trim();
  } catch {
    return `dev-${Date.now()}`;
  }
}

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".xml": "application/xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

async function serveAsset(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.includes("..")) {
    return null;
  }

  let filePath = join(assetsDir, pathname);
  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, "index.html");
  }
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    return null;
  }

  const body = readFileSync(filePath);
  // Mirrors the _headers file Workers Assets serves in production: /assets/*
  // is content-fingerprinted, everything else gets a modest TTL.
  const cacheControl = pathname.startsWith("/assets/")
    ? "public, max-age=31536000, immutable"
    : "public, max-age=3600";
  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": MIME[extname(filePath)] ?? "application/octet-stream",
      "Cache-Control": cacheControl,
    },
  });
}

// In-memory page-view store. Unset paths get a stable pseudo-random count so
// dev pages show plausible stats without credentials or state.
function pseudoViews(path: string): number {
  let hash = 0;
  for (const char of path) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0;
  }
  return 40 + (Math.abs(hash) % 860);
}

const viewsStore = new Map<string, number>();

const platform: Platform = {
  content: loadContent,
  versionId: gitVersionId(),
  assets: serveAsset,
  views: {
    async get(path) {
      return viewsStore.get(path) ?? pseudoViews(path);
    },
    async put(path, views) {
      viewsStore.set(path, views);
    },
  },
  secrets: {
    gaServiceAccountKey: process.env.GA_SERVICE_ACCOUNT_KEY,
    gaPropertyId: process.env.GA_PROPERTY_ID,
    adminResyncToken: process.env.ADMIN_RESYNC_TOKEN,
  },
  httpCache: null,
  waitUntil(promise) {
    promise.catch((err) => console.error("waitUntil task failed", err));
  },
};

const router = createApp(platform);

const port = Number(process.env.PORT ?? 3000);
const server = createServer(
  createRequestListener((request) => router.fetch(request)),
);

server.listen(port, () => {
  console.log(`remix dev server → http://localhost:${port}`);
});
