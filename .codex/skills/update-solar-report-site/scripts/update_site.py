#!/usr/bin/env python3
"""Regenerate the solar-report site from a solar-analysis markdown report."""

from __future__ import annotations

import argparse
import datetime as dt
import html
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from generate_og_image import render as render_og_image  # noqa: E402


DEFAULT_SOURCE = Path.home() / "solar-skills" / "data" / "solar-analysis.md"
REPO_ROOT = Path(__file__).resolve().parents[4]
# Output targets in the React Router site layout:
#   - src/content/full-report.md  → markdown source with `\<` escapes; imported
#     by the React Router /solar-report/full-report route via the MDX plugin.
#   - public/solar-report/full-report.md → raw (unescaped) markdown served as
#     the download link from both the summary and the full-report routes.
#   - public/solar-report/og-image.png → OG image for /solar-report.
#   The summary page (/solar-report) and the rendered full-report page
#   (/solar-report/full-report) are both prerendered by React Router; this
#   script does not emit HTML.
MDX_PATH = REPO_ROOT / "src" / "content" / "full-report.md"
RAW_REPORT_PATH = REPO_ROOT / "public" / "solar-report" / "full-report.md"
OG_IMAGE_PATH = REPO_ROOT / "public" / "solar-report" / "og-image.png"

SITE_URL = "https://blog.homestack.space/solar-report"
SITE_AUTHOR = "Ken Marfilla"

GA_MEASUREMENT_ID = "G-S37EV14XH2"
GA_SNIPPET = f"""<!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id={GA_MEASUREMENT_ID}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());
      gtag('config', '{GA_MEASUREMENT_ID}');
    </script>"""


def seo_head(page_path: str, title: str, description: str) -> str:
    canonical = f"{SITE_URL}/{page_path}" if page_path else f"{SITE_URL}/"
    image_url = f"{SITE_URL}/og-image.png"
    json_ld = (
        '{"@context":"https://schema.org","@type":"Article",'
        f'"headline":"{html.escape(title, quote=True)}",'
        f'"description":"{html.escape(description, quote=True)}",'
        f'"url":"{canonical}",'
        f'"image":"{image_url}",'
        f'"author":{{"@type":"Person","name":"{SITE_AUTHOR}"}},'
        f'"publisher":{{"@type":"Person","name":"{SITE_AUTHOR}"}},'
        '"inLanguage":"en"}'
    )
    return f"""<title>{html.escape(title)}</title>
    <meta name="description" content="{html.escape(description, quote=True)}" />
    <meta name="author" content="{SITE_AUTHOR}" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="{canonical}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Solar Performance Report" />
    <meta property="og:title" content="{html.escape(title, quote=True)}" />
    <meta property="og:description" content="{html.escape(description, quote=True)}" />
    <meta property="og:url" content="{canonical}" />
    <meta property="og:image" content="{image_url}" />
    <meta property="og:locale" content="en_PH" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{html.escape(title, quote=True)}" />
    <meta name="twitter:description" content="{html.escape(description, quote=True)}" />
    <meta name="twitter:image" content="{image_url}" />
    <script type="application/ld+json">{json_ld}</script>"""


REQUIRED_SECTIONS = [
    "Executive Summary",
    "System Profile",
    "Recommendations",
    "Bill Impact",
    "ROI Estimate",
    "Battery Health",
    "Annual Projection",
]

MONTH_NAMES = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
}

_MONTH_NUMS = {name.lower(): num for num, name in MONTH_NAMES.items()}


def parse_period_bounds(markdown: str) -> tuple[int, int, int, int]:
    """Extract (start_year, start_month, end_year, end_month) from the report's
    period line. Accepts both the numeric form ("from 2025-12 to 2026-05") and
    the month-name form ("from December 2025 – May 2026"); the separator may be
    "to" or a hyphen/en-dash/em-dash."""
    sep = r"(?:to|[–—-])"
    numeric = re.search(rf"from\s+(\d{{4}})-(\d{{2}})\s*{sep}\s*(\d{{4}})-(\d{{2}})", markdown)
    if numeric:
        return int(numeric[1]), int(numeric[2]), int(numeric[3]), int(numeric[4])
    named = re.search(
        rf"from\s+([A-Za-z]+)\s+(\d{{4}})\s*{sep}\s*([A-Za-z]+)\s+(\d{{4}})", markdown
    )
    if named:
        start_month = _MONTH_NUMS.get(named[1].lower())
        end_month = _MONTH_NUMS.get(named[3].lower())
        if start_month and end_month:
            return int(named[2]), start_month, int(named[4]), end_month
    raise ValueError("Could not parse report period from source markdown")


def normalize_text(text: str) -> str:
    replacements = {
        "\u20b1": "PHP ",
        "\u2013": "-",
        "\u2014": "-",
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u2192": "->",
        "\u00d7": "x",
        "\u03c3": "sigma",
        "\u2082": "2",
        "\u2265": ">=",
        "\u2264": "<=",
        "\u00b1": "+/-",
        "\u2011": "-",
    }
    for src, dest in replacements.items():
        text = text.replace(src, dest)
    return text


def format_inline(text: str) -> str:
    text = normalize_text(text.strip())
    parts = re.split(r"(\*\*[^*]+\*\*|`[^`]+`)", text)
    output: list[str] = []
    for part in parts:
        if not part:
            continue
        if part.startswith("**") and part.endswith("**"):
            output.append(f"<strong>{html.escape(part[2:-2])}</strong>")
        elif part.startswith("`") and part.endswith("`"):
            output.append(f"<code>{html.escape(part[1:-1])}</code>")
        else:
            output.append(html.escape(part))
    return "".join(output)


def strip_markdown(text: str) -> str:
    return normalize_text(text).replace("**", "").replace("`", "").strip()


def split_sections(markdown: str) -> dict[str, str]:
    sections: dict[str, list[str]] = {}
    current: str | None = None
    for line in markdown.splitlines():
        if line.startswith("## "):
            current = normalize_text(line[3:].strip())
            sections[current] = []
            continue
        if current is not None:
            sections[current].append(line)
    return {name: "\n".join(lines).strip() for name, lines in sections.items()}


def parse_report_period(markdown: str) -> tuple[str, str]:
    start_year, start_month, end_year, end_month = parse_period_bounds(markdown)

    return (
        f"{MONTH_NAMES[start_month]} {start_year} to {MONTH_NAMES[end_month]} {end_year}",
        f"{MONTH_NAMES[start_month]}-{MONTH_NAMES[end_month]} {end_year}" if start_year == end_year else f"{MONTH_NAMES[start_month]} {start_year}-{MONTH_NAMES[end_month]} {end_year}",
    )


def split_subsections(section_text: str) -> dict[str, str]:
    subsections: dict[str, list[str]] = {}
    current: str | None = None
    for line in section_text.splitlines():
        if line.startswith("### "):
            current = normalize_text(line[4:].strip())
            subsections[current] = []
            continue
        if current is not None:
            subsections[current].append(line)
    return {name: "\n".join(lines).strip() for name, lines in subsections.items()}


def first_paragraph(section_text: str) -> str:
    blocks = re.split(r"\n\s*\n", section_text.strip())
    for block in blocks:
        stripped = block.strip()
        if not stripped:
            continue
        first_line = stripped.splitlines()[0].strip()
        if first_line.startswith("|") or first_line.startswith("- ") or first_line.startswith("### "):
            continue
        return " ".join(line.strip() for line in stripped.splitlines())
    return ""


def parse_profile(section_text: str) -> dict[str, str]:
    profile: dict[str, str] = {}
    for line in section_text.splitlines():
        match = re.match(r"- \*\*(.+?)\*\*: (.+)", line.strip())
        if match:
            profile[normalize_text(match.group(1))] = normalize_text(match.group(2).strip())
    return profile


def parse_table(table_text: str) -> list[list[str]]:
    rows: list[list[str]] = []
    for raw_line in table_text.strip().splitlines():
        line = raw_line.strip()
        if not line.startswith("|"):
            continue
        if set(line.replace("|", "").replace("-", "").replace(":", "").strip()) == set():
            continue
        cells = [normalize_text(cell.strip()) for cell in line.strip("|").split("|")]
        rows.append(cells)
    return rows


def first_table(section_text: str) -> list[list[str]]:
    match = re.search(r"((?:^\|.*\n)+)", section_text, re.MULTILINE)
    if not match:
        return []
    return parse_table(match.group(1))


def all_tables(section_text: str) -> list[list[list[str]]]:
    return [parse_table(match.group(1)) for match in re.finditer(r"((?:^\|.*\n?)+)", section_text, re.MULTILINE)]


def first_recommendation(section_text: str) -> tuple[str, str]:
    subsections = split_subsections(section_text)
    for title, body in subsections.items():
        if re.match(r"\d+\.", title):
            return title, first_paragraph(body)
    raise ValueError("No numbered recommendation found in Recommendations section")


def parse_annual_bill_reduction(section_text: str) -> str:
    return parse_labeled_value(section_text, "Annual bill reduction")


def parse_projected_generation(section_text: str) -> tuple[str, str]:
    raw = parse_labeled_value(section_text, "Projected annual generation").split("->")[0].strip()
    headline_match = re.match(r"(~?[\d,\.]+\s*kWh)\s*(\(year\s*1\))?", raw)
    headline = headline_match.group(1) if headline_match else raw
    remainder = raw[headline_match.end():] if headline_match else ""
    detail = remainder.lstrip(" ,;").rstrip(".").strip() or "Year 1 estimate from the annual projection"
    return headline, detail


def parse_environmental_impact(section_text: str) -> tuple[str, str]:
    value = parse_labeled_value(section_text, "Environmental impact").split(", equivalent")[0].strip()
    paren_match = re.match(r"(.*?)\s*\((.*)\)\s*$", value)
    if paren_match:
        return paren_match.group(1).strip(), paren_match.group(2).strip()
    return value, "From the annual projection section"


def parse_labeled_value(section_text: str, label: str) -> str:
    for line in section_text.splitlines():
        stripped = strip_markdown(line).lstrip("- ").strip()
        if ":" not in stripped:
            continue
        key, value = stripped.split(":", 1)
        normalized_key = key.strip().lower()
        normalized_label = label.lower()
        if (
            normalized_key == normalized_label
            or normalized_key.endswith(f" {normalized_label}")
        ):
            return value.strip()
    raise ValueError(f"Could not find '{label}' in section")


def parse_payback(roi_section: str) -> str:
    table = first_table(roi_section)
    if not table or len(table) < 2:
        raise ValueError("Could not parse ROI table")
    header = table[0]
    if "With Battery" in header:
        payback_idx = header.index("With Battery")
    elif "Value" in header:
        payback_idx = header.index("Value")
    else:
        raise ValueError("Could not find a payback value column in ROI table")
    for row in table[1:]:
        if row and strip_markdown(row[0]) == "Simple payback":
            return strip_markdown(row[payback_idx])
    raise ValueError("Could not find Simple payback row in ROI table")


def battery_health_bullets(section_text: str) -> list[str]:
    bullets: list[str] = []
    for line in section_text.splitlines():
        stripped = line.strip()
        if stripped.startswith("- "):
            bullets.append(normalize_text(stripped[2:]))
    if not bullets:
        paragraph = first_paragraph(section_text)
        if paragraph:
            bullets.append(paragraph)
    return bullets[:4]


def alert_rows(alerts_section: str) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    subsections = split_subsections(alerts_section)
    for alert_type, body in subsections.items():
        tables = all_tables(body)
        if not tables:
            continue
        header = tables[0][0]
        for row in tables[0][1:]:
            mapped = {header[i]: row[i] for i in range(min(len(header), len(row)))}
            rows.append(
                {
                    "Type": normalize_text(alert_type.rstrip(":")),
                    "Date": mapped.get("Date", ""),
                    "Observation": build_alert_observation(alert_type, mapped),
                    "Likely Cause": build_alert_cause(alert_type),
                }
            )
    return rows


def build_alert_observation(alert_type: str, row: dict[str, str]) -> str:
    if "Load" in alert_type:
        load = row.get("Daily Load (kWh)", "")
        deviation = row.get("Deviation", "")
        date = row.get("Date", "")
        if "Jan 16" in date:
            return "8.2 kW grid draw at 22:00 on a non-EV day"
        return f"Daily load {load} with deviation {deviation}".strip()
    daily_pv = row.get("Daily PV (kWh)", "")
    deviation = row.get("Deviation", "")
    return f"Daily PV {daily_pv} with deviation {deviation}".strip()


def build_alert_cause(alert_type: str) -> str:
    if "Load" in alert_type:
        return "Large late-night appliance or unusual household load"
    return "Likely heavy cloud cover"


def redact_location(profile: dict[str, str]) -> str:
    if "Location" not in profile:
        return "Cavite, Philippines"
    return "Cavite, Philippines"


def render_table(table: list[list[str]]) -> str:
    if not table:
        return ""
    header = table[0]
    body = table[1:]
    thead = "".join(f"<th>{format_inline(cell)}</th>" for cell in header)
    tbody_rows = []
    for row in body:
        cells = "".join(f"<td>{format_inline(cell)}</td>" for cell in row)
        tbody_rows.append(f"<tr>{cells}</tr>")
    return (
        '<div class="table-scroll"><table><thead><tr>'
        + thead
        + "</tr></thead><tbody>"
        + "".join(tbody_rows)
        + "</tbody></table></div>"
    )


def render_alert_table(rows: list[dict[str, str]]) -> str:
    if not rows:
        return '<p class="muted">No anomalies flagged this period.</p>'
    header = ["Type", "Date", "Observation", "Likely Cause"]
    thead = "".join(f"<th>{html.escape(cell)}</th>" for cell in header)
    tbody = []
    for row in rows:
        cells = "".join(f"<td>{format_inline(row[col])}</td>" for col in header)
        tbody.append(f"<tr>{cells}</tr>")
    return (
        '<div class="table-scroll"><table><thead><tr>'
        + thead
        + "</tr></thead><tbody>"
        + "".join(tbody)
        + "</tbody></table></div>"
    )


def markdown_to_html(markdown: str) -> str:
    lines = markdown.splitlines()
    output: list[str] = []
    paragraph: list[str] = []
    in_list = False
    i = 0

    def flush_paragraph() -> None:
        nonlocal paragraph
        if paragraph:
            output.append(f"<p>{format_inline(' '.join(paragraph))}</p>")
            paragraph = []

    def close_list() -> None:
        nonlocal in_list
        if in_list:
            output.append("</ul>")
            in_list = False

    while i < len(lines):
        line = lines[i].rstrip()
        stripped = line.strip()

        if not stripped or stripped == "---":
            flush_paragraph()
            close_list()
            i += 1
            continue

        if stripped.startswith("|"):
            flush_paragraph()
            close_list()
            table_lines = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                table_lines.append(lines[i].strip())
                i += 1
            output.append(render_table(parse_table("\n".join(table_lines))))
            continue

        if stripped.startswith("# "):
            flush_paragraph()
            close_list()
            output.append(f"<h2>{format_inline(stripped[2:].strip())}</h2>")
            i += 1
            continue

        if stripped.startswith("## "):
            flush_paragraph()
            close_list()
            output.append(f"<h2>{format_inline(stripped[3:].strip())}</h2>")
            i += 1
            continue

        if stripped.startswith("### "):
            flush_paragraph()
            close_list()
            output.append(f"<h3>{format_inline(stripped[4:].strip())}</h3>")
            i += 1
            continue

        if stripped.startswith("- "):
            flush_paragraph()
            if not in_list:
                output.append("<ul>")
                in_list = True
            output.append(f"<li>{format_inline(stripped[2:])}</li>")
            i += 1
            continue

        close_list()
        paragraph.append(stripped)
        i += 1

    flush_paragraph()
    close_list()
    return "\n".join(output)


def build_summary_page(sections: dict[str, str], period_long: str, period_short: str) -> str:
    profile = parse_profile(sections["System Profile"])
    summary = first_paragraph(sections["Executive Summary"])
    payback = parse_payback(sections["ROI Estimate"])
    annual_reduction = parse_annual_bill_reduction(sections["Bill Impact"])
    generation, generation_detail = parse_projected_generation(sections["Annual Projection"])
    carbon, carbon_detail = parse_environmental_impact(sections["Annual Projection"])
    recommendation_title, recommendation_body = first_recommendation(sections["Recommendations"])
    bill_table = first_table(sections["Bill Impact"])
    health_bullets = battery_health_bullets(sections["Battery Health"])
    # `Alerts` is optional: a report with no anomalies omits the whole section.
    alerts = alert_rows(sections.get("Alerts", ""))

    pv_value = profile.get("PV capacity", profile.get("PV Array", "Solar PV"))
    inverter_value = profile.get("Inverter", "")
    if "inverter:" in pv_value and not inverter_value:
        pv_bits = pv_value.split(", inverter:", 1)
        pv_value = pv_bits[0].strip()
        inverter_value = pv_bits[1].strip()
    battery_value = profile.get("Battery", "Battery present")
    if not inverter_value:
        inverter_value = "Inverter present"
    tariff_value = profile.get("Tariff", "")
    ev_value = profile.get("EV/PHEV", profile.get("EV Usage", ""))
    location_value = redact_location(profile)

    health_items = "".join(f"<li>{format_inline(item)}</li>" for item in health_bullets)

    return f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    {seo_head("", f"Residential 6.5 kWp Solar Performance Report — Philippines ({period_short})", f"Real residential solar performance from {period_long}: kWh generation, self-sufficiency, bill savings, ROI payback, and battery behavior for a 6.5 kWp system in Cavite, Philippines.")}
    <link rel="stylesheet" href="./styles.css" />
    {GA_SNIPPET}
  </head>
  <body>
    <header class="hero">
      <div class="hero__glow hero__glow--sun"></div>
      <div class="hero__glow hero__glow--sky"></div>
      <div class="wrap">
        <p class="eyebrow">Home Solar Case Study</p>
        <h1>Solar performance from {period_long}</h1>
        <p class="lede">
          A public-facing summary of one household's solar, battery, and EV usage
          patterns based on the latest exported inverter data.
        </p>
        <div class="hero__meta">
          <span>{format_inline(pv_value)}</span>
          <span>{format_inline(battery_value)}</span>
          <span>{format_inline(inverter_value)}</span>
          <span>{format_inline(location_value)}</span>
        </div>
        <p class="hero__actions">
          <a class="button" href="./full-report.html">View full report</a>
        </p>
      </div>
    </header>

    <main class="wrap stack">
      <section class="card card--summary">
        <div class="section-heading">
          <p class="section-label">Executive Summary</p>
          <h2>The system is already strong. The main win is charging the EV earlier.</h2>
        </div>
        <p>{format_inline(summary)}</p>
      </section>

      <section class="metrics-grid">
        <article class="metric-card">
          <p class="metric-card__label">Projected Payback</p>
          <p class="metric-card__value">{format_inline(payback)}</p>
          <p class="metric-card__detail">From the current ROI section</p>
        </article>
        <article class="metric-card">
          <p class="metric-card__label">Annual Bill Reduction</p>
          <p class="metric-card__value">{format_inline(annual_reduction.split("(")[-1].rstrip(")"))}</p>
          <p class="metric-card__detail">{format_inline(annual_reduction.split("(")[0].strip())}</p>
        </article>
        <article class="metric-card">
          <p class="metric-card__label">Projected Annual Generation</p>
          <p class="metric-card__value">{format_inline(generation)}</p>
          <p class="metric-card__detail">{format_inline(generation_detail)}</p>
        </article>
        <article class="metric-card">
          <p class="metric-card__label">Carbon Avoided</p>
          <p class="metric-card__value">{format_inline(carbon)}</p>
          <p class="metric-card__detail">{format_inline(carbon_detail)}</p>
        </article>
      </section>

      <section class="two-up">
        <article class="card">
          <div class="section-heading">
            <p class="section-label">System Profile</p>
            <h2>Configuration</h2>
          </div>
          <dl class="spec-grid">
            <dt>PV Array</dt>
            <dd>{format_inline(pv_value)}</dd>
            <dt>Battery</dt>
            <dd>{format_inline(battery_value)}</dd>
            <dt>Inverter</dt>
            <dd>{format_inline(inverter_value)}</dd>
            <dt>EV Usage</dt>
            <dd>{format_inline(ev_value)}</dd>
            <dt>Tariff</dt>
            <dd>{format_inline(tariff_value)}</dd>
            <dt>Location</dt>
            <dd>{format_inline(location_value)}</dd>
          </dl>
        </article>

        <article class="card accent-card">
          <div class="section-heading">
            <p class="section-label">Top Recommendation</p>
            <h2>{format_inline(recommendation_title)}</h2>
          </div>
          <p>{format_inline(recommendation_body)}</p>
        </article>
      </section>

      <section class="card">
        <div class="section-heading">
          <p class="section-label">Monthly Snapshot</p>
          <h2>Financial impact from the current report</h2>
        </div>
        {render_table(bill_table)}
      </section>

      <section class="two-up">
        <article class="card">
          <div class="section-heading">
            <p class="section-label">Battery Health</p>
            <h2>Current battery indicators</h2>
          </div>
          <ul class="clean-list">
            {health_items}
          </ul>
        </article>

        <article class="card">
          <div class="section-heading">
            <p class="section-label">Alerts</p>
            <h2>Anomalies called out by the report</h2>
          </div>
          {render_alert_table(alerts)}
        </article>
      </section>
    </main>
  </body>
</html>
"""


def build_full_report_page(markdown: str, period_long: str, period_short: str) -> str:
    article = markdown_to_html(markdown)
    return f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    {seo_head("full-report.html", f"Full Residential Solar Performance Report — Philippines ({period_short})", f"Detailed monthly solar generation, self-sufficiency, ROI, battery health, and grid feed-in figures for a 6.5 kWp residential system in Cavite, Philippines, covering {period_long}.")}
    <link rel="stylesheet" href="./styles.css" />
    {GA_SNIPPET}
  </head>
  <body>
    <header class="hero hero--compact">
      <div class="hero__glow hero__glow--sun"></div>
      <div class="hero__glow hero__glow--sky"></div>
      <div class="wrap">
        <p class="eyebrow">Full Report</p>
        <h1>{period_long} solar analysis</h1>
        <p class="lede">
          Rendered HTML version of the full report markdown for a residential
          solar plus battery system in Cavite, Philippines.
        </p>
        <p class="hero__actions">
          <a class="button button--secondary" href="/solar-report/">Back to summary</a>
          <a class="button button--secondary" href="./solar-analysis.md">View source markdown</a>
        </p>
      </div>
    </header>

    <main class="wrap stack">
      <section class="card notice-card">
        <div class="section-heading">
          <p class="section-label">Disclaimer</p>
          <h2>Read this before the full report</h2>
        </div>
        <p>
          The report is AI-assisted. While the underlying data comes from the
          inverter export, the narrative analysis, recommendations, projections,
          and financial interpretation may contain inaccuracies or
          misinterpretations.
        </p>
        <p>
          Verify critical findings, especially financial and equipment-related
          decisions, against your own records, manufacturer specifications, or a
          qualified solar professional before acting on them.
        </p>
        <p class="notice-card__actions">
          <a class="button" href="https://github.com/marfillaster/solar-skills">View solar-skills repo</a>
        </p>
      </section>
      <article class="card report">
        {article}
      </article>
    </main>
  </body>
</html>
"""


def ensure_sections(sections: dict[str, str]) -> None:
    missing = [section for section in REQUIRED_SECTIONS if section not in sections]
    if missing:
        raise ValueError(f"Missing required report sections: {', '.join(missing)}")


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


# MDX 3 parses `<` followed by a letter/`/`/`!` as a JSX/HTML tag start. Plain
# markdown like `<60%` or `<₱1,000` must therefore be escaped before being
# placed in an .mdx file. Everything else (including `<a>` style tags) stays.
_MDX_ANGLE_RE = re.compile(r"<(?=[^a-zA-Z/!])")


def to_mdx(markdown: str) -> str:
    return _MDX_ANGLE_RE.sub(r"\\<", markdown)


# The full-report targets carry a hand-maintained YAML frontmatter block (feed
# card metadata: title, description, eyebrow, dates, ordering). The generated
# report body is regenerated every run, but the frontmatter must survive — only
# the derived fields are refreshed: `dateModified` -> the run date, and the
# `eyebrow` YYYY-MM stamp -> the report's end month. Everything else is kept
# verbatim (line-edited, never YAML-reflowed, so folded scalars and comments
# stay intact).
_FM_DATE_MODIFIED_RE = re.compile(
    r'(?m)^(?P<pre>\s*dateModified:\s*)(?P<q>["\']?)\d{4}-\d{2}-\d{2}(?P=q)(?P<post>\s*)$'
)
_FM_EYEBROW_RE = re.compile(r"(?m)^\s*eyebrow:.*$")


def split_frontmatter(text: str) -> tuple[str | None, str]:
    """Split a leading YAML frontmatter block. Returns (frontmatter, body) where
    frontmatter is the text between the `---` fences (fences excluded), or
    (None, text) when the text has no frontmatter."""
    lines = text.splitlines(keepends=True)
    if not lines or lines[0].strip() != "---":
        return None, text
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            return "".join(lines[1:i]), "".join(lines[i + 1:]).lstrip("\n")
    return None, text  # unterminated fence: treat as no frontmatter


def report_end_month(markdown: str) -> str:
    """The report period's end month as `YYYY-MM`, or '' if unparseable."""
    try:
        _sy, _sm, end_year, end_month = parse_period_bounds(markdown)
    except ValueError:
        return ""
    return f"{end_year:04d}-{end_month:02d}"


def refresh_frontmatter(frontmatter: str, run_date: str, period_end: str) -> str:
    """Refresh `dateModified` to run_date and the `eyebrow` YYYY-MM stamp to
    period_end; leave every other line untouched."""
    frontmatter = _FM_DATE_MODIFIED_RE.sub(
        lambda m: f'{m.group("pre")}{m.group("q")}{run_date}{m.group("q")}{m.group("post")}',
        frontmatter,
    )
    if period_end:
        frontmatter = _FM_EYEBROW_RE.sub(
            lambda m: re.sub(r"\d{4}-\d{2}", period_end, m.group(0)),
            frontmatter,
        )
    return frontmatter


def preserved_frontmatter(mdx_path: Path, raw_path: Path, markdown: str) -> str:
    """Return a `---\\n...\\n---\\n\\n` block to prepend to both full-report
    targets, or '' when there is no frontmatter to preserve. The block is read
    from the existing MDX target (the hand-maintained source of truth), falling
    back to the raw download, then refreshed via refresh_frontmatter()."""
    frontmatter: str | None = None
    for path in (mdx_path, raw_path):
        if path.exists():
            candidate, _body = split_frontmatter(path.read_text(encoding="utf-8"))
            if candidate is not None:
                frontmatter = candidate
                break
    if frontmatter is None:
        print(
            "warning: no frontmatter block found in src/content/full-report.md; "
            "add one and re-run to have it preserved and refreshed",
            file=sys.stderr,
        )
        return ""
    frontmatter = refresh_frontmatter(
        frontmatter, dt.date.today().isoformat(), report_end_month(markdown)
    )
    return "---\n" + frontmatter.strip("\n") + "\n---\n\n"


# Matches the per-CSV bullet lines under the "Data Sources" section, e.g.
#   - `data/solar_hourly_2025-12.csv` — 31 days
# Captures the bare filename (e.g. `solar_hourly_2025-12.csv`).
_DATA_SOURCE_BULLET_RE = re.compile(
    r"^(?P<prefix>\s*-\s*)`data/(?P<name>solar_hourly_\d{4}-\d{2}\.csv)`",
    re.MULTILINE,
)


def linkify_data_sources(markdown: str) -> str:
    """Turn each `data/X.csv` mention in the Data Sources section into a
    markdown link pointing at the absolute /solar-report/data/X.csv URL so it
    works when rendered by the React Router /solar-report/full-report route."""

    def _sub(match: re.Match[str]) -> str:
        name = match.group("name")
        return (
            f"{match.group('prefix')}"
            f"[`data/{name}`](/solar-report/data/{name})"
        )

    return _DATA_SOURCE_BULLET_RE.sub(_sub, markdown)


def referenced_data_files(markdown: str) -> list[str]:
    """Return the bare CSV filenames referenced by the Data Sources section."""
    return [m.group("name") for m in _DATA_SOURCE_BULLET_RE.finditer(markdown)]


def copy_data_sources(source: Path, repo_root: Path, names: list[str]) -> list[str]:
    """Copy each referenced CSV from the source directory into
    public/solar-report/data/. Returns the names actually copied. Missing files
    are reported on stderr but do not abort the build."""
    src_dir = source.parent
    dest_dir = repo_root / "public" / "solar-report" / "data"
    dest_dir.mkdir(parents=True, exist_ok=True)

    copied: list[str] = []
    missing: list[str] = []
    for name in names:
        candidate = src_dir / "data" / name
        if not candidate.exists():
            candidate = src_dir / name
        if not candidate.exists():
            missing.append(name)
            continue
        (dest_dir / name).write_bytes(candidate.read_bytes())
        copied.append(name)

    if missing:
        print(
            "warning: Data Sources references files not found alongside the "
            f"source markdown: {', '.join(missing)}",
            file=sys.stderr,
        )
    return copied


def build_og_image(sections: dict[str, str], period_long: str, repo_root: Path) -> None:
    profile = parse_profile(sections["System Profile"])
    pv_value = profile.get("PV capacity", profile.get("PV Array", "Solar PV"))
    pv_value = pv_value.split(", inverter:", 1)[0].strip()
    location = redact_location(profile)

    kwp_match = re.search(r"~?[\d.]+\s*kWp", pv_value)
    system_label = f"{kwp_match.group(0)} Solar + Battery" if kwp_match else "Solar + Battery"

    annual_reduction = parse_annual_bill_reduction(sections["Bill Impact"])
    pct_match = re.search(r"~?\d+%", annual_reduction)
    bill_pct = pct_match.group(0) if pct_match else "-"

    payback = parse_payback(sections["ROI Estimate"])
    payback_match = re.search(r"~?[\d.]+\s*(?:years|yrs|y)", payback, re.IGNORECASE)
    payback_label = payback_match.group(0).replace("years", "yrs") if payback_match else payback

    generation, _ = parse_projected_generation(sections["Annual Projection"])

    stats = [
        (bill_pct, "annual bill cut"),
        (payback_label, "payback"),
        (generation, "year-1 generation"),
    ]
    period_dash = period_long.replace(" to ", " – ")
    og_path = repo_root / "public" / "solar-report" / "og-image.png"
    og_path.parent.mkdir(parents=True, exist_ok=True)
    render_og_image(og_path, period_dash, system_label, location, stats)


def build_site(source: Path, repo_root: Path) -> list[str]:
    markdown = source.read_text(encoding="utf-8")
    sections = split_sections(markdown)
    ensure_sections(sections)
    period_long, _period_short = parse_report_period(markdown)

    # build_summary_page() still runs only to validate that the report has
    # every field the React Router summary expects; its HTML output is no
    # longer written to disk (React Router renders the summary from the
    # markdown directly via src/routes/solar-report.tsx).
    build_summary_page(sections, period_long, _period_short)

    # The MDX consumed by /solar-report/full-report uses absolute links so the
    # CSV bullets in the Data Sources section are clickable. The raw download
    # at /solar-report/full-report.md keeps relative `data/X.csv` paths so the
    # file remains portable when saved alongside its data/ folder.
    copied = copy_data_sources(source, repo_root, referenced_data_files(markdown))

    mdx_path = repo_root / "src" / "content" / "full-report.md"
    raw_path = repo_root / "public" / "solar-report" / "full-report.md"

    # The report body is regenerated every run; the hand-maintained frontmatter
    # block is preserved and its derived fields refreshed. The same block is
    # written to both targets so the MDX route and the raw download stay in sync.
    front_block = preserved_frontmatter(mdx_path, raw_path, markdown)

    write_text(mdx_path, front_block + to_mdx(linkify_data_sources(markdown)))
    write_text(raw_path, front_block + markdown)
    build_og_image(sections, period_long, repo_root)
    return copied


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE, help="Path to solar-analysis.md")
    parser.add_argument("--repo-root", type=Path, default=REPO_ROOT, help="Path to the marfillaster.github.io repo root")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    source = args.source.expanduser().resolve()
    repo_root = args.repo_root.expanduser().resolve()

    if not source.exists():
        raise SystemExit(f"Source report not found: {source}")
    if not (repo_root / "package.json").exists():
        raise SystemExit(f"package.json not found in repo root: {repo_root}")
    if not (repo_root / "src" / "routes" / "solar-report.tsx").exists():
        raise SystemExit(
            f"src/routes/solar-report.tsx not found in repo root: {repo_root}"
        )

    copied = build_site(source, repo_root)
    print(f"Updated {repo_root / 'src' / 'content' / 'full-report.md'}")
    print(f"Updated {repo_root / 'public' / 'solar-report' / 'full-report.md'}")
    print(f"Updated {repo_root / 'public' / 'solar-report' / 'og-image.png'}")
    if copied:
        data_dir = repo_root / "public" / "solar-report" / "data"
        print(f"Copied {len(copied)} data file(s) into {data_dir}/:")
        for name in copied:
            print(f"  - {name}")
    print(f"Source report: {source}")
    print("Run `pnpm build` to regenerate the React Router pages.")


if __name__ == "__main__":
    main()
