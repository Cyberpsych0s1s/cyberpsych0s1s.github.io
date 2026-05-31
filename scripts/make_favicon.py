"""Build favicon.svg from the Departure Mono glyph 'a'.

Departure Mono is a pixel face, so we rasterize the glyph, quantize it to a
small cell grid, and emit one SVG <rect> per lit cell. Result is crisp at any
size, matches the wordmark exactly, and spends no red on static tab chrome.
Run: python scripts/make_favicon.py  ->  static/favicon.svg
"""
import os
import tempfile
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WOFF2 = os.path.join(ROOT, "static", "fonts", "departure-mono-regular.woff2")
OUT = os.path.join(ROOT, "static", "favicon.svg")

BG = "#15110b"
PAPER = "#ddd5c4"

GLYPH = "a"
GRID = 24          # logical pixel grid the glyph is quantized onto
PAD_X, PAD_Y = 3, 3  # cells of padding around the glyph cells
THRESH = 110       # luma cutoff for a cell being "lit"

tmp = tempfile.NamedTemporaryFile(suffix=".ttf", delete=False)
tmp.close()
f = TTFont(WOFF2)
f.flavor = None
f.save(tmp.name)

# render the glyph big, tight-crop, then downsample to the cell grid
big = ImageFont.truetype(tmp.name, 400)
probe = Image.new("L", (600, 600), 0)
d = ImageDraw.Draw(probe)
d.text((100, 100), GLYPH, font=big, fill=255)
bbox = probe.getbbox()
glyph = probe.crop(bbox)

# target glyph cell size: keep aspect, fit inside (GRID - 2*PAD)
avail = GRID - 2 * PAD_X
gw, gh = glyph.size
scale = avail / max(gw, gh)
cw, ch = max(1, round(gw * scale)), max(1, round(gh * scale))
small = glyph.resize((cw, ch), Image.LANCZOS)

cells = []
ox = (GRID - cw) // 2
oy = (GRID - ch) // 2
px = small.load()
for y in range(ch):
    for x in range(cw):
        if px[x, y] >= THRESH:
            cells.append((ox + x, oy + y))

os.unlink(tmp.name)

rects = "\n".join(
    f'  <rect x="{x}" y="{y}" width="1" height="1"/>' for x, y in cells
)
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {GRID} {GRID}" shape-rendering="crispEdges">
  <rect width="{GRID}" height="{GRID}" rx="3" fill="{BG}"/>
  <g fill="{PAPER}">
{rects}
  </g>
</svg>
'''
with open(OUT, "w", encoding="utf-8") as fh:
    fh.write(svg)
print("wrote", OUT, f"({len(cells)} cells, glyph {cw}x{ch})")
