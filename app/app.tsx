// -----------------------------------------------------------------------------
// createApp(platform): the whole application as a fetch router. The render
// middleware (renderWith) installs context.render, which turns a document
// tree into an HTML Response — the pattern the framework's types are built
// around (see docs/remix3-spike-report.md).
// -----------------------------------------------------------------------------

import { createRouter } from "remix/router";
import { renderWith } from "remix/middleware/render";
import { createHtmlResponse } from "remix/response/html";
import { createRedirectResponse } from "remix/response/redirect";
import { renderToStream } from "remix/component/server";
import type { RemixNode } from "remix/component";
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
import { createClientEntryResolver } from "./client-entries.ts";
import { createGaClient, handlePageviews, handleResync } from "./analytics.ts";
import { handleCachePurge } from "./cache-purge.ts";
import { httpCaching } from "./http-caching.ts";
import { headRequests } from "./head-requests.ts";
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
    createHtmlResponse(
      renderToStream(node, {
        resolveClientEntry: createClientEntryResolver(platform.scripts),
        resolveFrame: (src: string, name?: string) => {
          if (name === "comments") {
            const standalone = src.replace(/\?fragment=1$/, "");
            return `<p class="mt-5 text-sm text-muted-foreground"><a href="${standalone}" class="underline underline-offset-4 hover:text-foreground">View or add comments</a></p>`;
          }
          throw new Error(`No server resolver for frame ${name ?? src}`);
        },
      }),
      init,
    );

  const render = renderWith(() => (input: {
    node: RemixNode;
    init?: ResponseInit;
  }) => renderNode(input.node, input.init));

  // The 404 document is fixed, so it is rendered once per isolate and replayed
  // from a string. Unmatched paths are the one route an attacker picks, so the
  // work done here is the work a flood multiplies.
  let notFoundHtml: Promise<string> | null = null;
  const notFoundBody = () =>
    (notFoundHtml ??= renderNode(
      <Document descriptors={notFoundDescriptors} scripts={platform.scripts.document}>
        <NotFoundPage />
      </Document>,
    ).text());

  const notFound = async (headers: Record<string, string>) =>
    new Response(await notFoundBody(), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8", ...headers },
    });

  // Every unmatched path ends here: the defaultHandler, and the post patterns
  // when the path names no post. Unmatched paths are the one route an attacker
  // picks, so this is also where the per-IP ceiling sits.
  async function unmatched(request: Request, url: URL): Promise<Response> {
    // Per-IP ceiling on unmatched paths. Repeats of one bad URL are absorbed
    // by the edge cache below and never reach here; this bounds the other
    // shape of the problem, a spray of paths that are each distinct.
    const client = request.headers.get("CF-Connecting-IP") ?? "anonymous";
    if (await platform.floodLimit.hit(`404:${client}`)) {
      return new Response("Too many requests.\n", {
        status: 429,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
          "Retry-After": "10",
        },
      });
    }

    // Workers Assets serves real files without invoking this Worker, so a
    // request arriving here has already missed. Only paths shaped like a
    // file are worth a binding round-trip to confirm it.
    if (/\.[a-z0-9]+$/i.test(url.pathname)) {
      const asset = await platform.assets(request);
      if (asset && asset.status !== 404) {
        return asset;
      }
    }

    // Cacheable, unlike before: entries are keyed by Worker version, so a
    // path that becomes real is published by a deploy — which retires this
    // 404 at exactly the moment it stops being true. Scanner traffic repeats
    // the same few hundred paths, and this collapses each to one render.
    return notFound({
      "Cache-Control": "public, max-age=60, s-maxage=86400",
    });
  }

  const router = createRouter({
    middleware: [headRequests, httpCaching(platform), render],
    defaultHandler: ({ request, url }) => unmatched(request, url),
  });

  // 301 to the canonical form (report summaries and posts end in a slash,
  // full-report pages don't — matching each page's rel=canonical).
  const redirectTo = (target: string, url: URL) =>
    createRedirectResponse(`${target}${url.search}`, {
      status: 301,
      headers: { "Cache-Control": "public, max-age=86400" },
    });

  function page(
    descriptors: MetaDescriptor[],
    node: RemixNode,
    codeHighlight = false,
  ) {
    return renderNode(
      <Document
        descriptors={descriptors}
        codeHighlight={codeHighlight}
        scripts={platform.scripts.document}
      >
        {node}
      </Document>,
    );
  }

  // code-highlight.css only matters where render-markdown emitted a code
  // figure (Shiki output or a plain fence — both carry the copy-button chrome
  // the stylesheet drives). Testing the rendered HTML rather than hardcoding
  // which routes have code means adding a fence to any markdown page pulls the
  // stylesheet in on its own.
  const hasCodeFigure = (html: string) => html.includes('class="code-snippet"');

  // Posts the shared post page serves, by canonical href. Hrefs with a
  // dedicated page component are left out, so their paths fall through to
  // the fixed routes above (static patterns outrank the post pattern).
  const sharedPosts = new Map(
    data.routablePosts
      .filter((post) => !customHrefs.has(post.href))
      .map((post) => [post.href, post]),
  );

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
      solarReportFull: () => {
        const html = data.contentHtml("full-report.md");
        return page(
          solarReportFullDescriptors,
          <SolarReportFullPage html={html} />,
          hasCodeFigure(html),
        );
      },
      nevMileage: () => page(nevMileageDescriptors, <NevMileagePage />),
      nevMileageFull: () => {
        const html = data.contentHtml("nev-full-report.md");
        return page(
          nevMileageFullDescriptors,
          <NevMileageFullPage html={html} />,
          hasCodeFigure(html),
        );
      },
      post: ({ request, url }) => {
        const post = sharedPosts.get(url.pathname);
        if (!post) {
          return unmatched(request, url);
        }
        const html = data.postHtml(post);
        return page(
          postMetaDescriptors(post),
          <PostPage
            post={post}
            html={html}
            commentsEnabled={platform.comments.enabled}
          />,
          hasCodeFigure(html),
        );
      },
      cachePurge: ({ request }) => handleCachePurge(request, platform),
    },
  });

  router.map(routes.analytics, {
    actions: {
      pageviews: ({ request }) => handlePageviews(request, platform, ga),
      resync: ({ request }) => handleResync(request, platform, ga),
    },
  });

  router.map(routes.comments, {
    actions: {
      show: ({ request, params }) =>
        handleCommentsGet(
          request,
          params.slug,
          data.routablePosts,
          platform,
          renderNode,
        ),
      create: ({ request, params }) =>
        handleCommentsPost(
          request,
          params.slug,
          data.routablePosts,
          platform,
          renderNode,
        ),
      hide: ({ request }) => handleCommentModeration(request, platform),
    },
  });

  router.map(routes.redirects, {
    actions: {
      solarReport: ({ url }) => redirectTo(routes.solarReport.href(), url),
      nevMileage: ({ url }) => redirectTo(routes.nevMileage.href(), url),
      solarReportFull: ({ url }) =>
        redirectTo(routes.solarReportFull.href(), url),
      nevMileageFull: ({ url }) =>
        redirectTo(routes.nevMileageFull.href(), url),
      vlanGuestIot: ({ url }) =>
        redirectTo(routes.post.href({ slug: "mikrotik-vlan-guest-iot" }), url),
      post: ({ request, url }) => {
        const canonical = `${url.pathname}/`;
        return sharedPosts.has(canonical)
          ? redirectTo(canonical, url)
          : unmatched(request, url);
      },
    },
  });

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
