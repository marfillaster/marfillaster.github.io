// -----------------------------------------------------------------------------
// Shared server-rendered components: site shell, TOC, series nav, variant
// tabs, share row, comments shell. Ports of the React components with the
// same markup and classes. Interactive behavior (theme toggle, copy buttons,
// Giscus injection, tab JS) is Phase 3 — everything here renders inert,
// matching what the RR7 prerender emitted before hydration.
// -----------------------------------------------------------------------------

import type { Handle, RemixNode } from "remix/ui";
import { CommentsThread, ThemeToggle } from "./interactive.tsx";
import { commentRoutePath } from "./comments.ts";
import { SERIES } from "../src/lib/series.ts";
import type { PostTabs, PostToc } from "../src/lib/post-meta.mjs";
import { normalizeHref } from "./site.ts";

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

export function Comments(
  handle: Handle<{ postHref?: string; firstParty?: boolean }>,
) {
  return () => (
    <section
      aria-label="Comments"
      className="mt-16 scroll-mt-20 border-t pt-10"
      id="comments"
    >
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Comments
      </p>
      {handle.props.firstParty && handle.props.postHref ? (
        <CommentsThread commentsPath={commentRoutePath(handle.props.postHref)} />
      ) : null}
      <p className="mt-3 text-sm text-muted-foreground">
        Comments are powered by GitHub Discussions and require a free GitHub
        account to post.
      </p>
      <div className="mt-6" data-giscus />
    </section>
  );
}
