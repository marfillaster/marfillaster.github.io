// Browser boot module: scans the server-rendered page for client-entry
// markers and hydrates each by dynamically importing its precompiled module.
// Precompiled to /assets/entries/boot.js by scripts/build-remix-assets.mjs.

import { run } from "remix/ui";

const app = run({
  async loadModule(moduleUrl: string, exportName: string) {
    const mod = await import(moduleUrl);
    return mod[exportName];
  },
});

app.addEventListener("error", (event: Event & { error?: unknown }) => {
  console.error("component error:", event.error);
});
