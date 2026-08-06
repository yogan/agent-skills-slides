# Decisions

Every judgement call the handoff left open, the changes made after the first review, and the
two places I deviated from the handoff. Ordered roughly by how likely you are to disagree.

## Reset to a clean base

The deck was built out to 12 pages against the original outline, then pruned **back to two** —
a title and one `/review-mr` slide — on request, to rebuild the content deliberately rather
than edit an outline nobody had committed to.

What went, and what that means:

- **Eight content pages** (`review-branch`, `explain-diff`, `explain-branch`, the two
  `review-mr` pages, `rework-mr`, design principles, the rig, the wrap). Their content is not
  lost — it is in git history, and the source material it came from is still in
  `~/src/agent-skills`.
- **Everything they alone used**: the `Steps` reveal, the code `Panel`, the topic table, the
  numbered `Stage` flow, the section rail, the brand-logo imports, and the palette tokens that
  only served them (`LINE`, `PANEL`, `SEV_CRITICAL`, `CODE_TEXT`, `CODE_LITERAL`). The file went
  from 926 lines to 411.
- **The `ACCENT` re-export**, now that nothing needs the accent outside a CSS variable. The
  palette comment says to add it back rather than paste a hex.

What deliberately survived: the whole visual system (background art, palette, `Shell`,
`SkillH`) and the theme bundle. That is the part worth keeping stable while the
content churns — which is exactly why it was extracted into `themes/` first.

**The assets are retained but unused.** `gitlab.svg`, `docker.svg` and `claude.svg` were the
rig page's. They are 5 KB total, already licence-cleared, and likely to come back; deleting
them would only mean re-fetching them offline later.

### The `/review-mr` slide

Five verbs, one line each — `explains · finds · adopts · tracks · drafts`. The list is
deliberately shorter than what the skill does, because it has to be readable in the four
minutes the speaker is talking over it while the real command runs. The last row carries the
argument (**it drafts, you post**) and everything else is setup for it.

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

It is **absolutely positioned**, which buys two things: it costs no layout, so the rows keep
the exact positions they had before it existed; and it can sit low — roughly at the optical
centre of the band the rows will fill — instead of tucking under the heading and leaving the
bottom half of the canvas empty. It also clears the first row's slot, so the fade-out and the
first row's fade-in never overlap.

`:has()` is Chrome 105+; the deck is presented in Chrome and open-slide's PDF export is
Chrome-only anyway, so that is not a new constraint.

**The cost is keypresses:** a stepped page takes 6 `→` instead of 1, 13 for the whole deck.
That is real during a live demo and is called out in the README.

Verified by driving Present mode in headless Chrome and reading the step attributes: 5 pending
on entry, one flipping per press, then the page advancing on the sixth. Checked in **both**
`npm run dev` and the production build — an earlier reading that production was broken was an
artefact of the probe never actually entering Present mode.

## Deviations from the original handoff

### Content is centred vertically, not pinned to the top

The handoff asked for consistent slide furniture. Top-alignment left 200–350px of dead space
under the sparser pages; it read as unfinished rather than airy. So the content block is
vertically centred, with symmetric 120px padding. One `justifyContent` in `Shell` to revert.

### No slide furniture at all

The handoff asked for a page number and a small topic marker. Both are gone, on request: the
deck is talked over during a live demo, nobody navigates by slide number, and the footer was
competing with the floor grid at exactly the point where the grid is densest. Dropping it also
freed the 32px of bottom padding that had been reserved for it, so the content band is now
symmetric.

`useSlidePageNumber()` is the hook if it ever comes back — the numbers must never be
hardcoded, since they would rot the moment a page is inserted.

## Look and feel

| Choice | Value | Why |
| --- | --- | --- |
| Background | `#0A0716` | Deep violet-black. True black bands badly on projectors, and the violet is what lets the neon read as neon. |
| Text | `#E8EDF2` | 16.9:1 on the flat base. |
| **Accent** | `#FFAE3D` sunset gold | One accent for everything readable. 10.8:1 on the base, 7.3:1 worst case. Warmer than the amber the deck started with (hue 40° → 35°) so it sits in the same family as the horizon glow. |
| Body | `#C9D5E1` (13.4:1) | Secondary body copy, table cells. |
| Muted | `#98A6BC` (8.1:1), dim `#6E7C95` (4.7:1) | Both lifted when the background went synthwave, so secondary text keeps its margin over a busier canvas. |
| Display / body | system sans (SF Pro on the speaker's Mac) | Heavy weights (800–850) for headings. |
| Monospace | SF Mono / Menlo stack | Used for **anything you could actually type** — skill names, file paths, commands, the topic table. That is the whole "nerdy" budget. |
| Hero | 132px | Fits "Agentic Code Reviews" on one line within the 1680px content width. |
| Body | 32–40px | Well above the 28px projector floor. |

### The synthwave background

Requested after the first pass, and built to stay projector-safe:

- **Neon is background-only.** Magenta `#FF2DAA` and cyan `#00D9FF` appear in blooms and the
  floor grid — **never in text**. So the readable palette is still one accent (amber), which
  is also why the severity glyphs (🔴🟠🟡🔵) still don't compete with anything.
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
- **The sky is a starfield, not a grid.** The original 120px rectangular grid read fine on a
  flat background but fought the perspective floor, so it is gone. In its place: 64 stars as
  plain CSS `radial-gradient` background layers — no DOM nodes, no image to load, and stable
  across renders because every position is literal. Density is biased upward and stops before
  the grid begins; anything in the text band is dimmed to ~55 %, and nothing exceeds 2.2px or
  0.62 alpha. They are scenery, not content.
- **A front-edge scrim** (`#acr-floor`, y 950→1080) sinks the grid into shadow at the bottom
  edge, so it recedes instead of ending at full strength against the frame. It originally
  protected the footer; it earns its place on looks alone now that the footer is gone.
- **No horizon line.** There was one; it read as a stray rule across the canvas rather than a
  horizon, so it came out.
- **Scanlines at a 6px pitch**, not the 3–4px a CRT would suggest — a tighter pitch moirés
  against projector pixels. If it shimmers on the venue hardware, delete the single
  `repeating-linear-gradient` line in `TEXTURE` that draws them.

**No page transitions.** open-slide has no default and snap-swap is tasteful. Adding motion to
a deck that gets driven mid-live-demo is risk for no gain.

## Assets

### No photography

`assets/CREDITS.md` has the licences; the reasoning belongs here.

The handoff allowed Unsplash/Pexels/undraw and also said a text or code slide beats a legally
dubious photo. I went further and used **no photos at all** — not because I couldn't find
free ones, but because every slide that might have wanted one had a better answer:

- **review-branch / review-mr** → real tool output. This audience prefers artefacts to
  imagery, and the handoff said so.
- **The rig** → three brand marks and four facts. A photo of a laptop adds nothing.

(The two cut pages were the other two: a hand-drawn SVG zigzag and a CSS flow diagram, both
built rather than sourced. They went for editorial reasons, not licensing ones.)

A stock photo would have been decoration competing with the type. Nothing was licensed that
did not earn its place.

### Three icons, and how they are coloured

`gitlab.svg`, `docker.svg`, `claude.svg` from simple-icons (CC0), used on the rig page to name
the tools the demo runs against.

I fetched them from `cdn.simpleicons.org/<slug>/E8EDF2` — **colour baked into the file**. The
alternative was shipping the stock black icons and recolouring them, which for an `<img>`
means either a `filter: invert()` hack or a CSS mask. Baking the hex in is one fewer moving
part, and these are decorative marks whose colour will never need to change independently.

Vite inlines all three as data URIs (each is under the 4 KB threshold), so the built deck
makes **zero** asset requests. Venue wifi is irrelevant.

### Fonts

**No webfont.** OS stacks only, so nothing to vendor and nothing to fail offline. The handoff
asked for fonts to be vendored *if* needed — the cheaper answer was not to need any. On the
speaker's macOS machine this is SF Pro + SF Mono, which is exactly the intended look.

**Glyphs verified rendering** in a real headless-Chrome capture, not assumed: `✎ ○ ◐ ● ⊘ ✓`
and `🔴 🟠 🟡 🔵 💬`. None are on a slide at the moment — the pages that used them were pruned —
but they are known-good in this font stack when the content comes back.

## Reuse: the theme bundle

The palette is not just consts in one slide file. `themes/synthwave-terminal.md` +
`themes/synthwave-terminal.demo.tsx` are the repo's house style, and the deck declares
`meta.theme: 'synthwave-terminal'` so it links back to them.

That is open-slide's own mechanism rather than something invented here: `/create-slide` reads
the markdown and offers the theme as a picker option, and the dev UI's **Themes** panel
renders the demo as a live preview. A slide cannot import from another slide (one `index.tsx`
plus `assets/`, no shared modules), so a documented, paste-ready theme is the *only* way to
keep future decks consistent.

Inside the deck, every colour now resolves to one place:

- `design.palette` drives the `var(--osd-*)` variables and the Design panel.
- `BG` / `ACCENT` re-read `design.palette` for the spots a CSS variable cannot reach — SVG
  attributes and JS conditionals. Previously the accent hex was hardcoded in six of those.
- The neon lives as bare `r,g,b` triplets, so the background blooms and the grid strokes
  derive from the same values instead of repeating them.

Change the accent in `design.palette` and the eyebrows, the `/` sigils and the `@` on the
handle all follow.

## Content accuracy

Every capability claim is traced to the skills' own docs — `SKILL.md` per skill,
`e2e/RUNBOOK.md` for the demo specifics. I read those and invented nothing. Specifically real,
not illustrative:

- the CORS finding, and that it is one of **two planted** flaws (two others are genuinely
  upstream's)
- the `t1`–`t5` topic table, including the states — that is the runbook's expected fixture
  state for MR !2 (`t1/t2/t3 ◐ needs-ack`, `t4 ○ open`, `t5 💬 peer`, 2 pushes)
- `drafts in en` — the marker the tool prints, and the language this talk runs in
- `bulletproof-react` PR #175, and `python3 fixture.py` resetting in ~20 s
- the `Stop` hook existing because documentation failed **three** times
- "2 chapters · 4 diagrams · 47 KB" for the captured explainer

The chapter titles in the explain-branch mock ("the first real step", "what it made
possible") are deliberately generic. I know the real explainer has two chapters, but not their
titles, so I did not invent plausible-looking ones for a slide that claims to show real
output.

**Language: English throughout**, per the handoff. Note the deck says `drafts in en`, while
`review-mr` defaults to German per repo — that marker is correct *for this demo*, and page 5
says "in the repo's language" rather than naming one.

## Things I chose not to do

- **A glyph-legend slide of its own.** Folded into page 6, under the table, where it is
  useful in context rather than as a page of notation.
- **A chart.** Nothing in the talk is quantitative. The `dataviz` skill's palette rules would
  have been solving a problem the deck doesn't have.
- **Two prototyped visual directions.** The constraints (dark, one accent, high contrast,
  monospace accents, projector-safe) left little genuine fork worth building twice. I spent
  the time on the diagrams instead.
- **Kept the scaffold's `getting-started` sample slide.** Deleted — it would show up beside
  the real deck on the slide index and there is nothing in it you want on the day.

## Verification

`npm run build` is clean. Every page is rendered in headless Chrome at exactly 1920×1080 in
play mode and inspected — that is what `previews/` contains, and it is how the overflow and
contrast checks were done rather than by trusting arithmetic. No page overflows the canvas.

If you add a page with `<Steps>`, note that it swallows an `ArrowRight` per reveal: a naive
screenshot walk will capture it blank and silently mis-index every page after it.

There is **no typecheck in CI or in the project** — TypeScript is not a dependency and the
build uses esbuild, which strips types without checking them. Types here are authoring
assistance only. If you want a real check, `npm i -D typescript && npx tsc --noEmit`.

Nothing outside this repo was modified: `~/src/agent-skills/` was read only, and the demo
checkouts, the local GitLab, its Docker container and `~/.claude/` were never touched.
