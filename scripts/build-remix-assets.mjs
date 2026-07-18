// Builds the .remix-assets/ static dir for the Remix adapters (gitignored):
//   - copies public/ (minus rss.xml + sitemap.xml, which are rendered routes)
//   - compiles src/styles.css with the Tailwind v4 CLI → assets/styles.css
//   - copies src/code-highlight.css → assets/code-highlight.css
//   - precompiles the browser client entries (boot + one module per
//     clientEntry id + the framework-free enhance script) with esbuild →
//     assets/entries/ (see app/client-entries.ts for the id → URL map)
// Run via `pnpm remix:assets`.

import { cp, mkdir, rm } from "node:fs/promises";
import { execSync } from "node:child_process";
import { join, resolve } from "node:path";
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

execSync(
  "pnpm exec tailwindcss -i src/styles.css -o .remix-assets/assets/styles.css --minify",
  { cwd: repoRoot, stdio: "inherit" },
);

await cp(join(repoRoot, "src/code-highlight.css"), join(outDir, "assets/code-highlight.css"));

await esbuild.build({
  entryPoints: {
    boot: join(repoRoot, "app/client/boot.ts"),
    enhance: join(repoRoot, "app/client/enhance.ts"),
    "theme-toggle": join(repoRoot, "app/client/theme-toggle.entry.ts"),
    "share-links": join(repoRoot, "app/client/share-links.entry.ts"),
    "page-stats": join(repoRoot, "app/client/page-stats.entry.ts"),
  },
  outdir: join(outDir, "assets/entries"),
  bundle: true,
  splitting: true, // shares the remix/ui runtime as one chunk
  format: "esm",
  platform: "browser",
  target: ["es2022"],
  jsx: "automatic",
  jsxImportSource: "remix/ui",
  entryNames: "[name]",
  chunkNames: "chunk-[hash]",
  minify: true,
  sourcemap: false,
  logLevel: "info",
});

console.log("built .remix-assets/");
