# marfillaster · notes

Remix 3 blog served by a Cloudflare Worker at https://blog.homestack.space/ — a sister-blog umbrella for long-running experiments. The repo is still the `marfillaster/marfillaster.github.io` user-site repo for historical reasons; only the hosting moved.

Routes:

- `/` — landing index
- `/mikrotik-home-network/` — MikroTik RB5009 home network build log
- `/solar-report/` — residential 6.5 kWp solar performance case study (curated summary)
  - `/solar-report/full-report` — full markdown rendered as HTML
  - `/solar-report/full-report.md` — raw markdown source (downloadable)
  - `/solar-report/data/solar_hourly_*.csv` — source CSVs cited in the report's Data Sources section

## Local development

This project uses [pnpm](https://pnpm.io/) (declared via `packageManager` in `package.json`). Install it once with `npm i -g pnpm` if you don't have it.

```sh
pnpm install
pnpm remix:assets   # static assets + client entries (rerun after CSS/entry changes)
pnpm dev:remix      # Node adapter, no build step — http://localhost:3000
```

`pnpm dev:remix-workerd` runs the same app under workerd (`wrangler dev`) with the real bindings shape.

The Node adapter enables first-party comments with a gitignored SQLite database at `local/comments.sqlite`. The workerd command applies the checked-in D1 migrations to its local database before starting. `pnpm test:comments` runs the focused sanitizer, preview, threading, write-path, moderation, and fragment checks.

## Deploy

Pushing `main` deploys via Cloudflare Workers Builds: `pnpm cf:build` then `pnpm cf:deploy` (`wrangler deploy` + zone cache purge). Markdown renders at request time in the worker; every route is edge-cached keyed on the deploy version. See `docs/remix3-migration-plan.md` for the architecture.

## Solar report regeneration

The `/solar-report` content is regenerated from a `solar-analysis.md` source using the bundled skill:

```sh
python3 .codex/skills/update-solar-report-site/scripts/update_site.py
pnpm gen:remix-content
```

See `.codex/skills/update-solar-report-site/SKILL.md` for the contract and deterministic rules.

## Analytics

Google Analytics 4 (`G-S37EV14XH2`) is wired into the shared document head (`app/document.tsx`); per-page view counts come from the worker's `/api/analytics/pageviews` endpoint backed by KV + the GA4 Data API.

## Comments operations

First-party comments use the production `COMMENTS_DB` D1 binding and Turnstile. `TURNSTILE_SECRET_KEY` and `COMMENT_IP_SALT` are Worker secrets; `TURNSTILE_SITE_KEY` is a public variable. Cloudflare Access protects `/api/comments/hide`.

D1 exports are CLI-only. Create a manual backup before schema changes and periodically while comments are active:

```sh
mkdir -p local
pnpm exec wrangler d1 export blog-comments --remote --output "local/blog-comments-$(date +%F).sql"
```

`local/` is gitignored. Store copies outside the repository according to the normal backup policy.
