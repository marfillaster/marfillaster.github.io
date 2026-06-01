import type { ReactNode } from "react";
import { Link } from "react-router";
import { ThemeToggle } from "./doc";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-3">
          <Link to="/" className="font-mono text-sm font-semibold tracking-tight">
            marfillaster · notes
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main id="top">{children}</main>

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
