---
name: update-solar-report-site
description: Regenerate the /solar-report content of the blog.homestack.space blog from /Users/ken/solar-skills/data/solar-analysis.md (or another solar-analysis.md report). Use when updating the markdown source for the summary and full-report routes, plus the OG image, after the analysis report changes.
---

# Update Solar Report Site

Regenerate the `/solar-report` markdown source with the bundled script instead of hand-editing the generated files. The site is a React Router app (sister blog at blog.homestack.space); this skill regenerates only the solar inputs and lets `pnpm build` produce the final HTML.

## Install For Codex

If this repo-local skill is not already linked into your global Codex skills directory, install it with:

```bash
ln -s /Users/ken/home-network/blog/.codex/skills/update-solar-report-site \
  /Users/ken/.codex/skills/update-solar-report-site
```

Then invoke it in Codex with:

```text
Use $update-solar-report-site to refresh the /solar-report content from the latest solar-analysis.md.
```

## Workflow

1. Confirm the source report path.
   Default source: `/Users/ken/solar-skills/data/solar-analysis.md`

2. Run the generator from the blog repo root:

```bash
python3 .codex/skills/update-solar-report-site/scripts/update_site.py
```

Optional flags:

```bash
python3 .codex/skills/update-solar-report-site/scripts/update_site.py \
  --source /absolute/path/to/solar-analysis.md \
  --repo-root /absolute/path/to/marfillaster.github.io
```

3. Build the site so the React Router routes pick up the new markdown:

```bash
pnpm build
```

4. Review the diff for:
   - `src/content/full-report.md` (MDX-safe, with `\<` escapes; Data Sources entries linkified to absolute `/solar-report/data/...` URLs; frontmatter block preserved with `dateModified`/`eyebrow` refreshed — see [Frontmatter](#frontmatter))
   - `public/solar-report/full-report.md` (raw, for download; Data Sources entries kept relative; same refreshed frontmatter block)
   - `public/solar-report/og-image.png`
   - `public/solar-report/data/*.csv` (one per file referenced in the Data Sources section)

5. Synthesize the hand-shaped summary React to match the regenerated report. The script does **not** write these files — update them yourself, keeping the existing JSX structure, classes, and component layout intact and changing only the data and copy:
   - `src/routes/solar-report.tsx` — refresh `headlineMetrics` (annual bill cut + %, simple payback, year-1 generation, CO₂ avoided), `monthlyBills` (one row per month in the report, including the newest month), `systemChips`, every period/date string (`datePublished`, `dateModified`, the "Dec 2025 – Apr 2026" eyebrow, the "Published …" line, the "N months in" copy), the `meta` title + description, the `structuredData` dates, and the prose under "What the data shows" and the monthly-bill caption. Take every figure from the report sections — never invent numbers.
   - `src/routes/solar-report-full.tsx` — refresh the same period/date strings, `meta` title + description, and `navItems` if the section anchors changed.
   - `src/content/solar-report-summary.mdx` — update its frontmatter: the `eyebrow` period stamp, `dateModified`, and any numbers cited in `description`.
   Follow the blog writing style: lead with the fact; do **not** use "the thing that surprised me" / "what surprised me" framing.

6. If the user asked to publish, commit and push the repo after reviewing the generated changes. GitHub Actions builds and deploys `build/client/`.

## Deterministic Rules

- Treat `.codex/skills/update-solar-report-site/scripts/update_site.py` as the source of truth for the markdown sources under `/solar-report`.
- Do not hand-edit `src/content/full-report.md`, `public/solar-report/full-report.md`, `public/solar-report/og-image.png`, or files under `public/solar-report/data/` to change report content unless you are intentionally updating the generator logic. The frontmatter block at the top of `src/content/full-report.md` is the exception — maintain it by hand; the generator preserves it and refreshes only its derived fields (see [Frontmatter](#frontmatter)).
- Redact the public location to `Cavite, Philippines`.
- If required report sections are missing, stop and report the missing headings instead of improvising replacements.
- The script copies CSVs whose filenames are referenced in the report's `Data Sources` section. CSVs must live next to the source markdown — either as siblings or in a `data/` subfolder. Missing files are warned about but do not abort the build; if a referenced CSV is missing, decide whether to fix the report or to publish the data file before re-running.

## Extraction Contract

The generator requires these report sections:

- `Executive Summary`
- `System Profile`
- `Recommendations`
- `Bill Impact`
- `ROI Estimate`
- `Battery Health`
- `Annual Projection`

`Alerts` is **optional** — a report with no anomalies omits the section entirely, and the generator degrades to a "No anomalies flagged this period" state instead of aborting. When `Alerts` is absent, drop the `#alerts` entry from `navItems` in `src/routes/solar-report-full.tsx` during synthesis (step 5) so the table of contents has no dead anchor.

The script validates section presence in-memory; the React Router routes consume the markdown directly. The full-report page mounts the entire markdown via the blog's MDX components, so any section heading present in the report becomes a deep-linkable anchor automatically.

## Frontmatter

Both full-report targets carry a hand-maintained YAML frontmatter block (the feed-card metadata: `title`, `description`, `eyebrow`, dates, ordering). The report body is regenerated on every run, but the frontmatter is **preserved**; the generator refreshes only two derived fields and keeps everything else verbatim (line-edited, never YAML-reflowed, so folded scalars and comments survive):

- `dateModified` → the run date.
- the `eyebrow` `YYYY-MM` stamp → the report's end month (parsed from the "from YYYY-MM to YYYY-MM" period line).

The block is read from `src/content/full-report.md` (the source of truth, falling back to the raw download) and written identically to both `src/content/full-report.md` and `public/solar-report/full-report.md`. If neither file has a frontmatter block, the script prints a warning and writes the bodies without one — add a block to `src/content/full-report.md` and re-run to have it preserved going forward.

## Outputs

| Output | Purpose |
|---|---|
| `src/content/full-report.md` | Markdown imported by the `/solar-report/full-report` React Router route. `<` is auto-escaped to `\<` for MDX 3 safety; Data Sources bullets are linkified to absolute `/solar-report/data/<file>.csv` URLs so they resolve when rendered. The hand-maintained frontmatter block is preserved, with `dateModified`/`eyebrow` refreshed. |
| `public/solar-report/full-report.md` | Raw (unescaped) markdown served as the download link on both `/solar-report` and `/solar-report/full-report`. Data Sources entries keep their original relative `data/<file>.csv` paths so the file remains portable when downloaded. Carries the same refreshed frontmatter block as the MDX target. |
| `public/solar-report/og-image.png` | OpenGraph image used by `/solar-report` and `/solar-report/full-report`. |
| `public/solar-report/data/*.csv` | Source CSVs cited by the Data Sources section, copied verbatim from the source directory so the linkified bullets resolve to a downloadable file. |

## Resources

### scripts/

- `scripts/update_site.py` regenerates the three outputs above from the report markdown.
- `scripts/generate_og_image.py` renders the OG image (called by `update_site.py`).
