// -----------------------------------------------------------------------------
// Runtime half of the Workers asset adapter: maps client-entry ids (the
// strings passed to clientEntry(id, ...) in app/interactive.tsx) to what
// Remix's asset server returned from getScriptEntry() at build time
// (scripts/lib/export-script-entries.mjs). The renderer merges each rendered
// entry's import map into the document's <ImportMap> and adds its preloads to
// <head>; the modules themselves are static files in .remix-assets/.
// -----------------------------------------------------------------------------

import {
  DOCUMENT_SCRIPTS,
  SCRIPT_ENTRIES,
  type ImportMapImports,
} from "./assets-manifest.generated.ts";

export interface ClientEntryResolution {
  href: string;
  exportName: string;
  /** Modules to <link rel="modulepreload"> on pages that render this entry. */
  preloads: string[];
  /** Merged into the document's import map on pages that render this entry. */
  importMap: ImportMapImports;
}

const EXPORT_NAMES: Record<string, string> = {
  "theme-toggle": "ThemeToggle",
  "share-links": "ShareLinks",
  "page-stats": "PageStats",
  comments: "CommentsThread",
};

/** Import map, preloads and module scripts every page loads. */
export { DOCUMENT_SCRIPTS };

/** The comments entry module, loaded directly by the standalone comments page. */
export const COMMENTS_SCRIPT = SCRIPT_ENTRIES.comments.href;

export function resolveClientEntry(entryId: string): ClientEntryResolution {
  const entry = SCRIPT_ENTRIES[entryId];
  const exportName = EXPORT_NAMES[entryId];
  if (!entry || !exportName) {
    throw new Error(`Unknown client entry: ${entryId}`);
  }
  return { ...entry, exportName };
}
