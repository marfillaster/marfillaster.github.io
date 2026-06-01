# CLAUDE.md

React Router blog (prerendered) — the "MikroTik RB5009 home network behind CGNAT" series plus solar/PHEV reports. Posts are `src/content/*.mdx` wired through `src/routes.ts`. **This repo is public — never commit real addresses, keys, or private infra.**

## Addresses in content
Examples only in documentation ranges: IPv6 `2001:db8::/32` (RFC 3849); IPv4 `192.0.2.0/24` / `198.51.100.0/24` / `203.0.113.0/24` (RFC 5737). Never real GUAs, VPS IPs, or prefixes.

## Snippets are verified, not theoretical
RouterOS / VyOS / bird config snippets are tested on live hardware. Don't "correct" them from online docs — ask first.

## Writing style
Lead with the fact. No "the thing that surprised me" framing; no "Proven, not assumed:" flourishes.

## Build & deploy
`npm run build` (prerenders to `build/client`). Pushing `main` auto-deploys via Cloudflare → https://blog.homestack.space. `local/` is gitignored scratch — never commit it.

## RSS feed
`public/rss.xml` is generated from YAML frontmatter in `src/content/*.mdx`. The homepage post list comes from the same frontmatter through the `virtual:post-index` Vite module. Whenever blog content is added, renamed, or materially updated, update the matching frontmatter title/description/date fields and run `pnpm rss` before committing. TSX-only summary pages use metadata-only MDX sidecars. `pnpm build` also regenerates the feed.

## CHR/VyOS variant of a post
Mirror an existing `*-vyos` / `*-chr` flavor — three pieces:
1. content `src/content/<flavor>-<base>.mdx`
2. route `src/routes/<base>-<flavor>.tsx` (import the mdx, `mdxComponentsWithHeadingPrefix`, set `dependencies`, back-link to the base post)
3. register the path in `src/routes.ts`

## Commits
Subject prefix `blog: …`.
