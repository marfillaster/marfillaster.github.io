// -----------------------------------------------------------------------------
// fs-facing wrapper around the pure metadata logic in src/lib/post-meta.mjs.
// The exported API is unchanged (readFeedPosts, readRoutablePosts,
// sortFeedItems, buildPostIndex) — vite.config.ts, src/routes.ts, and
// scripts/generate-rss.mjs keep working as before. The Remix app layer uses
// the pure module directly over Platform.content().
// -----------------------------------------------------------------------------

import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative, resolve, sep } from "node:path";
import { parsePosts } from "../src/lib/post-meta.mjs";

export { sortFeedItems, buildPostIndex } from "../src/lib/post-meta.mjs";

const contentDir = resolve(process.cwd(), "src/content");

async function listContentFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        return listContentFiles(path);
      }

      return [".md", ".mdx"].includes(extname(entry.name)) ? [path] : [];
    }),
  );

  return files.flat();
}

async function readContentEntries() {
  const contentFiles = await listContentFiles(contentDir);
  const entries = [];

  for (const filePath of contentFiles) {
    const relativePath = relative(contentDir, filePath).split(sep).join("/");
    entries.push([relativePath, await readFile(filePath, "utf8")]);
  }

  return entries;
}

export async function readFeedPosts() {
  return parsePosts(await readContentEntries());
}

export async function readRoutablePosts() {
  return parsePosts(await readContentEntries(), { includeRouteOnly: true });
}
