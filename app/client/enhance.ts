// Framework-free progressive enhancement over the server-rendered page:
//   - code-copy buttons (clipboard over the Shiki-rendered <figure> blocks)
//   - Giscus comment embed + dark/light theme sync
//   - legacy hash redirects (fragments never reach the server, so these must
//     stay client-side even under SSR)
// Precompiled to /assets/entries/enhance.js by scripts/build-remix-assets.mjs.

// --- Code copy (port of src/components/code-copy.tsx, event-delegated) ------

const copyTimeouts = new WeakMap<HTMLButtonElement, number>();

async function copyCode(button: HTMLButtonElement) {
  const code = button.closest("figure")?.querySelector("pre")?.textContent ?? "";

  try {
    await navigator.clipboard.writeText(code);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = code;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }

  button.classList.add("copied");
  window.clearTimeout(copyTimeouts.get(button));
  copyTimeouts.set(
    button,
    window.setTimeout(() => button.classList.remove("copied"), 1400),
  );
}

document.addEventListener("click", (event) => {
  const button = (event.target as Element | null)?.closest?.(
    "button.code-copy",
  ) as HTMLButtonElement | null;
  if (button) {
    void copyCode(button);
  }
});

// --- Giscus comments (port of src/components/comments.tsx) ------------------

const GISCUS_CONFIG = {
  repo: "marfillaster/marfillaster.github.io",
  repoId: "R_kgDOSeDLPQ",
  category: "Announcements",
  categoryId: "DIC_kwDOSeDLPc4C9JGC",
} as const;

function currentGiscusTheme(): string {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function postThemeToGiscus(theme: string) {
  const iframe = document.querySelector<HTMLIFrameElement>("iframe.giscus-frame");
  iframe?.contentWindow?.postMessage(
    { giscus: { setConfig: { theme } } },
    "https://giscus.app",
  );
}

function mountGiscus() {
  const container = document.querySelector<HTMLElement>("[data-giscus]");
  if (!container || container.querySelector("script")) {
    return;
  }

  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.setAttribute("data-repo", GISCUS_CONFIG.repo);
  script.setAttribute("data-repo-id", GISCUS_CONFIG.repoId);
  script.setAttribute("data-category", GISCUS_CONFIG.category);
  script.setAttribute("data-category-id", GISCUS_CONFIG.categoryId);
  script.setAttribute("data-mapping", "pathname");
  script.setAttribute("data-strict", "0");
  script.setAttribute("data-reactions-enabled", "1");
  script.setAttribute("data-emit-metadata", "0");
  script.setAttribute("data-input-position", "top");
  script.setAttribute("data-theme", currentGiscusTheme());
  script.setAttribute("data-lang", "en");
  script.setAttribute("data-loading", "lazy");
  container.appendChild(script);

  // Keep giscus in sync with the manual dark/light toggle, which flips the
  // `dark` class on <html> (see ThemeToggle in app/interactive.tsx).
  new MutationObserver(() => postThemeToGiscus(currentGiscusTheme())).observe(
    document.documentElement,
    { attributes: true, attributeFilter: ["class"] },
  );
}

mountGiscus();

// --- Legacy hash redirects (port of HashRedirects in src/lib/post-route.tsx) --

interface HashRedirect {
  exact?: string;
  prefix?: string;
  toPath: string;
}

function applyHashRedirects() {
  const config = document.getElementById("hash-redirects");
  if (!config?.textContent) {
    return;
  }

  let redirects: HashRedirect[];
  try {
    redirects = JSON.parse(config.textContent);
  } catch {
    return;
  }

  const hash = window.location.hash.replace(/^#/, "");
  const redirect = redirects.find(
    (candidate) =>
      (candidate.exact && hash === candidate.exact) ||
      (candidate.prefix && hash.startsWith(candidate.prefix)),
  );

  if (!redirect) {
    return;
  }

  const targetHash = redirect.exact === hash ? "" : window.location.hash;
  window.location.replace(`${redirect.toPath}${targetHash}`);
}

applyHashRedirects();
