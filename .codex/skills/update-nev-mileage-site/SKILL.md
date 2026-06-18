---
name: update-nev-mileage-site
description: Regenerate the /nev-mileage content of the blog.homestack.space blog from ~/phev-tracker/report.md (the PHEV Tracker extended report, written by the phev-tracker skill) and its phev_log.csv. Use when publishing the EV/PHEV report after the phev-tracker skill has refreshed it.
---

# Update NEV Mileage Site

This skill **only copies and transforms** an existing report into the
`/nev-mileage` site. It does not generate the report.

The report is produced by the **`phev-tracker` skill** (its "Extended report
with AI analysis" path), which writes `~/phev-tracker/report.md`. This skill
reads that file, fans it out into the React Router site, and lets `pnpm build`
produce the final HTML.

> If `~/phev-tracker/report.md` is stale or missing, run the `phev-tracker`
> skill and choose "Extended report with AI analysis" first — it regenerates
> the canonical source. Do not author the report here.

## Install For Codex

If this repo-local skill is not already linked into your global Codex skills directory, install it with:

```bash
ln -s /Users/ken/home-network/blog/.codex/skills/update-nev-mileage-site \
  /Users/ken/.codex/skills/update-nev-mileage-site
```

Then invoke it in Codex with:

```text
Use $update-nev-mileage-site to publish the latest ~/phev-tracker/report.md to /nev-mileage.
```

## Workflow

1. Confirm the source paths (defaults shown):
   - Report: `~/phev-tracker/report.md` (written by the `phev-tracker` skill)
   - Data: `$PHEV_TRACKER_DATA_DIR/phev_log.csv` when that env var is set (the
     `phev-tracker` skill's data-dir override), else
     `~/.local/share/phev-tracker/phev_log.csv`. `--data` overrides both.

2. Run the transform from the blog repo root:

```bash
python3 .codex/skills/update-nev-mileage-site/scripts/update_nev_site.py
```

Optional flags:

```bash
python3 .codex/skills/update-nev-mileage-site/scripts/update_nev_site.py \
  --source /absolute/path/to/report.md \
  --data /absolute/path/to/phev_log.csv \
  --repo-root /absolute/path/to/blog
```

3. Build the site so the React Router routes pick up the new markdown:

```bash
pnpm build
```

4. Review the diff for:
   - `src/content/nev-full-report.md` (MDX-safe, with `\<` escapes; Data Sources bullet linkified to the absolute `/nev-mileage/data/phev_log.csv` URL)
   - `public/nev-mileage/full-report.md` (raw download; Data Sources entry kept relative)
   - `public/nev-mileage/og-image.png`
   - `public/nev-mileage/data/phev_log.csv` (copied verbatim from the data path)

5. If the headline numbers on the curated summary (`src/routes/nev-mileage.tsx`) changed materially, update them by hand — the summary page is bespoke React, intentionally not generated, and there is no summary markdown.

6. If the user asked to publish, commit and push the repo after reviewing the generated changes. GitHub Actions builds and deploys `build/client/`.

## Deterministic Rules

- This skill does not write the report. Treat `~/phev-tracker/report.md` as a read-only input produced upstream by the `phev-tracker` skill.
- Treat `.codex/skills/update-nev-mileage-site/scripts/update_nev_site.py` as the source of truth for the repo/site markdown. Do not hand-edit `src/content/nev-full-report.md`, `public/nev-mileage/full-report.md`, `public/nev-mileage/og-image.png`, or `public/nev-mileage/data/phev_log.csv` to change report content — fix the upstream report and re-run.
- Redact the public location to `Cavite, Philippines` in any hand-written copy.
- If required report sections are missing, the script aborts and names the missing headings instead of improvising. Regenerate the report via the `phev-tracker` skill and re-run.
- The data CSV is copied from `--data` (default `$PHEV_TRACKER_DATA_DIR/phev_log.csv` when that env var is set, else `~/.local/share/phev-tracker/phev_log.csv`). A missing file is warned about but does not abort the build; publish the file or fix the path, then re-run.

## Extraction Contract

The transform splits on `## ` headings and **aborts** unless all of these
exist as H2 sections in `~/phev-tracker/report.md`:

- `Last Refuel`
- `Cumulative`
- `Executive Summary`
- `AI Analysis`
- `Inferred Insights`

The first non-empty line must be the bold header line (e.g.
`**BYD Sealion 6** · *4 fill-ups tracked* · Dec 2025 – Mar 2026`) so the
vehicle and fill-up count parse. A `## Data Sources` section is appended
automatically if absent. This format is owned by the `phev-tracker` skill's
extended-report write step; this skill only consumes it.

The transform first runs `normalize_report()`, which bridges the `phev-tracker`
skill's *native* extended-report format into the consumed one so either input
publishes identically:

- `## Core Analysis` is aliased to `## AI Analysis`.
- A leading `# PHEV Analysis — DATE` title line is dropped so the bold header
  becomes the first non-empty line.

Normalization is idempotent on the already-consumed format, so a report already
in the consumed shape passes through unchanged.

## Outputs

| Output | Purpose |
|---|---|
| `src/content/nev-full-report.md` | Markdown imported by the `/nev-mileage/full-report` route. `<` is escaped to `\<` for MDX 3 safety; the Data Sources bullet is linkified to `/nev-mileage/data/phev_log.csv`. |
| `public/nev-mileage/full-report.md` | Raw (unescaped) markdown served as the download link on both `/nev-mileage` and `/nev-mileage/full-report`. Data Sources entry keeps the relative `data/phev_log.csv` path so the file stays portable. |
| `public/nev-mileage/og-image.png` | OpenGraph image used by both `/nev-mileage` routes. |
| `src/content/nev-og-version.ts` | Generated `ogVersion` = 10-char sha256 of `og-image.png`. The routes append it to the `og:image` URL as `?v=<hash>` so share scrapers re-fetch only when the image actually changes. Do not hand-edit. |
| `public/nev-mileage/data/phev_log.csv` | The refuel log, copied verbatim so the linkified Data Sources bullet resolves to a downloadable file. |

## Resources

### scripts/

- `scripts/update_nev_site.py` transforms `~/phev-tracker/report.md` into the repo/site outputs.
- `scripts/generate_og_image.py` renders the OG image (called by `update_nev_site.py`).
