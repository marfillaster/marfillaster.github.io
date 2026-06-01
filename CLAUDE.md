# CLAUDE.md

React Router blog (prerendered) — the "MikroTik RB5009 home network behind CGNAT" series plus solar/PHEV reports. Feed posts live in `src/content/*.mdx` and route through the shared `src/routes/post.tsx` renderer using frontmatter. **This repo is public — never commit real addresses, keys, or private infra.**

## Addresses in content
Examples only in documentation ranges: IPv6 `2001:db8::/32` (RFC 3849); IPv4 `192.0.2.0/24` / `198.51.100.0/24` / `203.0.113.0/24` (RFC 5737). Never real GUAs, VPS IPs, or prefixes.

## Snippets are verified, not theoretical
RouterOS / VyOS / bird config snippets are tested on live hardware. Don't "correct" them from online docs — ask first.

## Writing style
Lead with the fact. No "the thing that surprised me" framing; no "Proven, not assumed:" flourishes.

## Build & deploy
`npm run build` (prerenders to `build/client`). Pushing `main` auto-deploys via Cloudflare → https://blog.homestack.space. `local/` is gitignored scratch — never commit it.

## RSS feed
`public/rss.xml`, the homepage post list, and post routes are generated from YAML frontmatter in `src/content/*.mdx` through `scripts/post-metadata.mjs` / `virtual:post-index`. `feed: true` posts appear in RSS/homepage and get a shared route; `feed: false` + `route: true` posts get only a shared route. Whenever blog content is added, renamed, or materially updated, update the matching frontmatter title/description/date fields and run `pnpm rss` before committing. TSX-only summary pages use metadata-only MDX sidecars and are excluded from the shared post route in `src/routes.ts`. `pnpm build` also regenerates the feed.

## CHR/VyOS variant of a post
Mirror an existing `*-vyos` / `*-chr` flavor in content only: add frontmatter with `feed: false`, `route: true`, the variant `href`, `headingPrefix` (`vyos-` or `chr-`), dependencies, and shared `tabs`. The generated shared `src/routes/post.tsx` route handles rendering.

## Commits
Subject prefix `blog: …`.
