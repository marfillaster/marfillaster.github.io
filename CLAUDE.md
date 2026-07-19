# CLAUDE.md

Remix 3 blog (live SSR on a Cloudflare Worker, version-keyed edge caching) — the "MikroTik RB5009 home network behind CGNAT" series plus solar/PHEV reports. Feed posts live in `src/content/*.mdx` (markdown rendered at request time by `src/lib/render-markdown.ts`); the app layer is `app/` behind the `Platform` port with Node (`server/node.ts`) and workerd (`workers/remix-app.ts`) adapters — see `docs/remix3-migration-plan.md`. **This repo is public — never commit real addresses, keys, or private infra.**

## Addresses in content
Examples only in documentation ranges: IPv6 `2001:db8::/32` (RFC 3849); IPv4 `192.0.2.0/24` / `198.51.100.0/24` / `203.0.113.0/24` (RFC 5737). Never real GUAs, VPS IPs, or prefixes.

## Snippets are verified, not theoretical
RouterOS / VyOS / bird config snippets are tested on live hardware. Don't "correct" them from online docs — ask first.

## Writing style
Lead with the fact. No "the thing that surprised me" framing; no "Proven, not assumed:" flourishes.

## Build & deploy
Pushing `main` auto-deploys via Workers Builds: build `pnpm cf:build` (regenerates the committed `workers/remix-content.generated.ts` + fingerprinted `.remix-assets/` + `app/assets-manifest.generated.ts`), deploy `pnpm cf:deploy` (`wrangler deploy` + zone purge) → https://blog.homestack.space (worker `blog`, `wrangler.jsonc`). Dev loops: `pnpm remix:assets && pnpm dev:remix` (Node, no build) or `pnpm dev:remix-workerd` (workerd via `wrangler.remix.jsonc`, never deployed). `local/` is gitignored scratch — never commit it.

## Content, RSS, routes
The homepage post list, post routes, `/rss.xml`, and `/sitemap.xml` all render at request time from YAML frontmatter in `src/content/*.mdx` (`app/post-index.ts` → `src/lib/post-meta.mjs`). `feed: true` posts appear in RSS/homepage and get a shared route; `feed: false` + `route: true` posts get only a shared route. Whenever content is added, renamed, or materially updated: update the frontmatter title/description/date fields and run `pnpm gen:remix-content` before committing (CI build regenerates too, but the file is committed). TSX-only summary pages (`app/pages/`) use metadata-only MDX sidecars.

## Comments
First-party threaded comments use D1 in workerd and `local/comments.sqlite` in Node. `pnpm dev:remix-workerd` applies `migrations/` to its local D1 before starting. Production requires the `COMMENTS_DB` binding, Turnstile keys, `COMMENT_IP_SALT`, and a Cloudflare Access policy for `/api/comments/hide`. Preview and publication share `renderCommentMarkdown()` and its strict sanitizer. Giscus and Reddit mirroring are not used. Run `pnpm test:comments` after changing comment storage, rendering, validation, preview, or moderation.

## CHR/VyOS variant of a post
Mirror an existing `*-vyos` / `*-chr` flavor in content only: add frontmatter with `feed: false`, `route: true`, the variant `href`, `headingPrefix` (`vyos-` or `chr-`), dependencies, and shared `tabs`. The shared post page (`app/pages/post.tsx`) handles rendering.

## Commits
Subject prefix `blog: …`.
