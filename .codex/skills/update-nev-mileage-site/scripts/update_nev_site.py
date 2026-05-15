#!/usr/bin/env python3
"""Regenerate the nev-mileage site from a PHEV Tracker report markdown.

Source of truth: ~/phev-tracker/report.md (the extended AI-analysis report
emitted by the phev-tracker skill). The refuel log CSV that backs the report
lives at ~/.local/share/phev-tracker/phev_log.csv.

This script only regenerates the markdown inputs + OG image + copied data file
under /nev-mileage. The summary route (src/routes/nev-mileage.tsx) is
hand-shaped and is NOT regenerated here; update it by hand when headline
numbers change. `pnpm build` produces the final HTML.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from generate_og_image import render as render_og_image  # noqa: E402

DEFAULT_SOURCE = Path.home() / "phev-tracker" / "report.md"
DEFAULT_DATA = Path.home() / ".local" / "share" / "phev-tracker" / "phev_log.csv"
REPO_ROOT = Path(__file__).resolve().parents[4]

# Output targets in the React Router site layout:
#   - src/content/nev-full-report.md → markdown with `\<` escapes; imported by
#     the /nev-mileage/full-report route via the MDX plugin. The Data Sources
#     bullet is linkified to the absolute /nev-mileage/data/ URL.
#   - public/nev-mileage/full-report.md → raw (unescaped) markdown served as
#     the download link; the Data Sources bullet keeps a relative data/ path.
#   - public/nev-mileage/og-image.png → OG image for both /nev-mileage routes.
#   - public/nev-mileage/data/phev_log.csv → the refuel log, copied verbatim.
MDX_PATH = REPO_ROOT / "src" / "content" / "nev-full-report.md"
RAW_REPORT_PATH = REPO_ROOT / "public" / "nev-mileage" / "full-report.md"
OG_IMAGE_PATH = REPO_ROOT / "public" / "nev-mileage" / "og-image.png"
DATA_DEST = REPO_ROOT / "public" / "nev-mileage" / "data" / "phev_log.csv"

# Section headings (## level) expected in the PHEV Tracker extended report.
REQUIRED_SECTIONS = [
    "Last Refuel",
    "Cumulative",
    "Executive Summary",
    "AI Analysis",
    "Inferred Insights",
]

MONTH_NAMES = {
    1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June",
    7: "July", 8: "August", 9: "September", 10: "October", 11: "November",
    12: "December",
}

# MDX 3 parses `<` followed by a letter/`/`/`!` as a JSX/HTML tag start. Plain
# markdown like `<10` or `<₱1,000` must be escaped before landing in an .md
# file consumed by the MDX plugin. Everything else stays.
_MDX_ANGLE_RE = re.compile(r"<(?=[^a-zA-Z/!])")


def to_mdx(markdown: str) -> str:
    return _MDX_ANGLE_RE.sub(r"\\<", markdown)


def split_sections(markdown: str) -> dict[str, str]:
    sections: dict[str, list[str]] = {}
    current: str | None = None
    for line in markdown.splitlines():
        if line.startswith("## "):
            current = line[3:].strip()
            sections[current] = []
            continue
        if current is not None:
            sections[current].append(line)
    return {name: "\n".join(lines).strip() for name, lines in sections.items()}


def ensure_sections(sections: dict[str, str]) -> None:
    missing = [s for s in REQUIRED_SECTIONS if s not in sections]
    if missing:
        raise SystemExit(
            "Missing required report sections: " + ", ".join(missing)
        )


def parse_period(data_csv: Path, fallback_markdown: str) -> str:
    """Derive a 'Month YYYY - Month YYYY' period from the log CSV date column;
    fall back to the report header date if the CSV is unavailable."""
    dates: list[tuple[int, int]] = []
    if data_csv.exists():
        for row in data_csv.read_text(encoding="utf-8").splitlines()[1:]:
            cell = row.split(",", 1)[0].strip()
            m = re.match(r"(\d{4})-(\d{2})-\d{2}", cell)
            if m:
                dates.append((int(m.group(1)), int(m.group(2))))
    if not dates:
        m = re.search(r"(\d{4})-(\d{2})-\d{2}", fallback_markdown)
        if not m:
            return "PHEV mileage report"
        dates = [(int(m.group(1)), int(m.group(2)))]
    dates.sort()
    (sy, sm), (ey, em) = dates[0], dates[-1]
    start = f"{MONTH_NAMES[sm]} {sy}"
    end = f"{MONTH_NAMES[em]} {ey}"
    return start if start == end else f"{start} - {end}"


def parse_header(markdown: str) -> tuple[str, str]:
    """Vehicle label + fill-up count from the report's first bold header line,
    e.g. `**BYD Sealion 6** · *3 fill-ups tracked* · 2026-02-16`."""
    vehicle = "PHEV"
    fillups = ""
    for line in markdown.splitlines():
        line = line.strip()
        if not line:
            continue
        vm = re.search(r"\*\*(.+?)\*\*", line)
        if vm:
            vehicle = vm.group(1).strip()
        fm = re.search(r"\*([0-9]+ fill-ups? tracked)\*", line)
        if fm:
            fillups = fm.group(1).strip()
        break
    return vehicle, fillups


def labeled_value(section_text: str, label: str) -> str | None:
    """Pull a value from an `| Label | Value |`-style Inferred Insights row."""
    for raw in section_text.splitlines():
        line = raw.strip()
        if not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) >= 2 and cells[0].lower() == label.lower():
            return cells[1]
    return None


_OG_NORMALIZE = {
    "₱": "PHP ", "–": "-", "—": "-", "‘": "'",
    "’": "'", "“": '"', "”": '"', "→": "->",
    "·": "-", "₂": "2", "≈": "~", "±": "+/-",
}


def og_text(text: str) -> str:
    for src, dst in _OG_NORMALIZE.items():
        text = text.replace(src, dst)
    return re.sub(r"\s+", " ", text).strip()


def compact_money(text: str) -> str:
    """Abbreviate a currency figure for the OG card, e.g. `~₱10,900` -> `~₱11k`,
    so the bottom stats stay short and balanced."""
    m = re.search(r"([₱$P])\s?([\d,]+)", text)
    if not m:
        return text
    num = int(m.group(2).replace(",", ""))
    if num < 1000:
        return text
    return f"{text[:m.start(2)]}{round(num / 1000)}k"


_DATA_SOURCES_BLOCK = """## Data Sources

- `data/phev_log.csv` - refuel log (odometer, plug meter, fuel, tariff) backing every figure above
"""


def append_data_sources(markdown: str) -> str:
    if "## Data Sources" in markdown:
        return markdown.rstrip() + "\n"
    return markdown.rstrip() + "\n\n---\n\n" + _DATA_SOURCES_BLOCK


def linkify_data_sources(markdown: str) -> str:
    return markdown.replace(
        "`data/phev_log.csv`",
        "[`data/phev_log.csv`](/nev-mileage/data/phev_log.csv)",
    )


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def build_og_image(
    sections: dict[str, str], vehicle: str, period: str, repo_root: Path
) -> None:
    insights = sections.get("Inferred Insights", "")
    summary = sections.get("Executive Summary", "")

    distance = labeled_value(insights, "Projected annual") or ""
    savings = labeled_value(insights, "Lifetime savings vs ICE") or ""
    co2 = labeled_value(insights, "CO2 avoided") or labeled_value(
        insights, "CO₂ avoided"
    ) or ""

    ev_pct = ""
    pm = re.search(r"(\d+)%\s*EV", og_text(summary))
    if pm:
        ev_pct = f"{pm.group(1)}% EV"

    stats = [
        (og_text(ev_pct) or "-", "electric driving"),
        (og_text(compact_money(savings)) or "-", "saved vs ICE"),
        (og_text(co2) or "-", "CO2 avoided"),
    ]
    og_path = repo_root / "public" / "nev-mileage" / "og-image.png"
    og_path.parent.mkdir(parents=True, exist_ok=True)
    render_og_image(og_path, og_text(period), og_text(vehicle), stats)


def build_site(source: Path, data_csv: Path, repo_root: Path) -> bool:
    markdown = source.read_text(encoding="utf-8")
    sections = split_sections(markdown)
    ensure_sections(sections)

    vehicle, _fillups = parse_header(markdown)
    period = parse_period(data_csv, markdown)

    copied = False
    if data_csv.exists():
        DATA_DEST.parent.mkdir(parents=True, exist_ok=True)
        DATA_DEST.write_bytes(data_csv.read_bytes())
        copied = True
    else:
        print(
            f"warning: data CSV not found at {data_csv}; Data Sources link "
            "will 404 until the file is published",
            file=sys.stderr,
        )

    with_sources = append_data_sources(markdown)
    write_text(MDX_PATH, to_mdx(linkify_data_sources(with_sources)))
    write_text(RAW_REPORT_PATH, with_sources)
    build_og_image(sections, vehicle, period, repo_root)
    return copied


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE,
                        help="Path to the PHEV Tracker report.md")
    parser.add_argument("--data", type=Path, default=DEFAULT_DATA,
                        help="Path to phev_log.csv")
    parser.add_argument("--repo-root", type=Path, default=REPO_ROOT,
                        help="Path to the blog repo root")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    source = args.source.expanduser().resolve()
    data_csv = args.data.expanduser().resolve()
    repo_root = args.repo_root.expanduser().resolve()

    if not source.exists():
        raise SystemExit(f"Source report not found: {source}")
    if not (repo_root / "package.json").exists():
        raise SystemExit(f"package.json not found in repo root: {repo_root}")
    if not (repo_root / "src" / "routes" / "nev-mileage.tsx").exists():
        raise SystemExit(
            f"src/routes/nev-mileage.tsx not found in repo root: {repo_root}"
        )

    copied = build_site(source, data_csv, repo_root)
    print(f"Updated {MDX_PATH}")
    print(f"Updated {RAW_REPORT_PATH}")
    print(f"Updated {OG_IMAGE_PATH}")
    if copied:
        print(f"Copied refuel log into {DATA_DEST}")
    print(f"Source report: {source}")
    print("Run `pnpm build` to regenerate the React Router pages.")


if __name__ == "__main__":
    main()
