import { useEffect, useRef } from "react";

/**
 * Giscus-backed comments (GitHub Discussions).
 *
 * Setup that lives outside this repo (one-time):
 *  1. The repo is public and Discussions is enabled.
 *  2. The giscus GitHub App is installed on marfillaster.github.io:
 *     https://github.com/apps/giscus
 *
 * The config below was generated from https://giscus.app for this repo.
 * `mapping="pathname"` gives each post its own discussion thread, created
 * lazily on the first comment.
 */

const GISCUS_CONFIG = {
  repo: "marfillaster/marfillaster.github.io",
  repoId: "R_kgDOSeDLPQ",
  category: "Announcements",
  categoryId: "DIC_kwDOSeDLPc4C9JGC",
} as const;

function currentGiscusTheme(): string {
  return document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
}

function postThemeToGiscus(theme: string) {
  const iframe = document.querySelector<HTMLIFrameElement>(
    "iframe.giscus-frame",
  );
  iframe?.contentWindow?.postMessage(
    { giscus: { setConfig: { theme } } },
    "https://giscus.app",
  );
}

export function Comments() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || container.querySelector("script")) return;

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

    // Keep giscus in sync with the site's manual dark/light toggle, which
    // flips the `dark` class on <html> (see useTheme in doc.tsx).
    const observer = new MutationObserver(() =>
      postThemeToGiscus(currentGiscusTheme()),
    );
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      aria-label="Comments"
      className="mt-16 scroll-mt-20 border-t pt-10"
      id="comments"
    >
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Comments
      </p>
      <p className="mt-3 text-sm text-muted-foreground">
        Comments are powered by GitHub Discussions and require a free GitHub
        account to post.
      </p>
      <div ref={containerRef} className="mt-6" />
    </section>
  );
}
