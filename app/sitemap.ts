// -----------------------------------------------------------------------------
// Sitemap rendered as a route from the post index, replacing the hand-kept
// public/sitemap.xml at cutover. Rules reproduce the existing file: homepage
// at priority 0.8 with lastmod = newest dateModified; full-report pages at
// 0.9; every other routable post at 1.0; image entries when the post declares
// seo.ogImage + seo.ogImageAlt.
// -----------------------------------------------------------------------------

import type { PostMeta } from "../src/lib/post-meta.mjs";
import { absoluteUrl, siteUrl } from "./site.ts";

function escapeXml(value: string): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

interface SitemapEntry {
  loc: string;
  lastmod: string;
  priority: string;
  image?: { loc: string; title: string };
}

export function buildSitemapXml(routablePosts: PostMeta[]): string {
  const newest = routablePosts
    .map((post) => post.dateModified)
    .sort()
    .at(-1) ?? "2026-01-01";

  // Hand-curated image entries carried over from the old static sitemap for
  // pages whose frontmatter doesn't declare seo.ogImage/ogImageAlt.
  const imageOverrides: Record<string, { loc: string; title: string }> = {
    "/mikrotik-home-network/": {
      loc: `${siteUrl}/mikrotik-home-network/og.png`,
      title: "A small home network behind CGNAT — RB5009 series index",
    },
    "/solar-report/": {
      loc: `${siteUrl}/solar-report/og-image.png`,
      title:
        "Residential 6.5 kWp Solar Performance Summary — Cavite, Philippines",
    },
    "/solar-report/full-report": {
      loc: `${siteUrl}/solar-report/og-image.png`,
      title: "Full residential solar performance report — Cavite, Philippines",
    },
  };

  function imageFor(href: string, post?: PostMeta) {
    if (imageOverrides[href]) {
      return imageOverrides[href];
    }
    return post?.seo?.ogImage && post?.seo?.ogImageAlt
      ? { loc: post.seo.ogImage, title: post.seo.ogImageAlt }
      : undefined;
  }

  // The two report full-report pages are TSX-only routes without frontmatter;
  // they inherit lastmod from their summary posts (as the old static file did).
  const fullReportEntries: SitemapEntry[] = ["/nev-mileage/", "/solar-report/"]
    .map((summaryHref): SitemapEntry | null => {
      const summary = routablePosts.find((post) => post.href === summaryHref);
      if (!summary) {
        return null;
      }
      const href = `${summaryHref}full-report`;
      return {
        loc: absoluteUrl(href),
        lastmod: summary.dateModified,
        priority: "0.9",
        image: imageFor(href),
      };
    })
    .filter((entry): entry is SitemapEntry => entry !== null);

  const entries: SitemapEntry[] = [
    { loc: `${siteUrl}/`, lastmod: newest, priority: "0.8" },
    ...routablePosts.map((post) => ({
      loc: absoluteUrl(post.href),
      lastmod: post.dateModified,
      priority: "1.0",
      image: imageFor(post.href, post),
    })),
    ...fullReportEntries,
  ];

  const body = entries
    .map((entry) => {
      const image = entry.image
        ? `
    <image:image>
      <image:loc>${escapeXml(entry.image.loc)}</image:loc>
      <image:title>${escapeXml(entry.image.title)}</image:title>
    </image:image>`
        : "";
      return `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${entry.priority}</priority>${image}
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
${body}
</urlset>
`;
}
