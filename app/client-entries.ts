// -----------------------------------------------------------------------------
// Single source of truth mapping client-entry ids (the strings passed to
// clientEntry(id, ...) in app/interactive.tsx) to their precompiled browser
// module URL + export name. Built into .remix-assets/assets/entries/ by
// scripts/build-remix-assets.mjs; served statically by both adapters.
// -----------------------------------------------------------------------------

export interface ClientEntryResolution {
  href: string;
  exportName: string;
}

const CLIENT_ENTRIES: Record<string, ClientEntryResolution> = {
  "theme-toggle": {
    href: "/assets/entries/theme-toggle.js",
    exportName: "ThemeToggle",
  },
  "share-links": {
    href: "/assets/entries/share-links.js",
    exportName: "ShareLinks",
  },
  "page-stats": {
    href: "/assets/entries/page-stats.js",
    exportName: "PageStats",
  },
};

/** Browser boot module: calls run({ loadModule }) to hydrate client entries. */
export const CLIENT_BOOT_SCRIPT = "/assets/entries/boot.js";

/** Framework-free progressive enhancement (code copy, Giscus, hash redirects). */
export const ENHANCE_SCRIPT = "/assets/entries/enhance.js";

export function resolveClientEntry(entryId: string): ClientEntryResolution {
  const hit = CLIENT_ENTRIES[entryId];
  if (!hit) {
    throw new Error(`Unknown client entry: ${entryId}`);
  }
  return hit;
}
