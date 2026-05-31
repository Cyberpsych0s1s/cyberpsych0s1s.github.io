"""Render the OG/Twitter share card for almahri.node.

Self-hosted Departure Mono ships as woff2; convert it to a TTF in a temp dir so
Pillow can rasterize with the real site face, then draw the boot-screen card.
Run: python scripts/make_og.py  ->  static/og.png
"""
import os
import tempfile
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WOFF2 = os.path.join(ROOT, "static", "fonts", "departure-mono-regular.woff2")
OUT = os.path.join(ROOT, "static", "og.png")

# palette (mirrors assets/css/main.css :root)
BG       = (0x15, 0x11, 0x0b)
BORDER   = (0x2a, 0x21, 0x18)
PAPER    = (0xdd, 0xd5, 0xc4)
GLOW_MUT = (0x8a, 0x81, 0x70)
META     = (0x6f, 0x66, 0x55)
RED      = (0xb3, 0x2a, 0x23)
SCANLINE = (0x0e, 0x0b, 0x07)

W, H = 1200, 630
M = 80

# woff2 -> ttf so Pillow can load it
tmp = tempfile.NamedTemporaryFile(suffix=".ttf", delete=False)
tmp.close()
f = TTFont(WOFF2)
f.flavor = None
f.save(tmp.name)


def font(px):
    return ImageFont.truetype(tmp.name, px)


img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

for y in range(0, H, 4):
    d.line([(0, y), (W, y)], fill=SCANLINE, width=1)
d.rectangle([M // 2, M // 2, W - M // 2, H - M // 2], outline=BORDER, width=2)

hs = font(26)
lines = [
    "> link established · almahri.node",
    "> handshake ok · signal acquired",
]
y = M + 6
for ln in lines:
    d.text((M, y), ln, font=hs, fill=GLOW_MUT)
    y += 38

big = font(168)
handle = "almahri"
hy = 250
d.text((M, hy), handle, font=big, fill=PAPER)
# red connection-cursor block right after the handle (sanctioned red)
tw = d.textlength(handle, font=big)
asc, desc = big.getmetrics()
cur_h = int(asc * 0.78)
cur_w = 46
cur_x = M + tw + 22
cur_y = hy + (asc - cur_h) + 6
d.rectangle([cur_x, cur_y, cur_x + cur_w, cur_y + cur_h], fill=RED)

sub = font(32)
d.text((M + 4, hy + asc + 28), "node // online · broadcasting from the wired",
       font=sub, fill=GLOW_MUT)

foot = font(26)
d.text((M, H - M - 18), "omar almahri", font=foot, fill=META)
right = "almahri.dev"
rw = d.textlength(right, font=foot)
d.text((W - M - rw, H - M - 18), right, font=foot, fill=META)

img.save(OUT, "PNG")
os.unlink(tmp.name)
print("wrote", OUT, img.size)
