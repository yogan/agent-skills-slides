---
name: Synthwave Terminal
description: Deep-violet night sky, neon horizon grid, one sunset-gold accent — built to stay readable on a washed-out projector.
mode: dark
---

# Synthwave Terminal

The house style for this repo. Retro-futurist scenery (starfield, perspective floor grid,
magenta/cyan nebula) behind strictly conventional, high-contrast typography. Nerdy without
becoming unreadable — the neon is **scenery**, never content.

## Palette

**The one rule: neon is background-only.** Magenta, cyan and violet appear in blooms and the
floor grid and *never* in text. Everything readable answers to a single accent, which is why
the deck can carry the severity glyphs (🔴🟠🟡🔵) without a colour clash.

| Role | Value | Notes |
| --- | --- | --- |
| `bg` | `#0A0716` | deep violet-black. Not true black — that bands on projectors, and the violet is what lets the neon read as neon |
| `text` | `#E8EDF2` | primary copy — 16.9:1 on bg |
| `accent` | `#FFAE3D` | **sunset gold.** Eyebrows, the `/` on command names, key words, active states — 10.8:1 on bg |
| `body` | `#C9D5E1` | secondary body copy, table cells — 13.0:1 |
| `muted` | `#98A6BC` | supporting copy, sub-headings — 8.1:1 |
| `dim` | `#6E7C95` | de-emphasis only — separators, footnotes. 4.7:1, the one token that dips below 4.5 over a bloom, so nothing load-bearing goes here |
| `line` | `#241C3C` | hairlines, panel borders |
| `panel` | `#130E24` | code / callout panel fill |

### Background neon (never text)

| Role | Value | Used for |
| --- | --- | --- |
| pink | `255,45,170` | top-right nebula bloom, near half of the floor grid |
| cyan | `0,217,255` | bottom-left bloom, far half of the floor grid |
| violet | `120,60,255` | top-left wash |
| sunset | `255,140,60` | bottom horizon glow — **this is what the accent is tuned against** |

Kept as bare `r,g,b` triplets so they can be used at several alphas.

### Why sunset gold and not neon pink

Pink and cyan are already doing the background's work; an accent in either would blend into
it. A warm accent is the one that still stands out, and in the synthwave sunset gradient
(gold → orange → hot pink) it is the canonical partner to the magenta. The hue sits at 35°,
close to the 25° horizon glow, so it reads as the sun in the scene rather than as an
unrelated warning yellow.

**Do not** swap the accent to pink/cyan "for consistency" — that is the one change that
breaks both the contrast story and the figure/ground split.

## Typography

- Display font: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` — weight 800–850
  for headings. Resolves to SF Pro on macOS.
- Body font: same stack, weight 400–500.
- Monospace: `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace`.
- No webfont. OS stacks only, so nothing to vendor and nothing to fail offline.

**The monospace rule:** mono is for **anything you could actually type** — command names,
file paths, flags, tool output, status glyphs. Prose is always sans. That split is the
"nerdy" budget; do not spend it on decorative mono headings.

Type-scale overrides (against `slide-authoring` defaults):

| Element | Size |
| --- | --- |
| Hero title | 132 px (one line at ≤ 21 characters) |
| Page heading | 76 px, weight 800 |
| Skill-name heading (mono) | 76 px, weight 700 |
| Body | 30–36 px |
| Caption / label | 22–26 px |

Body never below 28 px — that is the projector floor.

## Layout

- Canvas 1920 × 1080. Symmetric content padding of **120 px**. Usable height ≈ **840 px**.
- Content is **vertically centred**, left-aligned.
- **No slide furniture at all** — no footer, no page number, no running topic marker.
- The canvas does not scroll. Sum `font-size × line-height × lines` plus gaps before adding a
  line; split the page rather than shrinking type.

## Fixed components

Paste-ready. Copy verbatim into a slide that uses this theme, along with the palette consts.

### Palette consts

```tsx
import type { DesignSystem } from '@open-slide/core';

export const design: DesignSystem = {
  palette: { bg: '#0A0716', text: '#E8EDF2', accent: '#FFAE3D' },
  fonts: {
    display: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    body: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
  typeScale: { hero: 132, body: 36 },
  radius: 10,
};

// Re-exported for the places a CSS variable cannot reach — SVG attributes and JS
// conditionals. Never hardcode a hex below this block.
const BG = design.palette.bg;
const ACCENT = design.palette.accent;

const MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';
const BODY = '#C9D5E1';
const MUTED = '#98A6BC';
const DIM = '#6E7C95';
const LINE = '#241C3C';
const PANEL = '#130E24';

const NEON_PINK_RGB = '255,45,170';
const NEON_CYAN_RGB = '0,217,255';
const NEON_VIOLET_RGB = '120,60,255';
const NEON_SUNSET_RGB = '255,140,60';
```

### Background (`TEXTURE` + `Horizon`)

The scenery is two pieces: a `TEXTURE` string of CSS background layers (starfield, nebula
blooms, scanlines) and a `Horizon` SVG (the perspective floor grid). Both are reproduced in
full in `slides/mr-review-with-agent-skills/index.tsx` — **copy them from there**, they are
long and position-specific. The rules that matter if you re-derive them:

- **Starfield**: literal positions, no RNG, so the field never shifts between renders.
  Biased to the upper canvas, stops before the grid begins, dimmed to ~55 % inside the text
  band. Nothing above 2.2 px or 0.62 alpha.
- **Floor grid**: vanishing point `(960, 820)`; rays plus quadratically-spaced depth rows,
  stroke fading pink → cyan with distance. The ray fan must extend far off-canvas (±16000
  user units) — near the horizon the rays converge hard, and without the outer ones the
  verticals stop short and the grid visibly runs out at the sides.
- **Grid falloff**: one radial mask anchored at bottom-centre, in the grid box's own units so
  the circle stretches to an ellipse — fades the sides and the distance in a single pass.
- **Front-edge scrim**: darkens y 950→1080 so the grid sinks into shadow at the bottom edge
  instead of ending at full strength against the frame.
- **No horizon line.** It reads as a stray rule across the canvas, not a horizon.
- **Scanlines at a 6 px pitch**, not 3–4 px — a tighter pitch moirés against projector pixels.

### Shell

```tsx
const PAD = 120;

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      backgroundColor: 'var(--osd-bg)',
      backgroundImage: TEXTURE,
      color: 'var(--osd-text)',
      fontFamily: 'var(--osd-font-body)',
      padding: PAD,
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}
  >
    <Horizon />
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  </div>
);
```

**No footer, no page numbers, no topic markers.** Dropped deliberately: the deck is talked
over during a live demo, nobody navigates by slide number, and the furniture was competing
with the floor grid at the bottom of the canvas. If you ever want it back, `useSlidePageNumber()`
is the hook — never hardcode `n` / `total`.

### Eyebrow

```tsx
const Kicker = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: 26,
      lineHeight: 1.2,
      color: 'var(--osd-accent)',
      letterSpacing: '0.24em',
    }}
  >
    {children}
  </div>
);
```

Tracked-out uppercase. For **lowercase** eyebrows (command names) drop the tracking to
`0.02em` and raise the size — wide tracking on lowercase mono reads badly.

### Command / skill heading

The accent-slash pattern. Use it anywhere a command name appears as a heading.

```tsx
const SkillH = ({ name, sub }: { name: string; sub?: string }) => (
  <div>
    <h2 style={{ fontFamily: MONO, fontSize: 76, fontWeight: 700, lineHeight: 1.1,
                 letterSpacing: '-0.02em', margin: 0 }}>
      <span style={{ color: 'var(--osd-accent)' }}>/</span>
      {name}
    </h2>
    {sub ? (
      <div style={{ fontSize: 34, lineHeight: 1.2, color: MUTED, marginTop: 16 }}>{sub}</div>
    ) : null}
  </div>
);
```

Inline, the same idea applies to sigils generally: the `/` of a command and the `@` of a
handle take the accent, the word after it does not.

## Motion

**Static.** No page transitions — open-slide has no default and snap-swap is tasteful; a deck
driven mid-live-demo does not want motion it can trip over. The only movement is `<Steps>`
reveals, used sparingly (one page in ten) where the *order* of ideas is the point.

## Aesthetic

Retro-futurist **neon**, held one layer behind the content. The scene — night sky, starfield,
nebula, a grid receding to a vanishing point — is atmosphere; the type sitting on it is plain,
heavy, high-contrast and completely conventional. The tension between the two is the whole
look: it should feel like a terminal in a Blade Runner apartment, not like a poster.

Avoid: neon *text*, glow/text-shadow on type, chrome gradients on letterforms, more than one
accent, decorative mono, body copy over the brightest part of a bloom, and anything that
pushes a readable colour below 4.5:1. If a flourish costs legibility from the back of a bright
room, it loses — the deck is talked over, not read.

## Example usage

```tsx
const Cover: Page = () => (
  <Shell>
    <Kicker>CHAPTER 01</Kicker>
    <h1 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 'var(--osd-size-hero)',
                 fontWeight: 850, lineHeight: 1.02, letterSpacing: '-0.035em', margin: '44px 0 0' }}>
      The Big Idea
    </h1>
    <p style={{ fontSize: 40, lineHeight: 1.4, color: MUTED, margin: '40px 0 0', maxWidth: 1400 }}>
      A short subtitle that explains what this slide is about.
    </p>
  </Shell>
);

const Content: Page = () => (
  <Shell>
    <Kicker>LOCAL ONLY · NO NETWORK</Kicker>
    <div style={{ marginTop: 28 }}>
      <SkillH name="do-the-thing" sub="what it is for" />
    </div>
    <ul style={{ fontSize: 'var(--osd-size-body)', lineHeight: 1.5, listStyle: 'none',
                 margin: '40px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <li>One clear point per line</li>
      <li>Three to five of them, no more</li>
      <li>Identifiers in <code style={{ fontFamily: MONO }}>monospace</code></li>
    </ul>
  </Shell>
);
```
