// Build-time half of the Workers asset adapter. Remix's asset server
// (remix/assets) compiles browser modules on demand, which needs Node: its
// compilers (oxc, lightningcss) are native addons and it reads source from
// disk. Workers have neither, so this runs the real asset server once at build
// time and writes what it would have served into the static asset directory.
// The runtime half is app/script-manifest.ts and app/client-entries.ts, which
// hand the recorded getScriptEntry() results to the renderer.
//
// Files keep the exact URLs the asset server chose. Emitted modules import
// each other with relative and root-relative specifiers that resolve to the
// stable (unfingerprinted) URLs, and the import map points those at the
// fingerprinted files — so moving a file would break resolution.

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const ORIGIN = "http://assets.invalid";

// Workers Assets answers a path with a raw "@" (the asset server's ".@<hash>"
// fingerprint segment) with a 307 to its percent-encoded form, which would
// cost every module a redirect. Record fingerprinted URLs in that canonical
// form. Stable URLs stay as the asset server wrote them, since emitted modules
// import by exactly those strings and the import map keys must match.
function canonical(url) {
  return url
    .split("/")
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    .join("/");
}

// Static and dynamic import specifiers with a string literal. Run over the
// asset server's own (minified) output, only to verify the export is closed.
const SPECIFIER = /(?:\bfrom|\bimport)\s*\(?\s*["']([^"']+)["']/g;

/**
 * @param {object} options
 * @param {import("remix/assets").AssetServer} options.assetServer
 *   Created with fingerprint: true and watch: false.
 * @param {Record<string, string>} options.entries Logical name → entry file.
 * @param {string} options.outDir Static asset directory (file paths are
 *   the decoded URL paths beneath it).
 * @returns {Promise<{ entries: Record<string, { href: string, preloads: string[], importMap: { imports: Record<string, string> } }>, files: number, bytes: number }>}
 */
export async function exportScriptEntries({ assetServer, entries, outDir }) {
  const result = {};
  // Canonical URL → the URL the asset server itself answers to.
  const sourceUrls = new Map();
  const urls = new Set();
  const stableUrls = new Set();

  for (const [name, file] of Object.entries(entries)) {
    const entry = await assetServer.getScriptEntry(file);
    const imports = entry.importMap?.imports ?? {};
    for (const url of [entry.href, ...entry.preloads, ...Object.values(imports)]) {
      sourceUrls.set(canonical(url), url);
    }
    result[name] = {
      href: canonical(entry.href),
      preloads: entry.preloads.map(canonical),
      importMap: {
        imports: Object.fromEntries(
          Object.entries(imports).map(([stable, url]) => [stable, canonical(url)]),
        ),
      },
    };
    urls.add(result[name].href);
    for (const url of result[name].preloads) urls.add(url);
    for (const [stable, fingerprinted] of Object.entries(result[name].importMap.imports)) {
      stableUrls.add(stable);
      urls.add(fingerprinted);
    }
  }

  let bytes = 0;
  const missing = [];
  for (const url of [...urls].sort()) {
    const response = await assetServer.fetch(new Request(ORIGIN + sourceUrls.get(url)));
    if (!response?.ok) {
      throw new Error(`Asset server answered ${response?.status ?? "nothing"} for ${url}`);
    }
    const body = new Uint8Array(await response.arrayBuffer());
    bytes += body.byteLength;

    const path = join(outDir, decodeURIComponent(url));
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, body);

    // Every import must land on a file this export wrote, directly or through
    // the import map. A miss means a module the browser would 404 on.
    const source = new TextDecoder().decode(body);
    for (const [, specifier] of source.matchAll(SPECIFIER)) {
      if (specifier.includes("${")) {
        continue; // computed at runtime (boot's loadModule, frame sources)
      }
      if (!specifier.startsWith("/") && !specifier.startsWith(".")) {
        missing.push(`${url}: bare specifier "${specifier}"`);
        continue;
      }
      const resolved = new URL(specifier, ORIGIN + url).pathname;
      if (!stableUrls.has(resolved) && !urls.has(resolved)) {
        missing.push(`${url}: "${specifier}" → ${resolved}`);
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(`Exported modules import files outside the export:\n${missing.join("\n")}`);
  }

  return { entries: result, files: urls.size, bytes };
}
