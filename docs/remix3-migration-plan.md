# Remix 3 migration plan

Status: Phases 0–5 done (Phase 5 cutover: 2026-07-19). Phase 6 is implemented
with its production D1, Turnstile, and Access configuration.
**The Remix 3 app is
live in production** — worker `blog` deployed directly via `wrangler deploy`
(Git-integration build/deploy commands still to be switched to `pnpm cf:build`
/ `pnpm cf:deploy` in the dashboard, plus purge env vars; until then pushes to
main fail CI harmlessly and deploys are manual). Phase 1 spike GO
(`docs/remix3-spike-report.md`). Remaining: RR7 cleanup (plan §7 Phase 5 tail)
and Phase 6 (comments).
Written 2026-07-18 against Remix `3.0.0-beta.5`.

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
- **Runtime-focused, no bundler.** In Node, `remix/node-tsx` runs TS/JSX source
  directly; client assets are compiled **on demand** by its asset server
  (`createAssetServer()`), not by an upfront build. There is no MDX support, no
  prerender/SSG, and no published migration path from React Router 7.

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

## 0. The no-build principle, and what is irreducible on Workers

The plan follows Remix 3's runtime-first philosophy: **the Worker is the
renderer**. Content ships as source in the deploy artifact and everything —
post HTML, RSS, sitemap, ETags — is produced on demand and edge-cached. There is
no content build, no generated modules, no precomputed manifests.

Two ahead-of-time steps remain, and they are platform constraints rather than
framework choices:

1. **Wrangler's esbuild bundling.** workerd executes a pre-bundled JS artifact;
   it has no filesystem and no loader hooks, so `remix/node-tsx` and the
   on-demand asset server cannot run there. Any framework deployed to Workers
   goes through this step. It is one `wrangler deploy` (or `wrangler dev`, which
   bundles transparently on save) — there is no separate build pipeline to
   maintain. A fully build-free Remix 3 process needs a long-running Node server
   with source on disk; the runtime-decoupled layering below keeps exactly that
   available as the **local dev loop and a portability escape hatch** (a VPS
   could host the same app), while production stays on Cloudflare (KV, cron,
   edge cache).
2. **One Tailwind CSS pass.** Tailwind's class scanning is ahead-of-time by
   design in every deployment model. It is a single CLI invocation in the deploy
   command. `typeset.css` itself is a **static checked-in file** — generated once
   in the typeset builder, not per deploy.

Everything else the earlier draft of this plan placed at build time (markdown
compilation, Shiki highlighting, ETag computation, RSS generation) moves to
runtime below.

## 1. Target architecture

One Cloudflare Worker replaces the current static-assets-plus-API Worker:

- **Remix 3 router as the Worker fetch handler.** `app/routes.ts` defines typed
  routes: the homepage, every routable post (derived from the same frontmatter
  logic as today's `src/routes.ts`), the four report routes, `/rss.xml`,
  `/sitemap.xml`, and the two API routes (`/api/analytics/pageviews`,
  `/api/analytics/resync`). The `scheduled` cron handler stays beside the fetch
  handler.
- **Content ships as source.** `src/content/*.mdx` files are included in the
  bundle as text modules (Wrangler `rules`, `type: "Text"`). The frontmatter
  parsing, validation, and TOC extraction in `scripts/post-metadata.mjs` run
  in-Worker over those modules at startup (plain JS + `yaml`, already
  framework-free) instead of at build time.
- **Workers Assets carries only true static files**: images, fonts,
  `robots.txt`, the Tailwind CSS output, `typeset.css`, and the compiled
  client-entry JS. `rss.xml` and `sitemap.xml` become rendered routes (below),
  so `scripts/generate-rss.mjs` and the `pnpm rss` build step are retired.
  Unmatched routes get a Remix-rendered 404 — the `__spa-fallback.html →
  404.html` copy in `react-router.config.ts` goes away.
- **Aggressive CDN caching with ETag revalidation.** Content only changes on
  deploy, so caching keys on the deploy version — obtained **at runtime** from
  the version-metadata binding (`env.CF_VERSION_METADATA.id`), so no build step
  computes anything:
  - **HTML routes**: `ETag: W/"<version-id>:<path>"`. The Worker checks
    `If-None-Match` first and answers `304 Not Modified` without rendering —
    the ETag derives from the version binding, not from rendered output.
    Response headers: `ETag` plus
    `Cache-Control: public, max-age=0, must-revalidate, s-maxage=31536000` —
    browsers always revalidate (cheap 304s), the Cloudflare edge caches
    indefinitely. The fetch handler backs this with the Cache API
    (`caches.default`), so a route renders once per colo per deploy.
  - **Invalidation on deploy**: new version ID → new ETags; the deploy step
    purges the zone cache via the Cloudflare API, so stale edge copies die
    immediately rather than waiting out `s-maxage`.
  - **Static assets**: fingerprinted CSS/JS →
    `Cache-Control: public, max-age=31536000, immutable`. Non-fingerprinted
    files (images) get modest `max-age` plus the ETags Workers Assets already
    emits.
  - **API responses** (`/api/analytics/pageviews`) keep their existing short-TTL
    Cache API pattern — live data, not version-keyed.

### Runtime decoupling: application layer vs runtime adapters

Remix 3 describes an app as "a fetch handler behind a runtime adapter"; this
plan enforces that as a hard layering rule so the application never imports
anything workerd- or Node-specific:

- **`app/` — pure application.** Router, routes, document components, the
  markdown renderer, post index, analytics handlers. Depends only on Web APIs
  (Request/Response, URL, Web Crypto, streams) plus a small injected `Platform`
  interface. No `Env` bindings, no `node:` imports, no `import.meta`
  filesystem tricks.
- **`Platform` interface — the ports.** Everything runtime-specific the app
  needs, defined by the app and implemented by adapters:
  - `content(): Map<path, string>` — post source (text modules on workerd; `fs`
    reads on Node)
  - `views: { get(path), put(path, n) }` — pageview store (KV on workerd;
    in-memory or a JSON file on Node)
  - `cache: CacheStorage | null` — edge cache (`caches.default` on workerd;
    no-op on Node, where freshness is the point)
  - `versionId: string` — deploy version for ETags (`CF_VERSION_METADATA.id` on
    workerd; git SHA or `Date.now()` on Node)
  - `comments: CommentsStore` — threaded comments (D1 on workerd; `node:sqlite`
    on Node — same SQLite semantics on both sides)
  - `challenge: { verify(token, ip) }` — bot check (Turnstile `siteverify` on
    workerd; auto-pass stub on Node dev)
  - `secrets` — GA service account, resync token, Turnstile secret (bindings vs
    `process.env`)
- **`server/worker.ts` — workerd adapter.** Maps `Env` bindings into `Platform`,
  exports `fetch` and `scheduled`. This is the only file that knows about
  Cloudflare. Bundled by Wrangler at deploy.
- **`server/node.ts` — Node adapter.** `node --import remix/node-tsx server.ts`:
  the genuinely no-build path — source on disk, instant restart, no Wrangler in
  the loop. Serves static assets from disk. Used for local dev and available as
  a self-hosting fallback (e.g. a VPS) if Cloudflare ever stops fitting.
- **Dev workflow**: day-to-day iteration on the Node adapter (no build at all);
  `wrangler dev` before deploys to exercise the real bindings; `remix test`
  drives the app layer directly in Node with a stub `Platform` — no server, no
  bundler.

## 2. Content pipeline (runtime rendering, replaces MDX-as-React)

Authoring stays in `src/content/*.mdx` with unchanged frontmatter. Rendering
happens **in the Worker, on first request per route per deploy**, then lives in
the edge cache:

- **Markdown → HTML at runtime** via unified (remark-parse, remark-frontmatter,
  remark-gfm, rehype-slug — the same plugins used today), bundled into the
  Worker. The renderer is a pure function (markdown string → HTML string) with
  no I/O, so it runs identically in the Worker, in tests, and — during the
  transition — at build time under the current React Router stack (see
  Phase 0).
- **`<Rationale>` and `<SeriesNav>`** — the only components in prose, both
  static — are expanded by a small rehype step. Rationale is a styled aside;
  SeriesNav renders from the series table currently in `doc.tsx`, which moves to
  a data module.
- **Syntax highlighting via Shiki with its JavaScript regex engine** (no WASM,
  workerd-safe), bundled with only the three languages registered today (bash,
  ini, javascript) to keep the Worker artifact small. This replaces
  `react-syntax-highlighter` entirely; dual light/dark themes via Shiki's
  CSS-variable theme matching the existing `.dark` class toggle. The
  `rehype-mdx-code-props` `title` behavior is re-implemented as a rehype handler
  for fence meta.
- **RSS and sitemap become routes** rendered from the same in-Worker post index,
  cached with the same version-keyed strategy. Output must stay byte-compatible
  with today's `public/rss.xml` (same +0800 date formatting).
- Heading-prefixed variant flavors (VyOS/CHR) render on demand per variant route,
  passing the prefix into the rehype-slug step.
- This drops `@mdx-js/*`, `react-syntax-highlighter`, and the per-element React
  styling — the largest React coupling in the repo.
- Why render to HTML rather than compile MDX to Remix JSX: MDX emits
  props-taking function components, Remix render functions take zero arguments,
  and only two static components are used in prose — direct HTML rendering
  avoids betting on beta JSX-interop semantics for no functional gain.

## 3. Typography: shadcn typeset + Tailwind v4

- Generate `typeset.css` **once** from the typeset builder using the site's
  existing `sans`/`serif` stacks and teal-primary tokens, and check it in as a
  static asset; import it after Tailwind; wrap post HTML in
  `<article class="typeset typeset-post">`. This replaces the entire
  `mdxComponents`/`mdxComponentsWithHeadingPrefix` styling map in `doc.tsx`.
- **Tailwind v3 → v4** as part of the move: typeset and current shadcn tokens
  target v4, and v4's standalone CLI needs no Vite/PostCSS. Its single CLI pass
  is one of the two irreducible ahead-of-time steps (section 0). Migrate the
  HSL-triplet tokens in `src/styles.css` to v4 `@theme` full-color tokens; keep
  the `.dark` class strategy.
- Tune typeset's three control variables (`--typeset-size`, `--typeset-leading`,
  `--typeset-flow`) to match the current reading measure (`maxWidth: 70ch`,
  1180px container).

## 4. Interactivity rewrites (React → Remix client entries)

Each is small and self-contained; none needs React:

| Piece | Today | Remix 3 form |
|---|---|---|
| Theme toggle | `useTheme` in `doc.tsx` | `clientEntry()` component; same localStorage + `matchMedia` + `.dark`-class logic |
| Page stats | `page-stats.tsx` fetch | client entry fetching `/api/analytics/pageviews` (endpoint unchanged) |
| Comments | `comments.tsx` | first-party threaded comments loaded through a client entry (section 6) |
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
- `rss.xml` and `sitemap.xml` are served by the router (section 2); `robots.txt`
  and the GA gtag snippet are unchanged.

## 6. First-party threaded comments (replaces Giscus)

Once the Worker is a real request/response app, comments become a route rather
than an embedded third-party widget:

- **Reddit-style threading.** Comments form a tree: `parent_id` adjacency rows
  in **D1** (SQLite — the right store for relational thread data; KV is not),
  assembled server-side into nested HTML. Depth caps at 6 levels; deeper replies
  flatten behind a "continue this thread" permalink, the same device Reddit
  uses. Root comments sort newest-first, replies chronologically. Collapsible
  subtrees and per-comment permalinks are progressive enhancement over
  server-rendered `<details>`-based markup, so threads read fine with JS off.
  Voting is out of scope initially — "reddit-style" here means the nested,
  collapsible thread model; scores later are a column and a sort change, not a
  redesign.
- **No accounts.** Display name + body. Bodies are markdown-lite rendered
  through the same unified pipeline with `rehype-sanitize` (strict schema:
  links, code, emphasis; no images or raw HTML).
- **Server-rendered preview.** Write and Preview tabs post the draft back to
  the comment route. Preview uses the same markdown and sanitization function
  as publication, writes nothing, and remains available as a full-page form
  action without JavaScript.
- **Cloudflare Turnstile gates every write.** The form embeds the Turnstile
  widget; the POST handler verifies the token server-side (`siteverify` with the
  client IP) before touching D1. Honeypot field and a per-IP KV rate limit back
  it up.
- **Remix `form()` pairs the GET and POST** at the same URL — the exact pattern
  the framework is designed around, and the first place the blog uses Remix's
  mutation model rather than just its rendering.
- **The immutable post cache stays immutable.** Post HTML remains version-keyed;
  comments live at `GET /comments/<post-slug>` — a server-rendered fragment with
  its own short-TTL cache entry that the POST handler purges on successful
  write. A client entry injects the fragment into the post page; with JS off,
  the same handler serves it as a standalone page linked from the post.
- **Moderation: accept by default, hide-only.** A comment that passes Turnstile
  publishes immediately — no queue, no approval step. The single moderation
  action is an admin bearer-token hide endpoint (same pattern as
  `/api/analytics/resync`): a hidden comment keeps its row (a `hidden` flag) so
  the thread structure under it survives, and renders as a "comment hidden"
  stub. No delete — hiding is reversible and D1 rows are cheap. Rows store an
  IP hash + timestamp for abuse tracing, nothing else.
- **Giscus replacement**: there was no GitHub Discussions content to import.
  Activation removes the Giscus loader and theme synchronization.

## 7. Sequencing

Phases 0–1 are low-risk and worth doing before Remix 3 stabilizes; phases 2+
gate on the spike.

- **Phase 0 — extract a framework-neutral renderer (on the current stack).**
  Build the unified+Shiki renderer as a pure function and call it from the
  existing build under React Router 7 (prerender keeps working unchanged).
  Adopt Tailwind v4 + typeset, deleting the `mdxComponents` map. The same
  renderer function later moves into the Worker unmodified — only the call site
  changes from build time to request time. Independently shippable and valuable
  even if Remix 3 is never adopted.
- **Phase 1 — spike: Remix 3 beta on workerd (go/no-go gate).** Minimal Remix 3
  app bundled by Wrangler, one SSR route + one `clientEntry`, deployed to a
  scratch Worker, with the same app code also running under the Node adapter.
  Verifies the beta runs on Workers at all, pins the JSX-runtime/bundling
  configuration, and measures bundle size with unified + Shiki included.
  **Done 2026-07-18: GO** — see `docs/remix3-spike-report.md` (no
  `nodejs_compat` needed, byte-identical Node/workerd output, hydration
  verified, worker bundle ~212 KiB gzip incl. unified+Shiki,
  `jsxImportSource: "remix/ui"`, precompiled client entries via Workers
  Assets). If it fails, hold at Phase 0 until Remix
  ships Workers support or stable 3.0.
- **Phase 2 — port the app shell and routes**: define the `Platform` interface
  and both adapters (`server/worker.ts`, `server/node.ts`), then the document
  component, `SiteShell`, homepage sections, post routes calling the Phase 0
  renderer at request time, report routes (static tables — mechanical JSX
  conversion), RSS/sitemap routes. Day-to-day porting happens on the no-build
  Node adapter.
- **Phase 3 — port interactivity** (table above) and merge the analytics API +
  cron into the Remix router.
- **Phase 4 — caching (version-keyed ETag/304 + edge cache + deploy purge),
  redirects, 404, SEO parity.** Done 2026-07-19: `app/http-caching.ts`
  middleware, `Platform.waitUntil`, canonical trailing-slash 301s,
  fingerprinted client assets (`app/assets-manifest.generated.ts` +
  `_headers`), `scripts/purge-zone.mjs` (unwired until Phase 5),
  `scripts/seo-parity.mjs` sweep 22/22 clean.
- **Phase 5 — cutover**: switch the Cloudflare Git integration to
  `wrangler deploy` (plus the Tailwind CLI pass); verify; retire the React
  Router build. Done 2026-07-19 (staged on `blog-staging` first, then direct
  `wrangler deploy` to `blog`; dashboard build-command switch pending). Found
  in staging: remix/ui `run()` intercepts link clicks via the Navigation API
  with no frame support — suppressed in `app/client/boot.ts`; Cloudflare
  strips ETags from HTML (strong-format tags + inner cache key now
  version-keyed). RR7 deletion still pending as cleanup.
- **Phase 6 — comments** (post-cutover; new functionality, not porting): D1
  schema + thread renderer, server-rendered previews, Turnstile-gated form,
  and a moderation endpoint behind Cloudflare Access. Production activation
  uses the `COMMENTS_DB` binding, Turnstile keys, and `COMMENT_IP_SALT`. There
  was no Giscus content to import, and Reddit mirroring was removed from scope.

**Timing:** execute Phase 0 whenever convenient; hold Phases 1+ until Remix 3
reaches RC/stable unless the spike is done purely to de-risk.

## 8. Risks

- **Beta churn** — pin exact beta versions; expect API breakage before 3.0
  stable; re-verify the spike at RC.
- **Remix-on-workerd is undocumented territory** — the Phase 1 gate exists for
  this; the guides only demonstrate Node.
- **Worker bundle size** — unified + Shiki grammars + all post source now live
  in the Worker artifact. With three grammars and the JS regex engine this
  should sit well under the 10 MB (gzipped 3 MB) Workers limits, but measure in
  the Phase 1 spike.
- **First-request render latency** — each route renders once per colo per
  deploy; subsequent requests are edge hits. Acceptable at blog traffic levels;
  a post-deploy warm-up fetch of the top routes is an easy option if it ever
  matters.
- **SSR replaces free static serving** — mitigated by the edge caching above;
  the Worker already runs KV + cron for analytics.
- **Typeset visual regression risk** — the hand-tuned per-element styles are
  replaced wholesale; compare representative posts (code-heavy, table-heavy,
  Rationale-heavy) side by side during Phase 0.
- **Deploy pipeline change** — the Cloudflare Git integration must run
  `wrangler deploy`; test on a preview Worker before switching production.
- **First-party comments carry an ongoing moderation duty** — Turnstile +
  honeypot + rate limits stop bots, not motivated humans, and accept-by-default
  means anything that slips through is live until noticed. The hide endpoint
  and IP-hash tracing are the whole toolkit; expect occasional manual cleanup.
  D1 exports are CLI-only, so comment data needs either a scheduled GitHub
  Actions export using a D1-scoped API token or a documented manual export
  routine before production activation.

## 9. Verification (for the eventual implementation)

- **HTML parity diff**: a script fetches every route from the old prerendered
  build and the new SSR Worker (`wrangler dev`), normalizes, and diffs
  structure + meta + ld+json.
- Per-route smoke: theme toggle, code copy, tabs, comment loading, page-stats
  fetch, `/api/analytics/*` responses, cron via `wrangler dev --test-scheduled`.
- Caching behavior: first request renders (MISS + `ETag`), repeat request is an
  edge HIT, `curl -H 'If-None-Match: <etag>'` returns 304, and a redeploy
  changes the ETag and serves fresh HTML.
- `/rss.xml` byte-identical to the current generated file; sitemap URLs
  unchanged; Lighthouse/SEO spot-check on two posts.
- Comments (Phase 6): post → verify Turnstile rejection without a token and
  acceptance with one; reply nesting renders at depth 1–6 and flattens past the
  cap; fragment cache purges on write (new comment visible immediately, post
  HTML ETag unchanged); preview and publication use identical sanitized HTML;
  a comment containing `<script>` and an image renders inert; JS-off page shows
  the full thread, preview, and form.
