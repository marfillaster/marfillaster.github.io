#!/usr/bin/env python3
"""Generate the social-share og-image.png for the nev-mileage site.

Run standalone or via update_nev_site.py. Output: 1200x630 PNG.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 1200, 630
BG_TOP = (224, 240, 233)
BG_BOTTOM = (216, 232, 226)
INK = (24, 40, 36)
MUTED = (90, 110, 104)
LEAF = (33, 138, 96)
SLATE = (38, 78, 92)
LEAF_GLOW = (74, 176, 122)

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REGULAR = "/System/Library/Fonts/Helvetica.ttc"
FONT_BLACK = "/System/Library/Fonts/Supplemental/Arial Black.ttf"


def font(path: str, size: int, index: int = 0) -> ImageFont.FreeTypeFont:
    return (
        ImageFont.truetype(path, size, index=index)
        if path.endswith(".ttc")
        else ImageFont.truetype(path, size)
    )


def vertical_gradient(size, top, bottom):
    base = Image.new("RGB", size, top)
    pixels = base.load()
    w, h = size
    for y in range(h):
        t = y / max(1, h - 1)
        row = (
            int(top[0] * (1 - t) + bottom[0] * t),
            int(top[1] * (1 - t) + bottom[1] * t),
            int(top[2] * (1 - t) + bottom[2] * t),
        )
        for x in range(w):
            pixels[x, y] = row
    return base


def radial_glow(size, center, radius, color, alpha):
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    steps = 60
    for i in range(steps, 0, -1):
        r = int(radius * (i / steps))
        a = int(alpha * (1 - i / steps) ** 2)
        draw.ellipse(
            [center[0] - r, center[1] - r, center[0] + r, center[1] + r],
            fill=(*color, a),
        )
    return layer


def text_width(draw, text, fnt):
    bbox = draw.textbbox((0, 0), text, font=fnt)
    return bbox[2] - bbox[0]


def render(output: Path, period: str, vehicle: str, stats: list[tuple[str, str]]) -> None:
    img = vertical_gradient((WIDTH, HEIGHT), BG_TOP, BG_BOTTOM).convert("RGBA")
    img = Image.alpha_composite(
        img, radial_glow((WIDTH, HEIGHT), (WIDTH - 120, 120), 520, LEAF_GLOW, 200)
    )
    img = Image.alpha_composite(
        img, radial_glow((WIDTH, HEIGHT), (120, HEIGHT - 80), 460, (96, 150, 168), 130)
    )
    draw = ImageDraw.Draw(img)

    eyebrow_font = font(FONT_BOLD, 28)
    headline_font = font(FONT_BLACK, 76)
    sub_font = font(FONT_REGULAR, 34)
    period_font = font(FONT_BOLD, 28)
    stat_value_font = font(FONT_BLACK, 60)
    stat_label_font = font(FONT_REGULAR, 22)
    footer_font = font(FONT_BOLD, 24)

    margin_x = 80
    y = 70
    draw.text((margin_x, y), "EV / PHEV MILEAGE REPORT", font=eyebrow_font, fill=SLATE)
    y += 56
    draw.text((margin_x, y), vehicle, font=headline_font, fill=INK)
    y += 96
    draw.text((margin_x, y), "Real-world driving cost & efficiency", font=sub_font, fill=MUTED)
    y += 50
    draw.text((margin_x, y), period, font=period_font, fill=LEAF)
    y += 80

    draw.line([(margin_x, y - 10), (WIDTH - margin_x, y - 10)], fill=(24, 40, 36, 40), width=2)

    stat_y = HEIGHT - 230
    col_width = (WIDTH - 2 * margin_x) // max(1, len(stats))
    col_gap = 32
    max_value_w = col_width - col_gap
    for i, (value, label) in enumerate(stats):
        col_x = margin_x + i * col_width
        # Shrink the value font until it fits inside its column so adjacent
        # stats never overlap (e.g. a long "~PHP 10,900").
        size = 60
        value_font = stat_value_font
        while size > 32 and text_width(draw, value, value_font) > max_value_w:
            size -= 2
            value_font = font(FONT_BLACK, size)
        draw.text((col_x, stat_y), value, font=value_font, fill=LEAF)
        draw.text((col_x, stat_y + 78), label, font=stat_label_font, fill=MUTED)

    footer = "blog.homestack.space/nev-mileage"
    fw = text_width(draw, footer, footer_font)
    draw.text((WIDTH - margin_x - fw, HEIGHT - 60), footer, font=footer_font, fill=SLATE)

    img.convert("RGB").save(output, "PNG", optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).resolve().parents[4]
        / "public"
        / "nev-mileage"
        / "og-image.png",
    )
    parser.add_argument("--period", default="December 2025 - March 2026")
    parser.add_argument("--vehicle", default="BYD Sealion 6")
    args = parser.parse_args()
    stats = [
        ("60% EV", "electric driving"),
        ("PHP 8,504", "saved vs ICE"),
        ("~280 kg", "CO2 avoided"),
    ]
    render(args.output, args.period, args.vehicle, stats)
    print(f"Wrote {args.output}")


if __name__ == "__main__":
    main()
