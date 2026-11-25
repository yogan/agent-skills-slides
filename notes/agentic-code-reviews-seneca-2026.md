# Seneca 2026 deck — notes

Five pages, ~60 minutes with the demo. The house style is `themes/synthwave-terminal.md`
(`meta.theme`), which `/create-slide` offers for new decks.

## Presenting

- 15 `→` from title to end: each skill page reveals five rows, the close two blocks.
- `/review-mr !1` runs about 4 minutes unattended: start it as page 2 goes up.

## Why it looks this way

- **Projector first.** Background `#0A0716` rather than black (black bands on projectors);
  neon only in the background, never in text, so everything readable answers to the one gold
  accent; the blooms sit in the corners so the text band stays near the flat base. Scanlines
  are a 6px pitch because tighter moirés on projectors; if they shimmer at the venue, delete
  the `repeating-linear-gradient` line in `TEXTURE`.
- **The overview diagram is redrawn, not the PNG** from the skills repo: embedded, its labels
  would land at 11–13px on the canvas. So a change to the skills repo's diagram spec has to be
  made here by hand. It has no legend or edge labels; the speaker notes carry them.
- **The stepped rows' motion** is a CSS transition on `<Step>`'s `data-osd-step` attribute,
  because `<Step>` keeps its children mounted and a keyframe animation would fire at mount.
  The intro line hides via `:has()` on the stage and is absolutely positioned so the rows keep
  their place; its centring `transform` is in the stylesheet because an inline one would
  outrank the hide rule.
- **Icons are CSS masks** over the unmodified Tabler SVGs, coloured from the palette. The
  `url("…")` must be quoted: Vite inlines the SVGs with apostrophes, and an unquoted `url()`
  is silently dropped, leaving a solid box.
- **The Seneca phoenix is a plain `<img>`**, not masked: its own gradient already matches the
  palette.

## Content

The capability claims follow the skills' own `SKILL.md`. In the demo MR, the CORS
misconfiguration and one un-awaited write are planted; the `null`-returning loader and the
cwd-dependent path are upstream's own.
