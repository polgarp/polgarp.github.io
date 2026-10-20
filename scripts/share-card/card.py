# Renders the 1200x630 link-preview card with text outlined from IBM Plex Mono,
# so the SVG is self-contained and rasterises the same everywhere.
#   python3 scripts/share-card/card.py <dir with IBMPlexMono-{Regular,Bold}.ttf> > assets/images/share-card.svg
#   rsvg-convert -w 1200 -h 630 assets/images/share-card.svg -o assets/images/share-card.png
import sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
F = sys.argv[1]
fonts = {w: TTFont(f"{F}/IBMPlexMono-{w}.ttf") for w in ("Regular", "Bold")}

def text(s, x, y, size, weight="Regular", fill="#000000", anchor="start"):
    f = fonts[weight]; cmap = f.getBestCmap(); gs = f.getGlyphSet()
    upm = f["head"].unitsPerEm; k = size / upm
    width = sum(gs[cmap[ord(c)]].width for c in s) * k
    if anchor == "end": x -= width
    pen = SVGPathPen(gs); cx = 0
    for c in s:
        g = gs[cmap[ord(c)]]
        g.draw(TransformPen(pen, (k, 0, 0, -k, x + cx * k, y)))
        cx += g.width
    return f'<path fill="{fill}" d="{pen.getCommands()}"/>'

M = 114                      # outer margin; logo's visible edge sits on it
W, H = 1200, 630
body = [
  text("I make systems work for humans,", M, 370, 50),
  text("at every altitude.", M, 434, 50),
  f'<rect x="{M}" y="490" width="{W-2*M}" height="2" fill="#e4e4e4"/>',
  text("Péter Balázs Polgár", M, 548, 28, "Bold"),
  text("polgarp.com", W - M, 548, 28, fill="#6e6e6e", anchor="end"),
]
print(f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <rect width="{W}" height="{H}" fill="#ffffff"/>
  <g transform="translate({M-18} {82-18}) scale(0.5625)">
    <path fill="#000000" d="M32 32h64v32H64v128h48v32H32zM112 64h48v128h-32V96h-16z"/>
    <path fill="#d62828" d="M160 64h64v96h-64v-32h32V96h-32z"/>
  </g>
  {chr(10).join("  " + b for b in body)}
</svg>''')
