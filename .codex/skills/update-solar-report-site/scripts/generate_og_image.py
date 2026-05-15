#!/usr/bin/env python3
"""Generate the social-share og-image.png for the solar-report site.

Run standalone or via update_site.py. Output: <repo-root>/og-image.png at 1200x630.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 1200, 630
BG_TOP = (244, 231, 210)
BG_BOTTOM = (239, 231, 220)
INK = (29, 42, 47)
MUTED = (95, 109, 111)
SUN = (219, 108, 43)
SEA = (47, 96, 102)
SUN_GLOW = (240, 164, 50)

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REGULAR = "/System/Library/Fonts/Helvetica.ttc"
FONT_BLACK = "/System/Library/Fonts/Supplemental/Arial Black.ttf"


def font(path: str, size: int, index: int = 0) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size, index=index) if path.endswith(".ttc") else ImageFont.truetype(path, size)


def vertical_gradient(size: tuple[int, int], top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    base = Image.new("RGB", size, top)
    pixels = base.load()
    w, h = size
    for y in range(h):
        t = y / max(1, h - 1)
        r = int(top[0] * (1 - t) + bottom[0] * t)
        g = int(top[1] * (1 - t) + bottom[1] * t)
        b = int(top[2] * (1 - t) + bottom[2] * t)
        for x in range(w):
            pixels[x, y] = (r, g, b)
    return base


def radial_glow(size: tuple[int, int], center: tuple[int, int], radius: int, color: tuple[int, int, int], alpha: int) -> Image.Image:
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


def draw_text(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, fnt: ImageFont.FreeTypeFont, fill: tuple[int, int, int]) -> None:
    draw.text(xy, text, font=fnt, fill=fill)


def text_width(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont) -> int:
    bbox = draw.textbbox((0, 0), text, font=fnt)
    return bbox[2] - bbox[0]


def render(output: Path, period: str, system_label: str, location: str, stats: list[tuple[str, str]]) -> None:
    img = vertical_gradient((WIDTH, HEIGHT), BG_TOP, BG_BOTTOM).convert("RGBA")
    img = Image.alpha_composite(img, radial_glow((WIDTH, HEIGHT), (WIDTH - 120, 120), 520, SUN_GLOW, 220))
    img = Image.alpha_composite(img, radial_glow((WIDTH, HEIGHT), (120, HEIGHT - 80), 460, (120, 167, 172), 140))

    draw = ImageDraw.Draw(img)

    eyebrow_font = font(FONT_BOLD, 28)
    headline_font = font(FONT_BLACK, 78)
    sub_font = font(FONT_REGULAR, 34)
    period_font = font(FONT_BOLD, 28)
    stat_value_font = font(FONT_BLACK, 64)
    stat_label_font = font(FONT_REGULAR, 22)
    footer_font = font(FONT_BOLD, 24)

    margin_x = 80
    y = 70

    eyebrow = "RESIDENTIAL SOLAR PERFORMANCE REPORT"
    draw_text(draw, (margin_x, y), eyebrow, eyebrow_font, SEA)
    y += 56

    draw_text(draw, (margin_x, y), system_label, headline_font, INK)
    y += 96

    draw_text(draw, (margin_x, y), location, sub_font, MUTED)
    y += 50

    draw_text(draw, (margin_x, y), period, period_font, SUN)
    y += 80

    line_y = y - 10
    draw.line([(margin_x, line_y), (WIDTH - margin_x, line_y)], fill=(29, 42, 47, 40), width=2)

    stat_y = HEIGHT - 230
    col_width = (WIDTH - 2 * margin_x) // len(stats)
    for i, (value, label) in enumerate(stats):
        col_x = margin_x + i * col_width
        draw_text(draw, (col_x, stat_y), value, stat_value_font, SUN)
        draw_text(draw, (col_x, stat_y + 80), label, stat_label_font, MUTED)

    footer = "marfillaster.github.io/solar-report"
    fw = text_width(draw, footer, footer_font)
    draw_text(draw, (WIDTH - margin_x - fw, HEIGHT - 60), footer, footer_font, SEA)

    img.convert("RGB").save(output, "PNG", optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parents[4] / "og-image.png")
    parser.add_argument("--period", default="December 2025 – April 2026")
    parser.add_argument("--system", default="6.5 kWp Solar + Battery")
    parser.add_argument("--location", default="Cavite, Philippines")
    args = parser.parse_args()

    stats = [
        ("~69%", "annual bill cut"),
        ("~3.5 yrs", "payback"),
        ("~7,663 kWh", "year-1 generation"),
    ]
    render(args.output, args.period, args.system, args.location, stats)
    print(f"Wrote {args.output}")


if __name__ == "__main__":
    main()
