// -----------------------------------------------------------------------------
// What the document needs to load the browser scripts: getScriptEntry()
// results from Remix's asset server, split into the part every page loads and
// what each client entry adds. Both adapters produce one through
// Platform.scripts — the workerd adapter from the build-time export
// (app/assets-manifest.generated.ts), the Node adapter from a live asset
// server — so the app renders the same way on either.
// -----------------------------------------------------------------------------

export interface ImportMapImports {
  imports: Record<string, string>;
}

/** The parts of an asset server getScriptEntry() result the renderer uses. */
export interface ScriptEntry {
  href: string;
  preloads: string[];
  importMap: ImportMapImports;
}

export interface DocumentScripts {
  /** Module scripts the document always loads. */
  boot: string;
  enhance: string;
  /** Rendered as the document's <ImportMap>; entries' maps merge into it. */
  importMap: ImportMapImports;
  /** Every module the document-level scripts load, in dependency order. */
  preloads: string[];
}

export interface ScriptManifest {
  document: DocumentScripts;
  /** Client entries by id, each with only what it adds to `document`. */
  entries: Record<string, ScriptEntry>;
}

/** Browser script sources, by logical name, relative to the repo root. */
export const SCRIPT_FILES = {
  boot: "app/client/boot.ts",
  enhance: "app/client/enhance.ts",
  "theme-toggle": "app/client/theme-toggle.entry.ts",
  "share-links": "app/client/share-links.entry.ts",
  "page-stats": "app/client/page-stats.entry.ts",
  comments: "app/client/comments.entry.ts",
} as const;

export type ScriptName = keyof typeof SCRIPT_FILES;

// Loaded on every page: the two document-level module scripts, plus
// theme-toggle (SiteShell renders it everywhere, so boot always imports it).
const DOCUMENT_ENTRIES: ScriptName[] = ["boot", "enhance", "theme-toggle"];

export function buildScriptManifest(
  entries: Record<ScriptName, ScriptEntry>,
): ScriptManifest {
  const imports: Record<string, string> = {};
  const preloads: string[] = [];
  for (const name of DOCUMENT_ENTRIES) {
    Object.assign(imports, entries[name].importMap.imports);
    for (const url of entries[name].preloads) {
      if (!preloads.includes(url)) preloads.push(url);
    }
  }

  const clientEntries: Record<string, ScriptEntry> = {};
  for (const [name, entry] of Object.entries(entries)) {
    if (name === "boot" || name === "enhance") continue;
    clientEntries[name] = {
      href: entry.href,
      preloads: entry.preloads.filter((url) => !preloads.includes(url)),
      importMap: {
        imports: Object.fromEntries(
          Object.entries(entry.importMap.imports).filter(([stable]) => !(stable in imports)),
        ),
      },
    };
  }

  return {
    document: {
      boot: entries.boot.href,
      enhance: entries.enhance.href,
      importMap: { imports },
      preloads,
    },
    entries: clientEntries,
  };
}
