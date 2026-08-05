# Decisions

Every judgement call the handoff left open, and the two places I deviated from it. Ordered
roughly by how likely you are to disagree.

## Deviations from the handoff

### 1. Content is centred vertically, not pinned to the top

The handoff asked for consistent slide furniture. I first built every page top-aligned at
120px, which gave a genuinely consistent heading anchor — and 200–350px of dead space under
the sparser pages (the shape diagram, the principles). It read as unfinished rather than
airy.

So the content block is now vertically centred in the band above the footer. The **furniture**
is still fixed: the footer marker and `NN / 12` sit at an identical absolute position on all
12 pages, which is the part the eye actually tracks between slides. Easy to revert — one
`justifyContent` in `Shell`.

### 2. Page 10 is the only page with a stepped reveal

`<Steps>` is available and the handoff didn't ask for it. I used it on exactly one page — the
design principles — because the third principle (printed > remembered) is the payoff and
showing all three at once lets the room read ahead to it.

The cost is real and you should know about it: **`→` on page 10 advances the reveal, not the
page.** Three extra presses. It is documented in the README and flagged in the notes. Every
other page is shown whole, which is the right default for a deck you talk over.

## Deck structure

**12 pages, matching the suggested outline 1:1**, including `review-mr` as two pages. I did
not add a separate quote slide — the speaker's own words became the pull quote *on* the pain
page, which keeps that page to one idea and one visual instead of spending a whole page on
each.

The 4-minute opening window is carried by pages 1–6. That is roughly 40 seconds a page, which
is comfortable talking pace over slides this sparse.

**Pages 5, 6 and 11 are the designated cuts** if the talk runs late, and the notes say so. I
flagged 11 (the rig) as the one to protect, following the runbook's own instinct that this
crowd will want it.

## Look and feel

| Choice | Value | Why |
| --- | --- | --- |
| Background | `#0A0E13` | Near-black with a blue cast. True black bands badly on projectors. |
| Text | `#E8EDF2` | 16.4:1 on the background. |
| **Accent** | `#FFC24B` amber | One accent, used everywhere. 12.0:1 on the background, and it survives a washed-out projector far better than a mid-blue would. |
| Muted | `#8695A6` (6.3:1), dim `#5C6B7C` (3.6:1) | Secondary text only. **Nothing load-bearing is in dim** — it carries page numbers, the marker and footnotes. Dim is the one value below 4.5:1, which is why nothing you need to read sits in it. |
| Display / body | system sans (SF Pro on the speaker's Mac) | Heavy weights (800–850) for headings. |
| Monospace | SF Mono / Menlo stack | Used for **anything you could actually type** — skill names, file paths, commands, the topic table. That is the whole "nerdy" budget. |
| Hero | 132px | Fits "Stop tabbing to / the browser." on two lines within the 1680px content width. |
| Body | 32–40px | Well above the 28px projector floor. |

**Why amber and not the obvious terminal green:** the deck reproduces the skills' own severity
glyphs (🔴🟠🟡🔵) and status glyphs. Green would have read as a sixth status colour. Amber
sits next to the severity dots without competing, and it is already the colour of `◐
needs-ack` in the real tool.

**Texture:** a 120px grid at ~3 % white plus one warm bloom top-right. Deliberately almost
invisible — anything busier turns to mud when projected. It is there so the pages don't read
as flat black rectangles.

**No page transitions.** open-slide has no default and snap-swap is tasteful. Adding motion to
a deck that gets driven mid-live-demo is risk for no gain.

## Assets

### No photography

`assets/CREDITS.md` has the licences; the reasoning belongs here.

The handoff allowed Unsplash/Pexels/undraw and also said a text or code slide beats a legally
dubious photo. I went further and used **no photos at all** — not because I couldn't find
free ones, but because every slide that might have wanted one had a better answer:

- **The pain** → an SVG trace zigzagging between a TERMINAL rail and a BROWSER rail. It *is*
  the metaphor, drawn from the content, rather than a stock photo of a tired developer.
- **The shape** → a three-row CSS flow diagram, with the one row that is a write picked out in
  accent. A photo cannot make that point.
- **review-branch / review-mr** → real tool output. This audience prefers artefacts to
  imagery, and the handoff said so.

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
and `🔴 🟠 🟡 🔵 💬`. The status legend on page 8 exists partly so the audience can decode the
live demo, and partly as a standing check that these still render.

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
`review-mr` defaults to German per repo — that marker is correct *for this demo*, and page 7
says "in the repo's language" rather than naming one.

## Things I chose not to do

- **A glyph-legend slide of its own.** Folded into page 8, under the table, where it is
  useful in context rather than as a page of notation.
- **A chart.** Nothing in the talk is quantitative. The `dataviz` skill's palette rules would
  have been solving a problem the deck doesn't have.
- **Two prototyped visual directions.** The constraints (dark, one accent, high contrast,
  monospace accents, projector-safe) left little genuine fork worth building twice. I spent
  the time on the diagrams instead.
- **Kept the scaffold's `getting-started` sample slide.** Deleted — it would show up beside
  the real deck on the slide index and there is nothing in it you want on the day.

## Verification

`npm run build` is clean. All 12 pages were rendered in headless Chrome at exactly 1920×1080
in play mode and inspected — that is what `previews/` contains, and it is how the overflow and
glyph checks were done rather than by trusting arithmetic. No page overflows the canvas.

There is **no typecheck in CI or in the project** — TypeScript is not a dependency and the
build uses esbuild, which strips types without checking them. Types here are authoring
assistance only. If you want a real check, `npm i -D typescript && npx tsc --noEmit`.

Nothing outside this repo was modified: `~/src/agent-skills/` was read only, and the demo
checkouts, the local GitLab, its Docker container and `~/.claude/` were never touched.
