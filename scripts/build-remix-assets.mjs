// Builds the .remix-assets/ static dir for the Remix adapters (gitignored):
//   - copies public/ (minus rss.xml + sitemap.xml, which are rendered routes)
//   - compiles src/styles.css with the Tailwind v4 CLI → assets/styles-<hash>.css
//   - copies src/code-highlight.css → assets/code-highlight-<hash>.css
//   - precompiles the browser client entries (boot + one module per
//     clientEntry id + the framework-free enhance script) with esbuild →
//     assets/entries/<name>-<hash>.js (see app/client-entries.ts)
//   - writes a _headers file so Workers Assets serves /assets/* immutable
//   - regenerates app/assets-manifest.generated.ts (committed) mapping logical
//     asset names to their fingerprinted hrefs
// Run via `pnpm remix:assets`.

import { cp, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const repoRoot = resolve(fileURLToPath(import.meta.url), "../..");
const outDir = join(repoRoot, ".remix-assets");

await rm(outDir, { recursive: true, force: true });
await mkdir(join(outDir, "assets"), { recursive: true });

await cp(join(repoRoot, "public"), outDir, {
  recursive: true,
  filter: (src) => !src.endsWith(`${join("public", "rss.xml")}`) && !src.endsWith(`${join("public", "sitemap.xml")}`),
});

const manifest = {};

// Content-fingerprint a built CSS file: rename to <stem>-<hash>.css and
// record the logical name → href mapping.
async function fingerprintCss(logicalName, builtPath) {
  const content = await readFile(builtPath);
  const hash = createHash("sha256").update(content).digest("hex").slice(0, 8);
  const hashedName = basename(builtPath).replace(/\.css$/, `-${hash}.css`);
  await rename(builtPath, join(outDir, "assets", hashedName));
  manifest[logicalName] = `/assets/${hashedName}`;
}

execSync(
  "pnpm exec tailwindcss -i src/styles.css -o .remix-assets/assets/styles.css --minify",
  { cwd: repoRoot, stdio: "inherit" },
);
await fingerprintCss("styles.css", join(outDir, "assets/styles.css"));

await cp(join(repoRoot, "src/code-highlight.css"), join(outDir, "assets/code-highlight.css"));
await fingerprintCss("code-highlight.css", join(outDir, "assets/code-highlight.css"));

const built = await esbuild.build({
  entryPoints: {
    boot: join(repoRoot, "app/client/boot.ts"),
    enhance: join(repoRoot, "app/client/enhance.ts"),
    "theme-toggle": join(repoRoot, "app/client/theme-toggle.entry.ts"),
    "share-links": join(repoRoot, "app/client/share-links.entry.ts"),
    "page-stats": join(repoRoot, "app/client/page-stats.entry.ts"),
    comments: join(repoRoot, "app/client/comments.entry.ts"),
  },
  outdir: join(outDir, "assets/entries"),
  bundle: true,
  splitting: true, // shares the remix/ui runtime as one chunk
  format: "esm",
  platform: "browser",
  target: ["es2022"],
  jsx: "automatic",
  jsxImportSource: "remix/ui",
  entryNames: "[name]-[hash]",
  chunkNames: "chunk-[hash]",
  minify: true,
  sourcemap: false,
  metafile: true,
  logLevel: "info",
});

const outputs = built.metafile.outputs;
const outputPathFor = {};
for (const [outputPath, output] of Object.entries(outputs)) {
  if (!output.entryPoint) {
    continue;
  }
  const logicalName = basename(output.entryPoint).replace(/(\.entry)?\.ts$/, "");
  manifest[logicalName] = outputPath.replace(/^\.remix-assets/, "");
  outputPathFor[logicalName] = outputPath;
}

// Modules every page loads: the two document-level <script type=module> tags,
// plus theme-toggle (SiteShell renders it on every page, so boot always
// dynamically imports it). Walking their transitive *static* imports picks up
// the shared remix/ui runtime chunk, which every other client entry depends on
// too — so preloading this set also flattens the waterfall for the
// page-specific entries (share-links, page-stats, comments).
//
// Without these hints the browser can't discover the runtime chunk until it
// has parsed boot.js, and can't discover theme-toggle until boot has run and
// scanned the DOM for entry markers: four sequential round-trips. The
// generated PRELOAD_MODULES list is emitted as <link rel=modulepreload> by
// app/document.tsx, collapsing that to one.
const ALWAYS_LOADED = ["boot", "enhance", "theme-toggle"];
const preloadModules = [];
const visited = new Set();

function collectPreloads(outputPath) {
  if (visited.has(outputPath) || !outputs[outputPath]) {
    return;
  }
  visited.add(outputPath);
  // Depth-first, so shared chunks are listed ahead of the modules importing
  // them — the order the browser wants to start fetches in.
  for (const imported of outputs[outputPath].imports ?? []) {
    if (imported.kind === "import-statement") {
      collectPreloads(imported.path);
    }
  }
  preloadModules.push(outputPath.replace(/^\.remix-assets/, ""));
}

for (const logicalName of ALWAYS_LOADED) {
  const outputPath = outputPathFor[logicalName];
  if (!outputPath) {
    throw new Error(`No build output for always-loaded entry: ${logicalName}`);
  }
  collectPreloads(outputPath);
}

// Workers Assets honors a _headers file in the asset directory. Everything
// under /assets/ is content-fingerprinted (immutable); other static files
// (images, og.png, downloads) get a modest TTL. Matching rules combine
// (values comma-join), so the /assets/* rule must detach the broad rule's
// Cache-Control with `!` before setting its own.
await writeFile(
  join(outDir, "_headers"),
  `/*
  Cache-Control: public, max-age=3600
/assets/*
  ! Cache-Control
  Cache-Control: public, max-age=31536000, immutable
`,
);

const manifestModule = `// Generated by scripts/build-remix-assets.mjs — do not edit by hand.
// Maps logical asset names to their content-fingerprinted hrefs. Committed so
// the app layer (client-entries.ts, document.tsx) stays importable without a
// prior asset build; \`pnpm remix:assets\` rewrites it.
export const ASSET_MANIFEST: Record<string, string> = ${JSON.stringify(
  Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b))),
  null,
  2,
)};

// Modules loaded on every page (boot + enhance + theme-toggle and the shared
// runtime chunks they pull in), in dependency order. Emitted as
// <link rel="modulepreload"> so the browser starts all of them in parallel
// instead of discovering each one a round-trip at a time.
export const PRELOAD_MODULES: string[] = ${JSON.stringify(preloadModules, null, 2)};
`;
await writeFile(join(repoRoot, "app/assets-manifest.generated.ts"), manifestModule);

console.log("built .remix-assets/ and app/assets-manifest.generated.ts");
