// -----------------------------------------------------------------------------
// The explicit HTML document (Remix 3 style — no framework head manager).
// Mirrors src/root.tsx: charset/viewport, GA gtag, favicon, stylesheets, RSS
// alternate link, then the per-page head descriptors ported verbatim from the
// RR7 meta arrays. A tiny inline theme-init script applies the stored/system
// theme before first paint (the RR7 app did this post-hydration).
// -----------------------------------------------------------------------------

import type { Handle, RemixNode } from "remix/ui";
import type { MetaDescriptor } from "./head.ts";
import { CLIENT_BOOT_SCRIPT, ENHANCE_SCRIPT } from "./client-entries.ts";
import { ASSET_MANIFEST, PRELOAD_MODULES } from "./assets-manifest.generated.ts";

const GA_MEASUREMENT_ID = "G-S37EV14XH2";

const gtagInit = `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA_MEASUREMENT_ID}');`;

const themeInit = `(function(){try{var s=localStorage.getItem("theme");var d=s?s==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",d?"#0c0a09":"#fafaf9");}catch(e){}})();`;

// Navigation is full-document by design (see app/client/boot.ts), and
// documents sit in the edge cache until the next deploy purge — so a
// prefetched page is close to free to serve and stays valid. `moderate`
// eagerness starts the fetch on hover intent rather than speculatively
// crawling every link on the page. The live comment routes and the analytics
// API deliberately bypass the document cache, so they're excluded.
const speculationRules = JSON.stringify({
  prefetch: [
    {
      where: {
        and: [
          { href_matches: "/*" },
          { not: { href_matches: "/api/*" } },
          { not: { href_matches: "/comments/*" } },
        ],
      },
      eagerness: "moderate",
    },
  ],
});

export interface DocumentProps {
  descriptors: MetaDescriptor[];
  /**
   * Whether the page renders server-highlighted code figures. Only those pages
   * pay for code-highlight.css; app.tsx derives this from the rendered HTML so
   * adding a fence to a page turns it on without a code change here.
   */
  codeHighlight?: boolean;
  children?: RemixNode;
}

function HeadDescriptors(handle: Handle<{ descriptors: MetaDescriptor[] }>) {
  return () => (
    <>
      {handle.props.descriptors.map((d) => {
        if ("title" in d) {
          return <title>{d.title}</title>;
        }
        if ("script:ld+json" in d) {
          return (
            <script
              type="application/ld+json"
              innerHTML={JSON.stringify(d["script:ld+json"])}
            />
          );
        }
        if ("tagName" in d) {
          return <link rel={d.rel} href={d.href} />;
        }
        if ("name" in d) {
          return <meta name={d.name} content={d.content} />;
        }
        return <meta property={d.property} content={d.content} />;
      })}
    </>
  );
}

export function Document(handle: Handle<DocumentProps>) {
  return () => (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#fafaf9" />
        {/* Render-blocking stylesheets first so the preload scanner starts
            them ahead of the third-party analytics connection below. */}
        <link rel="stylesheet" href={ASSET_MANIFEST["styles.css"]} />
        {handle.props.codeHighlight ? (
          <link rel="stylesheet" href={ASSET_MANIFEST["code-highlight.css"]} />
        ) : null}
        {PRELOAD_MODULES.map((href) => (
          <link rel="modulepreload" href={href} />
        ))}
        <script innerHTML={themeInit} />
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <script innerHTML={gtagInit} />
        <HeadDescriptors descriptors={handle.props.descriptors} />
        {/* Real URLs, not a data: URI — Google Search only shows a favicon it
            can fetch. public/favicon.{svg,ico} and apple-touch-icon.png. */}
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="marfillaster · notes RSS"
          href="/rss.xml"
        />
        <script type="speculationrules" innerHTML={speculationRules} />
      </head>
      <body>
        {handle.props.children}
        <script type="module" src={CLIENT_BOOT_SCRIPT} />
        <script type="module" src={ENHANCE_SCRIPT} />
      </body>
    </html>
  );
}
