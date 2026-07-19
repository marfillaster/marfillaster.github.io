// -----------------------------------------------------------------------------
// Interactive client-entry components (Phase 3). Each is marked with
// clientEntry('<stable-id>', ...) — the id maps to a precompiled browser
// module via app/client-entries.ts. Setup code must be SSR-safe: it also runs
// on the server, where `document` does not exist; server output matches what
// the RR7 app emitted before hydration.
// -----------------------------------------------------------------------------

import { clientEntry, on, type EntryComponent, type Handle } from "remix/ui";
import {
  IconCheck,
  IconFacebook,
  IconLink2,
  IconLinkedin,
  IconMoon,
  IconSun,
  IconTwitter,
} from "./icons.tsx";

const inBrowser = typeof document !== "undefined";

// --- Theme toggle (port of useTheme/ThemeToggle in src/components/doc.tsx) ---

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", dark ? "#0c0a09" : "#fafaf9");
  localStorage.setItem("theme", dark ? "dark" : "light");
}

export const ThemeToggle: EntryComponent = clientEntry(
  "theme-toggle",
  function ThemeToggle(handle: Handle) {
    // The inline pre-paint script in document.tsx has already applied the
    // stored/system theme to <html>; hydration picks the state up from there.
    let dark = inBrowser && document.documentElement.classList.contains("dark");

    return () => (
      <button
        type="button"
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        className="text-muted-foreground/70 hover:text-foreground transition-colors"
        mix={on("click", () => {
          dark = !dark;
          applyTheme(dark);
          handle.update();
        })}
      >
        {dark ? <IconSun /> : <IconMoon />}
      </button>
    );
  },
);

// --- Share row (port of src/components/share.tsx) ---------------------------

export const ShareLinks: EntryComponent<{ url: string; title: string }> = clientEntry(
  "share-links",
  function ShareLinks(handle: Handle<{ url: string; title: string }>) {
    let copied = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    async function copyLink() {
      try {
        await navigator.clipboard.writeText(handle.props.url);
        copied = true;
        handle.update();
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          copied = false;
          handle.update();
        }, 2000);
      } catch {
        /* clipboard unavailable — no-op */
      }
    }

    return () => {
      const u = encodeURIComponent(handle.props.url);
      const t = encodeURIComponent(handle.props.title);
      const targets = [
        {
          label: "Share on X",
          href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
          Icon: IconTwitter,
        },
        {
          label: "Share on Facebook",
          href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
          Icon: IconFacebook,
        },
        {
          label: "Share on LinkedIn",
          href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
          Icon: IconLinkedin,
        },
      ];

      return (
        <div className="not-prose mt-12 flex items-center gap-4 border-t pt-6">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Share
          </span>
          <div className="flex items-center gap-1">
            {targets.map(({ label, href, Icon }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="rounded-md p-2 text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon />
              </a>
            ))}
            <button
              type="button"
              aria-label={copied ? "Link copied" : "Copy link"}
              title={copied ? "Link copied" : "Copy link"}
              className="rounded-md p-2 text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
              mix={on("click", () => void copyLink())}
            >
              {copied ? <IconCheck /> : <IconLink2 />}
            </button>
          </div>
        </div>
      );
    };
  },
);

// --- Page stats (port of src/components/page-stats.tsx) ---------------------

interface PageStatsData {
  views: number;
  activeUsers: number;
}

function formatViews(views: number): string {
  if (views >= 1000) {
    return `${(views / 1000).toFixed(views >= 10_000 ? 0 : 1)}k`;
  }
  return String(views);
}

export const PageStats: EntryComponent<{ path: string; title: string }> = clientEntry(
  "page-stats",
  function PageStats(handle: Handle<{ path: string; title: string }>) {
    let stats: PageStatsData | null = null;

    if (inBrowser) {
      const query = new URLSearchParams({
        path: handle.props.path,
        title: handle.props.title,
      });
      fetch(`/api/analytics/pageviews?${query}`)
        .then((res) => (res.ok ? (res.json() as Promise<PageStatsData>) : null))
        .then((data) => {
          if (data) {
            stats = data;
            handle.update();
          }
        })
        .catch(() => {
          // Analytics is decorative — a failed fetch just means nothing renders.
        });
    }

    return () => {
      if (!stats) {
        return null;
      }
      return (
        <span>
          {" · "}
          {formatViews(stats.views)} views
          {stats.activeUsers > 0 ? ` · ${stats.activeUsers} reading now` : null}
        </span>
      );
    };
  },
);

// --- First-party comments ---------------------------------------------------

function loadTurnstileWhenVisible() {
  const widget = document.querySelector<HTMLElement>(
    "[data-comments-fragment] .cf-turnstile",
  );
  if (!widget) return;

  const load = () => {
    if (document.getElementById("turnstile-script")) return;
    const script = document.createElement("script");
    script.id = "turnstile-script";
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  };

  if (!("IntersectionObserver" in window)) {
    load();
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        load();
      }
    },
    { rootMargin: "300px" },
  );
  observer.observe(widget);
}

export const CommentsThread: EntryComponent<{
  commentsPath: string;
}> = clientEntry(
  "comments",
  function CommentsThread(handle: Handle<{ commentsPath: string }>) {
    if (inBrowser) {
      const frame = handle.frames.get("comments");
      if (frame) {
        frame.addEventListener("reloadComplete", () =>
          queueMicrotask(loadTurnstileWhenVisible),
        );
        void frame.reload().catch(() => {
          // The server-rendered standalone link remains as the error fallback.
        });
      }
    }

    return () => null;
  },
);
