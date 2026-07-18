// -----------------------------------------------------------------------------
// Shared server-rendered components: site shell, TOC, series nav, variant
// tabs, share row, comments shell. Ports of the React components with the
// same markup and classes. Interactive behavior (theme toggle, copy buttons,
// Giscus injection, tab JS) is Phase 3 — everything here renders inert,
// matching what the RR7 prerender emitted before hydration.
// -----------------------------------------------------------------------------

import type { Handle, RemixNode } from "remix/ui";
import { SERIES } from "../src/lib/series.ts";
import type { PostTabs, PostToc } from "../src/lib/post-meta.mjs";
import { normalizeHref } from "./site.ts";

// --- Icons (inline ports of the lucide icons used by the shell/share row) ---

function IconMoon(_: Handle) {
  return () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function IconTwitter(_: Handle) {
  return () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function IconFacebook(_: Handle) {
  return () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function IconLinkedin(_: Handle) {
  return () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width={4} height={12} x={2} y={9} />
      <circle cx={4} cy={4} r={2} />
    </svg>
  );
}

function IconLink2(_: Handle) {
  return () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M9 17H7A5 5 0 0 1 7 7h2" />
      <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
      <line x1={8} x2={16} y1={12} y2={12} />
    </svg>
  );
}

// --- Site shell -------------------------------------------------------------

export function ThemeToggle(_: Handle) {
  // Inert until Phase 3 wires the client entry; matches pre-hydration SSR.
  return () => (
    <button
      type="button"
      aria-label="Switch to dark mode"
      className="text-muted-foreground/70 hover:text-foreground transition-colors"
    >
      <IconMoon />
    </button>
  );
}

export function SiteShell(handle: Handle<{ children?: RemixNode }>) {
  return () => (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-3">
          <a href="/" className="font-mono text-sm font-semibold tracking-tight">
            marfillaster · notes
          </a>
          <ThemeToggle />
        </div>
      </header>

      <main id="top">{handle.props.children}</main>

      <footer className="border-t">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-6 text-xs text-muted-foreground">
          <span>
            Prerendered notes ·{" "}
            <a
              href="https://github.com/marfillaster/marfillaster.github.io"
              className="hover:text-foreground hover:underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              source on GitHub
            </a>{" "}
            ·{" "}
            <a
              href="https://ko-fi.com/marfillaster"
              className="hover:text-foreground hover:underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              ☕ buy me a coffee
            </a>{" "}
            ·{" "}
            <a
              href="https://as197291.homestack.space/"
              className="hover:text-foreground hover:underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              AS197291
            </a>{" "}
            ·{" "}
            <a
              href="/rss.xml"
              className="hover:text-foreground hover:underline underline-offset-4"
            >
              RSS
            </a>
          </span>
          <a
            href="#top"
            className="hover:text-foreground hover:underline underline-offset-4"
          >
            Back to top ↑
          </a>
        </div>
      </footer>
    </div>
  );
}

// --- Post widgets -----------------------------------------------------------

export function TableOfContents(handle: Handle<{ items: PostToc }>) {
  return () => {
    const items = handle.props.items;
    const half = Math.ceil(items.length / 2);
    const columns = [items.slice(0, half), items.slice(half)];
    return (
      <nav
        aria-label="Table of contents"
        className="not-prose mt-10 rounded-md border bg-muted/30 p-4"
      >
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
          On this page
        </p>
        <div className="mt-3 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          {columns.map((column, colIdx) => (
            <ol className="space-y-1.5 text-sm">
              {column.map(([href, label], i) => {
                const idx = colIdx * half + i;
                return (
                  <li className="flex gap-2">
                    <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <a
                      href={href}
                      className="hover:text-primary hover:underline underline-offset-4"
                    >
                      {label}
                    </a>
                  </li>
                );
              })}
            </ol>
          ))}
        </div>
      </nav>
    );
  };
}

export function SeriesNav(handle: Handle<{ current: string }>) {
  return () => (
    <nav
      aria-label="Series navigation"
      className="not-prose my-8 rounded-md border bg-muted/30 p-4"
    >
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
        RB5009 home-network series · pick a layer, or read in order
      </p>
      <ol className="mt-3 space-y-1.5 text-sm">
        {SERIES.map((s, idx) => {
          const isCurrent = s.slug === handle.props.current;
          return (
            <li className="flex gap-2">
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {idx + 1}.
              </span>
              <span>
                {isCurrent ? (
                  <span className="font-semibold">{s.title}</span>
                ) : (
                  <a
                    href={s.href}
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    {s.title}
                  </a>
                )}
                <span className="text-muted-foreground">
                  {" "}
                  — {s.note}
                  {isCurrent ? " · you are here" : ""}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function VariantTabs(
  handle: Handle<{ currentHref: string; tabs: PostTabs }>,
) {
  return () => {
    const { currentHref, tabs } = handle.props;
    return (
      <div className="not-prose mt-10 border-b">
        <div role="tablist" aria-label={tabs.ariaLabel} className="flex gap-2">
          {tabs.items.map((tab) => {
            const selected = normalizeHref(tab.href) === normalizeHref(currentHref);
            return (
              <a
                href={tab.href}
                role="tab"
                aria-selected={selected}
                aria-current={selected ? "page" : undefined}
                className={
                  selected
                    ? "border-b-2 border-foreground px-3 py-2 text-sm font-medium text-foreground"
                    : "border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                }
              >
                {tab.label}
              </a>
            );
          })}
        </div>
      </div>
    );
  };
}

export function ShareLinks(handle: Handle<{ url: string; title: string }>) {
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
            aria-label="Copy link"
            title="Copy link"
            className="rounded-md p-2 text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
          >
            <IconLink2 />
          </button>
        </div>
      </div>
    );
  };
}

export function Comments(_: Handle) {
  // Static shell only; the Giscus script injection is a Phase 3 client entry.
  return () => (
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
      <div className="mt-6" />
    </section>
  );
}
