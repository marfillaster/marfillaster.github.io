// -----------------------------------------------------------------------------
// The explicit HTML document (Remix 3 style — no framework head manager).
// Mirrors src/root.tsx: charset/viewport, GA gtag, favicon, stylesheets, RSS
// alternate link, then the per-page head descriptors ported verbatim from the
// RR7 meta arrays. A tiny inline theme-init script applies the stored/system
// theme before first paint (the RR7 app did this post-hydration).
// -----------------------------------------------------------------------------

import type { Handle, RemixNode } from "remix/ui";
import type { MetaDescriptor } from "./head.ts";

const GA_MEASUREMENT_ID = "G-S37EV14XH2";

const favicon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%231c1917'/%3E%3Ctext x='32' y='39' text-anchor='middle' font-family='Arial,sans-serif' font-size='21' font-weight='700' fill='%23fafaf9'%3Em%3C/text%3E%3C/svg%3E";

const gtagInit = `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA_MEASUREMENT_ID}');`;

const themeInit = `(function(){try{var s=localStorage.getItem("theme");var d=s?s==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export interface DocumentProps {
  descriptors: MetaDescriptor[];
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
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <script innerHTML={gtagInit} />
        <script innerHTML={themeInit} />
        <HeadDescriptors descriptors={handle.props.descriptors} />
        <link rel="stylesheet" href="/assets/styles.css" />
        <link rel="stylesheet" href="/assets/code-highlight.css" />
        <link rel="icon" href={favicon} />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="marfillaster · notes RSS"
          href="/rss.xml"
        />
      </head>
      <body>{handle.props.children}</body>
    </html>
  );
}
