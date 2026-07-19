// -----------------------------------------------------------------------------
// createApp(platform): the whole application as a fetch router. The render
// middleware (renderWith) installs context.render, which turns a document
// tree into an HTML Response — the pattern the framework's types are built
// around (see docs/remix3-spike-report.md).
// -----------------------------------------------------------------------------

import { createRouter } from "remix/router";
import { renderWith } from "remix/render-middleware";
import { createHtmlResponse } from "remix/response/html";
import { createRedirectResponse } from "remix/response/redirect";
import { renderToStream } from "remix/ui/server";
import type { RemixNode } from "remix/ui";
import type { Platform } from "./platform.ts";
import { createAppData } from "./post-index.ts";
import { routes } from "./routes.ts";
import { Document } from "./document.tsx";
import type { MetaDescriptor } from "./head.ts";
import { HomePage, homeDescriptors } from "./pages/home.tsx";
import { PostPage } from "./pages/post.tsx";
import { NevMileagePage, nevMileageDescriptors } from "./pages/nev-mileage.tsx";
import {
  NevMileageFullPage,
  nevMileageFullDescriptors,
} from "./pages/nev-mileage-full.tsx";
import { SolarReportPage, solarReportDescriptors } from "./pages/solar-report.tsx";
import {
  SolarReportFullPage,
  solarReportFullDescriptors,
} from "./pages/solar-report-full.tsx";
import { SiteShell } from "./components.tsx";
import { postMetaDescriptors } from "./site.ts";
import { buildRssXml } from "./rss.ts";
import { buildSitemapXml } from "./sitemap.ts";
import { resolveClientEntry } from "./client-entries.ts";
import { createGaClient, handlePageviews, handleResync } from "./analytics.ts";
import { httpCaching } from "./http-caching.ts";
import {
  handleCommentModeration,
  handleCommentsGet,
  handleCommentsPost,
} from "./comment-handlers.tsx";

// Hrefs served by dedicated page components rather than the shared post page
// (mirrors customHrefs in the RR7 src/routes.ts).
const customHrefs = new Set(["/nev-mileage/", "/solar-report/"]);

export function createApp(platform: Platform) {
  const data = createAppData(platform);
  const ga = createGaClient(platform);

  // Client entries require the streaming renderer: renderToString has no
  // resolveClientEntry hook, so every document render goes through
  // renderToStream (SiteShell's ThemeToggle is an entry on every page).
  const renderNode = (node: RemixNode, init?: ResponseInit) =>
    createHtmlResponse(renderToStream(node, { resolveClientEntry }), init);

  const render = renderWith(() => (input: {
    node: RemixNode;
    init?: ResponseInit;
  }) => renderNode(input.node, input.init));

  const router = createRouter({
    middleware: [httpCaching(platform), render],
    async defaultHandler({ request }) {
      const asset = await platform.assets(request);
      if (asset && asset.status !== 404) {
        return asset;
      }

      return renderNode(
        <Document descriptors={notFoundDescriptors}>
          <NotFoundPage />
        </Document>,
        { status: 404, headers: { "Cache-Control": "no-store" } },
      );
    },
  });

  // 301 to the canonical form (report summaries and posts end in a slash,
  // full-report pages don't — matching each page's rel=canonical).
  const redirectTo =
    (target: string) =>
    ({ url }: { url: URL }) =>
      createRedirectResponse(`${target}${url.search}`, {
        status: 301,
        headers: { "Cache-Control": "public, max-age=86400" },
      });

  function page(descriptors: MetaDescriptor[], node: RemixNode) {
    return renderNode(<Document descriptors={descriptors}>{node}</Document>);
  }

  router.map(routes, {
    actions: {
      home: () => page(homeDescriptors, <HomePage index={data.index} />),
      rss: () =>
        new Response(buildRssXml(data.feedItems), {
          headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
        }),
      sitemap: () =>
        new Response(buildSitemapXml(data.routablePosts), {
          headers: { "Content-Type": "application/xml; charset=utf-8" },
        }),
      solarReport: () => page(solarReportDescriptors, <SolarReportPage />),
      solarReportFull: () =>
        page(
          solarReportFullDescriptors,
          <SolarReportFullPage html={data.contentHtml("full-report.md")} />,
        ),
      nevMileage: () => page(nevMileageDescriptors, <NevMileagePage />),
      nevMileageFull: () =>
        page(
          nevMileageFullDescriptors,
          <NevMileageFullPage html={data.contentHtml("nev-full-report.md")} />,
        ),
      analyticsPageviews: ({ request }) =>
        handlePageviews(request, platform, ga),
      analyticsResync: ({ request }) => handleResync(request, platform, ga),
    },
  });

  // Non-canonical twins of the fixed pages.
  router.get("/solar-report", redirectTo("/solar-report/"));
  router.get("/nev-mileage", redirectTo("/nev-mileage/"));
  router.get("/solar-report/full-report/", redirectTo("/solar-report/full-report"));
  router.get("/nev-mileage/full-report/", redirectTo("/nev-mileage/full-report"));

  // Live comment routes deliberately bypass the version-keyed document cache.
  router.get("/comments/:slug", ({ request, params }) =>
    handleCommentsGet(
      request,
      params.slug,
      data.routablePosts,
      platform,
      renderNode,
    ),
  );
  router.post("/comments/:slug", ({ request, params }) =>
    handleCommentsPost(request, params.slug, data.routablePosts, platform),
  );
  router.post("/api/comments/hide", ({ request }) =>
    handleCommentModeration(request, platform),
  );

  // Shared post routes, derived from frontmatter exactly like src/routes.ts.
  for (const post of data.routablePosts) {
    if (customHrefs.has(post.href)) {
      continue;
    }

    router.get(`/${post.routePath}/`, () =>
      page(
        postMetaDescriptors(post),
        <PostPage
          post={post}
          html={data.postHtml(post)}
          commentsEnabled={platform.comments.enabled}
        />,
      ),
    );
    router.get(`/${post.routePath}`, redirectTo(`/${post.routePath}/`));
  }

  return router;
}

const notFoundDescriptors: MetaDescriptor[] = [
  { title: "Page not found · marfillaster · notes" },
  { name: "robots", content: "noindex" },
];

function NotFoundPage() {
  return () => (
    <SiteShell>
      <div className="container max-w-[48rem] py-16 leading-relaxed">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.{" "}
          <a href="/" className="underline underline-offset-4 hover:text-primary">
            Back to the homepage
          </a>
          .
        </p>
      </div>
    </SiteShell>
  );
}
