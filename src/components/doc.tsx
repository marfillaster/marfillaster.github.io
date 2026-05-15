import { Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { Children, useEffect, useState } from "react";
import { CodeSnippet } from "./code-snippet";

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
// Inline blocks usable from MDX
// -----------------------------------------------------------------------------

export function Ascii({ children }: { children: ReactNode }) {
  const text = typeof children === "string" ? children.replace(/^\n/, "").replace(/\n$/, "") : children;
  return (
    <pre
      className="not-prose my-6 overflow-x-auto rounded-md border bg-muted/40 p-4 text-xs leading-5 text-foreground"
      aria-label="diagram"
    >
      {text}
    </pre>
  );
}

export function Rationale({ children }: { children: ReactNode }) {
  return (
    <p className="border-l-2 border-primary/40 pl-3 text-sm italic leading-6 text-muted-foreground">
      {children}
    </p>
  );
}

export function TableOfContents({
  items,
}: {
  items: ReadonlyArray<readonly [string, string]>;
}) {
  return (
    <nav
      aria-label="Table of contents"
      className="not-prose mt-10 rounded-md border bg-muted/30 p-4"
    >
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
        On this page
      </p>
      <ol className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
        {items.map(([href, label], idx) => (
          <li key={href} className="flex gap-2">
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <a
              href={href}
              className="hover:text-primary hover:underline underline-offset-4"
            >
              {label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// -----------------------------------------------------------------------------
// MDX → component map. Re-styles Markdown elements so the .mdx file reads as
// plain Markdown while preserving the RFC-style structure of the document.
// -----------------------------------------------------------------------------

function nodeText(children: ReactNode): string {
  let out = "";
  Children.forEach(children, (child) => {
    if (typeof child === "string" || typeof child === "number") out += child;
    else if (child && typeof child === "object" && "props" in child) {
      out += nodeText((child as { props: { children?: ReactNode } }).props.children);
    }
  });
  return out;
}

function H2({ id, children }: { id?: string; children?: ReactNode }) {
  return (
    <section id={id} className="mt-16 scroll-mt-20">
      <h2 className="text-2xl font-semibold tracking-tight">{children}</h2>
    </section>
  );
}

function H3({ id, children }: { id?: string; children?: ReactNode }) {
  return (
    <div id={id} className="mt-10 scroll-mt-20">
      <h3 className="text-lg font-semibold tracking-tight">{children}</h3>
    </div>
  );
}

function H4({ children, ...rest }: { children?: ReactNode }) {
  return (
    <h4 {...rest} className="mt-6 text-sm font-semibold">
      {children}
    </h4>
  );
}

function P({ children }: { children?: ReactNode }) {
  return <p className="mt-3">{children}</p>;
}

function UL({ children }: { children?: ReactNode }) {
  return <ul className="mt-3 list-disc space-y-1 pl-6 text-sm">{children}</ul>;
}

function OL({ children }: { children?: ReactNode }) {
  return <ol className="mt-3 list-decimal space-y-1 pl-6 text-sm">{children}</ol>;
}

function A({ href, children }: { href?: string; children?: ReactNode }) {
  const external = !!href && /^https?:\/\//i.test(href);
  return (
    <a
      href={href}
      className="underline underline-offset-4 hover:text-primary"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

function InlineCode({ children }: { children?: ReactNode }) {
  return (
    <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">{children}</code>
  );
}

/**
 * Fenced code blocks in MDX arrive here as `<pre><code class="language-x">…`.
 * For `language-ascii` we keep the plain ASCII look used by diagrams; for
 * everything else we hand off to the syntax-highlighted CodeSnippet so the
 * Markdown source can stay free of JSX for the common case.
 *
 * A code fence may carry a meta string after the language:
 *
 *     ```bash title="VPS wg0 + AllowedIPs"
 *
 * The MDX → JSX transform forwards the meta as the `title` prop on <pre>.
 */
function Pre({ children, title }: { children?: ReactNode; title?: string }) {
  const child = Children.toArray(children)[0];
  if (!child || typeof child !== "object" || !("props" in child)) {
    return <pre>{children}</pre>;
  }
  const codeProps = (child as { props: { className?: string; children?: ReactNode } }).props;
  const lang = (codeProps.className ?? "").replace(/^language-/, "") || "text";
  const raw =
    typeof codeProps.children === "string" ? codeProps.children : nodeText(codeProps.children);
  const code = raw.replace(/\n$/, "");

  if (lang === "ascii" || lang === "diagram") {
    return <Ascii>{code}</Ascii>;
  }

  return <CodeSnippet code={code} language={lang} label={title ?? lang} />;
}

function Table({ children }: { children?: ReactNode }) {
  return (
    <div className="not-prose mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

function THead({ children }: { children?: ReactNode }) {
  return <thead className="border-b text-left text-muted-foreground">{children}</thead>;
}

function TBody({ children }: { children?: ReactNode }) {
  return <tbody>{children}</tbody>;
}

function TR({ children }: { children?: ReactNode }) {
  return <tr className="border-b last:border-b-0">{children}</tr>;
}

function TH({ children }: { children?: ReactNode }) {
  return <th className="py-2 pr-4 font-medium">{children}</th>;
}

function TD({ children }: { children?: ReactNode }) {
  return <td className="py-2 pr-4 align-top">{children}</td>;
}

function HR() {
  return <hr className="my-12 border-border" />;
}

function Blockquote({ children }: { children?: ReactNode }) {
  return (
    <blockquote className="mt-3 border-l-2 border-muted-foreground/40 pl-3 text-sm text-muted-foreground">
      {children}
    </blockquote>
  );
}

export const mdxComponents = {
  h1: () => null, // The page header owns the document title; suppress an in-content H1.
  h2: H2,
  h3: H3,
  h4: H4,
  p: P,
  ul: UL,
  ol: OL,
  a: A,
  code: InlineCode,
  pre: Pre,
  table: Table,
  thead: THead,
  tbody: TBody,
  tr: TR,
  th: TH,
  td: TD,
  hr: HR,
  blockquote: Blockquote,
  // JSX-only blocks the MDX file can use directly:
  Ascii,
  Rationale,
};
