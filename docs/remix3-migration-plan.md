# Remix 3 migration plan

Status: planned, not started. Written 2026-07-18 against Remix `3.0.0-beta.5`.

## Context

The blog runs on React Router 7 (`ssr: false`, `prerender: true`): MDX content in
`src/content/*.mdx` compiles to React via `@mdx-js/rollup`, every route prerenders
to static HTML, and a Cloudflare Worker (`workers/app.ts`) serves the built assets
plus the GA4-backed analytics API. This plan covers migrating to **Remix 3** with
**live SSR on the Cloudflare Worker**, and adopting **shadcn typeset**
(<https://ui.shadcn.com/docs/typeset>) for prose styling.

What Remix 3 is (from <https://guides.remix.run/start-here/>):

- A ground-up rewrite, **currently beta** (`3.0.0-beta.5`, 2026-07-01; no stable
  3.x on npm). Betas have shipped roughly monthly with breaking changes.
- **Not React.** Components use a `Handle` setup-phase/render-phase model; server
  rendering via `renderToStream()`/`renderToString()`; interactivity via
  `clientEntry()`, `on(...)`, and `handle.update()`. React libraries do not carry
  over.
- **No bundler** (a runtime TS loader for Node plus an asset server), **no MDX
  support**, **no prerender/SSG**, and no published migration path from React
  Router 7.

What makes the migration tractable here:

- The blog's React surface is wide but shallow. Prose styling is a hand-rolled
  per-element component map (`mdxComponents` in `src/components/doc.tsx`); the
  interactive pieces are small and self-contained. Only two JSX components appear
  inside MDX prose — `<Rationale>` and `<SeriesNav>` — and both render static
  output. No MDX file uses ESM imports.
- shadcn typeset is pure generated CSS, framework-agnostic, and directly replaces
  the `mdxComponents` styling map.
- The analytics Worker (`workers/app.ts` + `workers/ga4.ts`) is already
  Web-API-only (fetch, Web Crypto, KV, Cache API) and ports into a Remix 3 router
  unchanged in substance.

## 1. Target architecture

One Cloudflare Worker replaces the current static-assets-plus-API Worker:

- **Remix 3 router as the Worker fetch handler.** `app/routes.ts` defines typed
  routes: the homepage, every routable post (generated from `readRoutablePosts()`
  in `scripts/post-metadata.mjs`, exactly as `src/routes.ts` does today), the four
  report routes, and the two API routes (`/api/analytics/pageviews`,
  `/api/analytics/resync`). The `scheduled` cron handler stays beside the fetch
  handler.
- **Wrangler/esbuild bundles the Worker.** Remix 3's `remix/node-tsx` loader is
  Node-only; on workerd the standard Wrangler build compiles TS/JSX instead, with
  `jsxImportSource` pointed at Remix's JSX runtime (exact module name pinned
  during the Phase 1 spike).
- **Static assets stay on Workers Assets** (`build/client`): images, fonts,
  `rss.xml`, `robots.txt`, `sitemap.xml`, compiled CSS, and the compiled
  client-entry JS. Unmatched routes fall through to a Remix-rendered 404 — the
  `__spa-fallback.html → 404.html` copy in `react-router.config.ts` goes away.
- **Aggressive CDN caching with ETag revalidation.** Content only changes on
  deploy, so caching is keyed to the build:
  - **HTML routes**: each route's ETag is computed at build time as a hash of
    (build ID + compiled route content) and shipped in the route manifest. The
    Worker checks `If-None-Match` first and answers `304 Not Modified` without
    rendering. Response headers: `ETag` plus
    `Cache-Control: public, max-age=0, must-revalidate, s-maxage=31536000` —
    browsers always revalidate (cheap 304s), the Cloudflare edge caches
    indefinitely. The fetch handler backs this with the Cache API
    (`caches.default`) keyed on URL, so a page renders once per colo per deploy.
  - **Invalidation on deploy**: new build ID → new ETags; the deploy step purges
    the zone cache via the Cloudflare API, so stale edge copies die immediately
    rather than waiting out `s-maxage`.
  - **Static assets**: compiled CSS/JS are content-fingerprinted →
    `Cache-Control: public, max-age=31536000, immutable`. Non-fingerprinted files
    (`rss.xml`, `sitemap.xml`, images) get modest `max-age` plus the ETags
    Workers Assets already emits.
  - **API responses** (`/api/analytics/pageviews`) keep their existing short-TTL
    Cache API pattern — live data, not build-keyed.

## 2. Content pipeline (replaces MDX-as-React)

Authoring stays in `src/content/*.mdx` with unchanged frontmatter;
`scripts/post-metadata.mjs` remains the single source of truth (plain `.mjs` +
`yaml`, already framework-free, including TOC extraction).

- **Build-time markdown → HTML** via unified (remark-parse, remark-frontmatter,
  remark-gfm, rehype-slug — the same plugins used today), emitting one HTML
  fragment per post (and per heading-prefixed variant flavor) into a generated
  module the Worker imports. Post routes inject the fragment into the Remix
  document component.
- **`<Rationale>` and `<SeriesNav>`** — the only components in prose, both
  static — are handled by a small rehype step that expands those elements to
  their static HTML. Rationale is a styled aside; SeriesNav renders from the
  series table currently in `doc.tsx`, which moves to a data module.
- **Syntax highlighting moves to build time with Shiki**, replacing
  `react-syntax-highlighter` entirely — no client-side highlighting JS, and dual
  light/dark themes via Shiki's CSS-variable theme matching the existing `.dark`
  class toggle. The `rehype-mdx-code-props` `title` behavior is re-implemented as
  a rehype handler for fence meta.
- This drops `@mdx-js/*`, `react-syntax-highlighter`, and the per-element React
  styling — the largest React coupling in the repo.
- Why compile to HTML rather than compile MDX to Remix JSX: MDX emits
  props-taking function components, Remix render functions take zero arguments,
  and only two static components are used in prose — build-time HTML avoids
  betting on beta JSX-interop semantics for no functional gain.

## 3. Typography: shadcn typeset + Tailwind v4

- Generate `typeset.css` from the typeset builder using the site's existing
  `sans`/`serif` stacks and teal-primary tokens; import it after Tailwind; wrap
  post HTML in `<article class="typeset typeset-post">`. This replaces the entire
  `mdxComponents`/`mdxComponentsWithHeadingPrefix` styling map in `doc.tsx`.
- **Tailwind v3 → v4** as part of the move: typeset and current shadcn tokens
  target v4, and v4's standalone CLI needs no Vite/PostCSS — which fits Remix 3's
  no-bundler model. Migrate the HSL-triplet tokens in `src/styles.css` to v4
  `@theme` full-color tokens; keep the `.dark` class strategy. Site-chrome
  components keep their utility classes; the CLI scans source for class names at
  build time.
- Tune typeset's three control variables (`--typeset-size`, `--typeset-leading`,
  `--typeset-flow`) to match the current reading measure (`maxWidth: 70ch`,
  1180px container).

## 4. Interactivity rewrites (React → Remix client entries)

Each is small and self-contained; none needs React:

| Piece | Today | Remix 3 form |
|---|---|---|
| Theme toggle | `useTheme` in `doc.tsx` | `clientEntry()` component; same localStorage + `matchMedia` + `.dark`-class logic |
| Page stats | `page-stats.tsx` fetch | client entry fetching `/api/analytics/pageviews` (endpoint unchanged) |
| Giscus | `comments.tsx` | client entry injecting the script; MutationObserver theme sync unchanged |
| Code copy | `code-snippet.tsx` | progressive-enhancement script over Shiki's server-rendered `<pre>` |
| Share/copy link | `share.tsx` | client entry (clipboard API) |
| Variant tabs | `VariantTabs` in `src/lib/post-route.tsx` | client entry over server-rendered panels |
| Hash redirects | client-side `window.location.replace` | server-side redirects in the router — an improvement SSR unlocks |

Radix (`react-slot`, `react-switch`) and the unused `src/components/ui/`
primitives are dropped; `cva`/`clsx`/`tailwind-merge` emit plain class strings
and keep working.

## 5. SEO and feeds

- The shared document component renders `<head>` explicitly (Remix 3 style):
  title/meta/OG and both `ld+json` blocks port from
  `postMetaDescriptors`/`articleStructuredData`/`breadcrumbStructuredData` in
  `src/lib/post-route.tsx` — the data-building logic moves verbatim; only the
  React Router meta-array wrapper changes.
- `scripts/generate-rss.mjs`, `sitemap.xml`, `robots.txt`, and the GA gtag
  snippet are unchanged.

## 6. Sequencing

Phases 0–1 are low-risk and worth doing before Remix 3 stabilizes; phases 2+
gate on the spike.

- **Phase 0 — de-React the content pipeline (on the current stack).** Build the
  unified+Shiki markdown→HTML pipeline and swap the post route to render
  compiled HTML. Adopt Tailwind v4 + typeset, deleting the `mdxComponents` map.
  The blog still ships on React Router 7, but the content layer becomes
  framework-neutral. Independently shippable and valuable even if Remix 3 is
  never adopted.
- **Phase 1 — spike: Remix 3 beta on workerd (go/no-go gate).** Minimal Remix 3
  app bundled by Wrangler, one SSR route + one `clientEntry`, deployed to a
  scratch Worker. Verifies the beta runs on Workers at all, and pins the
  JSX-runtime/bundling configuration. If it fails, hold at Phase 0 until Remix
  ships Workers support or stable 3.0.
- **Phase 2 — port the app shell and routes**: document component, `SiteShell`,
  homepage sections, post routes consuming the Phase 0 pipeline, report routes
  (static tables — mechanical JSX conversion).
- **Phase 3 — port interactivity** (table above) and merge the analytics API +
  cron into the Remix router.
- **Phase 4 — caching (ETag/304 + edge cache + deploy purge), redirects, 404,
  SEO parity.**
- **Phase 5 — cutover**: switch the Cloudflare Git integration's build/deploy
  command to the new build + `wrangler deploy`; verify; retire the React Router
  build.

**Timing:** execute Phase 0 whenever convenient; hold Phases 1+ until Remix 3
reaches RC/stable unless the spike is done purely to de-risk.

## 7. Risks

- **Beta churn** — pin exact beta versions; expect API breakage before 3.0
  stable; re-verify the spike at RC.
- **Remix-on-workerd is undocumented territory** — the Phase 1 gate exists for
  this; the guides only demonstrate Node.
- **SSR replaces free static serving** — mitigated by the edge caching above;
  the Worker already runs KV + cron for analytics.
- **Typeset visual regression risk** — the hand-tuned per-element styles are
  replaced wholesale; compare representative posts (code-heavy, table-heavy,
  Rationale-heavy) side by side during Phase 0.
- **Deploy pipeline change** — the Cloudflare Git integration must run the new
  build command; test on a preview Worker before switching production.

## 8. Verification (for the eventual implementation)

- **HTML parity diff**: a script fetches every route from the old prerendered
  build and the new SSR Worker (`wrangler dev`), normalizes, and diffs
  structure + meta + ld+json.
- Per-route smoke: theme toggle, code copy, tabs, Giscus load, page-stats fetch,
  `/api/analytics/*` responses, cron via `wrangler dev --test-scheduled`.
- Caching behavior: first request renders (MISS + `ETag`), repeat request is an
  edge HIT, `curl -H 'If-None-Match: <etag>'` returns 304, and a redeploy
  changes the ETag and serves fresh HTML.
- `rss.xml` byte-identical; sitemap URLs unchanged; Lighthouse/SEO spot-check on
  two posts.
