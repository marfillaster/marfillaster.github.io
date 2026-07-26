// Computes the per-path content digests that key document ETags and the inner
// response cache, and that the post-deploy reconcile diffs to decide what to
// purge. Kept separate from the generator script so tests can call it with a
// different epoch and assert what moves.
//
// A digest changes only when something that page renders from changes, so a
// deploy that edits one post leaves the other posts' ETags alone. BUILD_DIGEST
// covers the code and styles every page shares: a component or CSS change
// necessarily moves every path digest, which is correct — any page could
// render differently.

import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative, sep } from "node:path";
import { parsePosts } from "../../src/lib/post-meta.mjs";

// Paths rendered by dedicated page components rather than the shared post
// page, mapped to the content file each one renders. The components
// themselves ride along in BUILD_DIGEST.
const CUSTOM_PAGE_CONTENT = {
  "/solar-report/full-report": "full-report.md",
  "/nev-mileage/full-report": "nev-full-report.md",
};

// Rendered from the whole post set rather than one content file.
const INDEX_PATHS = ["/", "/rss.xml", "/sitemap.xml"];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function digest(...parts) {
  return sha256(parts.join(" ")).slice(0, 16);
}

export async function listFiles(directory) {
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

function posixPath(absolute, base) {
  return relative(base, absolute).split(sep).join("/");
}

// Everything whose bytes can change any rendered page: the app layer, the
// shared libraries, the stylesheets, and the workerd adapter. The generated
// output lives in workers/ and is not matched — hashing it would make the
// build non-idempotent.
async function buildDigest(repoRoot, epoch) {
  const roots = [
    { dir: join(repoRoot, "app"), match: (name) => /\.(ts|tsx)$/.test(name) },
    { dir: join(repoRoot, "src/lib"), match: (name) => /\.(ts|mjs)$/.test(name) },
    { dir: join(repoRoot, "workers"), match: (name) => name === "remix-app.ts" },
  ];

  const hashes = [];
  for (const { dir, match } of roots) {
    for (const path of await listFiles(dir)) {
      if (!match(path.split(sep).pop())) {
        continue;
      }
      hashes.push([posixPath(path, repoRoot), sha256(await readFile(path))]);
    }
  }

  for (const stylesheet of ["src/styles.css", "src/code-highlight.css"]) {
    hashes.push([stylesheet, sha256(await readFile(join(repoRoot, stylesheet)))]);
  }

  hashes.sort(([left], [right]) => left.localeCompare(right));
  return digest(epoch, ...hashes.map(([path, hash]) => `${path}:${hash}`));
}

/**
 * @param {string} repoRoot
 * @param {string} epoch  CACHE_EPOCH; changing it moves every digest.
 * @returns {Promise<{ build: string, paths: Record<string, string>, assets: Record<string, string> }>}
 */
export async function computeDigests(repoRoot, epoch) {
  const contentDir = join(repoRoot, "src/content");
  const contentEntries = await Promise.all(
    (await listFiles(contentDir))
      .filter((path) => [".md", ".mdx"].includes(extname(path)))
      .map(async (path) => [
        posixPath(path, contentDir),
        await readFile(path, "utf8"),
      ]),
  );
  const contentByFile = new Map(contentEntries);
  const posts = parsePosts(contentEntries, { includeRouteOnly: true });

  const build = await buildDigest(repoRoot, epoch);
  const paths = {};

  for (const post of posts) {
    paths[post.href] = digest(build, contentByFile.get(post.contentFile) ?? "");
  }

  for (const [href, contentFile] of Object.entries(CUSTOM_PAGE_CONTENT)) {
    const source = contentByFile.get(contentFile);
    if (source === undefined) {
      throw new Error(`Missing content file for ${href}: ${contentFile}`);
    }
    paths[href] = digest(build, source);
  }

  // The index pages render titles, descriptions and dates rather than bodies,
  // so they hash the parsed frontmatter of every post. Editing a post's prose
  // leaves them untouched; editing its title moves all three.
  const indexDigest = digest(
    build,
    JSON.stringify(
      posts
        .map((post) => ({
          href: post.href,
          feed: post.feed,
          route: post.route,
          eyebrow: post.eyebrow,
          title: post.title,
          description: post.description,
          datePublished: post.datePublished,
          dateModified: post.dateModified,
          category: post.category,
          sectionBlurb: post.sectionBlurb ?? null,
          sectionOrder: post.sectionOrder,
          order: post.order,
        }))
        .sort((left, right) => left.href.localeCompare(right.href)),
    ),
  );
  for (const href of INDEX_PATHS) {
    paths[href] = indexDigest;
  }

  // Non-fingerprinted static files. Served by Workers Assets rather than the
  // Worker, so no deploy retires them the way version keying retires a
  // document — the reconcile needs to know when their bytes change. /assets/*
  // is deliberately absent, being content-addressed already.
  const publicDir = join(repoRoot, "public");
  const assets = {};
  for (const path of await listFiles(publicDir)) {
    const pathname = `/${posixPath(path, publicDir)}`;
    if (pathname === "/.nojekyll") {
      continue;
    }
    assets[pathname] = digest(await readFile(path));
  }

  return { build, paths, assets };
}
