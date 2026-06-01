import { MDXProvider } from "@mdx-js/react";
import type { ComponentType, ReactNode } from "react";
import { useEffect } from "react";
import type { MetaFunction } from "react-router";
import postIndex from "virtual:post-index";
import {
  SeriesNav,
  TableOfContents,
  mdxComponents,
  mdxComponentsWithHeadingPrefix,
} from "../components/doc";
import { Comments } from "../components/comments";
import { ShareLinks } from "../components/share";
import { SiteShell } from "../components/site-shell";

const siteUrl = "https://blog.homestack.space";
const defaultAuthor = "marfillaster";
const defaultOgImage = `${siteUrl}/og.png`;
const defaultOgImageAlt = "marfillaster · notes — Home · Network · Solar · EV";
const defaultSeries = {
  name: "MikroTik RB5009 home network behind CGNAT",
  url: `${siteUrl}/mikrotik-home-network/`,
};

export type PostMetadata = (typeof postIndex.posts)[number];

export type VariantTab = {
  href: string;
  label: string;
};

export type HashRedirect = {
  exact?: string;
  prefix?: string;
  toPath: string;
};

export type PostRouteConfig = {
  post: ComponentType<Record<string, unknown>>;
  postMeta: PostMetadata;
};

function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

function normalizeHref(pathname: string) {
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

export function findPostByPath(pathname: string) {
  const href = normalizeHref(pathname);
  return postIndex.posts.find((post) => post.href === href);
}

export function formatPostDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const monthName = new Intl.DateTimeFormat("en", {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));

  return `${day} ${monthName} ${year}`;
}

function postSeries(post: PostMetadata) {
  return post.series === false ? false : defaultSeries;
}

function articleStructuredData(post: PostMetadata) {
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

function breadcrumbStructuredData(post: PostMetadata) {
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

export function createPostMeta(
  post: PostMetadata,
): MetaFunction {
  return () => postMetaDescriptors(post);
}

export function postMetaDescriptors(post: PostMetadata) {
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
    { property: "og:site_name", content: "marfillaster · notes" },
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

function HashRedirects({ redirects }: { redirects: HashRedirect[] }) {
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const redirect = redirects.find(
      (candidate) =>
        (candidate.exact && hash === candidate.exact) ||
        (candidate.prefix && hash.startsWith(candidate.prefix)),
    );

    if (!redirect) {
      return;
    }

    const targetHash = redirect.exact === hash ? "" : window.location.hash;
    window.location.replace(`${redirect.toPath}${targetHash}`);
  }, [redirects]);

  return null;
}

function VariantTabs({
  currentHref,
  tabs,
}: {
  currentHref: string;
  tabs: NonNullable<PostMetadata["tabs"]>;
}) {
  return (
    <div className="not-prose mt-10 border-b">
      <div role="tablist" aria-label={tabs.ariaLabel} className="flex gap-2">
        {tabs.items.map((tab) => {
          const selected = normalizeHref(tab.href) === normalizeHref(currentHref);
          return (
            <a
              key={tab.href}
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
}

function TabPanel({
  children,
  href,
  tabs,
}: {
  children: ReactNode;
  href: string;
  tabs?: PostMetadata["tabs"];
}) {
  if (!tabs) {
    return <>{children}</>;
  }

  const selected = tabs.items.find(
    (tab) => normalizeHref(tab.href) === normalizeHref(href),
  );

  return (
    <div role="tabpanel" aria-label={selected?.label}>
      {children}
    </div>
  );
}

export function PostRoute({
  post: Post,
  postMeta,
}: PostRouteConfig) {
  const title = postMeta.hero?.title ?? postMeta.title;
  const description = postMeta.hero?.description ?? postMeta.description;
  const eyebrow = postMeta.hero?.eyebrow ?? postMeta.eyebrow;
  const displayDate = postMeta.publishedLabel ?? formatPostDate(postMeta.datePublished);
  const seriesCurrent =
    postMeta.series === false ? undefined : postMeta.series?.current;
  const components = postMeta.headingPrefix
    ? mdxComponentsWithHeadingPrefix(postMeta.headingPrefix)
    : mdxComponents;

  return (
    <SiteShell>
      {postMeta.redirects ? <HashRedirects redirects={postMeta.redirects} /> : null}
      <div className="container max-w-[48rem] py-12 leading-relaxed">
        <article>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
            <time dateTime={postMeta.datePublished}>Published {displayDate}</time>
          </p>
        </article>

        {seriesCurrent ? <SeriesNav current={seriesCurrent} /> : null}
        {postMeta.tabs ? <VariantTabs currentHref={postMeta.href} tabs={postMeta.tabs} /> : null}
        {postMeta.toc.length > 0 ? <TableOfContents items={postMeta.toc} /> : null}

        <TabPanel href={postMeta.href} tabs={postMeta.tabs}>
          <MDXProvider components={components}>
            <Post />
          </MDXProvider>
        </TabPanel>

        <ShareLinks url={absoluteUrl(postMeta.href)} title={postMeta.title} />

        <Comments />
      </div>
    </SiteShell>
  );
}
