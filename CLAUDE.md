# CLAUDE.md

Remix 3 blog (live SSR on a Cloudflare Worker, version-keyed edge caching) — the "MikroTik RB5009 home network behind CGNAT" series plus solar/PHEV reports. Feed posts live in `src/content/*.mdx` (markdown rendered at request time by `src/lib/render-markdown.ts`); the app layer is `app/` behind the `Platform` port with Node (`server/node.ts`) and workerd (`workers/remix-app.ts`) adapters — see `docs/remix3-migration-plan.md`. **This repo is public — never commit real addresses, keys, or private infra.**

## Addresses in content
Examples only in documentation ranges: IPv6 `2001:db8::/32` (RFC 3849); IPv4 `192.0.2.0/24` / `198.51.100.0/24` / `203.0.113.0/24` (RFC 5737). Never real GUAs, VPS IPs, or prefixes.

## Snippets are verified, not theoretical
RouterOS / VyOS / bird config snippets are tested on live hardware. Don't "correct" them from online docs — ask first.

## Writing style
Lead with the fact. No "the thing that surprised me" framing; no "Proven, not assumed:" flourishes.

## Build & deploy
Pushing `main` auto-deploys via Workers Builds: build `pnpm cf:build` (regenerates the committed `workers/remix-content.generated.ts` + fingerprinted `.remix-assets/` + `app/assets-manifest.generated.ts` + `workers/cache-digests.generated.ts`), deploy `pnpm cf:deploy` (`wrangler deploy`) → https://blog.homestack.space (worker `blog`, `wrangler.jsonc`). Dev loops: `pnpm remix:assets && pnpm dev:remix` (Node, no build) or `pnpm dev:remix-workerd` (workerd via `wrangler.remix.jsonc`, never deployed). `local/` is gitignored scratch — never commit it.

## Caching
Two entrypoints in `workers/remix-app.ts`, **both cached**: the default export strips the query string and delegates to `Site`. The gateway's layer answers already-canonical URLs without running any code (one billed request, no CPU); `Site`'s layer is where every rewritten URL lands on one shared entry. Purges are scoped to the entrypoint that issues them, so paths whose freshness comes from a purge (`/comments/`, `isPurgeManaged`) are marked `Cloudflare-CDN-Cache-Control: no-store` by the gateway — `Site` still caches and purges them — and a successful `POST /api/cache/purge` makes the gateway drop its own layer wholesale. Stripping is by exclusion (`app/cache-key.ts`) — everything loses its query except `/api/` and `/comments/`, which select a response by it. That covers unmatched paths and redirects too, so no path has a cache key an outsider can vary: a sprayed `?x=n` can't fragment the cacheable 404, and a 301 doesn't forward campaign parameters (deliberate — canonical URLs already carry the trailing slash and never redirect). **Caching is enabled per entrypoint, never Worker-wide** — a top-level `cache` block makes otherwise-free static asset requests bill at the standard rate, and with both entrypoints set explicitly it would never be read anyway. **Deploys need no purge**: cache keys include the Worker version, so shipping retires every previous entry. Document ETags are build-time content digests (`workers/cache-digests.generated.ts`), so an edited post doesn't invalidate every reader's copy of the other posts. Purging exists only for what a deploy can't express: a new comment (`purgeCache` by path prefix, network-wide, unlike the per-colo `httpCache.delete`) and `POST /api/cache/purge` with the admin bearer token. Two measured constraints, both documented in `app/cache-key.ts`: `cache.purge({tags})` only reaches entries stored by the version issuing it, and a `cf.cacheKey` override makes an entry unpurgeable — hence canonical URLs and prefix purges. `CACHE_EPOCH` in `src/lib/cache-epoch.mjs` moves every digest at once (browsers and the inner cache included). Run `pnpm test:caching` after touching cache keys, digests, headers, or purging.

## Edge protection (zone-side, not in this repo)
Free plan gives `homestack.space` **1 rate limiting rule and 5 WAF custom rules**. The rate limiting rule is spent on the looking-glass backend (3 req/10s on `/api/bgp|ping|traceroute`) — don't repurpose it for the blog; rate limiting can't count by response status below Business, so a "many 404s" rule isn't expressible anyway. Blog protection is a WAF custom rule blocking scanner probe paths (`/wp-*`, `/.env`, `/.git`, `*.php`, `*.sql`, …) with a 403 *before* the Worker runs, which no route on this site collides with. That plus the in-Worker per-IP ceiling on unmatched paths (`app/app.tsx` defaultHandler, backed by the `NOT_FOUND_LIMITER` binding) and cacheable 404s is the whole defence. Bot Fight Mode is deliberately **off**: it challenges non-verified bots and is a known way to break RSS readers.

## Content, RSS, routes
The homepage post list, post routes, `/rss.xml`, and `/sitemap.xml` all render at request time from YAML frontmatter in `src/content/*.mdx` (`app/post-index.ts` → `src/lib/post-meta.mjs`). `feed: true` posts appear in RSS/homepage and get a shared route; `feed: false` + `route: true` posts get only a shared route. Whenever content is added, renamed, or materially updated: update the frontmatter title/description/date fields and run `pnpm gen:remix-content` before committing (CI build regenerates too, but the file is committed). TSX-only summary pages (`app/pages/`) use metadata-only MDX sidecars.

## Comments
First-party threaded comments use D1 in workerd and `local/comments.sqlite` in Node. `pnpm dev:remix-workerd` applies `migrations/` to its local D1 before starting. Production requires the `COMMENTS_DB` binding, Turnstile keys, `COMMENT_IP_SALT`, and a Cloudflare Access policy for `/api/comments/hide`. Preview and publication share `renderCommentMarkdown()` and its strict sanitizer. Giscus and Reddit mirroring are not used. Run `pnpm test:comments` after changing comment storage, rendering, validation, preview, or moderation.

## CHR/VyOS variant of a post
Mirror an existing `*-vyos` / `*-chr` flavor in content only: add frontmatter with `feed: false`, `route: true`, the variant `href`, `headingPrefix` (`vyos-` or `chr-`), dependencies, and shared `tabs`. The shared post page (`app/pages/post.tsx`) handles rendering.

## Commits
Subject prefix `blog: …`.
