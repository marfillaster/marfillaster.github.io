// Browser boot module: scans the server-rendered page for client-entry
// markers and hydrates each by dynamically importing its precompiled module.
// Precompiled to /assets/entries/boot.js by scripts/build-remix-assets.mjs.

import { run } from "remix/ui";

// run() installs a Navigation API interceptor for frame-targeted links. Keep
// ordinary links on full-document navigation, which is this site's caching
// model, while allowing explicitly targeted frame navigation through.
(window as { navigation?: EventTarget }).navigation?.addEventListener(
  "navigate",
  (event) => {
    const source = (event as { sourceElement?: unknown }).sourceElement;
    const link = source instanceof Element ? source.closest("a, area") : null;
    if (link?.hasAttribute("rmx-target")) return;
    event.stopImmediatePropagation();
  },
);

const app = run({
  async loadModule(moduleUrl: string, exportName: string) {
    const mod = await import(moduleUrl);
    return mod[exportName];
  },
  async resolveFrame(src: string, signal?: AbortSignal) {
    const response = await fetch(src, {
      signal,
      headers: { Accept: "text/html" },
    });
    if (!response.ok) throw new Error(`frame fetch ${response.status}`);
    return response.text();
  },
});

app.addEventListener("error", (event: Event & { error?: unknown }) => {
  console.error("component error:", event.error);
});
