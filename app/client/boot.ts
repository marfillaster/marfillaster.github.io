// Browser boot module: scans the server-rendered page for client-entry
// markers and hydrates each by dynamically importing its precompiled module.
// Precompiled to /assets/entries/boot.js by scripts/build-remix-assets.mjs.

import { run } from "remix/ui";

// run() unconditionally installs a Navigation API interceptor that reroutes
// every same-origin link click through a frame reload — with no frame
// support wired up (resolveFrame is unimplemented here), the URL updates and
// nothing renders. Registering first and stopping propagation keeps clicks
// on default full-document navigation, which is this site's model.
(window as { navigation?: EventTarget }).navigation?.addEventListener(
  "navigate",
  (event) => event.stopImmediatePropagation(),
);

const app = run({
  async loadModule(moduleUrl: string, exportName: string) {
    const mod = await import(moduleUrl);
    return mod[exportName];
  },
});

app.addEventListener("error", (event: Event & { error?: unknown }) => {
  console.error("component error:", event.error);
});
