// SEO parity sweep (Phase 4): diffs title / meta / OG / canonical / ld+json /
// heading ids between the prerendered RR7 build (build/client) and the Remix
// Node adapter. The RR7 build is the reference; drift is fixed on the Remix
// side.
//
// Usage: pnpm build (or an existing build/client), pnpm remix:assets,
// pnpm dev:remix in another shell, then:
//   node scripts/seo-parity.mjs [http://localhost:3000]

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(import.meta.url), "../..");
const buildDir = join(repoRoot, "build/client");
const baseUrl = process.argv[2] ?? "http://localhost:3000";

if (!existsSync(buildDir)) {
  console.error("seo-parity: build/client not found — run `pnpm build` first");
  process.exit(1);
}

function findRoutes(dir) {
  const routes = [];
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) {
        walk(path);
      } else if (entry.name === "index.html") {
        const rel = relative(buildDir, current).split(sep).join("/");
        routes.push(rel === "" ? "/" : `/${rel}/`);
      }
    }
  };
  walk(dir);
  return routes.sort();
}

// --- extraction (regex over controlled, self-generated HTML) ---------------

function decodeEntities(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'");
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`${name}="([^"]*)"`));
  return match ? decodeEntities(match[1]) : undefined;
}

function extract(html) {
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";

  const title = decodeEntities(head.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");

  const metas = {};
  for (const tag of head.match(/<meta [^>]*>/g) ?? []) {
    const key = attr(tag, "name") ?? attr(tag, "property");
    if (key && !["viewport", "theme-color"].includes(key)) {
      metas[key] = attr(tag, "content");
    }
  }

  const canonical = (head.match(/<link [^>]*rel="canonical"[^>]*>/g) ?? [])
    .map((tag) => attr(tag, "href"))[0];

  const ldjson = (head.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  ) ?? [])
    .map((block) =>
      JSON.parse(block.replace(/<\/?script[^>]*>/g, "")),
    )
    .sort((a, b) => String(a["@type"]).localeCompare(String(b["@type"])));

  const headingIds = [
    ...html.matchAll(/<h[1-6][^>]*\bid="([^"]*)"/g),
  ].map((match) => match[1]);

  return { title, metas, canonical, ldjson, headingIds };
}

// --- diff -------------------------------------------------------------------

function diffRoute(route, rr7, remix) {
  const problems = [];
  const note = (what, a, b) =>
    problems.push(`  ${what}:\n    rr7:   ${a}\n    remix: ${b}`);

  if (rr7.title !== remix.title) {
    note("title", rr7.title, remix.title);
  }
  if (rr7.canonical !== remix.canonical) {
    note("canonical", rr7.canonical, remix.canonical);
  }
  const metaKeys = new Set([...Object.keys(rr7.metas), ...Object.keys(remix.metas)]);
  for (const key of metaKeys) {
    if (rr7.metas[key] !== remix.metas[key]) {
      note(`meta[${key}]`, rr7.metas[key], remix.metas[key]);
    }
  }
  const a = JSON.stringify(rr7.ldjson);
  const b = JSON.stringify(remix.ldjson);
  if (a !== b) {
    note("ld+json", a, b);
  }
  const idsA = rr7.headingIds.join(",");
  const idsB = remix.headingIds.join(",");
  if (idsA !== idsB) {
    const setA = new Set(rr7.headingIds);
    const setB = new Set(remix.headingIds);
    const missing = rr7.headingIds.filter((id) => !setB.has(id));
    const extra = remix.headingIds.filter((id) => !setA.has(id));
    note(
      "heading ids",
      missing.length ? `missing in remix: ${missing.join(", ")}` : "(order only)",
      extra.length ? `extra in remix: ${extra.join(", ")}` : "(order only)",
    );
  }
  return problems;
}

const routes = findRoutes(buildDir);
let failures = 0;

for (const route of routes) {
  const rr7Html = readFileSync(join(buildDir, route, "index.html"), "utf8");

  const response = await fetch(`${baseUrl}${route}`, { redirect: "follow" });
  if (!response.ok) {
    console.log(`✗ ${route} — remix returned ${response.status}`);
    failures += 1;
    continue;
  }
  const remixHtml = await response.text();

  const problems = diffRoute(route, extract(rr7Html), extract(remixHtml));
  if (problems.length === 0) {
    console.log(`✓ ${route}`);
  } else {
    console.log(`✗ ${route}`);
    console.log(problems.join("\n"));
    failures += 1;
  }
}

console.log(
  `\nseo-parity: ${routes.length - failures}/${routes.length} routes clean`,
);
process.exit(failures === 0 ? 0 : 1);
