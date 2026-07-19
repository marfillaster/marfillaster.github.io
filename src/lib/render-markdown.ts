// -----------------------------------------------------------------------------
// Pure markdown → HTML renderer. No I/O, no framework imports — runs at
// request time inside the Worker and under the Node adapter alike. Mirrors
// the behavior of the retired MDX-as-React pipeline: GFM, heading ids (must
// stay in lockstep with the TOC slugs computed by src/lib/post-meta.mjs),
// fence-meta titles, h1 suppression, and static expansion of the two
// in-prose components (<Rationale>, <SeriesNav />).
// -----------------------------------------------------------------------------

import type { Element, ElementContent, Root } from "hast";
import { toString as hastToString } from "hast-util-to-string";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { createHighlighterCoreSync, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import langBash from "shiki/langs/bash.mjs";
import langIni from "shiki/langs/ini.mjs";
import langJavascript from "shiki/langs/javascript.mjs";
import themeOneDark from "shiki/themes/one-dark-pro.mjs";
import themeOneLight from "shiki/themes/one-light.mjs";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { SERIES } from "./series.ts";

export type RenderOptions = {
  headingPrefix?: string;
};

export type RenderResult = {
  html: string;
};

// -----------------------------------------------------------------------------
// Shiki: sync core with the JS regex engine (no WASM), the three languages the
// old react-syntax-highlighter setup registered, dual light/dark themes driven
// by CSS variables (`.dark` toggles them; see code-highlight.css).
// -----------------------------------------------------------------------------

const HIGHLIGHT_LANGS = new Set(["bash", "ini", "javascript"]);

let highlighterSingleton: HighlighterCore | undefined;

function highlighter(): HighlighterCore {
  highlighterSingleton ??= createHighlighterCoreSync({
    themes: [themeOneLight, themeOneDark],
    langs: [langBash, langIni, langJavascript],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighterSingleton;
}

// -----------------------------------------------------------------------------
// Slugs. Mirrors src/lib/post-meta.mjs (cleanHeadingText/slugifyHeading)
// exactly — the TOC anchors it computes must resolve against the ids emitted
// here. Dedupe counts occurrences across all headings in document order, the
// way rehype-slug (github-slugger) did.
// -----------------------------------------------------------------------------

function headingSlugSource(value: string) {
  return value
    .replace(/\{#[^}]+}/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function slugifyHeading(value: string) {
  return headingSlugSource(value)
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .trim()
    .replace(/\s/g, "-");
}

// -----------------------------------------------------------------------------
// Source preprocessing: expand the two in-prose components into HTML the rest
// of the pipeline understands. <Rationale> keeps its inner markdown parseable
// by inserting blank lines around the wrapper tags; <SeriesNav /> expands to
// its full static nav markup from the series table. Lines inside code fences
// are never touched.
// -----------------------------------------------------------------------------

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function seriesNavHtml(current: string) {
  const items = SERIES.map((s, idx) => {
    const isCurrent = s.slug === current;
    const title = isCurrent
      ? `<span class="series-nav-current">${escapeHtml(s.title)}</span>`
      : `<a href="${s.href}">${escapeHtml(s.title)}</a>`;
    const suffix = isCurrent ? " · you are here" : "";
    return [
      `<li><span class="series-nav-num">${idx + 1}.</span>`,
      `<span>${title}<span class="series-nav-note"> — ${escapeHtml(s.note)}${suffix}</span></span></li>`,
    ].join(" ");
  }).join("\n");

  return [
    '<nav aria-label="Series navigation" class="series-nav">',
    '<p class="series-nav-label">RB5009 home-network series · pick a layer, or read in order</p>',
    "<ol>",
    items,
    "</ol>",
    "</nav>",
  ].join("\n");
}

function preprocess(source: string) {
  let inFence = false;

  return source
    .split(/\r?\n/)
    .map((line) => {
      if (/^(```|~~~)/.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence) {
        return line;
      }
      if (/^<Rationale>\s*$/.test(line)) {
        return '<aside class="rationale">\n';
      }
      if (/^<\/Rationale>\s*$/.test(line)) {
        return "\n</aside>";
      }
      const nav = line.match(/^<SeriesNav current="([^"]+)"\s*\/>\s*$/);
      if (nav) {
        return seriesNavHtml(nav[1]);
      }
      return line;
    })
    .join("\n");
}

// -----------------------------------------------------------------------------
// Code blocks. Fenced code arrives as <pre><code class="language-x"> with the
// fence meta (` ```bash title="..." `) on code.data.meta. `ascii`/`diagram`
// fences keep the plain diagram look; highlightable languages get Shiki plus
// the figure/figcaption chrome the old CodeSnippet rendered, including a copy
// button wired up client-side (see code-copy.tsx).
// -----------------------------------------------------------------------------

const COPY_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="code-copy-icon" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';

const CHECK_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="code-check-icon" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

function codeFigureHtml(code: string, lang: string, title: string | undefined) {
  const label = title ?? lang;
  const body = HIGHLIGHT_LANGS.has(lang)
    ? highlighter().codeToHtml(code, {
        lang,
        themes: { light: "one-light", dark: "one-dark-pro" },
        defaultColor: "light",
      })
    : `<pre class="code-plain"><code>${escapeHtml(code)}</code></pre>`;

  return [
    '<figure class="code-snippet">',
    '<figcaption class="code-snippet-header">',
    `<div class="code-snippet-meta"><p class="code-snippet-title">${escapeHtml(label)}</p><p class="code-snippet-lang">${escapeHtml(lang)}</p></div>`,
    `<button type="button" class="code-copy" aria-label="Copy ${escapeHtml(label)}">${COPY_ICON}${CHECK_ICON}</button>`,
    "</figcaption>",
    body,
    "</figure>",
  ].join("");
}

function fenceInfo(node: Element): { lang: string; title?: string } | undefined {
  const code = node.children.find(
    (child): child is Element => child.type === "element" && child.tagName === "code",
  );
  if (!code) {
    return undefined;
  }

  const classes = Array.isArray(code.properties?.className)
    ? (code.properties.className as string[])
    : [];
  const langClass = classes.find((c) => typeof c === "string" && c.startsWith("language-"));
  const lang = langClass ? langClass.slice("language-".length) : "text";
  const meta = (code.data as { meta?: string } | undefined)?.meta ?? "";
  const title = meta.match(/title="([^"]*)"/)?.[1];

  return { lang, title };
}

// -----------------------------------------------------------------------------
// The main rehype transform: h1 suppression, heading ids (+ optional variant
// prefix on h2/h3), external-link targets, code-fence rendering, and a
// horizontal-scroll wrapper around tables.
// -----------------------------------------------------------------------------

function rehypeBlogTransforms(options: RenderOptions) {
  return (tree: Root) => {
    const seen = new Map<string, number>();
    const prefix = options.headingPrefix ?? "";

    visit(tree, "element", (node, index, parent) => {
      if (!parent || index === undefined) {
        return;
      }

      if (node.tagName === "h1") {
        parent.children.splice(index, 1);
        return index;
      }

      if (/^h[2-6]$/.test(node.tagName)) {
        const baseSlug = slugifyHeading(hastToString(node));
        if (baseSlug) {
          const count = seen.get(baseSlug) ?? 0;
          seen.set(baseSlug, count + 1);
          const slug = count === 0 ? baseSlug : `${baseSlug}-${count}`;
          const usePrefix = node.tagName === "h2" || node.tagName === "h3";
          node.properties = {
            ...node.properties,
            id: usePrefix ? `${prefix}${slug}` : slug,
          };
        }
        return;
      }

      if (node.tagName === "a") {
        const href = node.properties?.href;
        if (typeof href === "string" && /^https?:\/\//i.test(href)) {
          node.properties = {
            ...node.properties,
            target: "_blank",
            rel: ["noopener", "noreferrer"],
          };
        }
        return;
      }

      if (node.tagName === "pre") {
        const info = fenceInfo(node);
        if (!info) {
          return;
        }

        const codeElement = node.children[0] as Element;
        const raw = hastToString(codeElement).replace(/\n$/, "");

        if (info.lang === "ascii" || info.lang === "diagram") {
          const text = raw.replace(/^\n/, "").replace(/\n$/, "");
          const ascii: Element = {
            type: "element",
            tagName: "pre",
            properties: { className: ["ascii"], ariaLabel: "diagram" },
            children: [{ type: "text", value: text }],
          };
          parent.children[index] = ascii;
          return;
        }

        parent.children[index] = {
          type: "raw",
          value: codeFigureHtml(raw.trim(), info.lang, info.title),
        } as unknown as ElementContent;
        return;
      }

      if (node.tagName === "table") {
        const isWrapped =
          parent.type === "element" &&
          Array.isArray((parent as Element).properties?.className) &&
          ((parent as Element).properties.className as string[]).includes("table-scroll");
        if (!isWrapped) {
          const wrapper: Element = {
            type: "element",
            tagName: "div",
            properties: { className: ["table-scroll"] },
            children: [node],
          };
          parent.children[index] = wrapper;
        }
      }
    });
  };
}

// -----------------------------------------------------------------------------
// Entry point.
// -----------------------------------------------------------------------------

export function renderMarkdown(source: string, options: RenderOptions = {}): RenderResult {
  const file = unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeBlogTransforms, options)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .processSync(preprocess(source));

  return { html: String(file) };
}
