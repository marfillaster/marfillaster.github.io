// Purges mutable URLs from the Cloudflare zone cache after a deploy so stale
// edge copies die immediately instead of waiting out their TTL. Content-hashed
// /assets/ URLs are deliberately omitted: a changed asset gets a new URL, so
// evicting the old immutable object only makes active clients refetch it.
//
// Env: CLOUDFLARE_ZONE_ID, CLOUDFLARE_API_TOKEN (token needs Zone → Cache
// Purge permission).

import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parsePosts } from "../src/lib/post-meta.mjs";

const zoneId = process.env.CLOUDFLARE_ZONE_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const siteUrl = "https://blog.homestack.space";
const repoRoot = resolve(fileURLToPath(import.meta.url), "../..");

if (!zoneId || !apiToken) {
  console.error("purge-zone: CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN must be set");
  process.exit(1);
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) => {
        const path = join(directory, entry.name);
        return entry.isDirectory() ? listFiles(path) : path;
      }),
    )
  ).flat();
}

const contentDir = join(repoRoot, "src/content");
const contentEntries = await Promise.all(
  (await listFiles(contentDir))
    .filter((path) => /\.mdx?$/.test(path))
    .map(async (path) => [
      relative(contentDir, path).split(sep).join("/"),
      await readFile(path, "utf8"),
    ]),
);
const posts = parsePosts(contentEntries, { includeRouteOnly: true });

const paths = new Set([
  "/",
  "/rss.xml",
  "/sitemap.xml",
  "/solar-report/",
  "/solar-report",
  "/solar-report/full-report",
  "/solar-report/full-report/",
  "/nev-mileage/",
  "/nev-mileage",
  "/nev-mileage/full-report",
  "/nev-mileage/full-report/",
  "/lan-segmentation-vlans-mikrotik",
  "/lan-segmentation-vlans-mikrotik/",
]);

for (const post of posts) {
  paths.add(post.href);
  paths.add(post.href === "/" ? "/" : post.href.replace(/\/$/, ""));
}

const publicDir = join(repoRoot, "public");
for (const path of await listFiles(publicDir)) {
  const pathname = `/${relative(publicDir, path).split(sep).join("/")}`;
  if (
    pathname !== "/.nojekyll" &&
    pathname !== "/sitemap.xml" &&
    pathname !== "/rss.xml"
  ) {
    paths.add(pathname);
  }
}

const urls = [...paths]
  .sort()
  .map((pathname) => new URL(pathname, siteUrl).toString());
const endpoint = `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`;

// Cloudflare accepts at most 100 URLs in one single-file purge request.
for (let offset = 0; offset < urls.length; offset += 100) {
  const batch = urls.slice(offset, offset + 100);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ files: batch }),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    console.error("purge-zone: purge failed", JSON.stringify(result.errors ?? result));
    process.exit(1);
  }
}

console.log(`purge-zone: purged ${urls.length} mutable URLs; kept /assets/ cached`);
