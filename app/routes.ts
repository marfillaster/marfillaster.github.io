// -----------------------------------------------------------------------------
// Named route map for the fixed routes. Post routes are registered
// dynamically in app.tsx from frontmatter (same derivation as the RR7
// src/routes.ts). Typed href construction comes from Route#href.
// -----------------------------------------------------------------------------

import { get, route } from "remix/routes";

// Paths are the canonical forms (matching each page's rel=canonical): report
// summaries end in a slash, full-report pages don't. The non-canonical twins
// 301 to these in app.tsx.
export const routes = route({
  home: get("/"),
  rss: get("/rss.xml"),
  sitemap: get("/sitemap.xml"),
  solarReport: get("/solar-report/"),
  solarReportFull: get("/solar-report/full-report"),
  nevMileage: get("/nev-mileage/"),
  nevMileageFull: get("/nev-mileage/full-report"),
  // Analytics API (merged from the production worker in Phase 3).
  analyticsPageviews: get("/api/analytics/pageviews"),
  analyticsResync: get("/api/analytics/resync"),
});
