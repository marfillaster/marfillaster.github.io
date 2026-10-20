// -----------------------------------------------------------------------------
// The site's route map: every URL the app answers is declared here, and
// app.tsx supplies the actions with router.map(). Posts are one pattern
// rather than one route per post — the action looks the path up in the
// frontmatter-derived index at request time, so adding a post needs no route
// change. Typed href construction comes from Route#href.
//
// Patterns rank static over variable, so the fixed pages and legacy redirects
// below win over the post patterns that would otherwise also match them.
// Variables stop at "/" and ".", so file-shaped paths (/favicon.ico, /x.php)
// never match a post pattern and still reach the defaultHandler's asset check.
// -----------------------------------------------------------------------------

import { get, post, route } from "remix/routes";

export const routes = route({
  home: get("/"),
  rss: get("/rss.xml"),
  sitemap: get("/sitemap.xml"),

  // Canonical forms (matching each page's rel=canonical): report summaries
  // end in a slash, full-report pages don't.
  solarReport: get("/solar-report/"),
  solarReportFull: get("/solar-report/full-report"),
  nevMileage: get("/nev-mileage/"),
  nevMileageFull: get("/nev-mileage/full-report"),

  // Shared post page: /<slug>/ and its variants (/<slug>/vyos/, /<slug>/chr/).
  post: get("/:slug(/:variant)/"),

  analytics: {
    pageviews: get("/api/analytics/pageviews"),
    resync: get("/api/analytics/resync"),
  },

  // Live comment routes deliberately bypass the version-keyed document cache.
  comments: {
    show: get("/comments/:slug"),
    create: post("/comments/:slug"),
    hide: post("/api/comments/hide"),
  },

  cachePurge: post("/api/cache/purge"),

  // 301s to the canonical form.
  redirects: {
    solarReport: get("/solar-report"),
    nevMileage: get("/nev-mileage"),
    solarReportFull: get("/solar-report/full-report/"),
    nevMileageFull: get("/nev-mileage/full-report/"),
    // Pre-rename slug (6170e0d): 404ing instead of redirecting means Google
    // keeps re-crawling a dead end instead of folding signal into the live URL.
    vlanGuestIot: get("/lan-segmentation-vlans-mikrotik(/)"),
    // A post path without its trailing slash.
    post: get("/:slug(/:variant)"),
  },
});
