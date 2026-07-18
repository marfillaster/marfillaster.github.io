// Port of the shared post page (src/lib/post-route.tsx PostRoute). The body
// arrives as pre-rendered HTML from the Phase 0 renderer via innerHTML.
// PageStats renders nothing server-side in the RR7 app (fetch-after-hydrate),
// so it is simply absent here until Phase 3.

import type { Handle } from "remix/ui";
import type { PostMeta } from "../../src/lib/post-meta.mjs";
import {
  Comments,
  SeriesNav,
  SiteShell,
  TableOfContents,
  VariantTabs,
} from "../components.tsx";
import { PageStats, ShareLinks } from "../interactive.tsx";
import { absoluteUrl, formatPostDate } from "../site.ts";

export interface PostPageProps {
  post: PostMeta;
  html: string;
}

export function PostPage(handle: Handle<PostPageProps>) {
  return () => {
    const { post, html } = handle.props;
    const title = post.hero?.title ?? post.title;
    const description = post.hero?.description ?? post.description;
    const eyebrow = post.hero?.eyebrow ?? post.eyebrow;
    const displayDate = post.publishedLabel ?? formatPostDate(post.datePublished);
    const seriesCurrent = post.series === false ? undefined : post.series?.current;

    const article = (
      <article className="typeset typeset-post" innerHTML={html} />
    );

    return (
      <SiteShell>
        {post.redirects ? (
          // Legacy hash redirects are applied by the enhance script — the
          // fragment never reaches the server, so this stays client-side.
          <script
            type="application/json"
            id="hash-redirects"
            innerHTML={JSON.stringify(post.redirects)}
          />
        ) : null}
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
              <time dateTime={post.datePublished}>Published {displayDate}</time>
              <PageStats path={post.href} title={post.title} />
            </p>
          </article>

          {seriesCurrent ? <SeriesNav current={seriesCurrent} /> : null}
          {post.tabs ? <VariantTabs currentHref={post.href} tabs={post.tabs} /> : null}
          {post.toc.length > 0 ? <TableOfContents items={post.toc} /> : null}

          {post.tabs ? (
            <div
              role="tabpanel"
              aria-label={
                post.tabs.items.find((tab) => tab.href === post.href)?.label
              }
            >
              {article}
            </div>
          ) : (
            article
          )}

          <ShareLinks url={absoluteUrl(post.href)} title={post.title} />

          <Comments />
        </div>
      </SiteShell>
    );
  };
}
