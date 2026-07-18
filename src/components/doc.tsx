import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { SERIES } from "../lib/series";

// -----------------------------------------------------------------------------
// Theme toggle
// -----------------------------------------------------------------------------

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(stored ? stored === "dark" : prefersDark);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", dark ? "#0c0a09" : "#fafaf9");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);
  return { dark, setDark };
}

export function ThemeToggle() {
  const { dark, setDark } = useTheme();
  const Icon = dark ? Sun : Moon;
  return (
    <button
      type="button"
      onClick={() => setDark(!dark)}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="text-muted-foreground/70 hover:text-foreground transition-colors"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

// -----------------------------------------------------------------------------
// Table of contents (rendered from post metadata, outside the markdown body)
// -----------------------------------------------------------------------------

export function TableOfContents({
  items,
}: {
  items: ReadonlyArray<readonly [string, string]>;
}) {
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
          <ol key={colIdx} className="space-y-1.5 text-sm">
            {column.map(([href, label], i) => {
              const idx = colIdx * half + i;
              return (
                <li key={href} className="flex gap-2">
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
}

// -----------------------------------------------------------------------------
// Series navigation, rendered outside the markdown body (post header). The
// in-prose <SeriesNav /> markup is expanded statically by the markdown
// renderer from the same table in src/lib/series.ts.
// -----------------------------------------------------------------------------

export function SeriesNav({ current }: { current: string }) {
  return (
    <nav
      aria-label="Series navigation"
      className="not-prose my-8 rounded-md border bg-muted/30 p-4"
    >
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
        RB5009 home-network series · pick a layer, or read in order
      </p>
      <ol className="mt-3 space-y-1.5 text-sm">
        {SERIES.map((s, idx) => {
          const isCurrent = s.slug === current;
          return (
            <li key={s.slug} className="flex gap-2">
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
