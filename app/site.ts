// -----------------------------------------------------------------------------
// Site constants and post head-descriptor builders. The data logic is ported
// verbatim from src/lib/post-route.tsx (postMetaDescriptors,
// articleStructuredData, breadcrumbStructuredData); only the React Router
// MetaFunction wrapper is gone.
// -----------------------------------------------------------------------------

import type { PostMeta } from "../src/lib/post-meta.mjs";
import type { MetaDescriptor } from "./head.ts";

export const siteUrl = "https://blog.homestack.space";
export const siteName = "marfillaster · notes";
export const defaultAuthor = "marfillaster";
const defaultOgImage = `${siteUrl}/og.png`;
const defaultOgImageAlt = "marfillaster · notes — Home · Network · Solar · EV";
const defaultSeries = {
  name: "MikroTik RB5009 home network behind CGNAT",
  url: `${siteUrl}/mikrotik-home-network/`,
};

export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}

export function normalizeHref(pathname: string): string {
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

export function formatPostDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const monthName = new Intl.DateTimeFormat("en", {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));

  return `${day} ${monthName} ${year}`;
}

function postSeries(post: PostMeta) {
  return post.series === false ? false : defaultSeries;
}

function articleStructuredData(post: PostMeta) {
  const author = post.seo?.author ?? defaultAuthor;
  const url = absoluteUrl(post.href);
  const image = post.seo?.ogImage ?? defaultOgImage;
  const series = postSeries(post);

  return {
    "@context": "https://schema.org",
    "@type": post.seo?.schemaType ?? "TechArticle",
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: url,
    image,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    inLanguage: "en",
    ...(post.seo?.dependencies ? { dependencies: post.seo.dependencies } : {}),
    author: {
      "@type": "Person",
      name: author,
      url: "https://github.com/marfillaster",
    },
    publisher: {
      "@type": "Person",
      name: author,
      url: "https://github.com/marfillaster",
    },
    ...(series
      ? {
          isPartOf: {
            "@type": "CreativeWorkSeries",
            name: series.name,
            url: series.url,
          },
        }
      : {}),
    ...(post.seo?.keywords ? { keywords: post.seo.keywords } : {}),
  };
}

function breadcrumbStructuredData(post: PostMeta) {
  const series = postSeries(post);
  const items = [
    {
      name: "marfillaster · notes",
      item: `${siteUrl}/`,
    },
    ...(series
      ? [
          {
            name: "RB5009 home network series",
            item: series.url,
          },
        ]
      : []),
    {
      name: post.seo?.breadcrumbName ?? post.title,
      item: absoluteUrl(post.href),
    },
  ];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      ...item,
    })),
  };
}

export function postMetaDescriptors(post: PostMeta): MetaDescriptor[] {
  const author = post.seo?.author ?? defaultAuthor;
  const url = absoluteUrl(post.href);
  const ogImage = post.seo?.ogImage ?? defaultOgImage;

  return [
    { title: post.title },
    { name: "description", content: post.description },
    { name: "author", content: author },
    { property: "og:url", content: url },
    { property: "og:type", content: "article" },
    { property: "og:title", content: post.title },
    { property: "og:description", content: post.description },
    { property: "og:image", content: ogImage },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: post.seo?.ogImageAlt ?? defaultOgImageAlt },
    { property: "og:site_name", content: siteName },
    { property: "article:published_time", content: post.datePublished },
    { property: "article:modified_time", content: post.dateModified },
    { property: "article:author", content: author },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: post.title },
    { name: "twitter:description", content: post.description },
    { name: "twitter:image", content: ogImage },
    { tagName: "link", rel: "canonical", href: url },
    { "script:ld+json": articleStructuredData(post) },
    { "script:ld+json": breadcrumbStructuredData(post) },
  ];
}
