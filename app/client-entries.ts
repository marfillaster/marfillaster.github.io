// -----------------------------------------------------------------------------
// Single source of truth mapping client-entry ids (the strings passed to
// clientEntry(id, ...) in app/interactive.tsx) to their precompiled browser
// module URL + export name. Built into .remix-assets/assets/entries/ by
// scripts/build-remix-assets.mjs (content-fingerprinted; hrefs come from the
// generated manifest); served statically by both adapters.
// -----------------------------------------------------------------------------

import { ASSET_MANIFEST } from "./assets-manifest.generated.ts";

export interface ClientEntryResolution {
  href: string;
  exportName: string;
}

const CLIENT_ENTRIES: Record<string, ClientEntryResolution> = {
  "theme-toggle": {
    href: ASSET_MANIFEST["theme-toggle"],
    exportName: "ThemeToggle",
  },
  "share-links": {
    href: ASSET_MANIFEST["share-links"],
    exportName: "ShareLinks",
  },
  "page-stats": {
    href: ASSET_MANIFEST["page-stats"],
    exportName: "PageStats",
  },
};

/** Browser boot module: calls run({ loadModule }) to hydrate client entries. */
export const CLIENT_BOOT_SCRIPT = ASSET_MANIFEST["boot"];

/** Framework-free progressive enhancement (code copy, Giscus, hash redirects). */
export const ENHANCE_SCRIPT = ASSET_MANIFEST["enhance"];

export function resolveClientEntry(entryId: string): ClientEntryResolution {
  const hit = CLIENT_ENTRIES[entryId];
  if (!hit) {
    throw new Error(`Unknown client entry: ${entryId}`);
  }
  return hit;
}
