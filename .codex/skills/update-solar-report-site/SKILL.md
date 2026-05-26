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
   - `src/content/full-report.md` (MDX-safe, with `\<` escapes; Data Sources entries linkified to absolute `/solar-report/data/...` URLs)
   - `public/solar-report/full-report.md` (raw, for download; Data Sources entries kept relative)
   - `public/solar-report/og-image.png`
   - `public/solar-report/data/*.csv` (one per file referenced in the Data Sources section)

5. If any of the numbers shown on the curated summary (`src/routes/solar-report.tsx`) changed materially, update them by hand — the summary is currently hand-shaped, not regenerated.

6. If the user asked to publish, commit and push the repo after reviewing the generated changes. GitHub Actions builds and deploys `build/client/`.

## Deterministic Rules

- Treat `.codex/skills/update-solar-report-site/scripts/update_site.py` as the source of truth for the markdown sources under `/solar-report`.
- Do not hand-edit `src/content/full-report.md`, `public/solar-report/full-report.md`, `public/solar-report/og-image.png`, or files under `public/solar-report/data/` to change report content unless you are intentionally updating the generator logic.
- Redact the public location to `Cavite, Philippines`.
- If required report sections are missing, stop and report the missing headings instead of improvising replacements.
- The script copies CSVs whose filenames are referenced in the report's `Data Sources` section. CSVs must live next to the source markdown — either as siblings or in a `data/` subfolder. Missing files are warned about but do not abort the build; if a referenced CSV is missing, decide whether to fix the report or to publish the data file before re-running.

## Extraction Contract

The generator expects these report sections:

- `Executive Summary`
- `System Profile`
- `Alerts`
- `Recommendations`
- `Bill Impact`
- `ROI Estimate`
- `Battery Health`
- `Annual Projection`

The script validates section presence in-memory; the React Router routes consume the markdown directly. The full-report page mounts the entire markdown via the blog's MDX components, so any section heading present in the report becomes a deep-linkable anchor automatically.

## Outputs

| Output | Purpose |
|---|---|
| `src/content/full-report.md` | Markdown imported by the `/solar-report/full-report` React Router route. `<` is auto-escaped to `\<` for MDX 3 safety; Data Sources bullets are linkified to absolute `/solar-report/data/<file>.csv` URLs so they resolve when rendered. |
| `public/solar-report/full-report.md` | Raw (unescaped) markdown served as the download link on both `/solar-report` and `/solar-report/full-report`. Data Sources entries keep their original relative `data/<file>.csv` paths so the file remains portable when downloaded. |
| `public/solar-report/og-image.png` | OpenGraph image used by `/solar-report` and `/solar-report/full-report`. |
| `public/solar-report/data/*.csv` | Source CSVs cited by the Data Sources section, copied verbatim from the source directory so the linkified bullets resolve to a downloadable file. |

## Resources

### scripts/

- `scripts/update_site.py` regenerates the three outputs above from the report markdown.
- `scripts/generate_og_image.py` renders the OG image (called by `update_site.py`).
