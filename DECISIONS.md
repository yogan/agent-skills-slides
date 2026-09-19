# Decisions

Why the deck looks and behaves the way it does. Ordered roughly by how likely you are to
disagree.

The deck is five pages and deliberately sparse — the talk is ~90 % live terminal demo, and
every page is talked over while a real command runs. Anything that needed a wall of text
belonged in the demo instead. The one diagram earns its place by showing a shape the demo
cannot: how the skills compose.

## Stepped reveals on the skill pages

The five rows on each skill page come in one `→` at a time.

`<Step>` only animates opacity and keeps its children mounted, so a `@keyframes` entrance
would fire at page mount rather than at reveal. What it does expose is a
`data-osd-step="revealed|pending"` attribute on its wrapper — and a CSS *transition* against
that attribute fires exactly when it flips. So the framework keeps owning the fade, the
keyboard handling and the reduced-motion fallback, and a scoped stylesheet adds the movement:
the row rises 18px as it fades in, and the accent label settles in from the left 60ms behind
it, leaning on the deck's left axis instead of fighting it.

320ms sits just above the theme's 140–280ms transition band. A reveal you deliberately
trigger can carry a little more weight than an automatic page change.

**The intro sentence rides the same mechanism.** Each skill page opens with a one-line
description that fades out the moment the first row lands, so the page introduces itself and
then gets out of the way. It is hidden with `:has()` on the stage —
`.acr-stage:has([data-osd-step='revealed']) .acr-intro` — rather than by threading reveal
state through React.

It is **absolutely positioned** and centred on the canvas (`top: 50%`, which lands on the
canvas midpoint because the stage *is* the centred content block). That costs no layout, so
the rows keep the exact positions they had before the intro existed, and the page reads as
balanced on arrival rather than top-heavy with an empty lower half.

Two details that bite: the centring `transform` has to live in the stylesheet, because an
inline `transform` outranks a class selector and the hidden-state rule could never override
it; and since a centred intro shares space with the first row's slot, its out-fade is quicker
than the row's in-fade (200ms vs 320ms) so the sentence is gone before the row settles rather
than dissolving through it.

`:has()` is Chrome 105+; the deck is presented in Chrome and open-slide's PDF export is
Chrome-only anyway, so that is not a new constraint.

**The cost is keypresses:** a stepped page takes 6 `→` instead of 1, 15 for the whole deck.
That is real during a live demo and is called out in the README.

Verified by driving Present mode in headless Chrome and reading the step attributes: 5 pending
on entry, one flipping per press, then the page advancing on the sixth. Checked in **both**
`npm run dev` and the production build.

## Content is centred vertically, not pinned to the top

Top-alignment left 200–350px of dead space under the sparser pages; it read as unfinished
rather than airy. So the content block is vertically centred, with symmetric 120px padding.
One `justifyContent` in `Shell` to revert.

## No slide furniture at all

No page number, no topic marker, no footer. The deck is talked over during a live demo, nobody
navigates by slide number, and a footer competes with the floor grid at exactly the point
where the grid is densest. Dropping it also freed the bottom padding that had been reserved
for it, so the content band is symmetric.

`useSlidePageNumber()` is the hook if it ever comes back — the numbers must never be
hardcoded, since they would rot the moment a page is inserted.

## The overview diagram is redrawn, not embedded

Page 04 is the same graph as `docs/skills-overview-{light,dark}.png` in the skills repo, drawn
again in SVG inside `index.tsx`. Three reasons, in the order they decided it:

**It would not have been readable.** The source figure's natural size is 769×694 with 11–13px
type. The slot on the page is 1680×700, so it is height-limited to about 1:1 and the labels
would have landed at 11–13px on a 1920px canvas — against a deck whose *smallest* type is 26px.
Full-bleed buys 16px, which is still less than two thirds of the floor.

**Landscape was not on offer.** The obvious fix is to lay the graph out left-to-right, which
fits the slot's shape. `lib/diagram` refuses, and is right to: *"`direction` is not yours to
set — the renderer draws an embedded figure both ways, measures each, and keeps the one that
stays legible."* It measured, and for a README that answer is correct. A slide is a different
question, so it gets a different drawing rather than an override.

**A slide and a README want different pictures.** The README figure carries labels on every
edge and a legend, because nobody is standing next to it. The slide has a speaker, so both come
off and live in the notes instead — what is left is the shape, which is the part the room
cannot get from the talk track. All three cyan boxes also move to one bottom row, so shared
code reads as a foundation rather than as two boxes wedged into the middle of the cascade.

**The cost is real:** the two drawings are not generated from one source, so a change to
`docs/skills-overview.json` has to be made here by hand. Nine nodes and nine edges, once a
year at most — cheaper than shipping a figure nobody in row six can read.

## Look and feel

| Choice | Value | Why |
| --- | --- | --- |
| Background | `#0A0716` | Deep violet-black. True black bands badly on projectors, and the violet is what lets the neon read as neon. |
| Text | `#E8EDF2` | 16.9:1 on the flat base. |
| **Accent** | `#FFAE3D` sunset gold | One accent for everything readable. 10.8:1 on the base, 7.3:1 worst case. Warmer than the amber the deck started with (hue 40° → 35°) so it sits in the same family as the horizon glow. |
| Body | `#C9D5E1` (13.4:1) | Secondary body copy. |
| Muted | `#98A6BC` (8.1:1), dim `#6E7C95` (4.7:1) | Both lifted when the background went synthwave, so secondary text keeps its margin over a busier canvas. |
| Display / body | system sans (SF Pro on the speaker's Mac) | Heavy weights (800–850) for headings. |
| Monospace | SF Mono / Menlo stack | Used for **anything you could actually type** — skill names, commands, handles. That is the whole "nerdy" budget. |
| Hero | 132px | Fits "Agentic Code Reviews" on one line within the 1680px content width. |
| Body | 32–40px | Well above the 28px projector floor. |

### The synthwave background

Built to stay projector-safe:

- **Neon is background-only.** Magenta `#FF2DAA` and cyan `#00D9FF` appear in blooms and the
  floor grid — **never in text**. So the readable palette is still one accent.
- **The accent stayed warm** rather than being swapped for the genre-typical magenta or cyan.
  Those two are already carrying the background, so an accent in either would blend into it;
  warm is the hue that still stands out. It was then *retuned* from amber `#FFC24B` to sunset
  gold `#FFAE3D` — hue 40° → 35°, close to the 25° horizon glow — so it reads as the sun in
  the scene rather than as an unrelated warning yellow. In the synthwave sunset gradient
  (gold → orange → hot pink) it is the canonical partner to the magenta.
- **The blooms sit in the corners**, so the middle of the canvas — where the text is — stays
  near the flat base. Worst case, inside the brightest bloom overlap, is **11.4:1 for text and
  8.3:1 for the accent** (measured, not estimated).
- **The floor grid** is an SVG perspective grid with its vanishing point at `(960, 820)`: rays
  plus quadratically-spaced depth rows, fading pink→cyan with distance. The ray fan runs far
  off-canvas (±16000 in user units) because near the horizon the rays converge hard — without
  the outer ones the verticals stop short and the grid visibly runs out at the sides.
- **The grid is masked by a radial falloff** anchored at the bottom centre (`#acr-falloff`).
  Its units are the grid box's own 1920 × 260, so the circle stretches into a wide ellipse —
  one gradient fades the left and right edges *and* the far end, and the far corners, being
  furthest from the anchor, drop out almost entirely. That is what stops the grid from ending
  on a hard edge.
- **The sky is a starfield, not a grid.** A rectangular grid read fine on a flat background but
  fought the perspective floor. In its place: 64 stars as plain CSS `radial-gradient`
  background layers — no DOM nodes, no image to load, and stable across renders because every
  position is literal. Density is biased upward and stops before the grid begins; anything in
  the text band is dimmed to ~55 %, and nothing exceeds 2.2px or 0.62 alpha. They are scenery,
  not content.
- **A front-edge scrim** (`#acr-floor`, y 950→1080) sinks the grid into shadow at the bottom
  edge, so it recedes instead of ending at full strength against the frame.
- **No horizon line.** There was one; it read as a stray rule across the canvas rather than a
  horizon, so it came out.
- **Scanlines at a 6px pitch**, not the 3–4px a CRT would suggest — a tighter pitch moirés
  against projector pixels. If it shimmers on the venue hardware, delete the single
  `repeating-linear-gradient` line in `TEXTURE` that draws them.

**No page transitions.** open-slide has no default and snap-swap is tasteful. Adding motion to
a deck that gets driven mid-live-demo is risk for no gain.

## Assets

`assets/CREDITS.md` has the licences; the reasoning belongs here.

### No photography

No photos at all — not because free ones were hard to find, but because every page that might
have wanted one had a better answer. This audience prefers artefacts to imagery, and the real
artefacts are in the terminal. A stock photo would have been decoration competing with the
type.

### How the icons are coloured

The line icons are unmodified Tabler outline SVGs. They are stroke-based with
`stroke="currentColor"`, which renders **black** inside an `<img>`, so the deck applies them as
CSS masks and paints the palette colour through them — one `Icon` component, colour from the
palette, nothing baked into the files.

> **Gotcha.** Vite inlines them as data URIs and rewrites their attribute quotes to
> apostrophes. An unquoted CSS `url()` token cannot contain an apostrophe, so `url(${src})` is
> silently dropped and you get a solid coloured box. Quote it: `url("${src}")`.

**The event mark is the deliberate exception.** The Seneca phoenix on the title page is a plain
`<img>`, not an `Icon` — it arrives white-on-transparent and in full colour, and its gradient
(sunset orange → crimson → cyan) is already this deck's neon palette. One flat colour would
have cost the brand and bought nothing. The rule is "marks take the palette colour *when
flattening them loses nothing*", not "everything is a mask".

> The ZAM wordmark this deck first shipped with did need the mask treatment, for a third
> reason again — upstream ships black-on-white JPEG with no alpha, and a blend mode cannot
> reach the background from inside the content layer's own stacking context. `CREDITS.md`
> keeps that recipe for whoever re-points the deck at a venue whose logo is as awkward.

### Fonts

**No webfont.** OS stacks only, so nothing to vendor and nothing to fail offline. The cheaper
answer was not to need any. On macOS this is SF Pro + SF Mono, which is exactly the intended
look.

**Glyphs verified rendering** in a real headless-Chrome capture, not assumed: `✎ ○ ◐ ● ⊘ ✓` and
`🔴 🟠 🟡 🔵 💬`. None are on a page at the moment, but they are known-good in this font stack if
tool output ever comes back onto a slide.

## Reuse: the theme bundle

The palette is not just consts in one slide file. `themes/synthwave-terminal.md` +
`themes/synthwave-terminal.demo.tsx` are the repo's house style, and the deck declares
`meta.theme: 'synthwave-terminal'` so it links back to them.

That is open-slide's own mechanism rather than something invented here: `/create-slide` reads
the markdown and offers the theme as a picker option, and the dev UI's **Themes** panel
renders the demo as a live preview. A slide cannot import from another slide (one `index.tsx`
plus `assets/`, no shared modules), so a documented, paste-ready theme is the *only* way to
keep future decks consistent.

Inside the deck, every colour resolves to one place:

- `design.palette` drives the `var(--osd-*)` variables and the Design panel.
- `BG` re-reads `design.palette` for the one spot a CSS variable cannot reach — SVG
  attributes. If you need the accent there too, add `const ACCENT = design.palette.accent`
  rather than pasting the hex.
- The neon lives as bare `r,g,b` triplets, so the background blooms and the grid strokes
  derive from the same values instead of repeating them.

Change the accent in `design.palette` and the `/` sigils and the `@` on the handle all follow.

## Content accuracy

Every capability claim on the two skill pages is traced to the skills' own `SKILL.md`, not
invented for the slide. The flaw provenance stated on stage is real: in the demo MR, the CORS
misconfiguration and one un-awaited write are **planted**, while the `null`-returning loader
and the cwd-dependent path are **genuinely upstream's**.

**Language: English throughout**, including the `lang: en` the tooling prints for this project,
while `review-mr` defaults to German elsewhere.

## Verification

`npm run build` is clean. Every page was rendered in headless Chrome at exactly 1920×1080 in
play mode and inspected — that is how the overflow and contrast checks were done, rather than by
trusting arithmetic. No page overflows the canvas.

Those renders are **local artifacts**, written to a gitignored `previews/` and regenerated on
demand. They were committed once and it cost 32 MB of history, so they stay out.

If you add a page with `<Steps>`, note that it swallows an `ArrowRight` per reveal: a naive
screenshot walk will capture it blank and silently mis-index every page after it.

There is **no typecheck in CI or in the project** — TypeScript is not a dependency and the
build uses esbuild, which strips types without checking them. Types here are authoring
assistance only. If you want a real check, `npm i -D typescript && npx tsc --noEmit`.
