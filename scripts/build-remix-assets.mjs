// Builds the .remix-assets/ static dir for the Remix adapters (gitignored):
//   - copies public/ (minus rss.xml + sitemap.xml, which are rendered routes)
//   - compiles src/styles.css with the Tailwind v4 CLI → assets/styles-<hash>.css
//   - copies src/code-highlight.css → assets/code-highlight-<hash>.css
//   - exports the browser scripts (boot, enhance, one module per clientEntry
//     id) from Remix's asset server, at the URLs it serves them under
//     (assets/app/..., assets/npm/...; see scripts/lib/export-script-entries.mjs)
//   - writes a _headers file so Workers Assets serves /assets/* immutable
//   - regenerates app/assets-manifest.generated.ts (committed) mapping logical
//     asset names to their fingerprinted hrefs
// Run via `pnpm remix:assets`.

import { cp, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createAssetServer } from "remix/assets";
import { loadConfig } from "remix/cli";
import { exportScriptEntries } from "./lib/export-script-entries.mjs";

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

// Browser scripts: Remix's asset server, run once here and written into the
// static dir (scripts/lib/export-script-entries.mjs). Config is remix.json,
// shared with the `remix assets` CLI. Fingerprints are content hashes, so an
// unchanged module keeps its URL across deploys.
const config = await loadConfig(repoRoot);
const assetServer = createAssetServer({
  ...config.assets,
  rootDir: repoRoot,
  fingerprint: true,
  minify: true,
  watch: false,
});

// Loaded on every page: the two document-level module scripts, plus
// theme-toggle (SiteShell renders it everywhere, so boot always imports it).
const DOCUMENT_ENTRIES = ["boot", "enhance", "theme-toggle"];

const exported = await exportScriptEntries({
  assetServer,
  outDir,
  entries: {
    boot: "app/client/boot.ts",
    enhance: "app/client/enhance.ts",
    "theme-toggle": "app/client/theme-toggle.entry.ts",
    "share-links": "app/client/share-links.entry.ts",
    "page-stats": "app/client/page-stats.entry.ts",
    comments: "app/client/comments.entry.ts",
  },
});
await assetServer.close();

// One import map and preload list for the document-level scripts; each
// page-specific entry then carries only what it adds. The renderer merges an
// entry's import map into the document's <ImportMap> and adds its preloads to
// <head>, on pages that render the entry.
const documentImports = {};
const documentPreloads = [];
for (const name of DOCUMENT_ENTRIES) {
  const entry = exported.entries[name];
  Object.assign(documentImports, entry.importMap.imports);
  for (const url of entry.preloads) {
    if (!documentPreloads.includes(url)) documentPreloads.push(url);
  }
}

const scriptEntries = {};
for (const [name, entry] of Object.entries(exported.entries)) {
  if (name === "boot" || name === "enhance") continue;
  const imports = Object.fromEntries(
    Object.entries(entry.importMap.imports).filter(([stable]) => !(stable in documentImports)),
  );
  scriptEntries[name] = {
    href: entry.href,
    preloads: entry.preloads.filter((url) => !documentPreloads.includes(url)),
    importMap: { imports },
  };
}

console.log(
  `exported ${exported.files} browser modules (${(exported.bytes / 1024).toFixed(1)} KiB, ` +
    `${documentPreloads.length} on every page)`,
);

// Workers Assets honors a _headers file in the asset directory. Everything
// under /assets/ is content-fingerprinted (immutable); other static files
// (images, og.png, downloads) get a modest TTL. Matching rules combine
// (values comma-join), so the /assets/* rule must detach the broad rule's
// Cache-Control with `!` before setting its own. The raw-markdown downloads
// duplicate their full-report pages, so they are kept out of the index.
await writeFile(
  join(outDir, "_headers"),
  `/*
  Cache-Control: public, max-age=3600
/assets/*
  ! Cache-Control
  Cache-Control: public, max-age=31536000, immutable
/assets/app/*
  ! Content-Type
  Content-Type: text/javascript; charset=utf-8
/solar-report/full-report.md
  X-Robots-Tag: noindex
/nev-mileage/full-report.md
  X-Robots-Tag: noindex
`,
);

const manifestModule = `// Generated by scripts/build-remix-assets.mjs — do not edit by hand.
// Fingerprinted hrefs for the stylesheets, and the recorded getScriptEntry()
// results for the browser scripts (scripts/lib/export-script-entries.mjs).
// Committed so the app layer stays importable without a prior asset build;
// \`pnpm remix:assets\` rewrites it.

export const ASSET_MANIFEST: Record<string, string> = ${JSON.stringify(
  Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b))),
  null,
  2,
)};

export interface ImportMapImports {
  imports: Record<string, string>;
}

export interface ScriptEntry {
  href: string;
  preloads: string[];
  importMap: ImportMapImports;
}

/**
 * The document-level module scripts, plus the import map and preloads (in
 * dependency order) for everything loaded on every page.
 */
export const DOCUMENT_SCRIPTS: {
  boot: string;
  enhance: string;
  importMap: ImportMapImports;
  preloads: string[];
} = ${JSON.stringify(
  {
    boot: exported.entries.boot.href,
    enhance: exported.entries.enhance.href,
    importMap: { imports: documentImports },
    preloads: documentPreloads,
  },
  null,
  2,
)};

/** Client entries, each with only what it adds to DOCUMENT_SCRIPTS. */
export const SCRIPT_ENTRIES: Record<string, ScriptEntry> = ${JSON.stringify(scriptEntries, null, 2)};
`;
await writeFile(join(repoRoot, "app/assets-manifest.generated.ts"), manifestModule);

console.log("built .remix-assets/ and app/assets-manifest.generated.ts");
