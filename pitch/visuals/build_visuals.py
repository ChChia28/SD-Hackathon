"""Draws the SunD concept illustrations as SVG in a soft 3D-render style.

    python3 pitch/visuals/build_visuals.py

Writes sund-bay.svg (labelled Medium SunD Bay) and sund-township.svg (future township with
SunD facilities and people) next to this file. Export to PNG at 2× with headless Chrome so the
deck fonts load. Figures follow SunD-context.md (Medium bay: 30 lots, 75 kWp, 136 panels,
375 m², 8 AC + 1 DC, 100 kWh battery).
"""

import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))
C, S = math.cos(math.radians(30)), 0.5
SUN = (-0.16, 0.62)  # ground shift of a cast shadow per unit of height (sun top-right)
DISPLAY = "'Hubot Sans','Nunito',system-ui,sans-serif"
BODY = "'Atkinson Hyperlegible','Nunito Sans',system-ui,sans-serif"
EDGE = 'rgba(15,23,42,0.16)'


def shade(hex_color, f):
    h = hex_color.lstrip('#')
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    if f >= 1:
        r, g, b = (round(c + (255 - c) * (f - 1)) for c in (r, g, b))
    else:
        r, g, b = (round(c * f) for c in (r, g, b))
    return f'#{min(r, 255):02x}{min(g, 255):02x}{min(b, 255):02x}'


def hull(points):
    pts = sorted(set(points))
    if len(pts) <= 2:
        return pts
    cross = lambda o, a, b: (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lower, upper = [], []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    return lower[:-1] + upper[:-1]


class Scene:
    def __init__(self, ox, oy, k=1.0):
        self.ox, self.oy, self.k = ox, oy, k
        self.ground, self.shadows, self.items, self.top = [], [], [], []
        self.defs, self.gmap, self.clip_n = [], {}, 0

    # ── projection + primitives ───────────────────────────────────
    def p(self, x, y, z=0):
        return (self.ox + (x - y) * C * self.k, self.oy + (x + y) * S * self.k - z * self.k)

    def pts(self, pts3):
        return ' '.join(f'{a:.1f},{b:.1f}' for a, b in (self.p(*q) for q in pts3))

    def poly(self, pts3, fill, stroke=EDGE, sw=0.8, extra=''):
        return f'<polygon points="{self.pts(pts3)}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" {extra}/>'

    def grad(self, c1, c2, x1=0, y1=0, x2=0, y2=1):
        key = (c1, c2, x1, y1, x2, y2)
        if key not in self.gmap:
            gid = f'g{len(self.gmap)}'
            self.gmap[key] = gid
            self.defs.append(f'<linearGradient id="{gid}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"><stop offset="0" stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/></linearGradient>')
        return f'url(#{self.gmap[key]})'

    def add(self, depth, svg):
        self.items.append((depth, svg))

    def cast(self, footprint, h, opacity=0.2):
        """Soft cast shadow of a footprint (world x, y) raised to height h."""
        pts = [(x, y) for x, y in footprint] + [(x + SUN[0] * h, y + SUN[1] * h) for x, y in footprint]
        self.shadows.append(f'<polygon points="{self.pts([(a, b, 0) for a, b in hull(pts)])}" fill="#0F172A" opacity="{opacity}" filter="url(#soft)"/>')

    # ── solids ───────────────────────────────────────────────────
    def box(self, x, y, z, w, d, h, color, top=None, shadow=True, edge=True):
        t = top or color
        if shadow and z == 0:
            self.cast([(x, y), (x + w, y), (x + w, y + d), (x, y + d)], h)
        out = self.poly([(x, y + d, z), (x + w, y + d, z), (x + w, y + d, z + h), (x, y + d, z + h)], self.grad(shade(color, 0.80), shade(color, 0.68)))
        out += self.poly([(x + w, y, z), (x + w, y + d, z), (x + w, y + d, z + h), (x + w, y, z + h)], self.grad(shade(color, 0.99), shade(color, 0.86)))
        out += self.poly([(x, y, z + h), (x + w, y, z + h), (x + w, y + d, z + h), (x, y + d, z + h)], self.grad(shade(t, 1.14), shade(t, 0.97), 0, 0, 1, 1))
        if edge:
            a, b, c = self.p(x, y + d, z + h), self.p(x + w, y + d, z + h), self.p(x + w, y, z + h)
            out += f'<polyline points="{a[0]:.1f},{a[1]:.1f} {b[0]:.1f},{b[1]:.1f} {c[0]:.1f},{c[1]:.1f}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.2"/>'
        return out

    def frustum(self, x, y, z, w, d, h, inset, color, glass='#1E3A8A'):
        """Car cabin: a box whose top is inset on all sides (sloped windows)."""
        b = [(x, y, z), (x + w, y, z), (x + w, y + d, z), (x, y + d, z)]
        t = [(x + inset, y + inset * 1.4, z + h), (x + w - inset, y + inset * 1.4, z + h), (x + w - inset, y + d - inset * 1.4, z + h), (x + inset, y + d - inset * 1.4, z + h)]
        g1 = self.grad('#0F172A', shade(glass, 1.25))
        g2 = self.grad(shade(glass, 0.9), shade(glass, 1.45))
        out = self.poly([b[3], b[2], t[2], t[3]], g1)  # left side glass
        out += self.poly([b[1], b[2], t[2], t[1]], g2)  # right/front glass
        out += self.poly(t, self.grad(shade(color, 1.18), shade(color, 1.0), 0, 0, 1, 1))
        # window pillars + reflection streak
        m1, m2 = self.p((b[3][0] + b[2][0]) / 2, b[3][1], z), self.p((t[3][0] + t[2][0]) / 2, t[3][1], z + h)
        out += f'<line x1="{m1[0]:.1f}" y1="{m1[1]:.1f}" x2="{m2[0]:.1f}" y2="{m2[1]:.1f}" stroke="{shade(color, 0.85)}" stroke-width="2.2"/>'
        s1, s2 = self.p(b[1][0], b[1][1] + d * 0.25, z + 1), self.p(t[1][0], t[1][1] + d * 0.12, z + h - 1)
        out += f'<line x1="{s1[0]:.1f}" y1="{s1[1]:.1f}" x2="{s2[0]:.1f}" y2="{s2[1]:.1f}" stroke="#fff" stroke-opacity=".55" stroke-width="2.4" stroke-linecap="round"/>'
        return out

    def wheel(self, cx, cy, cz, r, plane):
        pts = []
        for i in range(16):
            t = i / 16 * 2 * math.pi
            if plane == 'y':  # wheel on a face at constant y
                pts.append((cx + r * math.cos(t), cy, cz + r * math.sin(t)))
            else:
                pts.append((cx, cy + r * math.cos(t), cz + r * math.sin(t)))
        hub = [(q[0] * 0.45 + cx * 0.55, q[1] * 0.45 + cy * 0.55, q[2] * 0.45 + cz * 0.55) for q in pts]
        return self.poly(pts, '#111827', stroke='#020617', sw=0.6) + self.poly(hub, self.grad('#E5E7EB', '#6B7280'), stroke='none', sw=0)

    def car(self, x, y, color, facing='y', shadow=True):
        L, W = 70, 32
        if facing == 'y':
            w, d = W, L
        else:
            w, d = L, W
        if shadow:
            self.cast([(x, y), (x + w, y), (x + w, y + d), (x, y + d)], 16, 0.26)
        out = self.box(x, y, 4, w, d, 13, color, shadow=False)
        if facing == 'y':
            out += self.frustum(x + 2, y + 16, 17, w - 4, 36, 11, 3, color)
            out += self.wheel(x + w, y + 14, 7, 6.5, 'x') + self.wheel(x + w, y + 56, 7, 6.5, 'x')
            out += self.wheel(x + 4, y + d, 7, 6.5, 'y') if False else ''
            hl = [(x + 4, y + d, 11), (x + 11, y + d, 11), (x + 11, y + d, 15), (x + 4, y + d, 15)]
            hr = [(x + w - 11, y + d, 11), (x + w - 4, y + d, 11), (x + w - 4, y + d, 15), (x + w - 11, y + d, 15)]
        else:
            out += self.frustum(x + 16, y + 2, 17, 36, d - 4, 11, 3, color)
            out += self.wheel(x + 14, y + d, 7, 6.5, 'y') + self.wheel(x + 56, y + d, 7, 6.5, 'y')
            hl = [(x + w, y + 4, 11), (x + w, y + 11, 11), (x + w, y + 11, 15), (x + w, y + 4, 15)]
            hr = [(x + w, y + d - 11, 11), (x + w, y + d - 4, 11), (x + w, y + d - 4, 15), (x + w, y + d - 11, 15)]
        out += self.poly(hl, '#FEF9C3', stroke='none', sw=0) + self.poly(hr, '#FEF9C3', stroke='none', sw=0)
        return out

    def tree(self, x, y, r=18, h=30):
        self.shadows.append(
            f'<ellipse cx="{self.p(x + SUN[0] * h, y + SUN[1] * h)[0]:.1f}" cy="{self.p(x + SUN[0] * h, y + SUN[1] * h)[1]:.1f}" '
            f'rx="{r * 1.25 * self.k:.1f}" ry="{r * 0.62 * self.k:.1f}" fill="#0F172A" opacity=".22" filter="url(#soft)"/>'
        )
        bx, by = self.p(x, y, 0)
        cx, cy = self.p(x, y, h + r * 0.5)
        k = self.k
        out = f'<path d="M{bx - 3 * k:.1f} {by:.1f} L{bx - 1.6 * k:.1f} {cy:.1f} L{bx + 1.6 * k:.1f} {cy:.1f} L{bx + 3 * k:.1f} {by:.1f} Z" fill="url(#trunk)"/>'
        for dx, dy, rr in [(-0.55, 0.15, 0.62), (0.5, 0.1, 0.6), (0, -0.45, 0.66), (-0.2, 0.25, 0.75), (0.25, -0.05, 0.7)]:
            out += f'<circle cx="{cx + dx * r * k:.1f}" cy="{cy + dy * r * k:.1f}" r="{rr * r * k:.1f}" fill="url(#leaf)"/>'
        out += f'<circle cx="{cx + 0.15 * r * k:.1f}" cy="{cy - 0.35 * r * k:.1f}" r="{0.28 * r * k:.1f}" fill="#BBF7D0" opacity=".35"/>'
        return out

    def solar(self, x0, y0, x1, y1, z_back, z_front, cols, rows, frame=True, shadow=True):
        """Tilted PV field with frame, cell grid and glare."""
        z = lambda yy: z_back + (z_front - z_back) * (yy - y0) / (y1 - y0)
        if shadow:
            hz = (z_back + z_front) / 2
            sx, sy = SUN[0] * hz, SUN[1] * hz
            self.cast([(x0 + sx, y0 + sy), (x1 + sx, y0 + sy), (x1 + sx, y1 + sy), (x0 + sx, y1 + sy)], 0, 0.24)
        out = ''
        if frame:
            out += self.poly([(x0, y1, z(y1) - 5), (x1, y1, z(y1) - 5), (x1, y1, z(y1)), (x0, y1, z(y1))], self.grad('#E2E8F0', '#94A3B8'))
            out += self.poly([(x1, y0, z(y0) - 5), (x1, y1, z(y1) - 5), (x1, y1, z(y1)), (x1, y0, z(y0))], self.grad('#CBD5E1', '#64748B'))
        field = [(x0, y0, z(y0)), (x1, y0, z(y0)), (x1, y1, z(y1)), (x0, y1, z(y1))]
        out += self.poly(field, 'url(#panel)', stroke='#CBD5E1', sw=1.6)
        lines = ''
        for i in range(1, cols):
            xx = x0 + (x1 - x0) * i / cols
            a, b = self.p(xx, y0, z(y0)), self.p(xx, y1, z(y1))
            lines += f'M{a[0]:.1f} {a[1]:.1f}L{b[0]:.1f} {b[1]:.1f}'
        for j in range(1, rows):
            yy = y0 + (y1 - y0) * j / rows
            a, b = self.p(x0, yy, z(yy)), self.p(x1, yy, z(yy))
            lines += f'M{a[0]:.1f} {a[1]:.1f}L{b[0]:.1f} {b[1]:.1f}'
        out += f'<path d="{lines}" stroke="#BFDBFE" stroke-opacity=".75" stroke-width="1.1"/>'
        self.clip_n += 1
        cid = f'clip{self.clip_n}'
        self.defs.append(f'<clipPath id="{cid}"><polygon points="{self.pts(field)}"/></clipPath>')
        g0, g1 = x0 + (x1 - x0) * 0.25, x0 + (x1 - x0) * 0.5
        glare = [(g0, y0, z(y0)), (g1, y0, z(y0)), (g1 - (x1 - x0) * 0.18, y1, z(y1)), (g0 - (x1 - x0) * 0.32, y1, z(y1))]
        out += f'<polygon clip-path="url(#{cid})" points="{self.pts(glare)}" fill="url(#glare)"/>'
        return out

    def gable_house(self, x, y, w, d, h, wall='#FEFCE8', roof='#B45309', solar=True):
        rh = d * 0.42
        self.cast([(x, y), (x + w, y), (x + w, y + d), (x, y + d)], h + rh * 0.6)
        out = self.box(x, y, 0, w, d, h, wall, shadow=False, edge=False)
        # windows + door on the two visible walls
        for i in range(2):
            wx = x + 6 + i * (w - 20)
            out += self.poly([(wx, y + d, 8), (wx + 10, y + d, 8), (wx + 10, y + d, 18), (wx, y + d, 18)], self.grad('#1E3A8A', '#93C5FD'), stroke='#fff', sw=1)
        out += self.poly([(x + w, y + d * 0.35, 0), (x + w, y + d * 0.55, 0), (x + w, y + d * 0.55, 17), (x + w, y + d * 0.35, 17)], '#92400E', stroke='#fff', sw=1)
        ridge = y + d / 2
        out += self.poly([(x, y, h), (x + w, y, h), (x + w, ridge, h + rh), (x, ridge, h + rh)], self.grad(shade(roof, 0.95), shade(roof, 0.75)))  # back slope
        out += self.poly([(x + w, y, h), (x + w, y + d, h), (x + w, ridge, h + rh)], self.grad(shade(wall, 0.98), shade(wall, 0.85)))  # gable
        front = [(x, ridge, h + rh), (x + w, ridge, h + rh), (x + w, y + d, h), (x, y + d, h)]
        out += self.poly(front, self.grad(shade(roof, 1.1), shade(roof, 0.88)))
        if solar:
            zr = lambda yy: h + rh * (y + d - yy) / (d / 2)
            px0, px1, py0, py1 = x + 4, x + w - 4, ridge + 2, y + d - 3
            cells = [(px0, py0, zr(py0)), (px1, py0, zr(py0)), (px1, py1, zr(py1)), (px0, py1, zr(py1))]
            out += self.poly(cells, 'url(#panel)', stroke='#E2E8F0', sw=1.2)
            for i in range(1, 4):
                xx = px0 + (px1 - px0) * i / 4
                a, b = self.p(xx, py0, zr(py0)), self.p(xx, py1, zr(py1))
                out += f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="#BFDBFE" stroke-opacity=".7"/>'
        return out

    def tower(self, x, y, w, d, h, color='#E2E8F0', floors=12, solar=True):
        out = self.box(x, y, 0, w, d, h, color)
        fh = (h - 8) / floors
        for f in range(floors):
            z0 = 6 + f * fh
            for i in range(4):
                a = x + 4 + i * (w - 8) / 4
                out += self.poly([(a + 1, y + d, z0), (a + (w - 8) / 4 - 1, y + d, z0), (a + (w - 8) / 4 - 1, y + d, z0 + fh * 0.6), (a + 1, y + d, z0 + fh * 0.6)], self.grad('#1E3A8A', '#60A5FA'), stroke='none', sw=0)
                b = y + 4 + i * (d - 8) / 4
                out += self.poly([(x + w, b + 1, z0), (x + w, b + (d - 8) / 4 - 1, z0), (x + w, b + (d - 8) / 4 - 1, z0 + fh * 0.6), (x + w, b + 1, z0 + fh * 0.6)], self.grad('#3B82F6', '#BFDBFE'), stroke='none', sw=0)
        if solar:
            out += self.solar(x + 6, y + 6, x + w - 6, y + d - 6, h + 6, h + 3, 4, 3, frame=False, shadow=False)
        return out

    def charger(self, x, y, dc=False):
        w, d, h = (18, 12, 62) if dc else (10, 8, 44)
        self.cast([(x, y), (x + w, y), (x + w, y + d), (x, y + d)], h, 0.22)
        body = '#1D4ED8' if dc else '#F8FAFC'
        out = self.box(x, y, 0, w, d, h, body, shadow=False)
        out += self.poly([(x + w, y + 2, h - 8), (x + w, y + d - 2, h - 8), (x + w, y + d - 2, h), (x + w, y + 2, h)], '#22C55E', stroke='none', sw=0)
        sz0, sz1 = h * 0.55, h * 0.8
        out += self.poly([(x + w, y + 2, sz0), (x + w, y + d - 2, sz0), (x + w, y + d - 2, sz1), (x + w, y + 2, sz1)], self.grad('#0F172A', '#14532D'), stroke='none', sw=0)
        a = self.p(x + w, y + d / 2, h * 0.45)
        b = self.p(x + w + 10, y + d + 6, 0)
        out += f'<path d="M{a[0]:.1f} {a[1]:.1f} C {a[0] + 14:.1f} {a[1] + 6:.1f}, {b[0] + 8:.1f} {b[1] - 14:.1f}, {b[0]:.1f} {b[1]:.1f}" stroke="#111827" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
        return out

    def battery(self, x, y, w=84, d=54, h=52):
        out = self.box(x, y, 0, w, d, h, '#F8FAFC', top='#E2E8F0')
        for i in range(1, 9):
            xx = x + w * i / 9
            a, b = self.p(xx, y + d, 2), self.p(xx, y + d, h - 2)
            out += f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="#CBD5E1" stroke-width="1"/>'
        out += self.poly([(x, y + d, 12), (x + w, y + d, 12), (x + w, y + d, 19), (x, y + d, 19)], self.grad('#22C55E', '#16A34A', 0, 0, 1, 0), stroke='none', sw=0)
        cx, cy = self.p(x + w * 0.72, y + d, 34)
        out += f'<path d="M{cx + 2:.1f} {cy - 12:.1f} l-8 13 h6 l-3 11 l9 -14 h-6 z" fill="#FBBF24" stroke="#B45309" stroke-width=".8"/>'
        out += self.poly([(x + w, y + 10, 18), (x + w, y + 40, 18), (x + w, y + 40, 40), (x + w, y + 10, 40)], self.grad('#E2E8F0', '#94A3B8'), stroke='#94A3B8', sw=1)
        return out

    def person(self, x, y, shirt='#3B82F6', pants='#1E293B', kind='adult', hair='#1F2937', walk=0):
        """Small figure standing at world (x, y). kind: adult | kid | senior."""
        sc = {'adult': 1.0, 'kid': 0.66, 'senior': 0.96}[kind] * self.k
        bx, by = self.p(x, y, 0)
        if kind == 'senior':
            hair = '#D1D5DB'
        self.shadows.append(f'<ellipse cx="{bx - 4 * sc:.1f}" cy="{by + 2:.1f}" rx="{9 * sc:.1f}" ry="{3.5 * sc:.1f}" fill="#0F172A" opacity=".28" filter="url(#soft)"/>')
        lg = 13 * sc
        o = walk * 3 * sc
        out = f'<g transform="translate({bx:.1f} {by:.1f})">'
        out += f'<rect x="{-4.2 * sc - o:.1f}" y="{-lg:.1f}" width="{3.6 * sc:.1f}" height="{lg:.1f}" rx="{1.6 * sc:.1f}" fill="{shade(pants, 0.85)}"/>'
        out += f'<rect x="{0.6 * sc + o:.1f}" y="{-lg:.1f}" width="{3.6 * sc:.1f}" height="{lg:.1f}" rx="{1.6 * sc:.1f}" fill="{pants}"/>'
        ty = -lg - 13 * sc
        out += f'<rect x="{-5.4 * sc:.1f}" y="{ty:.1f}" width="{10.8 * sc:.1f}" height="{14 * sc:.1f}" rx="{3.6 * sc:.1f}" fill="url(#shirt_{shirt[1:]})"/>'
        out += f'<rect x="{-7.6 * sc:.1f}" y="{ty + 1.5 * sc:.1f}" width="{3 * sc:.1f}" height="{11 * sc:.1f}" rx="{1.5 * sc:.1f}" fill="{shade(shirt, 0.8)}"/>'
        out += f'<rect x="{4.6 * sc:.1f}" y="{ty + 1.5 * sc:.1f}" width="{3 * sc:.1f}" height="{11 * sc:.1f}" rx="{1.5 * sc:.1f}" fill="{shade(shirt, 0.92)}"/>'
        hy = ty - 5.2 * sc
        out += f'<circle cx="0" cy="{hy:.1f}" r="{5 * sc:.1f}" fill="url(#skin)"/>'
        out += f'<path d="M{-5.1 * sc:.1f} {hy:.1f} a {5.1 * sc:.1f} {5.1 * sc:.1f} 0 0 1 {10.2 * sc:.1f} 0 q {-5 * sc:.1f} {-2.2 * sc:.1f} {-10.2 * sc:.1f} 0 z" fill="{hair}"/>'
        out += '</g>'
        if f'shirt_{shirt[1:]}' not in self.gmap.values():
            self.gmap[('shirt', shirt)] = f'shirt_{shirt[1:]}'
            self.defs.append(f'<linearGradient id="shirt_{shirt[1:]}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{shade(shirt, 1.25)}"/><stop offset="1" stop-color="{shade(shirt, 0.85)}"/></linearGradient>')
        return out

    def ebike(self, x, y, rider=None, color='#16A34A'):
        """eBike at world (x, y), optionally with a rider (shirt colour, kind)."""
        bx, by = self.p(x, y, 0)
        k = self.k
        self.shadows.append(f'<ellipse cx="{bx - 4:.1f}" cy="{by + 1:.1f}" rx="{17 * k:.1f}" ry="{4 * k:.1f}" fill="#0F172A" opacity=".25" filter="url(#soft)"/>')
        out = f'<g transform="translate({bx:.1f} {by - 8 * k:.1f}) scale({k:.2f})" stroke-linecap="round">'
        out += '<circle cx="-11" cy="0" r="7.5" fill="none" stroke="#111827" stroke-width="2.6"/><circle cx="11" cy="0" r="7.5" fill="none" stroke="#111827" stroke-width="2.6"/>'
        out += '<circle cx="-11" cy="0" r="1.6" fill="#9CA3AF"/><circle cx="11" cy="0" r="1.6" fill="#9CA3AF"/>'
        out += f'<path d="M-11 0 L-3 -10 L8 -10 L11 0 M-3 -10 L0 0 L11 0 M8 -10 L7 -15 M4 -16 H10 M-5 -12 H0" fill="none" stroke="{color}" stroke-width="2.6"/>'
        out += '<rect x="-2" y="-6" width="6" height="4" rx="1" fill="#0F172A"/>'
        out += '</g>'
        if rider:
            shirt, kind = rider
            sc = (0.66 if kind == 'kid' else 1.0) * k
            hair = '#D1D5DB' if kind == 'senior' else '#1F2937'
            rx, ry = bx - 2 * k, by - 18 * k
            out += f'<g transform="translate({rx:.1f} {ry:.1f})">'
            out += f'<path d="M{-2 * sc:.1f} 0 L{6 * sc:.1f} {8 * sc:.1f}" stroke="#1E293B" stroke-width="{3.4 * sc:.1f}" stroke-linecap="round"/>'
            out += f'<rect x="{-5 * sc:.1f}" y="{-13 * sc:.1f}" width="{10 * sc:.1f}" height="{14 * sc:.1f}" rx="{3.4 * sc:.1f}" fill="{shirt}" transform="rotate(12)"/>'
            out += f'<path d="M{2 * sc:.1f} {-9 * sc:.1f} L{11 * sc:.1f} {-4 * sc:.1f}" stroke="{shade(shirt, 0.85)}" stroke-width="{3 * sc:.1f}" stroke-linecap="round"/>'
            out += f'<circle cx="{1 * sc:.1f}" cy="{-18 * sc:.1f}" r="{4.8 * sc:.1f}" fill="url(#skin)"/>'
            out += f'<path d="M{-3.8 * sc:.1f} {-19.5 * sc:.1f} a {5 * sc:.1f} {4.6 * sc:.1f} 0 0 1 {9.6 * sc:.1f} 0 z" fill="{hair}"/>'
            out += '</g>'
        return out

    def water(self, pts3):
        return self.poly(pts3, 'url(#water)', stroke='#60A5FA', sw=1.5)

    def render_defs(self):
        return ''.join(self.defs)

    def render(self):
        return ''.join(self.ground) + ''.join(self.shadows) + ''.join(s for _, s in sorted(self.items, key=lambda t: t[0])) + ''.join(self.top)


def base_defs():
    return (
        '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#93C5FD"/><stop offset=".5" stop-color="#DBEAFE"/><stop offset="1" stop-color="#F8FAFC"/></linearGradient>'
        '<radialGradient id="sunglow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FEF3C7" stop-opacity="1"/><stop offset=".35" stop-color="#FDE68A" stop-opacity=".6"/><stop offset="1" stop-color="#FDE68A" stop-opacity="0"/></radialGradient>'
        '<linearGradient id="panel" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#0B1E5B"/><stop offset=".55" stop-color="#1D4ED8"/><stop offset="1" stop-color="#3B82F6"/></linearGradient>'
        '<linearGradient id="glare" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'
        '<radialGradient id="leaf" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#86EFAC"/><stop offset=".45" stop-color="#22C55E"/><stop offset="1" stop-color="#14532D"/></radialGradient>'
        '<linearGradient id="trunk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#78350F"/><stop offset="1" stop-color="#B45309"/></linearGradient>'
        '<radialGradient id="skin" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#FCE1C9"/><stop offset="1" stop-color="#C98B62"/></radialGradient>'
        '<linearGradient id="water" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#BAE6FD"/><stop offset=".5" stop-color="#38BDF8"/><stop offset="1" stop-color="#0369A1"/></linearGradient>'
        '<linearGradient id="grass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A7F3D0"/><stop offset="1" stop-color="#4ADE80"/></linearGradient>'
        '<linearGradient id="asphalt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#CBD5E1"/><stop offset="1" stop-color="#94A3B8"/></linearGradient>'
        '<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.2"/></filter>'
        '<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .06 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>'
        '<filter id="shadow" x="-10%" y="-20%" width="120%" height="160%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#0F172A" flood-opacity=".18"/></filter>'
    )


def sky(w, h, sun):
    sx, sy = sun
    clouds = ''.join(
        f'<g opacity=".9" filter="url(#soft)"><ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{rx * .3:.0f}" fill="#fff"/><ellipse cx="{cx - rx * .3:.0f}" cy="{cy - rx * .16:.0f}" rx="{rx * .45:.0f}" ry="{rx * .28:.0f}" fill="#fff"/><ellipse cx="{cx + rx * .32:.0f}" cy="{cy - rx * .2:.0f}" rx="{rx * .36:.0f}" ry="{rx * .26:.0f}" fill="#fff"/></g>'
        for cx, cy, rx in [(240, 120, 110), (900, 70, 80), (1280, 160, 60)]
    )
    return (
        f'<rect width="{w}" height="{h}" fill="url(#sky)"/>'
        f'<circle cx="{sx}" cy="{sy}" r="220" fill="url(#sunglow)"/><circle cx="{sx}" cy="{sy}" r="46" fill="#FFFBEB"/><circle cx="{sx}" cy="{sy}" r="40" fill="#FDE68A"/>'
        + clouds
    )


def skyline(base):
    blocks = [(30, 60, 110), (100, 50, 70), (160, 70, 150), (240, 46, 90), (1180, 60, 120), (1250, 44, 80), (1300, 74, 160), (1390, 50, 95), (1450, 64, 125), (1520, 56, 75)]
    out = ''.join(f'<rect x="{x}" y="{base - h}" width="{bw}" height="{h}" rx="3" fill="#BFDBFE" opacity=".75"/>' for x, bw, h in blocks)
    return out + f'<path d="M0 {base} C 300 {base - 40}, 600 {base - 20}, 900 {base - 50} S 1400 {base - 30}, 1600 {base - 45} V {base + 30} H 0 Z" fill="#A7F3D0" opacity=".55"/>'


def callout(anchor, box, title, sub, color):
    ax, ay = anchor
    bx, by, bw = box
    bh = 86
    ex = bx if ax < bx else bx + bw if ax > bx + bw else ax
    ey = min(max(ay, by + 18), by + bh - 18) if ex in (bx, bx + bw) else (by if ay < by else by + bh)
    return (
        f'<line x1="{ax:.1f}" y1="{ay:.1f}" x2="{ex:.1f}" y2="{ey:.1f}" stroke="#fff" stroke-width="5" opacity=".8"/>'
        f'<line x1="{ax:.1f}" y1="{ay:.1f}" x2="{ex:.1f}" y2="{ey:.1f}" stroke="#0F172A" stroke-width="2.2" opacity=".75"/>'
        f'<circle cx="{ax:.1f}" cy="{ay:.1f}" r="8" fill="#fff" stroke="{color}" stroke-width="4"/>'
        f'<g filter="url(#shadow)"><rect x="{bx}" y="{by}" width="{bw}" height="{bh}" rx="18" fill="#fff"/></g>'
        f'<rect x="{bx}" y="{by + 14}" width="7" height="{bh - 28}" rx="3.5" fill="{color}"/>'
        f'<text x="{bx + 24}" y="{by + 37}" font-family="{DISPLAY}" font-weight="700" font-size="29" fill="#0F172A">{title}</text>'
        f'<text x="{bx + 24}" y="{by + 70}" font-family="{BODY}" font-size="24" fill="#475569">{sub}</text>'
    )


def pill(anchor, text, color, dy=-70):
    ax, ay = anchor
    w = 56 + len(text) * 15.6
    x, y = ax - w / 2, ay + dy - 24
    y2 = y + 48 if dy < 0 else y
    return (
        f'<line x1="{ax:.1f}" y1="{ay:.1f}" x2="{ax:.1f}" y2="{y2:.1f}" stroke="#fff" stroke-width="5" opacity=".85"/>'
        f'<line x1="{ax:.1f}" y1="{ay:.1f}" x2="{ax:.1f}" y2="{y2:.1f}" stroke="#0F172A" stroke-width="2.2" opacity=".7"/>'
        f'<circle cx="{ax:.1f}" cy="{ay:.1f}" r="6.5" fill="#fff" stroke="{color}" stroke-width="3.5"/>'
        f'<g filter="url(#shadow)"><rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="48" rx="24" fill="#fff"/></g>'
        f'<circle cx="{x + 24:.1f}" cy="{y + 24:.1f}" r="8" fill="{color}"/>'
        f'<text x="{x + 40:.1f}" y="{y + 33:.1f}" font-family="{DISPLAY}" font-weight="700" font-size="26" fill="#0F172A">{text}</text>'
    )


def svg_doc(w, h, sc, body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}"><defs>{base_defs()}{sc.render_defs()}</defs>{body}</svg>'


# ═════════════════════════ SunD Bay (Medium) ═════════════════════════
def build_bay(labelled=True):
    W, H = 1600, 900
    sc = Scene(560, 196, 1.0)
    sc.ground.append(sc.poly([(-120, -80, 0), (940, -80, 0), (940, 640, 0), (-120, 640, 0)], 'url(#grass)', stroke='none', sw=0))
    sc.ground.append(sc.poly([(-6, 24, 0), (826, 24, 0), (826, 546, 0), (-6, 546, 0)], '#E2E8F0', stroke='none', sw=0))  # kerb
    sc.ground.append(sc.poly([(0, 30, 0), (820, 30, 0), (820, 540, 0), (0, 540, 0)], 'url(#asphalt)', stroke='none', sw=0))
    sc.ground.append(sc.poly([(0, 30, 0), (820, 30, 0), (820, 540, 0), (0, 540, 0)], '#94A3B8', stroke='none', sw=0, extra='filter="url(#grain)"'))
    sc.ground.append(sc.poly([(0, 200, 0), (680, 200, 0), (680, 356, 0), (0, 356, 0)], '#64748B', stroke='none', sw=0, extra='opacity=".35"'))  # aisle
    for row_y0, row_y1 in ((76, 176), (372, 472)):
        sc.ground.append(sc.poly([(40, row_y0, 0), (640, row_y0, 0), (640, row_y1, 0), (40, row_y1, 0)], '#22C55E', stroke='none', sw=0, extra='opacity=".18"'))
        for i in range(16):
            x = 40 + i * 40
            sc.ground.append(sc.poly([(x - 1, row_y0, 0), (x + 1, row_y0, 0), (x + 1, row_y1, 0), (x - 1, row_y1, 0)], '#fff', stroke='none', sw=0))
    for x in (150, 380):
        sc.ground.append(sc.poly([(x, 274, 0), (x + 50, 274, 0), (x + 50, 268, 0), (x + 66, 278, 0), (x + 50, 288, 0), (x + 50, 282, 0), (x, 282, 0)], '#fff', stroke='none', sw=0))
    # pedestrian walkway
    sc.ground.append(sc.poly([(690, 360, 0), (820, 360, 0), (820, 540, 0), (690, 540, 0)], '#F1F5F9', stroke='none', sw=0))

    palette = ['#F8FAFC', '#3B82F6', '#CBD5E1', '#1E3A8A', '#DC2626', '#E5E7EB', '#64748B', '#0F766E']
    for k, i in enumerate([0, 1, 3, 4, 5, 7, 8, 10, 11, 13, 14]):
        x = 44 + i * 40
        sc.add(x + 90, sc.car(x, 96, palette[k % len(palette)]))
    for k, i in enumerate([0, 2, 3, 5, 6, 8, 9, 11, 12, 14]):
        x = 44 + i * 40
        sc.add(x + 400, sc.car(x, 394, palette[(k + 3) % len(palette)]))

    for y in (126, 422):
        for x in (52, 172, 292, 412, 532, 632):
            sc.add(x + y + 40, sc.box(x, y, 0, 6, 6, 98, '#CBD5E1', shadow=False))

    for x in (120, 240, 360, 480):
        sc.add(x + 190, sc.charger(x, 184))
        sc.add(x + 500, sc.charger(x, 490))
    sc.add(950, sc.charger(696, 250, dc=True))
    sc.add(945, sc.car(706, 284, '#F8FAFC', facing='x'))

    sc.add(960, sc.battery(700, 70))
    sc.add(1150, sc.box(796, 170, 0, 7, 7, 170, '#94A3B8'))
    sc.add(1151, sc.box(782, 162, 158, 36, 24, 4, '#64748B', shadow=False))
    px, py = sc.p(800, 174, 160)
    bx, by = sc.p(742, 124, 52)
    sc.top.append(f'<path d="M{px:.1f} {py:.1f} Q {(px + bx) / 2:.1f} {(py + by) / 2 + 40:.1f} {bx:.1f} {by:.1f}" stroke="#334155" stroke-width="2.4" fill="none" stroke-dasharray="7 5"/>')

    # eBike dock with its own solar roof, two riders leaving
    sc.add(1120, sc.box(690, 400, 0, 110, 40, 5, '#CBD5E1', shadow=False))
    for x in (694, 794):
        sc.add(1121 + x / 1000, sc.box(x, 418, 0, 5, 5, 54, '#94A3B8', shadow=False))
    for i in range(5):
        sc.add(1130 + i, sc.ebike(706 + i * 18, 424))
    sc.add(1140, sc.solar(686, 396, 806, 446, 62, 54, 4, 2))
    sc.add(1300, sc.ebike(740, 500, rider=('#F97316', 'kid')))
    sc.add(1301, sc.ebike(770, 492, rider=('#0EA5E9', 'adult')))

    # people: driver at the DC charger, family walking to the bays, senior checking the app
    sc.add(1000, sc.person(724, 276, shirt='#16A34A', pants='#334155'))
    sc.add(1250, sc.person(704, 380, shirt='#EC4899', pants='#1E293B', walk=1))
    sc.add(1251, sc.person(716, 392, shirt='#FBBF24', pants='#1E40AF', kind='kid', walk=-1))
    sc.add(1252, sc.person(730, 382, shirt='#3B82F6', pants='#1E293B', walk=-1))
    sc.add(820, sc.person(300, 196, shirt='#A855F7', pants='#334155', kind='senior'))

    # price board totem
    sc.add(1280, sc.box(720, 520, 0, 10, 10, 70, '#334155'))
    tx, ty = sc.p(725, 525, 70)
    sc.top.append(
        f'<g filter="url(#shadow)"><rect x="{tx - 110:.1f}" y="{ty - 96:.1f}" width="220" height="92" rx="16" fill="#0F172A"/></g>'
        f'<text x="{tx:.1f}" y="{ty - 60:.1f}" text-anchor="middle" font-family="{DISPLAY}" font-weight="800" font-size="30" fill="#FBBF24">Sun<tspan fill="#60A5FA">D</tspan><tspan fill="#fff"> Bay</tspan></text>'
        f'<text x="{tx:.1f}" y="{ty - 26:.1f}" text-anchor="middle" font-family="{BODY}" font-weight="700" font-size="22" fill="#4ADE80">RM 0.80 · surplus</text>'
    )

    for x, y in [(-40, 60), (-40, 220), (-40, 400), (60, 580), (220, 590), (380, 590), (540, 580), (870, 300), (870, 60), (900, 460)]:
        sc.add(x + y + 2000 if y > 540 else x + y, sc.tree(x, y))

    sc.add(3000, sc.solar(30, 64, 650, 188, 98, 84, 17, 4))
    sc.add(3001, sc.solar(30, 360, 650, 484, 98, 84, 17, 4))

    labels = ''.join([
        callout(sc.p(330, 120, 92), (60, 30, 470), 'Self-supply solar canopy', '136 panels · 75 kWp · 375 m²', '#FBBF24'),
        callout(sc.p(130, 420, 0), (24, 572, 330), '30 parking lots', '2 covered rows × 15 lots', '#22C55E'),
        callout(sc.p(484, 494, 42), (24, 770, 400), '8 AC chargers', '22 kW Type 2 · 4 per row', '#3B82F6'),
        callout(sc.p(706, 258, 66), (1210, 268, 370), '1 DC fast charger', '60 kW CCS2 · ~20 min top-up', '#1D4ED8'),
        callout(sc.p(742, 96, 52), (1210, 150, 370), '100 kWh battery', 'Stores midday sun for night', '#16A34A'),
        callout(sc.p(800, 174, 168), (1210, 386, 370), 'Grid: backup only', 'Hybrid: solar → battery → grid', '#64748B'),
        callout(sc.p(745, 420, 30), (1210, 620, 370), 'SunD eBike dock', 'Ride while you charge', '#A855F7'),
    ])
    badge = (
        f'<g filter="url(#shadow)"><rect x="1210" y="36" width="370" height="86" rx="20" fill="#0F172A"/></g>'
        f'<text x="1236" y="72" font-family="{DISPLAY}" font-weight="800" font-size="29" fill="#fff">Medium <tspan fill="#FBBF24">Sun</tspan><tspan fill="#60A5FA">D</tspan> Bay</text>'
        f'<text x="1236" y="104" font-family="{BODY}" font-size="23" fill="#CBD5E1">100% of panels power EVs</text>'
    )
    body = sky(W, H, sun=(1110, 96)) + skyline(300) + sc.render()
    if labelled:
        body += labels + badge + f'<text x="{W - 24}" y="{H - 20}" text-anchor="end" font-family="{BODY}" font-size="20" fill="#475569">Concept illustration · figures are estimates</text>'
    open(os.path.join(HERE, 'sund-bay.svg' if labelled else 'sund-bay-plain.svg'), 'w').write(svg_doc(W, H, sc, body))


# ═════════════════════════ Future SunD township ═════════════════════════
def build_township(labelled=True):
    W, H = 1600, 900
    sc = Scene(700, 200, 0.92)
    sc.ground.append(sc.poly([(-80, -80, 0), (980, -80, 0), (980, 720, 0), (-80, 720, 0)], 'url(#grass)', stroke='none', sw=0))
    roads = [[(-80, 300, 0), (980, 300, 0), (980, 344, 0), (-80, 344, 0)], [(420, -80, 0), (464, -80, 0), (464, 720, 0), (420, 720, 0)], [(900, -80, 0), (960, -80, 0), (960, 720, 0), (900, 720, 0)]]
    for r in roads:
        sc.ground.append(sc.poly(r, '#64748B', stroke='none', sw=0))
        sc.ground.append(sc.poly(r, '#475569', stroke='none', sw=0, extra='filter="url(#grain)"'))
    for i in range(-2, 24):
        x = i * 44
        sc.ground.append(sc.poly([(x, 320, 0), (x + 22, 320, 0), (x + 22, 324, 0), (x, 324, 0)], '#F8FAFC', stroke='none', sw=0))
        sc.ground.append(sc.poly([(440, x - 60, 0), (444, x - 60, 0), (444, x - 38, 0), (440, x - 38, 0)], '#F8FAFC', stroke='none', sw=0))
    for pts in ([(480, 20, 0), (880, 20, 0), (880, 280, 0), (480, 280, 0)], [(480, 364, 0), (880, 364, 0), (880, 680, 0), (480, 680, 0)]):
        sc.ground.append(sc.poly(pts, 'url(#asphalt)', stroke='none', sw=0))
    # park + lake + paths
    sc.ground.append(sc.poly([(20, 360, 0), (400, 360, 0), (400, 690, 0), (20, 690, 0)], '#86EFAC', stroke='none', sw=0, extra='opacity=".6"'))
    lake = [(40 + 70 * math.cos(t), 615 + 50 * math.sin(t), 0) for t in [i / 24 * 2 * math.pi for i in range(24)]]
    sc.ground.append(sc.water(lake))
    sc.ground.append(sc.poly([(200, 460, 0), (220, 460, 0), (220, 690, 0), (200, 690, 0)], '#F1F5F9', stroke='none', sw=0))  # eBike path
    sc.ground.append(sc.poly([(220, 360, 0), (400, 360, 0), (400, 374, 0), (220, 374, 0)], '#F1F5F9', stroke='none', sw=0))

    # CREAM landed homes (gable roofs with solar)
    for row_y in (30, 160):
        for i in range(5):
            x = 30 + i * 76
            sc.add(x + row_y, sc.gable_house(x, row_y, 54, 46, 26, roof=['#B45309', '#9A3412', '#78716C'][i % 3]))
            sc.add(x + row_y + 60, sc.tree(x + 62, row_y + 64, r=11, h=16))
    sc.add(200, sc.person(110, 104, shirt='#EC4899', pants='#1E293B'))
    sc.add(201, sc.person(120, 112, shirt='#FBBF24', pants='#1E40AF', kind='kid'))
    sc.add(202, sc.person(132, 106, shirt='#64748B', pants='#334155', kind='senior'))
    sc.add(203, sc.car(228, 94, '#DC2626', facing='x'))

    # mall + SunD Bay canopy, data centre
    sc.add(560, sc.box(490, 30, 0, 200, 130, 74, '#F1F5F9', top='#E2E8F0'))
    sc.add(561, sc.poly([(490, 160, 26), (690, 160, 26), (690, 160, 58), (490, 160, 58)], sc.grad('#1E3A8A', '#93C5FD'), stroke='#fff', sw=1.5))
    sc.add(562, sc.solar(500, 40, 680, 150, 80, 78, 9, 5, frame=False, shadow=False))
    sc.add(600, sc.box(730, 30, 0, 140, 90, 62, '#CBD5E1', top='#E2E8F0'))
    for j in range(4):
        sc.add(601 + j, sc.poly([(730, 120, 12 + j * 12), (870, 120, 12 + j * 12), (870, 120, 16 + j * 12), (730, 120, 16 + j * 12)], '#334155', stroke='none', sw=0))
    for i, x in enumerate((500, 545, 590, 635, 680)):
        sc.add(x + 200, sc.car(x, 194, ['#3B82F6', '#F8FAFC', '#DC2626', '#1E3A8A', '#E5E7EB'][i]))
    sc.add(820, sc.person(600, 276, shirt='#0EA5E9', pants='#1E293B'))
    sc.add(821, sc.person(612, 282, shirt='#F97316', pants='#334155', kind='kid'))
    sc.add(1100, sc.solar(490, 186, 720, 270, 62, 52, 10, 3))

    # SunD Clubhouse (+ pool), SunD Gym, SunD eBike dock
    sc.add(430, sc.box(50, 380, 0, 140, 70, 40, '#FEF3C7', top='#FDE68A'))
    sc.add(431, sc.solar(56, 384, 184, 446, 50, 44, 6, 2, frame=False, shadow=False))
    sc.ground.append(sc.poly([(56, 462, 0), (184, 462, 0), (184, 504, 0), (56, 504, 0)], '#F8FAFC', stroke='none', sw=0))
    sc.ground.append(sc.water([(62, 466, 0), (178, 466, 0), (178, 500, 0), (62, 500, 0)]))
    for i, (x, y) in enumerate([(70, 520), (110, 512), (150, 522)]):
        sc.add(x + y, sc.person(x, y, shirt=['#EC4899', '#22C55E', '#3B82F6'][i], pants='#1E293B', kind=['adult', 'kid', 'senior'][i]))
    sc.add(760, sc.box(250, 500, 0, 120, 80, 46, '#DCFCE7', top='#BBF7D0'))
    sc.add(761, sc.poly([(250, 580, 6), (370, 580, 6), (370, 580, 36), (250, 580, 36)], sc.grad('#0F766E', '#5EEAD4'), stroke='#fff', sw=1.5))
    sc.add(762, sc.solar(256, 504, 364, 576, 56, 50, 5, 3, frame=False, shadow=False))
    for i, (x, y) in enumerate([(380, 600), (392, 590), (300, 600)]):
        sc.add(x + y + 100, sc.person(x, y, shirt=['#A855F7', '#64748B', '#F97316'][i], pants='#334155', kind=['senior', 'senior', 'adult'][i], walk=(i % 2) * 2 - 1))
    sc.add(690, sc.box(300, 380, 0, 100, 34, 5, '#CBD5E1', shadow=False))
    for i in range(5):
        sc.add(691 + i, sc.ebike(314 + i * 18, 400))
    sc.add(698, sc.solar(296, 376, 404, 416, 52, 46, 4, 1))
    sc.add(900, sc.ebike(212, 520, rider=('#F97316', 'kid')))
    sc.add(901, sc.ebike(212, 560, rider=('#0EA5E9', 'adult')))
    sc.add(902, sc.ebike(212, 620, rider=('#A855F7', 'senior')))

    # condo towers + condo SunD Bay, highway partner SunD Bay
    sc.add(900, sc.tower(520, 384, 70, 70, 170, '#E2E8F0', floors=12))
    sc.add(901, sc.tower(620, 384, 70, 70, 140, '#DBEAFE', floors=10))
    for i, x in enumerate((520, 562, 604, 646)):
        sc.add(x + 520, sc.car(x, 498, ['#F8FAFC', '#0F766E', '#94A3B8', '#3B82F6'][i]))
    sc.add(1180, sc.person(700, 600, shirt='#16A34A', pants='#1E293B'))
    sc.add(1300, sc.solar(506, 490, 700, 580, 56, 48, 9, 3))
    for i, y in enumerate((440, 490)):
        sc.add(780 + y, sc.car(770, y, ['#DC2626', '#F8FAFC'][i], facing='x'))
    sc.add(1450, sc.box(860, 520, 0, 30, 40, 30, '#F8FAFC', top='#1D4ED8'))
    sc.add(1500, sc.solar(756, 420, 880, 560, 58, 50, 6, 4))
    sc.add(1600, sc.car(918, 150, '#1E3A8A'))
    sc.add(1601, sc.car(918, 420, '#E5E7EB'))

    for x, y in [(230, 400), (215, 470), (395, 470), (300, 650), (390, 650), (500, 290), (880, 290), (720, 650), (840, 650), (20, 290), (300, 286), (-30, 420), (-30, 540)]:
        sc.add(x + y, sc.tree(x, y, r=15, h=24))

    labels = ''.join([
        pill(sc.p(210, 100, 40), 'CREAM homes', '#FBBF24', dy=-150),
        pill(sc.p(600, 228, 62), 'SunD Bay', '#3B82F6', dy=-90),
        pill(sc.p(800, 76, 62), 'Data centre', '#64748B', dy=-120),
        pill(sc.p(120, 415, 46), 'SunD Clubhouse', '#F59E0B', dy=-130),
        pill(sc.p(350, 396, 50), 'SunD eBike', '#A855F7', dy=-80),
        pill(sc.p(310, 540, 54), 'SunD Gym', '#22C55E', dy=150),
        pill(sc.p(600, 535, 52), 'SunD Bay · Condo', '#3B82F6', dy=-110),
        pill(sc.p(820, 490, 56), 'SunD Bay · Highway', '#1D4ED8', dy=-95),
    ])
    body = sky(W, H, sun=(1470, 110)) + skyline(250) + sc.render()
    if labelled:
        body += labels + f'<text x="24" y="{H - 20}" font-family="{BODY}" font-size="20" fill="#475569">Concept illustration · future Sime Darby township with SunD facilities</text>'
    open(os.path.join(HERE, 'sund-township.svg' if labelled else 'sund-township-plain.svg'), 'w').write(svg_doc(W, H, sc, body))


if __name__ == '__main__':
    for labelled in (True, False):
        build_bay(labelled)
        build_township(labelled)
    print('wrote sund-bay(.plain).svg, sund-township(.plain).svg')
