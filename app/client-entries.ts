// -----------------------------------------------------------------------------
// Maps client-entry ids (the strings passed to clientEntry(id, ...) in
// app/interactive.tsx) to the asset server's script entries, for
// renderToStream's resolveClientEntry. The renderer merges each rendered
// entry's import map into the document's <ImportMap> and adds its preloads to
// <head>.
// -----------------------------------------------------------------------------

import type { ScriptManifest } from "./script-manifest.ts";

const EXPORT_NAMES: Record<string, string> = {
  "theme-toggle": "ThemeToggle",
  "share-links": "ShareLinks",
  "page-stats": "PageStats",
  comments: "CommentsThread",
};

export function createClientEntryResolver(scripts: ScriptManifest) {
  return (entryId: string) => {
    const entry = scripts.entries[entryId];
    const exportName = EXPORT_NAMES[entryId];
    if (!entry || !exportName) {
      throw new Error(`Unknown client entry: ${entryId}`);
    }
    return { ...entry, exportName };
  };
}
