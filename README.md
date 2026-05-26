# marfillaster · notes

Static site hosted on Cloudflare at https://blog.homestack.space/ — a sister-blog umbrella for long-running experiments. The repo is still the `marfillaster/marfillaster.github.io` user-site repo for historical reasons; only the hosting moved.

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
pnpm dev
```

## Build

```sh
pnpm build
```

React Router prerenders each route at build time, so the deployed `build/client/<route>/index.html` files contain real article HTML instead of an empty React root.

## GitHub Pages

This folder is the repository root for `marfillaster/marfillaster.github.io`.

1. Push the contents of this folder to that repository.
2. In GitHub, open **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push to `main`; the included workflow builds and deploys `build/client/`.

## Solar report regeneration

The `/solar-report` content is regenerated from a `solar-analysis.md` source using the bundled skill:

```sh
python3 .codex/skills/update-solar-report-site/scripts/update_site.py
pnpm build
```

See `.codex/skills/update-solar-report-site/SKILL.md` for the contract and deterministic rules.

## Analytics

Google Analytics 4 (`G-S37EV14XH2`) is wired into `src/root.tsx` and inherited by every route.
