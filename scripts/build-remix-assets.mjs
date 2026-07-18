// Builds the .remix-assets/ static dir for the Remix adapters (gitignored):
//   - copies public/ (minus rss.xml + sitemap.xml, which are rendered routes)
//   - compiles src/styles.css with the Tailwind v4 CLI → assets/styles.css
//   - copies src/code-highlight.css → assets/code-highlight.css
// Run via `pnpm remix:assets`.

import { cp, mkdir, rm } from "node:fs/promises";
import { execSync } from "node:child_process";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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

console.log("built .remix-assets/");
